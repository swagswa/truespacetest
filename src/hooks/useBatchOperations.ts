import { useCallback, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface BatchOperation {
  type: 'favorite' | 'completed'
  lessonId: string
  value: boolean
}

interface BatchRequest {
  operations: BatchOperation[]
}

/**
 * Хук для батчинга операций toggle
 * Группирует множественные изменения в один API запрос
 */
export function useBatchOperations() {
  const queryClient = useQueryClient()
  const batchRef = useRef<BatchOperation[]>([])
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const BATCH_DELAY = 500 // 500ms для накопления операций

  // Мутация для отправки батча операций
  const batchMutation = useMutation({
    mutationFn: async (batch: BatchRequest) => {
      const response = await fetch('/api/lessons/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch),
      })

      if (!response.ok) {
        throw new Error('Batch operation failed')
      }

      return response.json()
    },
    onSuccess: () => {
      // Инвалидируем все связанные запросы
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      queryClient.invalidateQueries({ queryKey: ['completed'] })
    },
    onError: (error) => {
      console.error('Batch operation failed:', error)
      // Откатываем оптимистичные обновления
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
    },
  })

  // Функция для выполнения накопленного батча
  const executeBatch = useCallback(() => {
    if (batchRef.current.length === 0) return

    const operations = [...batchRef.current]
    batchRef.current = []

    // Удаляем дубликаты (последняя операция для каждого урока)
    const uniqueOperations = operations.reduce((acc, op) => {
      const key = `${op.lessonId}-${op.type}`
      acc[key] = op
      return acc
    }, {} as Record<string, BatchOperation>)

    const finalOperations = Object.values(uniqueOperations)

    if (finalOperations.length > 0) {
      batchMutation.mutate({ operations: finalOperations })
    }
  }, [batchMutation])

  // Добавление операции в батч
  const addToBatch = useCallback(
    (operation: BatchOperation) => {
      batchRef.current.push(operation)

      // Оптимистичное обновление кэша
      queryClient.setQueryData(['lessons'], (oldData: any) => {
        if (!oldData) return oldData

        return oldData.map((lesson: any) => {
          if (lesson.id === operation.lessonId) {
            return {
              ...lesson,
              [operation.type === 'favorite' ? 'is_favorite' : 'is_completed']: operation.value,
            }
          }
          return lesson
        })
      })

      // Сбрасываем предыдущий таймер и устанавливаем новый
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(executeBatch, BATCH_DELAY)
    },
    [executeBatch, queryClient]
  )

  // Немедленное выполнение батча
  const flushBatch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    executeBatch()
  }, [executeBatch])

  return {
    addToBatch,
    flushBatch,
    isPending: batchMutation.isPending,
    error: batchMutation.error,
  }
}

/**
 * Хук для оптимизированных toggle операций с батчингом
 */
export function useOptimizedToggle() {
  const { addToBatch, isPending, error } = useBatchOperations()

  const toggleFavorite = useCallback(
    (lessonId: string, currentValue: boolean) => {
      addToBatch({
        type: 'favorite',
        lessonId,
        value: !currentValue,
      })
    },
    [addToBatch]
  )

  const toggleCompleted = useCallback(
    (lessonId: string, currentValue: boolean) => {
      addToBatch({
        type: 'completed',
        lessonId,
        value: !currentValue,
      })
    },
    [addToBatch]
  )

  return {
    toggleFavorite,
    toggleCompleted,
    isPending,
    error,
  }
}
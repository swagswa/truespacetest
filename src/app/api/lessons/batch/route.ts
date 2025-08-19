import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Схема валидации для батч операций
const BatchOperationSchema = z.object({
  type: z.enum(['favorite', 'completed']),
  lessonId: z.string(),
  value: z.boolean(),
})

const BatchRequestSchema = z.object({
  operations: z.array(BatchOperationSchema).min(1).max(50), // Максимум 50 операций за раз
})

/**
 * API endpoint для батчинга операций
 * Обрабатывает множественные toggle операции в одном запросе
 * Оптимизирует производительность базы данных
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Валидация входных данных
    const validatedData = BatchRequestSchema.parse(body)
    const { operations } = validatedData

    // Группируем операции по типу для оптимизации SQL запросов
    const favoriteOperations = operations.filter(op => op.type === 'favorite')
    const completedOperations = operations.filter(op => op.type === 'completed')

    const results = []

    // Обрабатываем операции с избранным
    if (favoriteOperations.length > 0) {
      const favoriteIds = favoriteOperations.map(op => op.lessonId)
      const favoritesToAdd = favoriteOperations.filter(op => op.value).map(op => op.lessonId)
      const favoritesToRemove = favoriteOperations.filter(op => !op.value).map(op => op.lessonId)

      // Добавляем в избранное
      if (favoritesToAdd.length > 0) {
        const addResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/favorites/batch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ lesson_ids: favoritesToAdd }),
        })
        
        if (addResponse.ok) {
          results.push({ type: 'favorites_added', count: favoritesToAdd.length })
        }
      }

      // Удаляем из избранного
      if (favoritesToRemove.length > 0) {
        const removeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/favorites/batch`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ lesson_ids: favoritesToRemove }),
        })
        
        if (removeResponse.ok) {
          results.push({ type: 'favorites_removed', count: favoritesToRemove.length })
        }
      }
    }

    // Обрабатываем операции с завершенными уроками
    if (completedOperations.length > 0) {
      const completedToAdd = completedOperations.filter(op => op.value).map(op => op.lessonId)
      const completedToRemove = completedOperations.filter(op => !op.value).map(op => op.lessonId)

      // Добавляем в завершенные
      if (completedToAdd.length > 0) {
        const addResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/completed/batch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ lesson_ids: completedToAdd }),
        })
        
        if (addResponse.ok) {
          results.push({ type: 'completed_added', count: completedToAdd.length })
        }
      }

      // Удаляем из завершенных
      if (completedToRemove.length > 0) {
        const removeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/completed/batch`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ lesson_ids: completedToRemove }),
        })
        
        if (removeResponse.ok) {
          results.push({ type: 'completed_removed', count: completedToRemove.length })
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: operations.length,
      results,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Batch operation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint для получения статистики батч операций
 */
export async function GET() {
  try {
    // Здесь можно добавить логику для получения статистики
    // например, количество обработанных операций за день
    
    return NextResponse.json({
      success: true,
      stats: {
        supported_operations: ['favorite', 'completed'],
        max_batch_size: 50,
        batch_timeout: '500ms',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get batch stats',
      },
      { status: 500 }
    )
  }
}
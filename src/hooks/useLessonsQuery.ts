import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Lesson } from '@/types/lesson'

// Ключи для кэширования
export const QUERY_KEYS = {
  lessons: ['lessons'] as const,
  lessonsByDirection: (direction: string) => ['lessons', 'direction', direction] as const,
  favoriteLessons: ['lessons', 'favorites'] as const,
  completedLessons: ['lessons', 'completed'] as const,
  lesson: (id: string) => ['lessons', id] as const,
}

// API функции
const api = {
  async fetchLessonsByDirection(direction: string): Promise<Lesson[]> {
    const response = await fetch(`/api/lessons/direction/${direction}`)
    if (!response.ok) throw new Error('Failed to fetch lessons')
    return response.json()
  },

  async fetchFavoriteLessons(): Promise<Lesson[]> {
    const response = await fetch('/api/lessons/favorites')
    if (!response.ok) throw new Error('Failed to fetch favorite lessons')
    return response.json()
  },

  async fetchCompletedLessons(): Promise<Lesson[]> {
    const response = await fetch('/api/lessons/completed')
    if (!response.ok) throw new Error('Failed to fetch completed lessons')
    return response.json()
  },

  async toggleFavorite(lessonId: string): Promise<{ success: boolean }> {
    const response = await fetch(`/api/lessons/${lessonId}/toggle-favorite`, {
      method: 'POST',
    })
    if (!response.ok) throw new Error('Failed to toggle favorite')
    return response.json()
  },

  async toggleCompleted(lessonId: string): Promise<{ success: boolean }> {
    const response = await fetch(`/api/lessons/${lessonId}/toggle-completed`, {
      method: 'POST',
    })
    if (!response.ok) throw new Error('Failed to toggle completed')
    return response.json()
  },
}

// Хуки для запросов
export function useLessonsByDirection(direction: string) {
  return useQuery({
    queryKey: QUERY_KEYS.lessonsByDirection(direction),
    queryFn: () => api.fetchLessonsByDirection(direction),
    enabled: !!direction,
  })
}

export function useFavoriteLessonsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.favoriteLessons,
    queryFn: api.fetchFavoriteLessons,
  })
}

export function useCompletedLessonsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.completedLessons,
    queryFn: api.fetchCompletedLessons,
  })
}

// Хуки для мутаций с оптимистичными обновлениями
export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.toggleFavorite,
    onMutate: async (lessonId: string) => {
      // Отменяем исходящие запросы
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.lessons })

      // Получаем предыдущие данные для отката
      const previousData = {
        favorites: queryClient.getQueryData(QUERY_KEYS.favoriteLessons),
        directions: queryClient.getQueriesData({ queryKey: ['lessons', 'direction'] }),
      }

      // Оптимистично обновляем кэш
      queryClient.setQueriesData(
        { queryKey: ['lessons'] },
        (oldData: Lesson[] | undefined) => {
          if (!oldData) return oldData
          return oldData.map(lesson =>
            lesson.id === lessonId
              ? { ...lesson, is_favorite: !lesson.is_favorite }
              : lesson
          )
        }
      )

      return { previousData }
    },
    onError: (err, lessonId, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousData) {
        queryClient.setQueryData(QUERY_KEYS.favoriteLessons, context.previousData.favorites)
        context.previousData.directions.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSettled: () => {
      // Обновляем кэш после завершения
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lessons })
    },
  })
}

export function useToggleCompletedMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.toggleCompleted,
    onMutate: async (lessonId: string) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.lessons })

      const previousData = {
        completed: queryClient.getQueryData(QUERY_KEYS.completedLessons),
        directions: queryClient.getQueriesData({ queryKey: ['lessons', 'direction'] }),
      }

      queryClient.setQueriesData(
        { queryKey: ['lessons'] },
        (oldData: Lesson[] | undefined) => {
          if (!oldData) return oldData
          return oldData.map(lesson =>
            lesson.id === lessonId
              ? { ...lesson, is_completed: !lesson.is_completed }
              : lesson
          )
        }
      )

      return { previousData }
    },
    onError: (err, lessonId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(QUERY_KEYS.completedLessons, context.previousData.completed)
        context.previousData.directions.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lessons })
    },
  })
}
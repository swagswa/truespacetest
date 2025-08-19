'use client'

import { useEffect } from 'react'
import { useLessonStore } from '@/stores/lesson-store'
import type { LessonWithStatus } from '@/contexts/LessonsContext'
import type { LessonWithUserData } from '@/types/lesson-types'

/**
 * Адаптер для плавной миграции с LessonsContext на Zustand store
 * Предоставляет тот же API, что и существующие хуки, но использует Zustand внутри
 */

// Функция для конвертации между типами
function convertLessonWithUserDataToLessonWithStatus(
  lesson: LessonWithUserData
): LessonWithStatus {
  return {
    id: lesson.id,
    slug: lesson.slug,
    title: lesson.title,
    description: lesson.description,
    content: lesson.content,
    chatLink: lesson.chatLink,
    difficulty: lesson.difficulty,
    duration: lesson.duration,
    tags: lesson.tags,
    published: lesson.published,
    featured: lesson.featured,
    order: lesson.order,
    directionId: lesson.directionId,
    createdAt: lesson.createdAt,
    updatedAt: lesson.updatedAt,
    is_favorite: lesson.userStatus.isFavorite,
    is_completed: lesson.userStatus.isCompleted,
    completed_at: lesson.userStatus.completedAt?.toISOString() || null,
    directionName: lesson.direction?.name,
    direction_slug: lesson.direction?.slug,
    direction_icon: lesson.direction?.icon,
    directionColor: lesson.direction?.color,
    direction: lesson.direction ? {
      id: lesson.direction.id,
      name: lesson.direction.name,
      slug: lesson.direction.slug,
      icon: lesson.direction.icon,
      color: lesson.direction.color,
    } : undefined,
  }
}

/**
 * Хук-адаптер для замены useLessons
 * Предоставляет тот же API, что и оригинальный хук
 */
export function useLessonsAdapter() {
  const {
    lessons,
    directions,
    loading,
    error,
    loadLessons,
    loadLessonsByDirection,
    loadFavorites,
    loadCompleted,
    loadDirections,
    toggleFavorite,
    toggleCompleted,
    getLessonById,
    getFavoriteLessons,
    getCompletedLessons,
    getLessonsByDirection,
    clearCache,
  } = useLessonStore()

  // Конвертируем Map в формат, ожидаемый старым API
  const lessonsMap = new Map<string, LessonWithStatus>()
  lessons.forEach((lesson, id) => {
    lessonsMap.set(id, convertLessonWithUserDataToLessonWithStatus(lesson))
  })

  const directionsMap = new Map<string, any>()
  directions.forEach((direction, id) => {
    directionsMap.set(direction.slug, direction)
  })

  const favoritesSet = new Set<string>()
  const completedSet = new Set<string>()
  
  lessons.forEach((lesson, id) => {
    if (lesson.userStatus.isFavorite) favoritesSet.add(id)
    if (lesson.userStatus.isCompleted) completedSet.add(id)
  })

  // Адаптированные методы переключения
  const adaptedToggleFavorite = async (lessonId: string, lessonOrder: number) => {
    await toggleFavorite(lessonId)
  }

  const adaptedToggleCompleted = async (lessonId: string, lessonOrder: number) => {
    await toggleCompleted(lessonId)
  }

  // Адаптированные селекторы
  const adaptedGetLessonById = (id: string): LessonWithStatus | undefined => {
    const lesson = getLessonById(id)
    return lesson ? convertLessonWithUserDataToLessonWithStatus(lesson) : undefined
  }

  const adaptedGetFavoriteLessons = (): LessonWithStatus[] => {
    return getFavoriteLessons().map(convertLessonWithUserDataToLessonWithStatus)
  }

  const adaptedGetCompletedLessons = (): LessonWithStatus[] => {
    return getCompletedLessons().map(convertLessonWithUserDataToLessonWithStatus)
  }

  const adaptedGetLessonsByDirection = (directionSlug: string): LessonWithStatus[] => {
    const direction = Array.from(directions.values()).find(d => d.slug === directionSlug)
    if (!direction) return []
    
    return getLessonsByDirection(direction.id).map(convertLessonWithUserDataToLessonWithStatus)
  }

  // Адаптированные методы загрузки
  const adaptedLoadLessonsByDirection = async (directionSlug: string, force = false) => {
    const direction = Array.from(directions.values()).find(d => d.slug === directionSlug)
    if (direction) {
      await loadLessons({ directionId: direction.id }, force)
    }
  }

  // Адаптированные утилиты
  const isLoading = (key?: string) => {
    if (!key) return loading
    // Для совместимости с оригинальным API
    return loading
  }

  const getError = (key?: string) => {
    return error
  }

  return {
    state: {
      lessons: lessonsMap,
      directions: directionsMap,
      favorites: favoritesSet,
      completed: completedSet,
      loading: {
        lessons: loading,
        favorites: loading,
        completed: loading,
        toggles: new Set<string>(), // TODO: implement toggle loading tracking
      },
      errors: {
        lessons: error,
        favorites: error,
        completed: error,
        toggles: new Map<string, string>(), // TODO: implement toggle error tracking
      },
      cache: {
        lastFetch: new Map<string, number>(),
        ttl: 5 * 60 * 1000,
      },
    },
    loadLessons,
    loadLessonsByDirection: adaptedLoadLessonsByDirection,
    loadFavorites,
    loadCompleted,
    loadDirections,
    toggleFavorite: adaptedToggleFavorite,
    toggleCompleted: adaptedToggleCompleted,
    getLessonById: adaptedGetLessonById,
    getFavoriteLessons: adaptedGetFavoriteLessons,
    getCompletedLessons: adaptedGetCompletedLessons,
    getLessonsByDirection: adaptedGetLessonsByDirection,
    clearCache,
    isLoading,
    getError,
  }
}

/**
 * Хук-адаптер для замены useFavoriteLessons
 */
export function useFavoriteLessonsAdapter() {
  const { getFavoriteLessons, loadFavorites, loading, error } = useLessonStore()

  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  return {
    lessons: getFavoriteLessons().map(convertLessonWithUserDataToLessonWithStatus),
    isLoading: loading,
    error,
    reload: async () => {
      await loadFavorites(true)
    },
  }
}

/**
 * Хук-адаптер для замены useCompletedLessons
 */
export function useCompletedLessonsAdapter() {
  const { getCompletedLessons, loadCompleted, loading, error } = useLessonStore()

  useEffect(() => {
    loadCompleted()
  }, [loadCompleted])

  return {
    lessons: getCompletedLessons().map(convertLessonWithUserDataToLessonWithStatus),
    isLoading: loading,
    error,
    reload: async () => {
      await loadCompleted(true)
    },
  }
}

/**
 * Хук-адаптер для замены useLessonsByDirection
 */
export function useLessonsByDirectionAdapter(directionSlug: string) {
  const { 
    getLessonsByDirection, 
    loadLessons, 
    directions, 
    loading, 
    error 
  } = useLessonStore()

  const direction = Array.from(directions.values()).find(d => d.slug === directionSlug)

  useEffect(() => {
    if (direction) {
      loadLessons({ directionId: direction.id })
    }
  }, [loadLessons, direction])

  const lessons = direction 
    ? getLessonsByDirection(direction.id).map(convertLessonWithUserDataToLessonWithStatus)
    : []

  return {
    lessons,
    isLoading: loading,
    error,
    reload: () => {
      if (direction) {
        loadLessons({ directionId: direction.id }, true)
      }
    },
  }
}

/**
 * Хук-адаптер для замены useLessonToggle
 */
export function useLessonToggleAdapter(lessonId: string, lessonOrder: number) {
  const { 
    getLessonById, 
    toggleFavorite, 
    toggleCompleted, 
    loading 
  } = useLessonStore()

  const lesson = getLessonById(lessonId)
  const adaptedLesson = lesson ? convertLessonWithUserDataToLessonWithStatus(lesson) : undefined

  return {
    lesson: adaptedLesson,
    isToggling: loading, // TODO: implement per-lesson toggle loading
    toggleError: null, // TODO: implement per-lesson toggle errors
    toggleFavorite: () => toggleFavorite(lessonId),
    toggleCompleted: () => toggleCompleted(lessonId),
  }
}
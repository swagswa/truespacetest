'use client'

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { apiClient, type Lesson, type Direction, getTelegramId } from '@/lib/api'

// Типы для состояния
export interface LessonWithStatus extends Lesson {
  is_favorite: boolean
  is_completed: boolean
  direction?: {
    id: number
    name: string
    slug: string
    icon?: string
    color?: string
  }
}

export interface LessonsState {
  lessons: Map<string, LessonWithStatus> // key: lesson.id
  directions: Map<string, Direction> // key: direction.slug
  favorites: Set<string> // lesson ids
  completed: Set<string> // lesson ids
  loading: {
    lessons: boolean
    favorites: boolean
    completed: boolean
    toggles: Set<string> // lesson ids being toggled
  }
  errors: {
    lessons: string | null
    favorites: string | null
    completed: string | null
    toggles: Map<string, string> // lesson id -> error message
  }
  cache: {
    lastFetch: Map<string, number> // ключ -> timestamp
    ttl: number // время жизни кэша в миллисекундах
  }
}

// Типы действий
type LessonsAction =
  | { type: 'SET_LOADING'; payload: { key: keyof LessonsState['loading']; value: boolean } }
  | { type: 'SET_ERROR'; payload: { key: keyof LessonsState['errors']; value: string | null } }
  | { type: 'SET_TOGGLE_LOADING'; payload: { lessonId: string; loading: boolean } }
  | { type: 'SET_TOGGLE_ERROR'; payload: { lessonId: string; error: string | null } }
  | { type: 'SET_LESSONS'; payload: LessonWithStatus[] }
  | { type: 'SET_DIRECTIONS'; payload: Direction[] }
  | { type: 'SET_FAVORITES'; payload: LessonWithStatus[] }
  | { type: 'SET_COMPLETED'; payload: LessonWithStatus[] }
  | { type: 'TOGGLE_FAVORITE_OPTIMISTIC'; payload: { lessonId: string; isFavorite: boolean } }
  | { type: 'TOGGLE_COMPLETED_OPTIMISTIC'; payload: { lessonId: string; isCompleted: boolean } }
  | { type: 'UPDATE_LESSON_STATUS'; payload: { lessonId: string; is_favorite?: boolean; is_completed?: boolean } }
  | { type: 'UPDATE_CACHE_TIMESTAMP'; payload: { key: string } }
  | { type: 'CLEAR_CACHE' }

// Начальное состояние
const initialState: LessonsState = {
  lessons: new Map(),
  directions: new Map(),
  favorites: new Set(),
  completed: new Set(),
  loading: {
    lessons: false,
    favorites: false,
    completed: false,
    toggles: new Set(),
  },
  errors: {
    lessons: null,
    favorites: null,
    completed: null,
    toggles: new Map(),
  },
  cache: {
    lastFetch: new Map(),
    ttl: 5 * 60 * 1000, // 5 минут
  },
}

// Reducer
function lessonsReducer(state: LessonsState, action: LessonsAction): LessonsState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      }

    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.value,
        },
      }

    case 'SET_TOGGLE_LOADING': {
      const newToggles = new Set(state.loading.toggles)
      if (action.payload.loading) {
        newToggles.add(action.payload.lessonId)
      } else {
        newToggles.delete(action.payload.lessonId)
      }
      return {
        ...state,
        loading: {
          ...state.loading,
          toggles: newToggles,
        },
      }
    }

    case 'SET_TOGGLE_ERROR': {
      const newErrors = new Map(state.errors.toggles)
      if (action.payload.error) {
        newErrors.set(action.payload.lessonId, action.payload.error)
      } else {
        newErrors.delete(action.payload.lessonId)
      }
      return {
        ...state,
        errors: {
          ...state.errors,
          toggles: newErrors,
        },
      }
    }

    case 'SET_LESSONS': {
      const lessonsMap = new Map<string, LessonWithStatus>()
      action.payload.forEach(lesson => {
        lessonsMap.set(lesson.id, lesson)
      })
      return {
        ...state,
        lessons: lessonsMap,
      }
    }

    case 'SET_DIRECTIONS': {
      const directionsMap = new Map<string, Direction>()
      action.payload.forEach(direction => {
        directionsMap.set(direction.slug, direction)
      })
      return {
        ...state,
        directions: directionsMap,
      }
    }

    case 'SET_FAVORITES': {
      const favoritesSet = new Set<string>()
      const lessonsMap = new Map(state.lessons)
      
      action.payload.forEach(lesson => {
        favoritesSet.add(lesson.id)
        lessonsMap.set(lesson.id, { ...lesson, is_favorite: true })
      })
      
      return {
        ...state,
        lessons: lessonsMap,
        favorites: favoritesSet,
      }
    }

    case 'SET_COMPLETED': {
      const completedSet = new Set<string>()
      const lessonsMap = new Map(state.lessons)
      
      action.payload.forEach(lesson => {
        completedSet.add(lesson.id)
        lessonsMap.set(lesson.id, { ...lesson, is_completed: true })
      })
      
      return {
        ...state,
        lessons: lessonsMap,
        completed: completedSet,
      }
    }

    case 'TOGGLE_FAVORITE_OPTIMISTIC': {
      const lesson = state.lessons.get(action.payload.lessonId)
      if (!lesson) return state

      const updatedLesson = { ...lesson, is_favorite: action.payload.isFavorite }
      const newLessons = new Map(state.lessons)
      newLessons.set(action.payload.lessonId, updatedLesson)

      const newFavorites = new Set(state.favorites)
      if (action.payload.isFavorite) {
        newFavorites.add(action.payload.lessonId)
      } else {
        newFavorites.delete(action.payload.lessonId)
      }

      return {
        ...state,
        lessons: newLessons,
        favorites: newFavorites,
      }
    }

    case 'TOGGLE_COMPLETED_OPTIMISTIC': {
      const lesson = state.lessons.get(action.payload.lessonId)
      if (!lesson) return state

      const updatedLesson = { ...lesson, is_completed: action.payload.isCompleted }
      const newLessons = new Map(state.lessons)
      newLessons.set(action.payload.lessonId, updatedLesson)

      const newCompleted = new Set(state.completed)
      if (action.payload.isCompleted) {
        newCompleted.add(action.payload.lessonId)
      } else {
        newCompleted.delete(action.payload.lessonId)
      }

      return {
        ...state,
        lessons: newLessons,
        completed: newCompleted,
      }
    }

    case 'UPDATE_LESSON_STATUS': {
      const lesson = state.lessons.get(action.payload.lessonId)
      if (!lesson) return state

      const updatedLesson = {
        ...lesson,
        ...(action.payload.is_favorite !== undefined && { is_favorite: action.payload.is_favorite }),
        ...(action.payload.is_completed !== undefined && { is_completed: action.payload.is_completed }),
      }

      const newLessons = new Map(state.lessons)
      newLessons.set(action.payload.lessonId, updatedLesson)

      const newFavorites = new Set(state.favorites)
      const newCompleted = new Set(state.completed)

      if (action.payload.is_favorite !== undefined) {
        if (action.payload.is_favorite) {
          newFavorites.add(action.payload.lessonId)
        } else {
          newFavorites.delete(action.payload.lessonId)
        }
      }

      if (action.payload.is_completed !== undefined) {
        if (action.payload.is_completed) {
          newCompleted.add(action.payload.lessonId)
        } else {
          newCompleted.delete(action.payload.lessonId)
        }
      }

      return {
        ...state,
        lessons: newLessons,
        favorites: newFavorites,
        completed: newCompleted,
      }
    }

    case 'UPDATE_CACHE_TIMESTAMP': {
      const newLastFetch = new Map(state.cache.lastFetch)
      newLastFetch.set(action.payload.key, Date.now())
      return {
        ...state,
        cache: {
          ...state.cache,
          lastFetch: newLastFetch,
        },
      }
    }

    case 'CLEAR_CACHE':
      return {
        ...state,
        cache: {
          ...state.cache,
          lastFetch: new Map(),
        },
      }

    default:
      return state
  }
}

// Контекст
interface LessonsContextType {
  state: LessonsState
  // Методы загрузки данных
  loadLessons: (force?: boolean) => Promise<void>
  loadLessonsByDirection: (directionSlug: string, force?: boolean) => Promise<void>
  loadFavorites: (force?: boolean) => Promise<void>
  loadCompleted: (force?: boolean) => Promise<void>
  loadDirections: (force?: boolean) => Promise<void>
  // Методы управления состоянием
  toggleFavorite: (lessonId: string, lessonOrder: number) => Promise<void>
  toggleCompleted: (lessonId: string, lessonOrder: number) => Promise<void>
  // Селекторы
  getLessonById: (id: string) => LessonWithStatus | undefined
  getFavoriteLessons: () => LessonWithStatus[]
  getCompletedLessons: () => LessonWithStatus[]
  getLessonsByDirection: (directionSlug: string) => LessonWithStatus[]
  // Утилиты
  clearCache: () => void
  isLoading: (key?: keyof LessonsState['loading']) => boolean
  getError: (key?: keyof LessonsState['errors']) => string | null
}

const LessonsContext = createContext<LessonsContextType | undefined>(undefined)

// Провайдер
export function LessonsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(lessonsReducer, initialState)

  // Проверка актуальности кэша
  const isCacheValid = useCallback((key: string) => {
    const lastFetch = state.cache.lastFetch.get(key)
    if (!lastFetch) return false
    return Date.now() - lastFetch < state.cache.ttl
  }, [state.cache.ttl]) // Убираем state.cache.lastFetch из зависимостей

  // Загрузка уроков
  const loadLessons = useCallback(async (force = false) => {
    if (!force && isCacheValid('lessons')) {
      return
    }

    dispatch({ type: 'SET_LOADING', payload: { key: 'lessons', value: true } })
    dispatch({ type: 'SET_ERROR', payload: { key: 'lessons', value: null } })

    try {
      const lessons = await apiClient.getLessons()
      const lessonsWithStatus: LessonWithStatus[] = lessons.map(lesson => ({
        ...lesson,
        slug: lesson.slug, // Explicitly include lesson slug
        is_favorite: lesson.is_favorite || false,
        is_completed: lesson.is_completed || false,
        direction: lesson.directionName ? {
          id: lesson.directionId,
          name: lesson.directionName,
          slug: lesson.direction_slug || '',
          icon: lesson.direction_icon,
          color: lesson.directionColor,
        } : undefined,
      }))

      dispatch({ type: 'SET_LESSONS', payload: lessonsWithStatus })
      dispatch({ type: 'UPDATE_CACHE_TIMESTAMP', payload: { key: 'lessons' } })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки уроков'
      dispatch({ type: 'SET_ERROR', payload: { key: 'lessons', value: errorMessage } })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'lessons', value: false } })
    }
  }, [isCacheValid])

  // Загрузка уроков по направлению
  const loadLessonsByDirection = useCallback(async (directionSlug: string, force = false) => {
    // Проверяем, есть ли уже уроки для этого направления
    const existingLessons = Array.from(state.lessons.values()).filter(
      lesson => lesson.direction?.slug === directionSlug
    )
    
    // Используем специальный ключ кэша для каждого направления
    const cacheKey = `lessons_${directionSlug}`
    
    if (!force && existingLessons.length > 0 && isCacheValid(cacheKey)) {
      return
    }
    dispatch({ type: 'SET_LOADING', payload: { key: 'lessons', value: true } })
    dispatch({ type: 'SET_ERROR', payload: { key: 'lessons', value: null } })

    try {
      const lessons = await apiClient.getLessonsByDirection(directionSlug)
      const lessonsWithStatus: LessonWithStatus[] = lessons.map(lesson => ({
        ...lesson,
        slug: lesson.slug, // Explicitly include lesson slug
        is_favorite: lesson.is_favorite || false,
        is_completed: lesson.is_completed || false,
        direction: {
          id: lesson.directionId,
          name: lesson.directionName || '',
          slug: directionSlug,
          icon: lesson.direction_icon,
          color: lesson.directionColor,
        },
      }))

      // Обновляем только уроки этого направления в общем состоянии
      const newLessons = new Map(state.lessons)
      lessonsWithStatus.forEach(lesson => {
        newLessons.set(lesson.id, lesson)
      })
      
      dispatch({ type: 'SET_LESSONS', payload: Array.from(newLessons.values()) })
      dispatch({ type: 'UPDATE_CACHE_TIMESTAMP', payload: { key: cacheKey } })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки уроков направления'
      dispatch({ type: 'SET_ERROR', payload: { key: 'lessons', value: errorMessage } })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'lessons', value: false } })
    }
  }, [isCacheValid]) // Убираем state.lessons из зависимостей

  // Загрузка избранных
  const loadFavorites = useCallback(async (force = false) => {
    if (!force && isCacheValid('favorites')) return

    dispatch({ type: 'SET_LOADING', payload: { key: 'favorites', value: true } })
    dispatch({ type: 'SET_ERROR', payload: { key: 'favorites', value: null } })

    try {
      const telegramId = getTelegramId()
      if (!telegramId) {
        throw new Error('Telegram ID не найден')
      }

      const favorites = await apiClient.getFavorites(telegramId)
      const favoritesWithStatus: LessonWithStatus[] = favorites.map(lesson => ({
        ...lesson,
        slug: lesson.slug, // Explicitly include lesson slug
        is_favorite: true,
        is_completed: lesson.is_completed || false,
        direction: lesson.directionName ? {
          id: lesson.directionId,
          name: lesson.directionName,
          slug: lesson.direction_slug || '',
          icon: lesson.direction_icon,
          color: lesson.directionColor,
        } : undefined,
      }))

      dispatch({ type: 'SET_FAVORITES', payload: favoritesWithStatus })
      dispatch({ type: 'UPDATE_CACHE_TIMESTAMP', payload: { key: 'favorites' } })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки избранных'
      dispatch({ type: 'SET_ERROR', payload: { key: 'favorites', value: errorMessage } })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'favorites', value: false } })
    }
  }, [isCacheValid])

  // Загрузка пройденных
  const loadCompleted = useCallback(async (force = false) => {
    if (!force && isCacheValid('completed')) {
      return
    }

    dispatch({ type: 'SET_LOADING', payload: { key: 'completed', value: true } })
    dispatch({ type: 'SET_ERROR', payload: { key: 'completed', value: null } })

    try {
      const telegramId = getTelegramId()
      if (!telegramId) {
        throw new Error('Telegram ID не найден')
      }

      const completed = await apiClient.getCompleted(telegramId)
      
      const completedWithStatus: LessonWithStatus[] = completed.map(lesson => ({
        ...lesson,
        slug: lesson.slug, // Explicitly include lesson slug
        is_favorite: lesson.is_favorite || false,
        is_completed: lesson.is_completed !== undefined ? lesson.is_completed : true,
        direction: lesson.directionName ? {
          id: lesson.directionId,
          name: lesson.directionName,
          slug: lesson.direction_slug || '',
          icon: lesson.direction_icon,
          color: lesson.directionColor,
        } : undefined,
      }))

      dispatch({ type: 'SET_COMPLETED', payload: completedWithStatus })
      dispatch({ type: 'UPDATE_CACHE_TIMESTAMP', payload: { key: 'completed' } })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки пройденных'
      dispatch({ type: 'SET_ERROR', payload: { key: 'completed', value: errorMessage } })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'completed', value: false } })
    }
  }, [isCacheValid])

  // Загрузка направлений
  const loadDirections = useCallback(async (force = false) => {
    try {
      const directions = await apiClient.getDirections()
      dispatch({ type: 'SET_DIRECTIONS', payload: directions })
    } catch (error) {
      console.error('Ошибка загрузки направлений:', error)
    }
  }, [])

  // Переключение избранного
  const toggleFavorite = useCallback(async (lessonId: string, lessonOrder: number) => {
    const lesson = state.lessons.get(lessonId)
    if (!lesson) return

    const newFavoriteStatus = !lesson.is_favorite

    // Optimistic update
    dispatch({ type: 'TOGGLE_FAVORITE_OPTIMISTIC', payload: { lessonId, isFavorite: newFavoriteStatus } })
    dispatch({ type: 'SET_TOGGLE_LOADING', payload: { lessonId, loading: true } })
    dispatch({ type: 'SET_TOGGLE_ERROR', payload: { lessonId, error: null } })

    try {
      const result = await apiClient.toggleFavoriteStatus(lessonOrder)
      // Обновляем состояние с реальными данными с сервера
      dispatch({ type: 'UPDATE_LESSON_STATUS', payload: { lessonId, is_favorite: result.isFavorite } })
      // Инвалидируем кэш для favorites и completed, чтобы данные перезагрузились на других страницах
      dispatch({ type: 'UPDATE_CACHE_TIMESTAMP', payload: { key: 'favorites' } })
      dispatch({ type: 'UPDATE_CACHE_TIMESTAMP', payload: { key: 'completed' } })
    } catch (error) {
      // Откатываем optimistic update
      dispatch({ type: 'TOGGLE_FAVORITE_OPTIMISTIC', payload: { lessonId, isFavorite: lesson.is_favorite } })
      const errorMessage = error instanceof Error ? error.message : 'Ошибка изменения статуса избранного'
      dispatch({ type: 'SET_TOGGLE_ERROR', payload: { lessonId, error: errorMessage } })
    } finally {
      dispatch({ type: 'SET_TOGGLE_LOADING', payload: { lessonId, loading: false } })
    }
  }, [state.lessons])

  // Переключение завершения
  const toggleCompleted = useCallback(async (lessonId: string, lessonOrder: number) => {
    const lesson = state.lessons.get(lessonId)
    if (!lesson) return

    const newCompletedStatus = !lesson.is_completed

    // Optimistic update
    dispatch({ type: 'TOGGLE_COMPLETED_OPTIMISTIC', payload: { lessonId, isCompleted: newCompletedStatus } })
    dispatch({ type: 'SET_TOGGLE_LOADING', payload: { lessonId, loading: true } })
    dispatch({ type: 'SET_TOGGLE_ERROR', payload: { lessonId, error: null } })

    try {
      const result = await apiClient.toggleCompletedStatus(lessonOrder)
      // Обновляем состояние с реальными данными с сервера
      dispatch({ type: 'UPDATE_LESSON_STATUS', payload: { lessonId, is_completed: result.isCompleted } })
      // Инвалидируем кэш для completed и favorites, чтобы данные перезагрузились на других страницах
      dispatch({ type: 'UPDATE_CACHE_TIMESTAMP', payload: { key: 'completed' } })
      dispatch({ type: 'UPDATE_CACHE_TIMESTAMP', payload: { key: 'favorites' } })
    } catch (error) {
      // Откатываем optimistic update
      dispatch({ type: 'TOGGLE_COMPLETED_OPTIMISTIC', payload: { lessonId, isCompleted: lesson.is_completed } })
      const errorMessage = error instanceof Error ? error.message : 'Ошибка изменения статуса завершения'
      dispatch({ type: 'SET_TOGGLE_ERROR', payload: { lessonId, error: errorMessage } })
    } finally {
      dispatch({ type: 'SET_TOGGLE_LOADING', payload: { lessonId, loading: false } })
    }
  }, [state.lessons])

  // Селекторы
  const getLessonById = useCallback((id: string) => {
    return state.lessons.get(id)
  }, [state.lessons])

  const getFavoriteLessons = useCallback(() => {
    return Array.from(state.lessons.values()).filter(lesson => lesson.is_favorite)
  }, [state.lessons])

  const getCompletedLessons = useCallback(() => {
    return Array.from(state.lessons.values()).filter(lesson => lesson.is_completed)
  }, [state.lessons])

  const getLessonsByDirection = useCallback((directionSlug: string) => {
    return Array.from(state.lessons.values()).filter(lesson => lesson.direction?.slug === directionSlug)
  }, [state.lessons])

  // Утилиты
  const clearCache = useCallback(() => {
    dispatch({ type: 'CLEAR_CACHE' })
  }, [])

  const isLoading = useCallback((key?: keyof LessonsState['loading']) => {
    if (key) {
      if (key === 'toggles') {
        return state.loading.toggles.size > 0
      }
      return state.loading[key]
    }
    return Object.values(state.loading).some(loading => {
      if (typeof loading === 'boolean') return loading
      if (loading instanceof Set) return loading.size > 0
      return false
    })
  }, [state.loading])

  const getError = useCallback((key?: keyof LessonsState['errors']) => {
    if (key) {
      if (key === 'toggles') {
        const errors = Array.from(state.errors.toggles.values())
        return errors.length > 0 ? errors.join(', ') : null
      }
      return state.errors[key]
    }
    const allErrors = [
      state.errors.lessons,
      state.errors.favorites,
      state.errors.completed,
      ...Array.from(state.errors.toggles.values()),
    ].filter(Boolean)
    return allErrors.length > 0 ? allErrors.join(', ') : null
  }, [state.errors])

  const contextValue: LessonsContextType = {
    state,
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
    isLoading,
    getError,
  }

  return (
    <LessonsContext.Provider value={contextValue}>
      {children}
    </LessonsContext.Provider>
  )
}

// Хук для использования контекста
export function useLessons() {
  const context = useContext(LessonsContext)
  if (context === undefined) {
    throw new Error('useLessons must be used within a LessonsProvider')
  }
  return context
}

// Хуки для конкретных случаев использования
export function useFavoriteLessons() {
  const { getFavoriteLessons, loadFavorites, isLoading, getError } = useLessons()
  
  useEffect(() => {
    // Загружаем только избранные уроки - они уже содержат правильные статусы
    loadFavorites()
  }, [loadFavorites])
  
  return {
    lessons: getFavoriteLessons() || [],
    isLoading: isLoading('favorites'),
    error: getError('favorites'),
    reload: async () => {
      await loadFavorites(true)
    },
  }
}

export function useCompletedLessons() {
  const context = useLessons()
  const { getCompletedLessons, loadCompleted, isLoading, getError } = context
  
  useEffect(() => {
    // Загружаем только завершенные уроки - они уже содержат правильные статусы
    loadCompleted()
  }, [loadCompleted])
  
  return {
    lessons: getCompletedLessons(),
    isLoading: isLoading('completed'),
    error: getError('completed'),
    reload: async () => {
      await loadCompleted(true)
    },
  }
}

export function useLessonsByDirection(directionSlug: string) {
  const { getLessonsByDirection, loadLessonsByDirection, isLoading, getError } = useLessons()
  
  useEffect(() => {
    loadLessonsByDirection(directionSlug)
  }, [loadLessonsByDirection, directionSlug])
  
  return {
    lessons: getLessonsByDirection(directionSlug),
    isLoading: isLoading('lessons'),
    error: getError('lessons'),
    reload: () => loadLessonsByDirection(directionSlug, true),
  }
}

export function useLessonToggle(lessonId: string, lessonOrder: number) {
  const { toggleFavorite, toggleCompleted, getLessonById, state } = useLessons()
  
  const lesson = getLessonById(lessonId)
  const isToggling = state.loading.toggles.has(lessonId)
  const toggleError = state.errors.toggles.get(lessonId)
  
  return {
    lesson,
    isToggling,
    toggleError,
    toggleFavorite: () => toggleFavorite(lessonId, lessonOrder),
    toggleCompleted: () => toggleCompleted(lessonId, lessonOrder),
  }
}
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { UnifiedLesson } from '@/components/UnifiedLessonCard'
import { useLessons, useFavoriteLessons, useCompletedLessons } from '@/contexts/LessonsContext'
import { apiClient } from '@/lib/api'

// Типы фильтров
export type LessonFilter = {
  search?: string
  tags?: string[]
  completed?: boolean
  favorite?: boolean
  author?: string
  duration?: {
    min?: number
    max?: number
  }
  dateRange?: {
    from?: Date
    to?: Date
  }
}

// Типы сортировки
export type LessonSort = {
  field: 'title' | 'order' | 'duration' | 'author' | 'createdAt' | 'updatedAt'
  direction: 'asc' | 'desc'
}

// Типы пагинации
export type LessonPagination = {
  page: number
  limit: number
  total: number
  hasMore: boolean
}

interface UseLessonListOptions {
  // Источник данных
  source?: 'all' | 'favorites' | 'completed' | 'direction' | 'custom'
  directionSlug?: string
  customFetcher?: () => Promise<UnifiedLesson[]>
  
  // Фильтрация и сортировка
  initialFilter?: LessonFilter
  initialSort?: LessonSort
  
  // Пагинация
  pageSize?: number
  enablePagination?: boolean
  
  // Автообновление
  autoRefresh?: boolean
  refreshInterval?: number
  
  // Кэширование
  cacheKey?: string
  cacheTTL?: number
}

interface UseLessonListReturn {
  // Данные
  lessons: UnifiedLesson[]
  filteredLessons: UnifiedLesson[]
  
  // Состояние
  isLoading: boolean
  error: string | null
  isEmpty: boolean
  
  // Фильтрация
  filter: LessonFilter
  setFilter: (filter: Partial<LessonFilter>) => void
  clearFilter: () => void
  
  // Сортировка
  sort: LessonSort
  setSort: (sort: LessonSort) => void
  
  // Пагинация
  pagination: LessonPagination
  loadMore: () => void
  goToPage: (page: number) => void
  
  // Действия
  refresh: () => Promise<void>
  toggleFavorite: (lessonId: string, order?: number) => Promise<void>
  toggleCompleted: (lessonId: string, order?: number) => Promise<void>
  
  // Поиск
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: UnifiedLesson[]
  
  // Статистика
  stats: {
    total: number
    completed: number
    favorites: number
    filtered: number
  }
}

/**
 * Универсальный хук для управления списками уроков
 * 
 * Поддерживает:
 * - Различные источники данных
 * - Фильтрацию и поиск
 * - Сортировку
 * - Пагинацию
 * - Автообновление
 * - Кэширование
 */
export function useLessonList(options: UseLessonListOptions = {}): UseLessonListReturn {
  const {
    source = 'all',
    directionSlug,
    customFetcher,
    initialFilter = {},
    initialSort = { field: 'order', direction: 'asc' },
    pageSize = 20,
    enablePagination = false,
    autoRefresh = false,
    refreshInterval = 30000,
    cacheKey,
    cacheTTL = 300000, // 5 минут
  } = options
  
  // Состояние
  const [filter, setFilterState] = useState<LessonFilter>(initialFilter)
  const [sort, setSortState] = useState<LessonSort>(initialSort)
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState<LessonPagination>({
    page: 1,
    limit: pageSize,
    total: 0,
    hasMore: false,
  })
  const [customLessons, setCustomLessons] = useState<UnifiedLesson[]>([])
  const [customLoading, setCustomLoading] = useState(false)
  const [customError, setCustomError] = useState<string | null>(null)
  
  // Контексты для разных источников данных
  const allLessons = useLessons()
  const favoriteLessons = useFavoriteLessons()
  const completedLessons = useCompletedLessons()
  
  // Выбор источника данных
  const sourceData = useMemo(() => {
    switch (source) {
      case 'favorites':
        return favoriteLessons
      case 'completed':
        return completedLessons
      case 'custom':
        return {
          lessons: customLessons,
          isLoading: customLoading,
          error: customError,
          reload: async () => {
            if (customFetcher) {
              setCustomLoading(true)
              setCustomError(null)
              try {
                const data = await customFetcher()
                setCustomLessons(data)
              } catch (err) {
                setCustomError(err instanceof Error ? err.message : 'Ошибка загрузки')
              } finally {
                setCustomLoading(false)
              }
            }
          },
        }
      case 'direction':
        // Для направления используем общий контекст с фильтрацией
        return {
          ...allLessons,
          lessons: allLessons.lessons.filter(lesson => 
            directionSlug ? lesson.direction?.slug === directionSlug : true
          ),
        }
      default:
        return allLessons
    }
  }, [source, allLessons, favoriteLessons, completedLessons, customLessons, customLoading, customError, customFetcher, directionSlug])
  
  // Фильтрация уроков
  const filteredLessons = useMemo(() => {
    let filtered = [...sourceData.lessons]
    
    // Поиск по тексту
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(lesson => 
        lesson.title.toLowerCase().includes(query) ||
        lesson.description?.toLowerCase().includes(query) ||
        lesson.author?.toLowerCase().includes(query) ||
        lesson.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }
    
    // Фильтр по тегам
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(lesson => 
        lesson.tags?.some(tag => filter.tags!.includes(tag))
      )
    }
    
    // Фильтр по статусу завершения
    if (filter.completed !== undefined) {
      filtered = filtered.filter(lesson => 
        (lesson.is_completed || lesson.isCompleted) === filter.completed
      )
    }
    
    // Фильтр по избранному
    if (filter.favorite !== undefined) {
      filtered = filtered.filter(lesson => 
        (lesson.is_favorite || lesson.isFavorite) === filter.favorite
      )
    }
    
    // Фильтр по автору
    if (filter.author) {
      filtered = filtered.filter(lesson => 
        lesson.author?.toLowerCase().includes(filter.author!.toLowerCase())
      )
    }
    
    // Фильтр по длительности
    if (filter.duration) {
      filtered = filtered.filter(lesson => {
        if (!lesson.duration) return false
        const { min, max } = filter.duration!
        return (!min || lesson.duration >= min) && (!max || lesson.duration <= max)
      })
    }
    
    // Сортировка
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any
      
      switch (sort.field) {
        case 'title':
          aValue = a.title
          bValue = b.title
          break
        case 'order':
          aValue = a.order || 0
          bValue = b.order || 0
          break
        case 'duration':
          aValue = a.duration || 0
          bValue = b.duration || 0
          break
        case 'author':
          aValue = a.author || ''
          bValue = b.author || ''
          break
        case 'createdAt':
          aValue = new Date(a.createdAt || 0)
          bValue = new Date(b.createdAt || 0)
          break
        case 'updatedAt':
          aValue = new Date(a.updatedAt || 0)
          bValue = new Date(b.updatedAt || 0)
          break
        default:
          return 0
      }
      
      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1
      return 0
    })
    
    return filtered
  }, [sourceData.lessons, searchQuery, filter, sort])
  
  // Пагинация
  const paginatedLessons = useMemo(() => {
    if (!enablePagination) return filteredLessons
    
    const startIndex = (pagination.page - 1) * pagination.limit
    const endIndex = startIndex + pagination.limit
    return filteredLessons.slice(0, endIndex) // Для бесконечной прокрутки
  }, [filteredLessons, pagination, enablePagination])
  
  // Обновление пагинации при изменении данных
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      total: filteredLessons.length,
      hasMore: enablePagination ? filteredLessons.length > prev.page * prev.limit : false,
    }))
  }, [filteredLessons.length, enablePagination])
  
  // Автообновление
  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(() => {
      sourceData.reload?.()
    }, refreshInterval)
    
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, sourceData.reload])
  
  // Загрузка кастомных данных при монтировании
  useEffect(() => {
    if (source === 'custom' && customFetcher && customLessons.length === 0) {
      sourceData.reload?.()
    }
  }, [source, customFetcher, customLessons.length, sourceData.reload])
  
  // Функции управления
  const setFilter = useCallback((newFilter: Partial<LessonFilter>) => {
    setFilterState(prev => ({ ...prev, ...newFilter }))
    setPagination(prev => ({ ...prev, page: 1 })) // Сброс на первую страницу
  }, [])
  
  const clearFilter = useCallback(() => {
    setFilterState({})
    setSearchQuery('')
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [])
  
  const setSort = useCallback((newSort: LessonSort) => {
    setSortState(newSort)
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [])
  
  const loadMore = useCallback(() => {
    if (pagination.hasMore) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }))
    }
  }, [pagination.hasMore])
  
  const goToPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }, [])
  
  const refresh = useCallback(async () => {
    await sourceData.reload?.()
  }, [sourceData.reload])
  
  const toggleFavorite = useCallback(async (lessonId: string, order?: number) => {
    // Используем методы из контекста в зависимости от источника
    if (source === 'all' || source === 'direction') {
      await allLessons.toggleFavorite?.(lessonId, order)
    } else if (source === 'favorites') {
      await favoriteLessons.toggleFavorite?.(lessonId, order)
    } else if (source === 'completed') {
      await completedLessons.toggleFavorite?.(lessonId, order)
    }
  }, [source, allLessons.toggleFavorite, favoriteLessons.toggleFavorite, completedLessons.toggleFavorite])
  
  const toggleCompleted = useCallback(async (lessonId: string, order?: number) => {
    if (source === 'all' || source === 'direction') {
      await allLessons.toggleCompleted?.(lessonId, order)
    } else if (source === 'favorites') {
      await favoriteLessons.toggleCompleted?.(lessonId, order)
    } else if (source === 'completed') {
      await completedLessons.toggleCompleted?.(lessonId, order)
    }
  }, [source, allLessons.toggleCompleted, favoriteLessons.toggleCompleted, completedLessons.toggleCompleted])
  
  // Статистика
  const stats = useMemo(() => {
    const total = sourceData.lessons.length
    const completed = sourceData.lessons.filter(l => l.is_completed || l.isCompleted).length
    const favorites = sourceData.lessons.filter(l => l.is_favorite || l.isFavorite).length
    const filtered = filteredLessons.length
    
    return { total, completed, favorites, filtered }
  }, [sourceData.lessons, filteredLessons.length])
  
  return {
    lessons: sourceData.lessons,
    filteredLessons: enablePagination ? paginatedLessons : filteredLessons,
    
    isLoading: sourceData.isLoading,
    error: sourceData.error,
    isEmpty: filteredLessons.length === 0,
    
    filter,
    setFilter,
    clearFilter,
    
    sort,
    setSort,
    
    pagination,
    loadMore,
    goToPage,
    
    refresh,
    toggleFavorite,
    toggleCompleted,
    
    searchQuery,
    setSearchQuery,
    searchResults: filteredLessons,
    
    stats,
  }
}
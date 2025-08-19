'use client'

import React, { memo, useMemo, useCallback, useEffect } from 'react'
import { FixedSizeList as List } from 'react-window'
import UnifiedLessonCard from './UnifiedLessonCard'
import type { UnifiedLesson, LessonCardVariant, LessonCardSize } from './UnifiedLessonCard'
import { useLessonsStore } from '@/stores/lesson-store'

import { cn } from '@/lib/utils'

// Типы макетов
export type LessonListLayout = 'grid' | 'list' | 'masonry'
export type LessonListDensity = 'comfortable' | 'compact' | 'dense'

interface UnifiedLessonListProps {
  lessons?: UnifiedLesson[] // Опциональный, может использовать данные из store
  layout?: LessonListLayout
  density?: LessonListDensity
  variant?: LessonCardVariant
  size?: LessonCardSize
  className?: string
  
  // Виртуализация
  virtualized?: boolean
  itemHeight?: number
  listHeight?: number
  
  // Настройки отображения
  showLessonNumbers?: boolean
  showActions?: boolean
  showDescription?: boolean
  showTags?: boolean
  showMetadata?: boolean
  expandable?: boolean
  
  // Сетка
  columns?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  
  // Обработчики событий
  onLessonClick?: (chatLink: string) => void
  onToggleFavorite?: (lessonId: string, order?: number) => void
  onToggleCompleted?: (lessonId: string, order?: number) => void
  
  // Состояния
  isLoading?: boolean
  error?: string
  emptyState?: React.ReactNode
  
  // Zustand store интеграция
  useStoreData?: boolean // Использовать данные из store
  filterType?: 'all' | 'favorites' | 'completed' | 'direction' // Тип фильтрации
  directionId?: string // ID направления для фильтрации
  autoRefresh?: boolean // Автоматическое обновление данных
}

interface VirtualListItemProps {
  index: number
  style: React.CSSProperties
  data: {
    lessons: UnifiedLesson[]
    variant: LessonCardVariant
    size: LessonCardSize
    showLessonNumbers: boolean
    showActions: boolean
    showDescription: boolean
    showTags: boolean
    showMetadata: boolean
    expandable: boolean
    onLessonClick?: (chatLink: string) => void
    onToggleFavorite?: (lessonId: string, order?: number) => void
    onToggleCompleted?: (lessonId: string, order?: number) => void
  }
}

/**
 * Компонент элемента виртуализированного списка
 */
const VirtualListItem = memo<VirtualListItemProps>(function VirtualListItem({ index, style, data }) {
  const {
    lessons,
    variant,
    size,
    showLessonNumbers,
    showActions,
    showDescription,
    showTags,
    showMetadata,
    expandable,
    onLessonClick,
    onToggleFavorite,
    onToggleCompleted,
  } = data
  
  const lesson = lessons[index]
  
  const handleToggleFavorite = useCallback(() => {
    if (onToggleFavorite) {
      onToggleFavorite(lesson.id, lesson.order)
    }
  }, [lesson.id, lesson.order, onToggleFavorite])
  
  const handleToggleCompleted = useCallback(() => {
    if (onToggleCompleted) {
      onToggleCompleted(lesson.id, lesson.order)
    }
  }, [lesson.id, lesson.order, onToggleCompleted])
  
  return (
    <div style={style} className="px-2 py-1">
      <UnifiedLessonCard
        lesson={lesson}
        variant={variant}
        size={size}
        lessonNumber={showLessonNumbers ? index + 1 : undefined}
        showActions={showActions}
        showDescription={showDescription}
        showTags={showTags}
        showMetadata={showMetadata}
        expandable={expandable}
        onLessonClick={onLessonClick}
        onToggleFavorite={handleToggleFavorite}
        onToggleCompleted={handleToggleCompleted}
      />
    </div>
  )
})

/**
 * Универсальный компонент для отображения списков уроков
 * 
 * Поддерживает:
 * - Различные макеты (сетка, список, masonry)
 * - Виртуализацию для больших списков
 * - Настраиваемую плотность отображения
 * - Адаптивные колонки для сетки
 * - Состояния загрузки и ошибок
 */
const UnifiedLessonList = memo<UnifiedLessonListProps>(function UnifiedLessonList({
  lessons: propLessons,
  layout = 'grid',
  density = 'comfortable',
  variant = 'default',
  size = 'md',
  className = '',
  
  virtualized = false,
  itemHeight = 200,
  listHeight = 600,
  
  showLessonNumbers = false,
  showActions = true,
  showDescription = true,
  showTags = true,
  showMetadata = true,
  expandable = false,
  
  columns = {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
  },
  
  onLessonClick,
  onToggleFavorite,
  onToggleCompleted,
  
  isLoading: propIsLoading = false,
  error: propError,
  emptyState,
  
  useStoreData = false,
  filterType = 'all',
  directionId,
  autoRefresh = false,
}) {

  
  // Zustand store hooks
  const {
    lessons: storeLessons,
    favoriteLessons,
    completedLessons,
    isLoading: storeIsLoading,
    error: storeError,
    loadLessons,
    loadFavorites,
    loadCompleted,
    loadLessonsByDirection,
    toggleFavorite,
    toggleCompleted,
    getLessonsByDirection,
  } = useLessonsStore()
  
  // Определяем источник данных
  const lessons = useMemo(() => {
    if (!useStoreData) {
      return propLessons || []
    }
    
    switch (filterType) {
      case 'favorites':
        return favoriteLessons
      case 'completed':
        return completedLessons
      case 'direction':
        return directionId ? getLessonsByDirection(directionId) : []
      default:
        return storeLessons
    }
  }, [useStoreData, propLessons, filterType, storeLessons, favoriteLessons, completedLessons, directionId, getLessonsByDirection])
  
  // Определяем состояние загрузки и ошибки
  const isLoading = useStoreData ? storeIsLoading : propIsLoading
  const error = useStoreData ? storeError : propError
  
  // Автоматическая загрузка данных
  useEffect(() => {
    if (!useStoreData || !autoRefresh) return
    
    const loadData = async () => {
      try {
        switch (filterType) {
          case 'favorites':
            await loadFavorites()
            break
          case 'completed':
            await loadCompleted()
            break
          case 'direction':
            if (directionId) {
              await loadLessonsByDirection(directionId)
            }
            break
          default:
            await loadLessons()
        }
      } catch (err) {
        console.error('Failed to load lessons:', err)
      }
    }
    
    loadData()
  }, [useStoreData, autoRefresh, filterType, directionId, loadLessons, loadFavorites, loadCompleted, loadLessonsByDirection])
  
  // Обработчики для Zustand store
  const handleStoreToggleFavorite = useCallback(
    async (lessonId: string, order?: number) => {
      try {
        await toggleFavorite(lessonId)
        if (onToggleFavorite) {
          onToggleFavorite(lessonId, order)
        }
      } catch (err) {
        console.error('Failed to toggle favorite:', err)
      }
    },
    [toggleFavorite, onToggleFavorite]
  )
  
  const handleStoreToggleCompleted = useCallback(
    async (lessonId: string, order?: number) => {
      try {
        await toggleCompleted(lessonId)
        if (onToggleCompleted) {
          onToggleCompleted(lessonId, order)
        }
      } catch (err) {
        console.error('Failed to toggle completed:', err)
      }
    },
    [toggleCompleted, onToggleCompleted]
  )
  
  // Мемоизируем данные для виртуализации
  const virtualItemData = useMemo(
    () => ({
      lessons,
      variant,
      size,
      showLessonNumbers,
      showActions,
      showDescription,
      showTags,
      showMetadata,
      expandable,
      onLessonClick,
      onToggleFavorite: useStoreData ? handleStoreToggleFavorite : onToggleFavorite,
      onToggleCompleted: useStoreData ? handleStoreToggleCompleted : onToggleCompleted,
    }),
    [
      lessons,
      variant,
      size,
      showLessonNumbers,
      showActions,
      showDescription,
      showTags,
      showMetadata,
      expandable,
      onLessonClick,
      useStoreData,
      handleStoreToggleFavorite,
      handleStoreToggleCompleted,
      onToggleFavorite,
      onToggleCompleted,
    ]
  )
  
  // Стили для плотности
  const densityClasses = {
    comfortable: 'gap-6',
    compact: 'gap-4',
    dense: 'gap-2',
  }
  
  // Стили для колонок сетки
  const gridClasses = cn(
    'grid',
    `grid-cols-${columns.sm || 1}`,
    `md:grid-cols-${columns.md || 2}`,
    `lg:grid-cols-${columns.lg || 3}`,
    `xl:grid-cols-${columns.xl || 4}`,
    densityClasses[density]
  )
  
  // Обработчики для отдельных уроков
  const handleToggleFavorite = useCallback(
    (lessonId: string, order?: number) => {
      if (useStoreData) {
        handleStoreToggleFavorite(lessonId, order)
      } else if (onToggleFavorite) {
        onToggleFavorite(lessonId, order)
      }
    },
    [useStoreData, handleStoreToggleFavorite, onToggleFavorite]
  )
  
  const handleToggleCompleted = useCallback(
    (lessonId: string, order?: number) => {
      if (useStoreData) {
        handleStoreToggleCompleted(lessonId, order)
      } else if (onToggleCompleted) {
        onToggleCompleted(lessonId, order)
      }
    },
    [useStoreData, handleStoreToggleCompleted, onToggleCompleted]
  )
  
  // Измеряем производительность рендера
  useEffect(() => {
    measureRender()
  }, [measureRender])
  
  // Состояние загрузки
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-neutral-500 text-sm">
            {useStoreData ? 'Загрузка из store...' : 'Загрузка уроков...'}
          </p>
        </div>
      </div>
    )
  }
  
  // Состояние ошибки
  if (error) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            Ошибка загрузки
          </h3>
          <p className="text-neutral-500 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }
  
  // Пустое состояние
  if (lessons.length === 0) {
    if (emptyState) {
      return <div className={className}>{emptyState}</div>
    }
    
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <div className="text-center">
          <div className="text-neutral-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            Нет уроков
          </h3>
          <p className="text-neutral-500 text-sm">
            Уроки появятся здесь, когда они будут добавлены
          </p>
        </div>
      </div>
    )
  }
  
  // Виртуализированный список для больших объемов данных
  if (virtualized && lessons.length > 50) {
    return (
      <div className={className}>
        <List
          height={listHeight}
          itemCount={lessons.length}
          itemSize={itemHeight}
          itemData={virtualItemData}
          className="scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600"
        >
          {VirtualListItem}
        </List>
      </div>
    )
  }
  
  // Макет списка
  if (layout === 'list') {
    return (
      <div className={cn('space-y-2', className)}>
        {lessons.map((lesson, index) => (
          <UnifiedLessonCard
            key={lesson.id}
            lesson={lesson}
            variant="list"
            size={size}
            lessonNumber={showLessonNumbers ? index + 1 : undefined}
            showActions={showActions}
            showDescription={showDescription}
            showTags={showTags}
            showMetadata={showMetadata}
            expandable={expandable}
            onLessonClick={onLessonClick}
            onToggleFavorite={() => handleToggleFavorite(lesson.id, lesson.order)}
            onToggleCompleted={() => handleToggleCompleted(lesson.id, lesson.order)}
          />
        ))}
      </div>
    )
  }
  
  // Макет masonry (водопад)
  if (layout === 'masonry') {
    return (
      <div className={cn('columns-1 md:columns-2 lg:columns-3 xl:columns-4', densityClasses[density], className)}>
        {lessons.map((lesson, index) => (
          <div key={lesson.id} className="break-inside-avoid mb-4">
            <UnifiedLessonCard
              lesson={lesson}
              variant={variant}
              size={size}
              lessonNumber={showLessonNumbers ? index + 1 : undefined}
              showActions={showActions}
              showDescription={showDescription}
              showTags={showTags}
              showMetadata={showMetadata}
              expandable={expandable}
              onLessonClick={onLessonClick}
              onToggleFavorite={() => handleToggleFavorite(lesson.id, lesson.order)}
              onToggleCompleted={() => handleToggleCompleted(lesson.id, lesson.order)}
            />
          </div>
        ))}
      </div>
    )
  }
  
  // Макет сетки (по умолчанию)
  return (
    <div className={cn(gridClasses, className)}>
      {lessons.map((lesson, index) => (
        <UnifiedLessonCard
          key={lesson.id}
          lesson={lesson}
          variant={variant}
          size={size}
          lessonNumber={showLessonNumbers ? index + 1 : undefined}
          showActions={showActions}
          showDescription={showDescription}
          showTags={showTags}
          showMetadata={showMetadata}
          expandable={expandable}
          onLessonClick={onLessonClick}
          onToggleFavorite={() => handleToggleFavorite(lesson.id, lesson.order)}
          onToggleCompleted={() => handleToggleCompleted(lesson.id, lesson.order)}
        />
      ))}
    </div>
  )
})

export default UnifiedLessonList
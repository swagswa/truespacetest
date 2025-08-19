'use client'

import React, { useMemo, useCallback } from 'react'
import { FixedSizeList as List } from 'react-window'
import { Lesson, LessonWithUserData } from '@/types/lesson'
import OptimizedLessonCard from './OptimizedLessonCard'

interface VirtualizedLessonListProps {
  lessons: (Lesson | LessonWithUserData)[]
  itemHeight?: number
  height?: number
  className?: string
  onLessonClick?: (lesson: Lesson | LessonWithUserData) => void
  onToggleFavorite?: (lessonId: string) => void
  onToggleCompleted?: (lessonId: string) => void
}

interface ListItemProps {
  index: number
  style: React.CSSProperties
  data: {
    lessons: (Lesson | LessonWithUserData)[]
    onLessonClick?: (lesson: Lesson | LessonWithUserData) => void
    onToggleFavorite?: (lessonId: string) => void
    onToggleCompleted?: (lessonId: string) => void
  }
}

/**
 * Компонент элемента виртуализированного списка
 */
const ListItem = React.memo(function ListItem({ index, style, data }: ListItemProps) {
  const { lessons, onLessonClick, onToggleFavorite, onToggleCompleted } = data
  const lesson = lessons[index]

  const handleClick = useCallback(() => {
    if (onLessonClick) {
      onLessonClick(lesson)
    }
  }, [lesson, onLessonClick])

  return (
    <div style={style} className="px-2 py-1">
      <div onClick={handleClick} className="cursor-pointer">
        <OptimizedLessonCard 
          lesson={lesson}
          onToggleFavorite={onToggleFavorite}
          onToggleCompleted={onToggleCompleted}
        />
      </div>
    </div>
  )
})

/**
 * Виртуализированный список уроков для оптимальной производительности
 * при отображении больших объемов данных (1000+ элементов)
 * 
 * Особенности:
 * - Рендерит только видимые элементы
 * - Поддерживает прокрутку больших списков без потери производительности
 * - Мемоизация для предотвращения лишних рендеров
 */
const VirtualizedLessonList: React.FC<VirtualizedLessonListProps> = ({
  lessons,
  itemHeight = 200,
  height = 600,
  className = '',
  onLessonClick,
  onToggleFavorite,
  onToggleCompleted,
}) => {
  // Мемоизируем данные для передачи в List
  const itemData = useMemo(
    () => ({
      lessons,
      onLessonClick,
      onToggleFavorite,
      onToggleCompleted,
    }),
    [lessons, onLessonClick, onToggleFavorite, onToggleCompleted]
  )

  // Если уроков мало, используем обычный рендеринг
  if (lessons.length <= 20) {
    return (
      <div className={`space-y-4 ${className}`}>
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            onClick={() => onLessonClick?.(lesson)}
            className="cursor-pointer"
          >
            <OptimizedLessonCard 
              lesson={lesson}
              onToggleFavorite={onToggleFavorite}
              onToggleCompleted={onToggleCompleted}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={className}>
      <List
        height={height}
        itemCount={lessons.length}
        itemSize={itemHeight}
        itemData={itemData}
        overscanCount={5} // Рендерим 5 дополнительных элементов для плавной прокрутки
        className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        {ListItem}
      </List>
    </div>
  )
}

export default VirtualizedLessonList
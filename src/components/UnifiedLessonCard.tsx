'use client'

import React, { memo, useCallback } from 'react'
import { Heart, CheckCircle, Clock, User, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { hapticFeedback, isTelegramWebApp } from '@/lib/telegram'
import { useLessonToggleAdapter as useLessonToggle, type LessonWithStatus } from '@/hooks'
import type { LessonWithStatus as OriginalLessonWithStatus } from '@/contexts/LessonsContext'

// WebSocket functionality removed
import { cn } from '@/lib/utils'

// Типы для различных вариантов отображения
export type LessonCardVariant = 'default' | 'compact' | 'detailed' | 'list'
export type LessonCardSize = 'sm' | 'md' | 'lg'

// Расширенный интерфейс урока
export interface UnifiedLesson extends LessonWithStatus {
  learningOutcomes?: string[]
  tags?: string[]
  duration?: number
  author?: string
  chatLink?: string
  description?: string
}

interface UnifiedLessonCardProps {
  lesson: UnifiedLesson
  variant?: LessonCardVariant
  size?: LessonCardSize
  lessonNumber?: number
  className?: string
  showActions?: boolean
  showDescription?: boolean
  showTags?: boolean
  showMetadata?: boolean
  expandable?: boolean
  onLessonClick?: (chatLink: string) => void
  onToggleFavorite?: () => void
  onToggleCompleted?: () => void
}

/**
 * Единый компонент карточки урока с поддержкой различных вариантов отображения
 * 
 * Варианты:
 * - default: Стандартная карточка с основной информацией
 * - compact: Компактная версия для списков
 * - detailed: Подробная версия с расширенной информацией
 * - list: Горизонтальная версия для списков
 */
const UnifiedLessonCard = memo<UnifiedLessonCardProps>(function UnifiedLessonCard({
  lesson,
  variant = 'default',
  size = 'md',
  lessonNumber,
  className = '',
  showActions = true,
  showDescription = true,
  showTags = true,
  showMetadata = true,
  expandable = false,
  onLessonClick,
  onToggleFavorite,
  onToggleCompleted,
}) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  
  const { 
    lesson: contextLesson, 
    isToggling, 
    toggleError, 
    toggleFavorite: contextToggleFavorite, 
    toggleCompleted: contextToggleCompleted 
  } = useLessonToggle(lesson.id, lesson.order)
  

  // WebSocket sync removed

  // Используем данные из контекста, если доступны
  const currentLesson = contextLesson || lesson
  const isFavorite = contextLesson?.is_favorite ?? lesson.isFavorite ?? lesson.is_favorite ?? false
  const isCompleted = contextLesson?.is_completed ?? lesson.isCompleted ?? lesson.is_completed ?? false

  // Обработчики событий
  const handleToggleFavorite = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      if (isTelegramWebApp()) {
        hapticFeedback('impact', 'light')
      }
      
      try {
        if (onToggleFavorite) {
          onToggleFavorite()
        } else {
          await contextToggleFavorite()
        }
        
        if (connected) {
          syncLessonUpdate({
            id: currentLesson.id,
            is_favorite: !isFavorite,
            is_completed: isCompleted
          })
        }
      } catch (error) {
        console.error('Ошибка при изменении статуса избранного:', error)
      }
    },
    [isFavorite, isCompleted, currentLesson.id, onToggleFavorite, contextToggleFavorite, connected, syncLessonUpdate]
  )

  const handleToggleCompleted = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      if (isTelegramWebApp()) {
        hapticFeedback('impact', 'medium')
      }
      
      try {
        if (onToggleCompleted) {
          onToggleCompleted()
        } else {
          await contextToggleCompleted()
        }
        
        if (connected) {
          syncLessonUpdate({
            id: currentLesson.id,
            is_favorite: isFavorite,
            is_completed: !isCompleted
          })
        }
      } catch (error) {
        console.error('Ошибка при изменении статуса завершения:', error)
      }
    },
    [isFavorite, isCompleted, currentLesson.id, onToggleCompleted, contextToggleCompleted, connected, syncLessonUpdate]
  )

  const handleLessonClick = useCallback(() => {
    if (currentLesson.chatLink && onLessonClick) {
      if (isTelegramWebApp()) {
        hapticFeedback('impact', 'heavy')
      }
      onLessonClick(currentLesson.chatLink)
    }
  }, [currentLesson.chatLink, onLessonClick])

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(!isExpanded)
    if (isTelegramWebApp()) {
      hapticFeedback('impact', 'light')
    }
  }, [isExpanded])

  // Стили для разных размеров
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  // Компактный вариант
  if (variant === 'compact') {
    return (
      <Card className={cn(
        'group hover:shadow-md transition-all duration-200 cursor-pointer',
        sizeClasses[size],
        className
      )}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate group-hover:text-blue-600 transition-colors">
                {lessonNumber && <span className="text-neutral-500 mr-2">{lessonNumber}.</span>}
                {currentLesson.title}
              </h3>
              {showMetadata && (currentLesson.duration || currentLesson.author) && (
                <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                  {currentLesson.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{currentLesson.duration} мин</span>
                    </div>
                  )}
                  {currentLesson.author && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{currentLesson.author}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {showActions && (
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleFavorite}
                  disabled={isToggling}
                  className={cn(
                    'p-1 h-6 w-6',
                    isFavorite ? 'text-red-500' : 'text-neutral-400 hover:text-red-500'
                  )}
                >
                  <Heart className={cn('h-3 w-3', isFavorite && 'fill-current')} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleCompleted}
                  disabled={isToggling}
                  className={cn(
                    'p-1 h-6 w-6',
                    isCompleted ? 'text-green-500' : 'text-neutral-400 hover:text-green-500'
                  )}
                >
                  <CheckCircle className={cn('h-3 w-3', isCompleted && 'fill-current')} />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Список вариант
  if (variant === 'list') {
    return (
      <div className={cn(
        'flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer',
        sizeClasses[size],
        className
      )}>
        {lessonNumber && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400">
            {lessonNumber}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{currentLesson.title}</h3>
          {showDescription && currentLesson.description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate mt-1">
              {currentLesson.description}
            </p>
          )}
        </div>
        
        {showMetadata && (
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            {currentLesson.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{currentLesson.duration}м</span>
              </div>
            )}
          </div>
        )}
        
        {showActions && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              disabled={isToggling}
              className={cn(
                'p-1 h-6 w-6',
                isFavorite ? 'text-red-500' : 'text-neutral-400 hover:text-red-500'
              )}
            >
              <Heart className={cn('h-3 w-3', isFavorite && 'fill-current')} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleCompleted}
              disabled={isToggling}
              className={cn(
                'p-1 h-6 w-6',
                isCompleted ? 'text-green-500' : 'text-neutral-400 hover:text-green-500'
              )}
            >
              <CheckCircle className={cn('h-3 w-3', isCompleted && 'fill-current')} />
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Стандартный и детальный варианты
  const isDetailed = variant === 'detailed'
  
  return (
    <Card className={cn(
      'group hover:shadow-lg transition-all duration-200',
      sizeClasses[size],
      className
    )}>
      <CardHeader className={cn('pb-3', size === 'sm' && 'pb-2')}>
        <div className="flex items-start justify-between">
          <CardTitle className={cn(
            'font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors',
            size === 'sm' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-lg'
          )}>
            {lessonNumber && (
              <span className="text-neutral-500 mr-2">{lessonNumber}.</span>
            )}
            {currentLesson.title}
          </CardTitle>
          
          {showActions && (
            <div className="flex gap-1 ml-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleFavorite}
                disabled={isToggling}
                className={cn(
                  'p-1 h-8 w-8 transition-colors',
                  isFavorite ? 'text-red-500 hover:text-red-600' : 'text-neutral-400 hover:text-red-500'
                )}
                aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
              >
                <Heart className={cn('h-4 w-4 transition-all', isFavorite && 'fill-current')} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleCompleted}
                disabled={isToggling}
                className={cn(
                  'p-1 h-8 w-8 transition-colors',
                  isCompleted ? 'text-green-500 hover:text-green-600' : 'text-neutral-400 hover:text-green-500'
                )}
                aria-label={isCompleted ? 'Отметить как незавершенный' : 'Отметить как завершенный'}
              >
                <CheckCircle className={cn('h-4 w-4 transition-all', isCompleted && 'fill-current')} />
              </Button>
              
              {expandable && isDetailed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleExpand}
                  className="p-1 h-8 w-8 text-neutral-400 hover:text-neutral-600"
                  aria-label={isExpanded ? 'Свернуть' : 'Развернуть'}
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {showDescription && currentLesson.description && (
          <p className={cn(
            'text-neutral-600 dark:text-neutral-400 mb-3',
            size === 'sm' ? 'text-xs line-clamp-1' : 'text-sm line-clamp-2'
          )}>
            {currentLesson.description}
          </p>
        )}
        
        {showMetadata && (
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-3">
            <div className="flex items-center gap-3">
              {currentLesson.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{currentLesson.duration} мин</span>
                </div>
              )}
              {currentLesson.author && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{currentLesson.author}</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-1">
              {isFavorite && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  ❤️
                </Badge>
              )}
              {isCompleted && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  ✅
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {showTags && currentLesson.tags && currentLesson.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {currentLesson.tags.slice(0, isDetailed ? 10 : 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {!isDetailed && currentLesson.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{currentLesson.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        {/* Расширенная информация для детального варианта */}
        {isDetailed && (isExpanded || !expandable) && (
          <div className="space-y-3 border-t pt-3">
            {currentLesson.learningOutcomes && currentLesson.learningOutcomes.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Результаты обучения:</h4>
                <ul className="space-y-1">
                  {currentLesson.learningOutcomes.map((outcome, index) => (
                    <li key={index} className="text-sm text-neutral-600 dark:text-neutral-400 flex items-start">
                      <span className="mr-2 mt-1">•</span>
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {/* Кнопка действия */}
        {currentLesson.chatLink && onLessonClick && (
          <Button
            onClick={handleLessonClick}
            className={cn(
              'w-full mt-3 transition-all duration-200 flex items-center justify-center gap-2',
              size === 'sm' ? 'py-2 text-sm' : 'py-3'
            )}
          >
            <span>Смотреть урок</span>
            <ExternalLink className="w-4 h-4" />
          </Button>
        )}
        
        {/* Индикатор ошибки */}
        {toggleError && (
          <div className="mt-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
            {toggleError}
          </div>
        )}
      </CardContent>
    </Card>
  )
})

export default UnifiedLessonCard
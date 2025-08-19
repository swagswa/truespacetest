'use client'

import React, { memo, useCallback, useState } from 'react'
import { Heart, CheckCircle, Clock, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDebounce } from '@/hooks/useDebounce'
import { useLessonStore } from '@/stores/lesson-store'
// WebSocket functionality removed
import type { LessonWithUserData } from '@/types/lesson-types'
import { cn } from '@/lib/utils'

interface OptimizedLessonCardProps {
  lesson: LessonWithUserData
  className?: string
  onToggleFavorite?: (lessonId: string) => void
  onToggleCompleted?: (lessonId: string) => void
}

/**
 * Оптимизированный компонент карточки урока с:
 * - Мемоизацией для предотвращения лишних рендеров
 * - Дебаунсингом для toggle операций
 * - Оптимистичными обновлениями через Zustand store
 * - Мониторингом производительности
 * - WebSocket синхронизацией
 */
const OptimizedLessonCard = memo(function OptimizedLessonCard({
  lesson,
  className = '',
  onToggleFavorite,
  onToggleCompleted,
}: OptimizedLessonCardProps) {
  const [isToggling, setIsToggling] = useState(false)
  const { toggleFavorite, toggleCompleted } = useLessonStore()
  // WebSocket sync removed

  // Дебаунсинг для предотвращения множественных API вызовов
  const debouncedToggleFavorite = useDebounce(
    useCallback(async (lessonId: string) => {
      try {
        setIsToggling(true)
        await toggleFavorite(lessonId)
        
        // WebSocket синхронизация
        if (connected) {
          syncLessonUpdate({
            lessonId: lessonId,
            userId: 'current-user', // TODO: получить из контекста аутентификации
            type: 'favorite',
            action: !lesson.userStatus?.isFavorite ? 'add' : 'remove'
          })
        }
        
        // Вызов внешнего обработчика
        onToggleFavorite?.(lessonId)
        

      } catch (error) {
        console.error('Ошибка при изменении статуса избранного:', error)
      } finally {
        setIsToggling(false)
      }
    }, [toggleFavorite, lesson.userStatus, connected, syncLessonUpdate, onToggleFavorite]),
    300 // 300ms задержка
  )

  const debouncedToggleCompleted = useDebounce(
    useCallback(async (lessonId: string) => {
      try {
        setIsToggling(true)
        await toggleCompleted(lessonId)
        
        // WebSocket синхронизация
        if (connected) {
          syncLessonUpdate({
            lessonId: lessonId,
            userId: 'current-user', // TODO: получить из контекста аутентификации
            type: 'completed',
            action: !lesson.userStatus?.isCompleted ? 'add' : 'remove'
          })
        }
        
        // Вызов внешнего обработчика
        onToggleCompleted?.(lessonId)
        

      } catch (error) {
        console.error('Ошибка при изменении статуса завершения:', error)
      } finally {
        setIsToggling(false)
      }
    }, [toggleCompleted, lesson.userStatus, connected, syncLessonUpdate, onToggleCompleted]),
    300
  )

  const handleToggleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      debouncedToggleFavorite(lesson.id)
    },
    [debouncedToggleFavorite, lesson.id]
  )

  const handleToggleCompleted = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      debouncedToggleCompleted(lesson.id)
    },
    [debouncedToggleCompleted, lesson.id]
  )

  // Получаем статусы из userStatus
  const isFavorite = lesson.userStatus?.isFavorite || false
  const isCompleted = lesson.userStatus?.isCompleted || false

  return (
    <Card className={cn(
      'group hover:shadow-lg transition-all duration-200',
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
            {lesson.title}
          </CardTitle>
          <div className="flex gap-1 ml-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              disabled={isToggling}
              className={cn(
                'p-1 h-8 w-8 transition-colors',
                isFavorite
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-gray-400 hover:text-red-500'
              )}
              aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
            >
              <Heart
                className={cn(
                  'h-4 w-4 transition-all',
                  isFavorite && 'fill-current'
                )}
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleCompleted}
              disabled={isToggling}
              className={cn(
                'p-1 h-8 w-8 transition-colors',
                isCompleted
                  ? 'text-green-500 hover:text-green-600'
                  : 'text-gray-400 hover:text-green-500'
              )}
              aria-label={isCompleted ? 'Отметить как незавершенный' : 'Отметить как завершенный'}
            >
              <CheckCircle
                className={cn(
                  'h-4 w-4 transition-all',
                  isCompleted && 'fill-current'
                )}
              />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {lesson.content?.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {lesson.content.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            {lesson.metadata?.estimatedTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{lesson.metadata.estimatedTime} мин</span>
              </div>
            )}
            {lesson.content?.author && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{lesson.content.author}</span>
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
        
        {lesson.content?.tags && lesson.content.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {lesson.content.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {lesson.content.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{lesson.content.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
})

export default OptimizedLessonCard
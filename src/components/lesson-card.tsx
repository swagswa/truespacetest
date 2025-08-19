'use client'

import React, { useState, memo } from 'react'
import { Heart, Check, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { hapticFeedback, isTelegramWebApp } from '@/lib/telegram'
import { useLessonToggleAdapter as useLessonToggle, type LessonWithStatus } from '@/hooks'
import type { LessonWithStatus as OriginalLessonWithStatus } from '@/contexts/LessonsContext'
// Убираем неиспользуемый импорт useOptimizedToggle

// WebSocket functionality removed

interface LessonCardProps {
  lesson: LessonWithStatus & {
    learningOutcomes?: string[]
  }
  lessonNumber?: number
  onLessonClick?: (chatLink: string) => void
  onToggleFavorite?: () => void
  onToggleCompleted?: () => void
}

/**
 * Оптимизированный компонент карточки урока с:
 * - Мемоизацией для предотвращения лишних рендеров
 * - Батчингом операций для снижения нагрузки на сервер
 * - Мониторингом производительности
 */
export const LessonCard = memo<LessonCardProps>(function LessonCard({ lesson, lessonNumber, onLessonClick, onToggleFavorite, onToggleCompleted }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const { 
    lesson: contextLesson, 
    isToggling, 
    toggleError, 
    toggleFavorite: contextToggleFavorite, 
    toggleCompleted: contextToggleCompleted 
  } = useLessonToggle(lesson.id, lesson.order)
  
  // Убираем неиспользуемый optimized toggle
  // WebSocket sync removed

  // Используем данные из контекста, если доступны, иначе из props
  const currentLesson = contextLesson || lesson
  const isFavorite = contextLesson?.is_favorite ?? lesson.isFavorite ?? lesson.is_favorite ?? false
  const isCompleted = contextLesson?.is_completed ?? lesson.isCompleted ?? lesson.is_completed ?? false

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isToggling) return
    
    console.log('Heart clicked! Current isFavorite:', isFavorite, 'Lesson order:', lesson.order)
    if (isTelegramWebApp()) {
      hapticFeedback('impact', 'light')
    }
    
    measureRender(() => {
      if (onToggleFavorite) {
        onToggleFavorite()
      } else {
        // Используем contextToggleFavorite который работает с API правильно
        contextToggleFavorite()
      }
      
      // Синхронизация через WebSocket
      if (connected) {
        syncLessonUpdate({
          lessonId: lesson.id,
          userId: 'user-123', // TODO: получать из контекста пользователя
          type: 'favorite',
          action: isFavorite ? 'remove' : 'add'
        })
      }
    })
  }

  const handleCompletedToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isToggling) return
    
    console.log('Check clicked! Current isCompleted:', isCompleted, 'Lesson order:', lesson.order)
    if (isTelegramWebApp()) {
      hapticFeedback('impact', 'light')
    }
    
    measureRender(() => {
      if (onToggleCompleted) {
        onToggleCompleted()
      } else {
        // Используем contextToggleCompleted который работает с API правильно
        contextToggleCompleted()
      }
      
      // Синхронизация через WebSocket
      if (connected) {
        syncLessonUpdate({
          lessonId: lesson.id,
          userId: 'user-123', // TODO: получать из контекста пользователя
          type: 'completed',
          action: isCompleted ? 'remove' : 'add'
        })
      }
    })
  }

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
    if (isTelegramWebApp()) {
      hapticFeedback('impact', 'light')
    }
  }

  const handleLessonClick = () => {
    if (isTelegramWebApp()) {
      hapticFeedback('impact', 'medium')
    }
    if (onLessonClick) {
      onLessonClick(lesson.chatLink)
    } else {
      window.open(lesson.chatLink, '_blank')
    }
  }

  return (
    <div className="glass-button rounded-xl overflow-hidden">
      {/* Компактный заголовок */}
      <div 
        className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={handleToggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <span className="text-neutral-400 text-sm font-medium">#{lessonNumber || lesson.id}</span>
            <h3 className="text-white font-semibold text-base flex-1">
              {lesson.title}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
                onClick={handleFavoriteToggle}
                disabled={isToggling}
                className={`transition-all duration-200 ${
                  isFavorite
                    ? 'text-red-400'
                    : 'text-white/60 hover:text-red-400'
                } ${isToggling ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                title={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
              >
                <Heart 
                  className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} 
                />
            </button>
            <button
                onClick={handleCompletedToggle}
                disabled={isToggling}
                className={`transition-all duration-200 ${
                  isCompleted
                    ? 'text-green-400'
                    : 'text-white/60 hover:text-green-400'
                } ${(isToggling || isPending) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                title={isCompleted ? 'Отметить как не пройденный' : 'Отметить как пройденный'}
              >
                <Check 
                  className="w-4 h-4" 
                />
            </button>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-neutral-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            )}
          </div>
        </div>
      </div>

      
      {/* Раскрывающаяся секция с анимацией */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 space-y-4">
          {/* Error Display */}
          {toggleError && (
            <div className="mb-4 p-2 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-xs">{toggleError}</p>
            </div>
          )}

          {/* Описание */}
          <div className="pt-4">
            <p className="text-neutral-300 text-sm leading-relaxed">
              {currentLesson.description}
            </p>
          </div>

          {/* Результаты обучения */}
          {currentLesson.learningOutcomes && currentLesson.learningOutcomes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-white font-medium text-sm">Результаты обучения:</h4>
              <ul className="space-y-1">
                {currentLesson.learningOutcomes.map((outcome, index) => (
                  <li key={index} className="text-neutral-300 text-sm flex items-start">
                    <span className="text-white mr-2 mt-1">•</span>
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Кнопка */}
          <button
            onClick={handleLessonClick}
            className="w-full bg-white/80 hover:bg-white/90 text-black py-3 px-4 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 backdrop-blur-sm"
          >
            <span>Смотреть урок</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
})
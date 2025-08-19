'use client'

import React, { useEffect, useState } from 'react'
import { Heart, CheckCircle, Clock, User, ExternalLink, ArrowLeft, BookOpen, Target, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useLessonStore } from '@/stores/lesson-store'
import { hapticFeedback, isTelegramWebApp } from '@/lib/telegram'
import { cn } from '@/lib/utils'
import type { LessonWithUserData } from '@/types/lesson-types'

interface LessonDetailViewProps {
  lessonId: string
  onBack?: () => void
  onStartLesson?: (chatLink: string) => void
  className?: string
}

/**
 * Компонент детального просмотра урока
 * Использует прямой доступ к Zustand store для демонстрации нового подхода
 */
export function LessonDetailView({ 
  lessonId, 
  onBack, 
  onStartLesson, 
  className 
}: LessonDetailViewProps) {
  const {
    getLessonById,
    toggleFavorite,
    toggleCompleted,
    updateProgress,
    loading,
    error
  } = useLessonStore()

  const [lesson, setLesson] = useState<LessonWithUserData | null>(null)
  const [isToggling, setIsToggling] = useState(false)

  useEffect(() => {
    const currentLesson = getLessonById(lessonId)
    setLesson(currentLesson || null)
  }, [lessonId, getLessonById])

  const handleToggleFavorite = async () => {
    if (!lesson || isToggling) return
    
    setIsToggling(true)
    try {
      if (isTelegramWebApp()) {
        hapticFeedback('impact', 'light')
      }
      await toggleFavorite(lessonId)
    } catch (error) {
      console.error('Ошибка при изменении статуса избранного:', error)
    } finally {
      setIsToggling(false)
    }
  }

  const handleToggleCompleted = async () => {
    if (!lesson || isToggling) return
    
    setIsToggling(true)
    try {
      if (isTelegramWebApp()) {
        hapticFeedback('impact', 'medium')
      }
      await toggleCompleted(lessonId)
    } catch (error) {
      console.error('Ошибка при изменении статуса завершения:', error)
    } finally {
      setIsToggling(false)
    }
  }

  const handleStartLesson = () => {
    if (!lesson?.content.chatLink) return
    
    if (isTelegramWebApp()) {
      hapticFeedback('impact', 'heavy')
    }
    
    // Обновляем прогресс при начале урока
    if (!lesson.userStatus.isCompleted) {
      updateProgress(lessonId, {
        progressPercentage: Math.max(lesson.userStatus.progressPercentage || 0, 10),
        lastAccessedAt: new Date(),
        timeSpentMinutes: (lesson.userStatus.timeSpentMinutes || 0) + 1
      })
    }
    
    onStartLesson?.(lesson.content.chatLink)
  }

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('text-center p-8', className)}>
        <p className="text-red-500 mb-4">Ошибка загрузки урока: {error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Попробовать снова
        </Button>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className={cn('text-center p-8', className)}>
        <p className="text-neutral-500 mb-4">Урок не найден</p>
        {onBack && (
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        )}
      </div>
    )
  }

  const progressPercentage = lesson.userStatus.progressPercentage || 0
  const timeSpent = lesson.userStatus.timeSpentMinutes || 0
  const estimatedTime = lesson.metadata.estimatedTime || 0

  return (
    <div className={cn('max-w-4xl mx-auto space-y-6', className)}>
      {/* Заголовок с навигацией */}
      <div className="flex items-center justify-between">
        {onBack && (
          <Button onClick={onBack} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        )}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleToggleFavorite}
            disabled={isToggling}
            variant="ghost"
            size="sm"
            className={cn(
              'transition-colors',
              lesson.userStatus.isFavorite 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-neutral-400 hover:text-red-500'
            )}
          >
            <Heart className={cn(
              'w-4 h-4',
              lesson.userStatus.isFavorite && 'fill-current'
            )} />
          </Button>
          <Button
            onClick={handleToggleCompleted}
            disabled={isToggling}
            variant="ghost"
            size="sm"
            className={cn(
              'transition-colors',
              lesson.userStatus.isCompleted 
                ? 'text-green-500 hover:text-green-600' 
                : 'text-neutral-400 hover:text-green-500'
            )}
          >
            <CheckCircle className={cn(
              'w-4 h-4',
              lesson.userStatus.isCompleted && 'fill-current'
            )} />
          </Button>
        </div>
      </div>

      {/* Основная информация */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{lesson.content.title}</CardTitle>
              <p className="text-neutral-600 dark:text-neutral-400">
                {lesson.content.description}
              </p>
            </div>
            {lesson.metadata.thumbnailUrl && (
              <img 
                src={lesson.metadata.thumbnailUrl} 
                alt={lesson.content.title}
                className="w-24 h-24 rounded-lg object-cover ml-4"
              />
            )}
          </div>
          
          {/* Метаданные */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
            {estimatedTime > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{estimatedTime} мин</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              <span className="capitalize">{lesson.content.difficulty}</span>
            </div>
            {lesson.direction && (
              <Badge variant="secondary">
                {lesson.direction.name}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Прогресс */}
          {progressPercentage > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Прогресс</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              {timeSpent > 0 && (
                <p className="text-xs text-neutral-500">
                  Потрачено времени: {timeSpent} мин
                  {estimatedTime > 0 && ` из ${estimatedTime} мин`}
                </p>
              )}
            </div>
          )}
          
          {/* Цели обучения */}
          {lesson.metadata.learningGoals && lesson.metadata.learningGoals.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Цели обучения
              </h3>
              <ul className="space-y-2">
                {lesson.metadata.learningGoals.map((goal, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <Separator />
          
          {/* Предварительные требования */}
          {lesson.metadata.prerequisites && lesson.metadata.prerequisites.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Предварительные требования</h3>
              <ul className="space-y-1">
                {lesson.metadata.prerequisites.map((prereq, index) => (
                  <li key={index} className="text-sm text-neutral-600 dark:text-neutral-400">
                    • {prereq}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Ресурсы */}
          {lesson.metadata.resources && lesson.metadata.resources.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Дополнительные ресурсы</h3>
              <div className="space-y-2">
                {lesson.metadata.resources.map((resource, index) => (
                  <a 
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {resource.title}
                  </a>
                ))}
              </div>
            </div>
          )}
          
          {/* Загружаемые файлы */}
          {lesson.metadata.downloadableFiles && lesson.metadata.downloadableFiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Материалы для скачивания</h3>
              <div className="space-y-2">
                {lesson.metadata.downloadableFiles.map((file, index) => (
                  <a 
                    key={index}
                    href={file.url}
                    download={file.filename}
                    className="flex items-center gap-2 text-sm text-green-600 hover:text-green-800 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    {file.filename} ({file.size})
                  </a>
                ))}
              </div>
            </div>
          )}
          
          {/* Кнопка начала урока */}
          <div className="pt-4">
            <Button 
              onClick={handleStartLesson}
              disabled={!lesson.content.chatLink}
              size="lg"
              className="w-full"
            >
              {lesson.userStatus.isCompleted ? 'Повторить урок' : 'Начать урок'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LessonDetailView
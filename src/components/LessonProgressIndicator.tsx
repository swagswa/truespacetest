'use client'

import React, { useMemo } from 'react'
import { CheckCircle, Clock, Target, TrendingUp, Award } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useLessonStore } from '@/stores/lesson-store'
import { cn } from '@/lib/utils'
import type { LessonWithUserData } from '@/types/lesson-types'

interface LessonProgressIndicatorProps {
  lessonId?: string
  directionId?: string
  variant?: 'compact' | 'detailed' | 'card'
  showStats?: boolean
  showAchievements?: boolean
  className?: string
}

interface ProgressStats {
  totalLessons: number
  completedLessons: number
  favoriteLessons: number
  totalTimeSpent: number
  averageProgress: number
  completionRate: number
  streakDays: number
}

/**
 * Компонент индикатора прогресса изучения уроков
 * Использует Zustand store для получения статистики и прогресса
 */
export function LessonProgressIndicator({
  lessonId,
  directionId,
  variant = 'compact',
  showStats = true,
  showAchievements = false,
  className
}: LessonProgressIndicatorProps) {
  const {
    lessons,
    getLessonById,
    getLessonsByDirection,
    getCompletedLessons,
    getFavoriteLessons,
    getStats
  } = useLessonStore()

  // Вычисляем статистику прогресса
  const progressStats = useMemo((): ProgressStats => {
    let relevantLessons: LessonWithUserData[] = []
    
    if (lessonId) {
      const lesson = getLessonById(lessonId)
      relevantLessons = lesson ? [lesson] : []
    } else if (directionId) {
      relevantLessons = getLessonsByDirection(directionId)
    } else {
      relevantLessons = Array.from(lessons.values())
    }

    const totalLessons = relevantLessons.length
    const completedLessons = relevantLessons.filter(l => l.userStatus.isCompleted).length
    const favoriteLessons = relevantLessons.filter(l => l.userStatus.isFavorite).length
    
    const totalTimeSpent = relevantLessons.reduce(
      (sum, lesson) => sum + (lesson.userStatus.timeSpentMinutes || 0), 
      0
    )
    
    const averageProgress = totalLessons > 0 
      ? relevantLessons.reduce(
          (sum, lesson) => sum + (lesson.userStatus.progressPercentage || 0), 
          0
        ) / totalLessons
      : 0
    
    const completionRate = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0
    
    // Простая логика подсчета streak (дней подряд)
    const streakDays = calculateStreakDays(relevantLessons)

    return {
      totalLessons,
      completedLessons,
      favoriteLessons,
      totalTimeSpent,
      averageProgress,
      completionRate,
      streakDays
    }
  }, [lessons, lessonId, directionId, getLessonById, getLessonsByDirection])

  // Определяем достижения
  const achievements = useMemo(() => {
    const achievements = []
    
    if (progressStats.completedLessons >= 1) {
      achievements.push({ 
        id: 'first-lesson', 
        title: 'Первый урок', 
        description: 'Завершили первый урок',
        icon: '🎯'
      })
    }
    
    if (progressStats.completedLessons >= 5) {
      achievements.push({ 
        id: 'five-lessons', 
        title: 'Активный ученик', 
        description: 'Завершили 5 уроков',
        icon: '📚'
      })
    }
    
    if (progressStats.completedLessons >= 10) {
      achievements.push({ 
        id: 'ten-lessons', 
        title: 'Знаток', 
        description: 'Завершили 10 уроков',
        icon: '🏆'
      })
    }
    
    if (progressStats.streakDays >= 3) {
      achievements.push({ 
        id: 'streak-3', 
        title: 'Постоянство', 
        description: '3 дня подряд',
        icon: '🔥'
      })
    }
    
    if (progressStats.streakDays >= 7) {
      achievements.push({ 
        id: 'streak-7', 
        title: 'Неделя успеха', 
        description: '7 дней подряд',
        icon: '⭐'
      })
    }
    
    if (progressStats.completionRate >= 100) {
      achievements.push({ 
        id: 'perfect', 
        title: 'Перфекционист', 
        description: '100% завершение',
        icon: '💎'
      })
    }
    
    return achievements
  }, [progressStats])

  // Компактный вариант
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-neutral-600 dark:text-neutral-400">Прогресс</span>
            <span className="font-medium">
              {progressStats.completedLessons}/{progressStats.totalLessons}
            </span>
          </div>
          <Progress 
            value={progressStats.completionRate} 
            className="h-2" 
          />
        </div>
        {showAchievements && achievements.length > 0 && (
          <div className="flex items-center gap-1">
            {achievements.slice(0, 3).map(achievement => (
              <span 
                key={achievement.id}
                title={achievement.description}
                className="text-lg"
              >
                {achievement.icon}
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Детальный вариант
  if (variant === 'detailed') {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Основной прогресс */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Target className="w-4 h-4" />
              Общий прогресс
            </h3>
            <span className="text-lg font-bold">
              {Math.round(progressStats.completionRate)}%
            </span>
          </div>
          <Progress value={progressStats.completionRate} className="h-3" />
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {progressStats.completedLessons} из {progressStats.totalLessons} уроков завершено
          </p>
        </div>

        {/* Статистика */}
        {showStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {progressStats.completedLessons}
              </div>
              <div className="text-xs text-neutral-500">Завершено</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">
                {progressStats.favoriteLessons}
              </div>
              <div className="text-xs text-neutral-500">Избранных</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(progressStats.totalTimeSpent / 60)}ч
              </div>
              <div className="text-xs text-neutral-500">Потрачено</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                {progressStats.streakDays}
              </div>
              <div className="text-xs text-neutral-500">Дней подряд</div>
            </div>
          </div>
        )}

        {/* Достижения */}
        {showAchievements && achievements.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Award className="w-4 h-4" />
              Достижения
            </h4>
            <div className="flex flex-wrap gap-2">
              {achievements.map(achievement => (
                <Badge 
                  key={achievement.id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <span>{achievement.icon}</span>
                  <span className="text-xs">{achievement.title}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Карточка (по умолчанию)
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Прогресс обучения
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Основной прогресс */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Завершение уроков</span>
            <span className="font-medium">
              {progressStats.completedLessons}/{progressStats.totalLessons}
            </span>
          </div>
          <Progress value={progressStats.completionRate} className="h-2" />
        </div>

        {/* Мини-статистика */}
        {showStats && (
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {Math.round(progressStats.averageProgress)}%
              </div>
              <div className="text-xs text-neutral-500">Средний прогресс</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">
                {Math.round(progressStats.totalTimeSpent / 60)}ч
              </div>
              <div className="text-xs text-neutral-500">Время изучения</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-orange-500">
                {progressStats.streakDays}
              </div>
              <div className="text-xs text-neutral-500">Дней подряд</div>
            </div>
          </div>
        )}

        {/* Достижения */}
        {showAchievements && achievements.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Последние достижения</div>
            <div className="flex gap-2">
              {achievements.slice(-3).map(achievement => (
                <div 
                  key={achievement.id}
                  title={achievement.description}
                  className="text-2xl"
                >
                  {achievement.icon}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Вспомогательная функция для подсчета streak
function calculateStreakDays(lessons: LessonWithUserData[]): number {
  const completedDates = lessons
    .filter(lesson => lesson.userStatus.isCompleted && lesson.userStatus.completedAt)
    .map(lesson => {
      const date = lesson.userStatus.completedAt!
      return new Date(date.getFullYear(), date.getMonth(), date.getDate())
    })
    .sort((a, b) => b.getTime() - a.getTime())

  if (completedDates.length === 0) return 0

  let streak = 1
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let currentDate = completedDates[0]
  
  // Проверяем, есть ли активность сегодня или вчера
  const daysDiff = Math.floor((today.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
  if (daysDiff > 1) return 0
  
  // Считаем дни подряд
  for (let i = 1; i < completedDates.length; i++) {
    const prevDate = completedDates[i - 1]
    const currDate = completedDates[i]
    
    const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}

export default LessonProgressIndicator
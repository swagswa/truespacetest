'use client'

import { useState, useEffect, useLayoutEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuroraBackground } from '@/components/ui/aurora-background'
import UnifiedLessonList from '@/components/UnifiedLessonList'
import { useLessonList } from '@/hooks/useLessonList'
import { ArrowLeft, CheckCircle } from 'lucide-react'

// Telegram Web App utilities
const isTelegramWebApp = () => {
  if (typeof window === 'undefined') return false
  return !!(window as any).Telegram?.WebApp
}

const getTelegramWebApp = () => {
  if (typeof window === 'undefined') return null
  return (window as any).Telegram?.WebApp
}

export default function CompletedCopyPage() {
  const router = useRouter()
  const [isTgWebApp, setIsTgWebApp] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const {
    filteredLessons,
    isLoading,
    error,
    isEmpty,
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    sort,
    setSort,
    stats,
    refresh
  } = useLessonList({
    source: 'completed',
    initialFilter: { status: 'completed' },
    initialSort: { field: 'completedAt', direction: 'desc' },
    autoRefresh: true
  })

  useEffect(() => {
    setIsTgWebApp(isTelegramWebApp())
    setIsMounted(true)
  }, [])

  useLayoutEffect(() => {
    if (!isMounted) return

    // Инициализация Telegram Web App
    const tg = getTelegramWebApp()
    if (tg) {
      tg.ready()
      tg.expand()
      tg.setHeaderColor('#000000')
      tg.setBackgroundColor('#000000')
    }

    // Настройка начальных стилей для анимации
    const backButton = document.querySelector('.back-button')
    const title = document.querySelector('.page-title')
    const content = document.querySelector('.lesson-content')

    if (backButton) {
      ;(backButton as HTMLElement).style.opacity = '0'
      ;(backButton as HTMLElement).style.transform = 'translateX(-20px)'
    }
    if (title) {
      ;(title as HTMLElement).style.opacity = '0'
      ;(title as HTMLElement).style.transform = 'translateY(-20px)'
    }
    if (content) {
      ;(content as HTMLElement).style.opacity = '0'
      ;(content as HTMLElement).style.transform = 'translateY(20px)'
    }

    // Запуск анимации
    setTimeout(() => {
      setIsAnimating(true)
      
      if (backButton) {
        ;(backButton as HTMLElement).style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
        ;(backButton as HTMLElement).style.opacity = '1'
        ;(backButton as HTMLElement).style.transform = 'translateX(0)'
      }
      
      if (title) {
        ;(title as HTMLElement).style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s'
        ;(title as HTMLElement).style.opacity = '1'
        ;(title as HTMLElement).style.transform = 'translateY(0)'
      }
      
      if (content) {
        ;(content as HTMLElement).style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s'
        ;(content as HTMLElement).style.opacity = '1'
        ;(content as HTMLElement).style.transform = 'translateY(0)'
      }
    }, 100)
  }, [isMounted, filteredLessons])

  const handleBack = () => {
    router.push('/')
  }

  if (!isMounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <AuroraBackground className="absolute inset-0" />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
          <button
            onClick={handleBack}
            className="back-button flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Назад</span>
          </button>
          
          <h1 className="page-title text-xl font-bold flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            Пройденные (Копия) ({stats.total})
          </h1>
          
          <div className="w-16" /> {/* Spacer */}
        </div>

        {/* Content */}
        <div className="lesson-content flex-1 p-4">
          {error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={refresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Попробовать снова
              </button>
            </div>
          ) : (
            <UnifiedLessonList
              lessons={filteredLessons}
              isLoading={isLoading}
              isEmpty={isEmpty}
              layout="grid"
              variant="desktop"
              size="md"
              showSearch={true}
              showFilters={true}
              showSort={true}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filter={filter}
              onFilterChange={setFilter}
              sort={sort}
              onSortChange={setSort}
              emptyMessage="Пока нет пройденных уроков"
              loadingMessage="Загрузка пройденных уроков..."
              emptyIcon={<CheckCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />}
              emptyAction={
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Перейти к урокам
                </button>
              }
              className="grid gap-4"
            />
          )}
        </div>
      </div>
    </div>
  )
}
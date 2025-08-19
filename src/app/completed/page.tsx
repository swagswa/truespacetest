'use client'

import { useState, useEffect, useLayoutEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuroraBackground } from '@/components/ui/aurora-background'
import UnifiedLessonList from '@/components/UnifiedLessonList'
import { useLessonList } from '@/hooks/useLessonList'
import { isTelegramWebApp, initTelegramWebApp, hapticFeedback } from '@/lib/telegram'
import { ArrowLeft, CheckCircle } from 'lucide-react'

export default function CompletedPage() {
  const router = useRouter()
  const [isInTelegram, setIsInTelegram] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  
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
    initialSort: { field: 'completedAt', direction: 'desc' },
    autoRefresh: true
  })

  useEffect(() => {
    setIsInTelegram(isTelegramWebApp())
    setMounted(true)
    
    if (isTelegramWebApp()) {
      initTelegramWebApp()
    }
  }, [])

  useLayoutEffect(() => {
    if (!mounted || hasAnimated) return

    // Настройка начальных стилей для анимации
    const backButton = document.querySelector('[data-animate="back-button"]') as HTMLElement
    const title = document.querySelector('[data-animate="title"]') as HTMLElement
    const subtitle = document.querySelector('[data-animate="subtitle"]') as HTMLElement
    const content = document.querySelector('[data-animate="content"]') as HTMLElement

    if (backButton) {
      backButton.style.opacity = '0'
      backButton.style.transform = 'translateY(32px)'
      backButton.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out'
    }

    if (title) {
      title.style.opacity = '0'
      title.style.transform = 'translateY(32px)'
      title.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out'
    }

    if (subtitle) {
      subtitle.style.opacity = '0'
      subtitle.style.transform = 'translateY(32px)'
      subtitle.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out'
    }

    if (content) {
      content.style.opacity = '0'
      content.style.transform = 'translateY(32px)'
      content.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out'
    }

    // Запускаем анимацию
    const timer = setTimeout(() => {
      if (backButton) {
        backButton.style.opacity = '1'
        backButton.style.transform = 'translateY(0)'
      }

      if (title) {
        title.style.opacity = '1'
        title.style.transform = 'translateY(0)'
      }

      if (subtitle) {
        subtitle.style.opacity = '1'
        subtitle.style.transform = 'translateY(0)'
      }

      if (content) {
        setTimeout(() => {
          content.style.opacity = '1'
          content.style.transform = 'translateY(0)'
        }, 400)
      }

      setHasAnimated(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [mounted, hasAnimated])

  const handleBack = () => {
    if (isInTelegram) {
      hapticFeedback('impact', 'light')
    }
    router.push('/')
  }

  if (!mounted) {
    return null
  }

  return (
    <main className={`min-h-screen bg-black text-white relative ${mounted && isInTelegram ? 'tg-viewport' : ''}`}>
      <AuroraBackground>
        <div className="relative z-10 min-h-screen flex flex-col">
          <div className="w-full max-w-sm mx-auto flex flex-col relative z-10 py-4 pb-32">
            
            {/* Header */}
            <header className="relative z-10 pb-6 px-4 flex-shrink-0">
              <div className="flex items-center mb-4">
                <button 
                  onClick={handleBack}
                  className="glass-button p-2 rounded-lg mr-3"
                  data-animate="back-button"
                  suppressHydrationWarning
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1" data-animate="title" suppressHydrationWarning>
                  <h1 className="text-xl font-bold text-white flex items-center">
                    <CheckCircle 
                      className="w-5 h-5 mr-2" 
                      style={{ color: '#22c55e' }}
                    />
                    Пройденные уроки
                  </h1>
                  <p className="text-neutral-300 text-sm mt-1" data-animate="subtitle" suppressHydrationWarning>
                    {stats.total} {stats.total === 1 ? 'урок' : stats.total < 5 ? 'урока' : 'уроков'}
                    {stats.favorites > 0 && (
                      <span className="text-red-400 ml-2">• {stats.favorites} в избранном</span>
                    )}
                  </p>
                </div>
              </div>
            </header>

            {/* Content */}
            <div className="px-4 flex-1" data-animate="content" suppressHydrationWarning>
              {error ? (
                <div className="text-center py-12">
                  <p className="text-red-400 text-sm mb-4">{error}</p>
                  <button
                    onClick={refresh}
                    className="glass-button px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Попробовать снова
                  </button>
                </div>
              ) : (
                <UnifiedLessonList
                  lessons={filteredLessons}
                  isLoading={isLoading}
                  isEmpty={isEmpty}
                  layout="list"
                  variant="mobile"
                  size="sm"
                  showSearch={true}
                  showFilters={false} // Скрываем фильтры для мобильной версии
                  showSort={true}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  filter={filter}
                  onFilterChange={setFilter}
                  sort={sort}
                  onSortChange={setSort}
                  emptyMessage="Нет пройденных уроков. Завершите уроки, чтобы они появились здесь."
                  loadingMessage="Загрузка пройденных уроков..."
                  emptyIcon={<CheckCircle className="w-16 h-16 text-neutral-600 mx-auto mb-4" />}
                  emptyAction={
                    <button
                      onClick={handleBack}
                      className="glass-button px-6 py-3 rounded-lg text-sm font-medium"
                    >
                      Перейти к урокам
                    </button>
                  }
                  className="space-y-3"
                />
              )}
            </div>

          </div>
        </div>
      </AuroraBackground>
    </main>
  )
}

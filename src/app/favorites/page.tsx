'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuroraBackground } from '@/components/ui/aurora-background'
import UnifiedLessonList from '@/components/UnifiedLessonList'
import { useLessonList } from '@/hooks/useLessonList'
import { isTelegramWebApp, initTelegramWebApp, hapticFeedback } from '@/lib/telegram'
import { ArrowLeft, Heart, Plus } from 'lucide-react'

export default function FavoritesPage() {
  const router = useRouter()
  const [isInTelegram, setIsInTelegram] = useState(false)
  const [mounted, setMounted] = useState(false)

  
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
    source: 'favorites',
    initialSort: { field: 'updatedAt', direction: 'desc' },
    autoRefresh: true
  })

  useEffect(() => {
    setMounted(true)
    const isTg = isTelegramWebApp()
    setIsInTelegram(isTg)
    
    if (isTg) {
      initTelegramWebApp()
    }
  }, [])

  useEffect(() => {
    // Небольшая задержка для запуска анимаций
    const timer = setTimeout(() => {
      setMounted(true)
    }, 50)

    return () => clearTimeout(timer)
  }, [])

  const handleBack = () => {
    if (isInTelegram) {
      hapticFeedback('impact', 'light')
    }
    router.push('/')
  }

  return (
    <main className={`min-h-screen bg-black text-white relative ${mounted && isInTelegram ? 'tg-viewport' : ''}`}>
      <AuroraBackground>
        <div className="relative z-10 min-h-screen flex flex-col overflow-visible">
          <div className="w-full max-w-sm mx-auto flex flex-col relative z-10 py-4 pb-32 overflow-visible">
            
            {/* Header */}
            <header className="relative z-10 pb-6 px-4 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 flex justify-start">
                    <button 
                      onClick={handleBack}
                      className={`glass-button p-2 rounded-lg transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}
                      style={{ transitionDelay: mounted ? '100ms' : '0ms' }}
                    >
                      <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    </div>
                  
                  <div className={`flex-1 text-center transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}
                       style={{ transitionDelay: mounted ? '150ms' : '0ms' }}>
                    <h1 className="text-xl font-bold text-white flex items-center justify-center">
                      <Heart 
                        className="w-5 h-5 mr-2" 
                        style={{ color: '#ef4444', fill: '#ef4444' }}
                      />
                      Избранные уроки
                    </h1>
                  </div>
                  
                  <div className="w-12 flex justify-end">
                    {/* Пустое место для симметрии */}
                    <div className="w-10 h-10"></div>
                  </div>
                </div>
                
                {/* Статистика */}
                <div className={`flex justify-center gap-4 text-xs text-gray-400 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                     style={{ transitionDelay: mounted ? '300ms' : '0ms' }}>
                  <span>{stats.total} уроков</span>
                  <span>{stats.completed} завершено</span>
                  <span>{stats.favorites} в избранном</span>
                </div>
              </header>

              {/* Lessons */}
              <div className="px-4 mb-6">
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
                  showFilters={true}
                  showSort={true}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  filter={filter}
                  onFilterChange={setFilter}
                  sort={sort}
                  onSortChange={setSort}
                  emptyMessage="Нет избранных уроков. Добавьте уроки в избранное, чтобы быстро находить их здесь."
                  loadingMessage="Загрузка избранных уроков..."
                  emptyIcon={<Heart className="w-16 h-16 text-neutral-600 mx-auto mb-4" />}
                  emptyAction={
                    <button
                      onClick={handleBack}
                      className="glass-button px-6 py-3 rounded-lg text-sm font-medium"
                    >
                      Перейти к урокам
                    </button>
                  }
                  className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                  style={{ transitionDelay: mounted ? '400ms' : '0ms' }}
                />
              )}
              </div>

          </div>
        </div>
      </AuroraBackground>
    </main>
  )
}
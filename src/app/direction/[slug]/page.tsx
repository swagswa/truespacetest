'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AuroraBackground } from '@/components/ui/aurora-background'
import UnifiedLessonList from '@/components/UnifiedLessonList'
import { isTelegramWebApp, initTelegramWebApp, hapticFeedback } from '@/lib/telegram'
import { ArrowLeft, Plus } from 'lucide-react'
import { apiClient, type Direction } from '@/lib/api'
import { useLessonList } from '@/hooks/useLessonList'
import { useLessons } from '@/contexts/LessonsContext'

export default function DirectionPage() {
  const params = useParams()
  const router = useRouter()
  const [isInTelegram, setIsInTelegram] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [direction, setDirection] = useState<Direction | null>(null)
  const [directionError, setDirectionError] = useState<string | null>(null)
  
  const { lessons } = useLessons()
  
  const slug = params.slug as string

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
    source: 'direction',
    directionSlug: slug,
    initialSort: { field: 'order', direction: 'asc' },
    autoRefresh: true
  })

  useEffect(() => {
    const isTg = isTelegramWebApp()
    setIsInTelegram(isTg)
    
    if (isTg) {
      initTelegramWebApp()
    }

    const loadDirection = async () => {
      try {
        const directionData = await apiClient.getDirection(slug)
        setDirection(directionData)
      } catch (error) {
        console.error('Error loading direction:', error)
        const errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки направления'
        setDirectionError(errorMessage)
      }
    }

    loadDirection()
  }, [slug])

  useEffect(() => {
    if (lessons.length > 0) {
      // Находим информацию о направлении из первого урока
      const directionLessons = lessons.filter(lesson => lesson.direction?.slug === slug)
      
      if (directionLessons.length > 0 && !direction) {
        const firstLesson = directionLessons[0]
        setDirection({
          id: firstLesson.direction?.id || '',
          name: firstLesson.direction?.name || '',
          slug: firstLesson.direction?.slug || '',
          description: firstLesson.direction?.description || ''
        })
      }
    }
  }, [lessons, slug, direction])

  useEffect(() => {
    // Небольшая задержка для запуска анимаций
    const timer = setTimeout(() => {
      setMounted(true)
    }, 50)

    return () => clearTimeout(timer)
  }, [direction])

  const handleBack = () => {
    if (isInTelegram) {
      hapticFeedback('impact', 'light')
    }
    router.back()
  }

  if (directionError || (!direction && !isLoading)) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{directionError || 'Направление не найдено'}</h1>
          <button 
            onClick={handleBack}
            className="glass-button px-6 py-3 rounded-lg"
          >
            Вернуться назад
          </button>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Ошибка загрузки</h1>
          <p className="text-red-400 mb-4">{error}</p>
          <div className="space-x-4">
            <button 
              onClick={refresh}
              className="glass-button px-6 py-3 rounded-lg"
            >
              Попробовать снова
            </button>
            <button 
              onClick={handleBack}
              className="glass-button px-6 py-3 rounded-lg"
            >
              Вернуться назад
            </button>
          </div>
        </div>
      </main>
    )
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
                    <h1 className="text-xl font-bold text-white">
                      {direction?.name || 'Загрузка...'}
                    </h1>
                    {direction?.description && (
                      <p className="text-sm text-gray-300 mt-1">
                        {direction.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="w-12 flex justify-end">
                    {/* Кнопка добавления урока для админов */}
                    <button 
                      onClick={() => router.push('/admin')}
                      className={`glass-button p-2 rounded-lg transition-all duration-500 hover:bg-white/10 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}
                      style={{ transitionDelay: mounted ? '200ms' : '0ms' }}
                      title="Добавить урок"
                    >
                      <Plus className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
                
                {/* Статистика */}
                {direction && (
                  <div className={`flex justify-center gap-4 text-xs text-gray-400 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                       style={{ transitionDelay: mounted ? '300ms' : '0ms' }}>
                    <span>{stats.total} уроков</span>
                    <span>{stats.completed} завершено</span>
                    <span>{stats.favorites} в избранном</span>
                  </div>
                )}
              </header>

              {/* Lessons */}
              <div className="px-4 mb-6">
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
                  emptyMessage={`В направлении "${direction?.name || slug}" пока нет уроков`}
                  loadingMessage="Загрузка уроков направления..."
                  className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                  style={{ transitionDelay: mounted ? '400ms' : '0ms' }}
                />
              </div>

          </div>
        </div>

      </AuroraBackground>
      

    </main>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AuroraBackground } from '@/components/ui/aurora-background'
import UnifiedLessonList from '@/components/UnifiedLessonList'
import { useLessonList } from '@/hooks/useLessonList'
import { isTelegramWebApp, initTelegramWebApp, hapticFeedback } from '@/lib/telegram'
import { ArrowLeft, Calendar } from 'lucide-react'

// Моковые данные архива
const archiveData = {
  'ai-agents': {
    title: 'AI Агенты',
    sprints: [
      {
        id: 'dec-2023',
        title: 'Декабрь 2023: Автоматизация с ИИ',
        lessonsCount: 8,
        lessons: [
          {
            id: 101,
            title: 'Автоматизация рутинных задач',
            description: 'Как использовать ИИ для автоматизации',
            chatLink: 'https://t.me/truemans_chat/101'
          },
          {
            id: 102,
            title: 'Интеграция с API',
            description: 'Подключение агентов к внешним сервисам',
            chatLink: 'https://t.me/truemans_chat/102'
          }
        ]
      },
      {
        id: 'nov-2023',
        title: 'Ноябрь 2023: Основы агентов',
        lessonsCount: 6,
        lessons: [
          {
            id: 103,
            title: 'Первый AI агент',
            description: 'Создаем простого чат-бота',
            chatLink: 'https://t.me/truemans_chat/103'
          }
        ]
      }
    ],
    allLessons: [
      {
        id: 201,
        title: 'Продвинутые техники промптинга',
        description: 'Как писать эффективные промпты',
        chatLink: 'https://t.me/truemans_chat/201',
        sprint: 'Октябрь 2023'
      },
      {
        id: 202,
        title: 'Мониторинг агентов',
        description: 'Отслеживание работы ИИ агентов',
        chatLink: 'https://t.me/truemans_chat/202',
        sprint: 'Сентябрь 2023'
      }
    ]
  },
  'no-code': {
    title: 'No-Code',
    sprints: [
      {
        id: 'dec-2023',
        title: 'Декабрь 2023: Продвинутый Bubble',
        lessonsCount: 5,
        lessons: [
          {
            id: 301,
            title: 'Сложные workflow в Bubble',
            description: 'Создание многоступенчатых процессов',
            chatLink: 'https://t.me/truemans_chat/301'
          }
        ]
      }
    ],
    allLessons: [
      {
        id: 401,
        title: 'Интеграция с базами данных',
        description: 'Подключение внешних БД',
        chatLink: 'https://t.me/truemans_chat/401',
        sprint: 'Ноябрь 2023'
      }
    ]
  },
  'graphics-ai': {
    title: 'Графический ИИ',
    sprints: [
      {
        id: 'dec-2023',
        title: 'Декабрь 2023: Stable Diffusion',
        lessonsCount: 7,
        lessons: [
          {
            id: 501,
            title: 'Установка Stable Diffusion',
            description: 'Настройка локальной генерации',
            chatLink: 'https://t.me/truemans_chat/501'
          }
        ]
      }
    ],
    allLessons: [
      {
        id: 601,
        title: 'Создание логотипов с ИИ',
        description: 'Генерация брендинга',
        chatLink: 'https://t.me/truemans_chat/601',
        sprint: 'Ноябрь 2023'
      }
    ]
  },
  'beginners': {
    title: 'Для начинающих',
    sprints: [
      {
        id: 'dec-2023',
        title: 'Декабрь 2023: Практика с ИИ',
        lessonsCount: 4,
        lessons: [
          {
            id: 701,
            title: 'Первые шаги с ChatGPT',
            description: 'Эффективное использование ChatGPT',
            chatLink: 'https://t.me/truemans_chat/701'
          }
        ]
      }
    ],
    allLessons: [
      {
        id: 801,
        title: 'История развития ИИ',
        description: 'От первых алгоритмов до современности',
        chatLink: 'https://t.me/truemans_chat/801',
        sprint: 'Октябрь 2023'
      }
    ]
  }
}

export default function ArchivePage() {
  const params = useParams()
  const router = useRouter()
  const [isInTelegram, setIsInTelegram] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const slug = params.slug as string
  const data = archiveData[slug as keyof typeof archiveData]
  
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
    source: 'archive',
    directionSlug: slug,
    initialSort: { field: 'createdAt', direction: 'desc' },
    autoRefresh: false // Архив не нуждается в автообновлении
  })

  useEffect(() => {
    setMounted(true)
    const isTg = isTelegramWebApp()
    setIsInTelegram(isTg)
    
    if (isTg) {
      initTelegramWebApp()
    }
  }, [])

  const handleBack = () => {
    if (isInTelegram) {
      hapticFeedback('impact', 'light')
    }
    router.back()
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Архив не найден</h1>
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
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-white flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-400" />
                    Архив: {data.title}
                  </h1>
                  <p className="text-neutral-300 text-sm mt-1">
                    {stats.total} {stats.total === 1 ? 'урок' : stats.total < 5 ? 'урока' : 'уроков'} в архиве
                    {stats.completed > 0 && (
                      <span className="text-green-400 ml-2">• {stats.completed} завершено</span>
                    )}
                  </p>
                </div>
              </div>
            </header>

            {/* Content */}
            <div className="px-4 flex-1">
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
                  emptyMessage="В архиве пока нет уроков для этого направления."
                  loadingMessage="Загрузка архивных уроков..."
                  emptyIcon={<Calendar className="w-16 h-16 text-neutral-600 mx-auto mb-4" />}
                  emptyAction={
                    <button
                      onClick={handleBack}
                      className="glass-button px-6 py-3 rounded-lg text-sm font-medium"
                    >
                      Вернуться назад
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
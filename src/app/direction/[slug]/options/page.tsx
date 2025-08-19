'use client'

import { useState, useEffect, useLayoutEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { ArrowLeft, Calendar, Archive } from 'lucide-react'
import { isTelegramWebApp, initTelegramWebApp, hapticFeedback } from '@/lib/telegram'

// Данные для разных направлений
const directionData = {
  'ai-agents': {
    title: 'AI Агенты',
    currentSprint: 'Спринт Сентябрь 2025',
    description: 'Создание и обучение ИИ-агентов'
  },
  'no-code': {
    title: 'No-Code',
    currentSprint: 'Спринт Сентябрь 2025',
    description: 'Разработка без программирования'
  },
  'graphics-ai': {
    title: 'Графический ИИ',
    currentSprint: 'Спринт Сентябрь 2025',
    description: 'Создание изображений с помощью ИИ'
  },
  'beginners': {
    title: 'Для начинающих',
    currentSprint: 'Спринт Сентябрь 2025',
    description: 'Основы ИИ и машинного обучения'
  }
}

export default function DirectionOptionsPage() {
  const params = useParams()
  const router = useRouter()
  const [isInTelegram, setIsInTelegram] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const slug = params.slug as string
  
  const direction = directionData[slug as keyof typeof directionData]

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const isTg = isTelegramWebApp()
    setIsInTelegram(isTg)
    
    if (isTg) {
      initTelegramWebApp()
    }
  }, [])

  useLayoutEffect(() => {
    if (!isClient) return
    
    // Устанавливаем начальные стили для анимации
    const backButton = document.querySelector('[data-animate="back"]') as HTMLElement
    const title = document.querySelector('[data-animate="title"]') as HTMLElement
    const option1 = document.querySelector('[data-animate="option1"]') as HTMLElement
    const option2 = document.querySelector('[data-animate="option2"]') as HTMLElement
    
    // Устанавливаем начальные стили
    if (backButton) {
      backButton.style.opacity = '0'
      backButton.style.transform = 'translateY(-16px)'
      backButton.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
    }
    if (title) {
      title.style.opacity = '0'
      title.style.transform = 'translateY(24px)'
      title.style.transition = 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
    }
    if (option1) {
      option1.style.opacity = '0'
      option1.style.transform = 'translateY(32px)'
      option1.style.transition = 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
    }
    if (option2) {
      option2.style.opacity = '0'
      option2.style.transform = 'translateY(32px)'
      option2.style.transition = 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
    }
    
    // Запускаем анимацию
    const timer = setTimeout(() => {
      const animateElement = (element: HTMLElement, delay: number) => {
        if (element) {
          setTimeout(() => {
            element.style.opacity = '1'
            element.style.transform = 'translateY(0)'
          }, delay)
        }
      }
      
      animateElement(backButton, 0)
      animateElement(title, 150)
      animateElement(option1, 300)
      animateElement(option2, 450)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [isClient])

  const handleOptionClick = (option: 'sprint' | 'archive') => {
    if (isInTelegram) {
      hapticFeedback('impact', 'light')
    }
    
    if (option === 'sprint') {
      router.push(`/direction/${slug}`)
    } else {
      router.push(`/direction/${slug}/archive`)
    }
  }

  const handleBackClick = () => {
    if (isInTelegram) {
      hapticFeedback('impact', 'light')
    }
    router.push('/')
  }

  if (!direction) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Направление не найдено</h1>
          <button 
            onClick={handleBackClick}
            className="text-white hover:text-gray-300 transition-colors"
          >
            Вернуться на главную
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white relative">
      <AuroraBackground>
        <div className="relative z-10 min-h-screen flex flex-col">
          <div className="w-full max-w-sm mx-auto flex flex-col relative z-10 py-8">
            
            {/* Header with back button */}
            <div className="flex items-center justify-between mb-8 px-4">
              <div className="w-12 flex justify-start">
                <button
          onClick={handleBackClick}
          className="glass-button p-2 rounded-lg transition-all duration-300 hover:bg-white/10"
          data-animate="back"
        >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
              </div>
              
              <div className="flex-1 text-center">
              </div>
              
              <div className="w-12"></div>
            </div>

            {/* Direction Title */}
            <div 
                className="text-center mb-12 px-4"
                data-animate="title"
              >
              <h1 className="text-3xl font-bold text-white mb-2">
                {direction.title}
              </h1>
              <p className="text-neutral-300 text-sm">
                {direction.description}
              </p>
            </div>

            {/* Options */}
            <div className="flex-1 px-4 space-y-6">
              
              {/* Current Sprint Option */}
              <button
                 onClick={() => handleOptionClick('sprint')}
                 className="w-full glass-button p-6 rounded-2xl transition-all transform hover:scale-105 active:scale-95"
                 data-animate="option1"
               >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-semibold text-lg mb-1">
                      {direction.currentSprint}
                    </h3>
                    <p className="text-neutral-300 text-sm">
                      Текущий спринт с актуальными уроками
                    </p>
                  </div>
                </div>
              </button>

              {/* Archive Option */}
              <button
                 onClick={() => handleOptionClick('archive')}
                 className="w-full glass-button p-6 rounded-2xl transition-all transform hover:scale-105 active:scale-95"
                 data-animate="option2"
               >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Archive className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-semibold text-lg mb-1">
                      Архив всех предыдущих уроков
                    </h3>
                    <p className="text-neutral-300 text-sm">
                      Все уроки из прошлых спринтов
                    </p>
                  </div>
                </div>
              </button>

            </div>
          </div>
        </div>
      </AuroraBackground>
    </main>
  )
}
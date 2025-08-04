'use client'

import { useState, useMemo, useCallback } from 'react'
import { useSpring, animated } from '@react-spring/web'
import Image from 'next/image'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { getOptimizedAnimationConfig, getPerformanceOptimizedSettings } from '@/lib/performance'

// Иконки
import { BookOpen, Zap, Lightbulb, Video } from 'lucide-react'

// Основные элементы меню для главной страницы
const menuItems = [
  {
    title: 'AI Агенты',
    description: 'Создание и обучение ИИ-агентов',
    icon: <Zap className="w-6 h-6 text-blue-400" />,
    href: '/ai-agents'
  },
  {
    title: 'No-Code',
    description: 'Разработка без программирования',
    icon: <Lightbulb className="w-6 h-6 text-green-400" />,
    href: '/no-code'
  },
  {
    title: 'Вебинары',
    description: 'Онлайн-обучение и мастер-классы',
    icon: <Video className="w-6 h-6 text-purple-400" />,
    href: '/webinars'
  },
  {
    title: 'Для начинающих',
    description: 'Основы ИИ и машинного обучения',
    icon: <BookOpen className="w-6 h-6 text-orange-400" />,
    href: '/ai-beginners'
  },
  {
    title: 'Графический ИИ',
    description: 'Создание изображений с помощью ИИ',
    icon: <Zap className="w-6 h-6 text-cyan-400" />,
    href: '/graphics-ai'
  }
]

export default function TrueSpaceApp() {
  const [activeButton, setActiveButton] = useState<number | null>(null)

  // Получаем оптимизированные настройки
  const animationConfig = useMemo(() => getOptimizedAnimationConfig(), []);
  const performanceSettings = useMemo(() => getPerformanceOptimizedSettings(), []);

  // Оптимизированные анимации с уменьшенной сложностью для мобильных
  const headerSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: animationConfig,
    delay: 100
  })

  const menuSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: animationConfig,
    delay: 300
  })

  // Мемоизированный обработчик клика
  const handleButtonClick = useCallback((index: number, href: string) => {
    setActiveButton(index)
    
    // Добавляем небольшую задержку для анимации
    setTimeout(() => {
      window.location.href = href
    }, performanceSettings.animationDuration)
  }, [performanceSettings.animationDuration])

  return (
    <main className="min-h-screen bg-black text-white relative">
      <AuroraBackground>
        <div className="relative z-10 min-h-screen flex flex-col">
          <div className="w-full max-w-sm mx-auto flex flex-col relative z-10 py-8 pb-32">
          <animated.header 
            style={headerSpring}
            className="relative z-10 pb-6 px-4 flex-shrink-0"
          >
            <div className="text-center">
              <div className="mb-1 flex justify-center">
                <Image
                  src="/Logo.svg"
                  alt="TrueSpace Logo"
                  width={80}
                  height={80}
                  className="filter invert drop-shadow-lg"
                />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white text-center tracking-tight drop-shadow-lg">
                TrueSpace
              </h1>
              <p className="text-neutral-200 mt-1 font-medium text-sm sm:text-base">
                Образовательная платформа
              </p>
            </div>
          </animated.header>

          <animated.div 
            style={menuSpring}
            className="flex-1 px-4 pb-6 relative z-10"
          >
            <div className="space-y-6">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleButtonClick(index, item.href)}
                  className={`glass-button w-full p-4 rounded-xl transition-all duration-${performanceSettings.animationDuration} transform hover:scale-105 active:scale-95 ${
                    activeButton === index ? 'scale-95 opacity-80' : ''
                  }`}
                  style={{
                    willChange: 'transform, opacity',
                    backfaceVisibility: 'hidden',
                    perspective: '1000px'
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-white font-semibold text-base sm:text-lg">
                        {item.title}
                      </h3>
                      <p className="text-neutral-300 text-xs sm:text-sm mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </animated.div>
          </div>
        </div>
      </AuroraBackground>
    </main>
  )
}

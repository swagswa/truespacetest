'use client'

import React, { useState, useCallback, useMemo } from 'react';
import { 
  Bot, 
  Palette, 
  Code, 
  GraduationCap, 
  Video,
  ChevronRight
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { useSpring, animated, useTrail } from '@react-spring/web'
import { 
  getOptimizedAnimationConfig, 
  getPerformanceOptimizedSettings
} from '@/lib/performance'

export default function TrueSpaceApp() {
  const [activeButton, setActiveButton] = useState<number | null>(null)

  // Получаем оптимизированные настройки
  const animationConfig = useMemo(() => getOptimizedAnimationConfig(), []);
  const performanceSettings = useMemo(() => getPerformanceOptimizedSettings(), []);

  // Оптимизированные анимации с уменьшенной сложностью для мобильных
  const headerSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(-10px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: animationConfig // Более быстрые анимации
  })

  const logoSpring = useSpring({
    from: { opacity: 0, transform: 'scale(0.9)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: animationConfig,
    delay: performanceSettings.enableComplexAnimations ? 100 : 50 // Уменьшенная задержка
  })

  // Мемоизация данных меню для предотвращения пересоздания
  const menuItems = useMemo(() => [
    {
      title: "ИИ Агенты",
      subtitle: "Создание умных помощников",
      icon: Bot,
      color: "#6366f1",
      href: "/ai-agents"
    },
    {
      title: "Graphics AI",
      subtitle: "ИИ для графического дизайна",
      icon: Palette,
      color: "#8b5cf6",
      href: "/graphics-ai"
    },
    {
      title: "ИИ для начинающих",
      subtitle: "Первые шаги в мире ИИ",
      icon: GraduationCap,
      color: "#10b981",
      href: "/ai-beginners"
    },
    {
      title: "No-code разработка",
      subtitle: "Создание без программирования",
      icon: Code,
      color: "#f59e0b",
      href: "/no-code"
    },
    {
      title: "Вебинары",
      subtitle: "Онлайн обучение в реальном времени",
      icon: Video,
      color: "#ef4444",
      href: "/webinars"
    }
  ], [])

  // Оптимизированная каскадная анимация
  const trail = useTrail(menuItems.length, {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: animationConfig,
    delay: performanceSettings.enableComplexAnimations ? 200 : 100,
  })

  // Мемоизированные обработчики событий
  const handlePointerDown = useCallback((index: number) => {
    setActiveButton(index)
  }, [])

  const handlePointerUp = useCallback(() => {
    setActiveButton(null)
  }, [])

  const handlePointerLeave = useCallback(() => {
    setActiveButton(null)
  }, [])



  return (
    <AuroraBackground>
      <div className="w-full max-w-sm mx-auto flex flex-col relative z-10">

      {/* Header */}
      <animated.header style={headerSpring} className="relative z-10 pb-6 px-4 flex-shrink-0">
        <div className="text-center">
          <animated.div style={logoSpring} className="mb-1 flex justify-center">
            <Image
              src="/Logo.svg"
              alt="TrueSpace Logo"
              width={80}
              height={80}
              className="filter invert drop-shadow-lg"
            />
          </animated.div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white text-center tracking-tight drop-shadow-lg">
            TrueSpace
          </h1>
          <p className="text-neutral-200 mt-1 font-medium text-sm sm:text-base">
            Образовательная платформа
          </p>
        </div>
      </animated.header>

      {/* Menu Buttons */}
      <div className="flex-1 px-4 pb-6 relative z-10 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
        {trail.map((style, index) => {
          const item = menuItems[index]
          const IconComponent = item.icon
          return (
            <animated.div key={index} style={style}>
              <Link href={item.href} className={`block ${index < menuItems.length - 1 ? 'mb-6' : ''}`}>
              <button
                className="glass-button w-full p-4 rounded-xl relative overflow-hidden motion-element transition-all ease-out"
                onPointerDown={() => handlePointerDown(index)}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerLeave}
                style={{
                  transitionDuration: `${performanceSettings.animationDuration}ms`,
                  boxShadow: activeButton === index 
                    ? `0 8px 25px -8px ${item.color}60`
                    : '0 4px 15px -4px rgba(0,0,0,0.3)',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                  contain: 'layout style paint'
                }}
                data-animated="true"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-lg backdrop-blur-sm
                      transition-all duration-150 ease-out icon-container
                      ${activeButton === index 
                        ? 'bg-white/25 shadow-lg' 
                        : 'bg-white/10'
                      }
                    `}
                    style={{
                      transform: 'none !important',
                      opacity: '1 !important'
                    }}
                  >
                    <item.icon className="w-5 h-5 transition-colors duration-150" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-base sm:text-lg text-white tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-neutral-200 text-xs sm:text-sm mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                  <ChevronRight 
                    className={`w-4 h-4 transition-all duration-150 ${
                      activeButton === index ? 'text-white translate-x-1' : 'text-neutral-300'
                    }`}
                  />
                </div>
              </button>
            </Link>
            </animated.div>
          )
        })}
      </div>

      </div>
    </AuroraBackground>
  )
}

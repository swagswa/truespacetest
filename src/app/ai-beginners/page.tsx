'use client'

import Link from 'next/link'
import { ArrowLeft, BookOpen, Lightbulb, Users, Target, GraduationCap } from 'lucide-react'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { useSpring, animated, useTrail } from '@react-spring/web'

export default function AIBeginnersPage() {
  // Анимация для кнопки "Назад"
  const backButtonSpring = useSpring({
    from: { opacity: 0, transform: 'translateX(-20px)' },
    to: { opacity: 1, transform: 'translateX(0px)' },
    config: { tension: 120, friction: 80 }
  })

  // Анимация для заголовка
  const titleSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(-30px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 120, friction: 80 },
    delay: 400
  })

  // Анимация для иконки
  const iconSpring = useSpring({
    from: { opacity: 0, transform: 'scale(0.5) rotate(-180deg)' },
    to: { opacity: 1, transform: 'scale(1) rotate(0deg)' },
    config: { tension: 150, friction: 70 },
    delay: 800
  })

  // Карточки контента для каскадной анимации
  const contentCards = [
    {
      title: "Введение в ИИ",
      description: "Основы искусственного интеллекта для начинающих. Понятия, термины и базовые концепции.",
      level: "Начальный уровень",
      duration: "2 часа",
      icon: BookOpen
    },
    {
      title: "Практические примеры",
      description: "Реальные примеры использования ИИ в повседневной жизни и бизнесе.",
      level: "Начальный уровень", 
      duration: "3 часа",
      icon: Lightbulb
    },
    {
      title: "Первые шаги",
      description: "Пошаговое руководство по началу работы с инструментами искусственного интеллекта.",
      level: "Начальный уровень",
      duration: "4 часа", 
      icon: Target
    }
  ]

  // Каскадная анимация для карточек
  const trail = useTrail(contentCards.length, {
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 120, friction: 80 },
    delay: 1200
  })
  return (
    <AuroraBackground>
      <div className="mobile-scroll-container">
        <div className="w-full max-w-md mx-auto flex flex-col relative z-10 min-h-full">
        {/* Back Button */}
        <animated.div style={backButtonSpring} className="px-6 pt-6 mb-8">
          <Link href="/">
            <button className="glass-button flex items-center space-x-2 px-4 py-3 rounded-lg">
              <ArrowLeft className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-semibold">Назад</span>
            </button>
          </Link>
        </animated.div>

        {/* Page Content */}
        <div className="flex-1 px-6 pb-8">
          {/* Page Title */}
          <animated.div style={titleSpring} className="text-center mb-10">
            <animated.div style={iconSpring} className="flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-500/20 backdrop-blur-sm mx-auto mb-6">
              <GraduationCap className="w-10 h-10 text-blue-400" />
            </animated.div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              ИИ для начинающих
            </h1>
            <p className="text-neutral-200 text-base sm:text-lg">
              Первые шаги в мире ИИ
            </p>
          </animated.div>

          {/* Content Cards */}
          <div className="space-y-6">
            {trail.map((style, index) => (
              <animated.div key={index} style={style} className="glass-button p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-3">
                  {contentCards[index].title}
                </h3>
                <p className="text-neutral-200 text-sm mb-4">
                  {contentCards[index].description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-blue-400 text-sm font-medium">
                    {contentCards[index].level}
                  </span>
                  <span className="text-neutral-300 text-xs">
                    {contentCards[index].duration}
                  </span>
                </div>
              </animated.div>
            ))}
          </div>
        </div>
        </div>
      </div>
    </AuroraBackground>
  )
}
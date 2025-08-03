'use client'

import Link from 'next/link'
import { ArrowLeft, Video, Calendar, Users, Play } from 'lucide-react'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { useSpring, useTrail, animated } from '@react-spring/web'

export default function WebinarsPage() {
  // Анимации для элементов
  const backButtonSpring = useSpring({
    from: { opacity: 0, transform: 'translateX(-20px)' },
    to: { opacity: 1, transform: 'translateX(0px)' },
    config: { tension: 120, friction: 80 }
  })

  const titleSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    delay: 400,
    config: { tension: 120, friction: 80 }
  })

  const iconSpring = useSpring({
    from: { opacity: 0, transform: 'scale(0.8) rotate(-10deg)' },
    to: { opacity: 1, transform: 'scale(1) rotate(0deg)' },
    delay: 800,
    config: { tension: 150, friction: 70 }
  })

  // Данные для карточек
  const contentCards = [
    {
      title: "Будущее AI в бизнесе",
      description: "Обсуждение трендов и перспектив использования искусственного интеллекта в различных отраслях.",
      date: "15 декабря, 19:00",
      duration: "90 минут",
      color: "red"
    },
    {
      title: "No-Code революция",
      description: "Как создавать приложения без программирования и монетизировать свои идеи.",
      date: "20 декабря, 18:30",
      duration: "75 минут",
      color: "green"
    },
    {
      title: "Графический дизайн с AI",
      description: "Мастер-класс по созданию профессиональной графики с помощью AI-инструментов.",
      date: "25 декабря, 20:00",
      duration: "120 минут",
      color: "purple"
    }
  ]

  // Каскадная анимация для карточек
  const trail = useTrail(contentCards.length, {
    from: { opacity: 0, transform: 'translateY(40px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    delay: 1200,
    config: { tension: 120, friction: 80 }
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
              <animated.div style={iconSpring} className="flex items-center justify-center w-20 h-20 rounded-2xl bg-orange-500/20 backdrop-blur-sm mx-auto mb-6">
                <Video className="w-10 h-10 text-orange-400" />
              </animated.div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                Вебинары
              </h1>
              <p className="text-neutral-200 text-base sm:text-lg">
                Онлайн обучение в реальном времени
              </p>
            </animated.div>

            {/* Content Cards */}
            <div className="space-y-6">
              {trail.map((style, index) => (
                <animated.div key={index} style={style} className="glass-button p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">
                      {contentCards[index].title}
                    </h3>
                    <Video className={`w-5 h-5 text-${contentCards[index].color}-400`} />
                  </div>
                  <p className="text-neutral-200 text-sm mb-4">
                    {contentCards[index].description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-${contentCards[index].color}-400 text-sm font-medium`}>
                      {contentCards[index].date}
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
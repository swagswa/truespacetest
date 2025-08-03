'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  Brain, 
  Palette, 
  Zap, 
  GraduationCap, 
  Video,
  ChevronRight
} from 'lucide-react'
import Image from 'next/image'
import { BeamsBackground } from '@/components/ui/beams-background'

export default function TrueSpaceApp() {
  const [activeButton, setActiveButton] = useState<number | null>(null)

  const menuItems = [
    {
      title: "AI агенты",
      subtitle: "Создание умных помощников",
      icon: Brain,
      color: "#6366f1",
      bgColor: "bg-indigo-500/10",
      hoverBg: "bg-indigo-500/20",
      shadowColor: "shadow-indigo-500/20"
    },
    {
      title: "Графика и Видео с ИИ",
      subtitle: "Творчество с ИИ",
      icon: Palette,
      color: "#8b5cf6",
      bgColor: "bg-violet-500/10",
      hoverBg: "bg-violet-500/20",
      shadowColor: "shadow-violet-500/20"
    },
    {
      title: "No-code разработка",
      subtitle: "Приложения без кода",
      icon: Zap,
      color: "#f59e0b",
      bgColor: "bg-amber-500/10",
      hoverBg: "bg-amber-500/20",
      shadowColor: "shadow-amber-500/20"
    },
    {
      title: "ИИ для начинающих",
      subtitle: "Основы ИИ",
      icon: GraduationCap,
      color: "#10b981",
      bgColor: "bg-emerald-500/10",
      hoverBg: "bg-emerald-500/20",
      shadowColor: "shadow-emerald-500/20"
    },
    {
      title: "Вебинары",
      subtitle: "Живые занятия",
      icon: Video,
      color: "#ef4444",
      bgColor: "bg-red-500/10",
      hoverBg: "bg-red-500/20",
      shadowColor: "shadow-red-500/20"
    }
  ]

  return (
    <BeamsBackground intensity="strong" className="min-h-screen w-full max-w-sm mx-auto flex flex-col relative">

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 pt-12 pb-6 px-4 flex-shrink-0"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-3 flex justify-center"
          >
            <Image
              src="/Logo.svg"
              alt="TrueSpace Logo"
              width={80}
              height={80}
              className="filter invert drop-shadow-lg"
            />
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-lg">
            TrueSpace
          </h1>
          <p className="text-gray-200 mt-1 font-medium text-sm sm:text-base">
            Образовательная платформа
          </p>
        </div>
      </motion.header>

      {/* Menu Buttons */}
      <div className="flex-1 px-4 pb-6 space-y-2.5 relative z-10 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
        {menuItems.map((item, index) => {
          const IconComponent = item.icon
          return (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.08 + 0.2,
                ease: "easeOut"
              }}
              whileTap={{ 
                scale: 0.97,
                transition: { duration: 0.1 }
              }}
              onTouchStart={() => setActiveButton(index)}
              onTouchEnd={() => setActiveButton(null)}
              onClick={() => {
                setActiveButton(index)
                setTimeout(() => setActiveButton(null), 150)
              }}
              className={`
                w-full p-4 rounded-xl border backdrop-blur-sm
                transition-all duration-200 ease-out
                ${activeButton === index 
                  ? 'bg-white/25 border-white/40 shadow-xl' 
                  : 'bg-white/10 border-white/20 hover:bg-white/15 shadow-lg'
                }
              `}
              style={{
                boxShadow: activeButton === index 
                  ? `0 8px 25px -8px ${item.color}60`
                  : '0 4px 15px -4px rgba(0,0,0,0.3)'
              }}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-lg backdrop-blur-sm
                    ${activeButton === index ? 'bg-white/30 shadow-md' : 'bg-white/15'}
                  `}
                >
                  <IconComponent 
                    className="w-5 h-5" 
                    style={{ color: activeButton === index ? '#ffffff' : item.color }}
                  />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-base sm:text-lg text-white tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-gray-200 text-xs sm:text-sm mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
                <ChevronRight 
                  className={`w-4 h-4 transition-all duration-200 ${
                    activeButton === index ? 'text-white translate-x-1' : 'text-gray-300'
                  }`}
                />
              </div>
            </motion.button>
          )
        })}
      </div>


    </BeamsBackground>
  )
}

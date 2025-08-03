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
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 pt-16 pb-8 px-6 flex-shrink-0"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-2 flex justify-center"
          >
            <Image
              src="/Logo.svg"
              alt="TrueSpace Logo"
              width={100}
              height={100}
              className="filter invert"
            />
          </motion.div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            TrueSpace
          </h1>
          <p className="text-gray-300 mt-2 font-medium">
            Образовательная платформа
          </p>
        </div>
      </motion.header>

      {/* Menu Buttons */}
      <div className="flex-1 px-6 pb-8 space-y-3 relative z-10 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
        {menuItems.map((item, index) => {
          const IconComponent = item.icon
          return (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1 + 0.3,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              whileTap={{ 
                scale: 0.98,
                transition: { duration: 0.1 }
              }}
              onHoverStart={() => setActiveButton(index)}
              onHoverEnd={() => setActiveButton(null)}
              className={`
                w-full p-5 rounded-2xl border border-white/10 backdrop-blur-md
                transition-all duration-300 ease-out
                ${activeButton === index 
                  ? 'bg-white/20 border-white/30 shadow-2xl' 
                  : 'bg-white/5 hover:bg-white/10 hover:border-white/20 shadow-lg'
                }
              `}
              style={{
                boxShadow: activeButton === index 
                  ? `0 20px 40px -12px ${item.color}40`
                  : undefined
              }}
            >
              <div className="flex items-center space-x-4">
                <motion.div 
                  className={`
                    flex items-center justify-center w-12 h-12 rounded-xl backdrop-blur-sm
                    ${activeButton === index ? 'bg-white/20 shadow-lg' : 'bg-white/10'}
                  `}
                  whileHover={{ 
                    rotate: [0, -5, 5, 0],
                    transition: { duration: 0.4 }
                  }}
                >
                  <IconComponent 
                    className="w-6 h-6" 
                    style={{ color: activeButton === index ? '#ffffff' : item.color }}
                  />
                </motion.div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-lg text-white tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-gray-300 text-sm mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
                <motion.div
                  animate={{ 
                    x: activeButton === index ? 4 : 0,
                    scale: activeButton === index ? 1.1 : 1
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight 
                    className={`w-5 h-5 transition-colors duration-200 ${
                      activeButton === index ? 'text-white' : 'text-gray-400'
                    }`}
                  />
                </motion.div>
              </div>
            </motion.button>
          )
        })}
      </div>


    </BeamsBackground>
  )
}

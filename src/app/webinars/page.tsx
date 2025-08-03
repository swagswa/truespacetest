'use client'

import { motion } from 'framer-motion'
import { Video, ArrowLeft, Calendar, Users } from 'lucide-react'
import Link from 'next/link'
import { AuroraBackground } from '@/components/ui/aurora-background'

export default function WebinarsPage() {
  return (
    <AuroraBackground>
      <div className="w-full max-w-md mx-auto flex flex-col relative z-10 min-h-screen">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="px-6 pt-6 mb-8"
        >
          <Link href="/">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="glass-button flex items-center space-x-2 px-4 py-3 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-semibold">Назад</span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Page Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 px-6 pb-8"
        >
          {/* Page Title */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-orange-500/20 backdrop-blur-sm mx-auto mb-6">
              <Video className="w-10 h-10 text-orange-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Вебинары
            </h1>
            <p className="text-neutral-200 text-base sm:text-lg">
              Онлайн обучение в реальном времени
            </p>
          </div>

          {/* Content Cards */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="glass-button p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">
                  Будущее AI в бизнесе
                </h3>
                <Video className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-neutral-200 text-sm mb-4">
                Обсуждение трендов и перспектив использования искусственного интеллекта в различных отраслях.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-red-400 text-sm font-medium">
                  15 декабря, 19:00
                </span>
                <span className="text-neutral-300 text-xs">
                  90 минут
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="glass-button p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">
                  No-Code революция
                </h3>
                <Video className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-neutral-200 text-sm mb-4">
                Как создавать приложения без программирования и монетизировать свои идеи.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-green-400 text-sm font-medium">
                  20 декабря, 18:30
                </span>
                <span className="text-neutral-300 text-xs">
                  75 минут
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="glass-button p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">
                  Графический дизайн с AI
                </h3>
                <Video className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-neutral-200 text-sm mb-4">
                Мастер-класс по созданию профессиональной графики с помощью AI-инструментов.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-purple-400 text-sm font-medium">
                  25 декабря, 20:00
                </span>
                <span className="text-neutral-300 text-xs">
                  120 минут
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </AuroraBackground>
  )
}
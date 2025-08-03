'use client'

import { motion } from 'framer-motion'
import { Brain, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { AuroraBackground } from '@/components/ui/aurora-background'

export default function AIAgentsPage() {
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
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-indigo-500/20 backdrop-blur-sm mx-auto mb-6">
              <Brain className="w-10 h-10 text-indigo-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              AI агенты
            </h1>
            <p className="text-neutral-200 text-base sm:text-lg">
              Создание умных помощников
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
              <h3 className="text-lg font-semibold text-white mb-3">
                Основы AI агентов
              </h3>
              <p className="text-neutral-200 text-sm mb-4">
                Изучите принципы создания интеллектуальных агентов и их применение в различных сферах.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-indigo-400 text-sm font-medium">
                  Начальный уровень
                </span>
                <span className="text-neutral-300 text-xs">
                  2 часа
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="glass-button p-6 rounded-2xl"
            >
              <h3 className="text-lg font-semibold text-white mb-3">
                Создание чат-ботов
              </h3>
              <p className="text-neutral-200 text-sm mb-4">
                Практический курс по разработке умных чат-ботов для бизнеса и личного использования.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-indigo-400 text-sm font-medium">
                  Средний уровень
                </span>
                <span className="text-neutral-300 text-xs">
                  4 часа
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="glass-button p-6 rounded-2xl"
            >
              <h3 className="text-lg font-semibold text-white mb-3">
                Автоматизация с AI
              </h3>
              <p className="text-neutral-200 text-sm mb-4">
                Продвинутые техники автоматизации рабочих процессов с помощью AI агентов.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-indigo-400 text-sm font-medium">
                  Продвинутый уровень
                </span>
                <span className="text-neutral-300 text-xs">
                  6 часов
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </AuroraBackground>
  )
}
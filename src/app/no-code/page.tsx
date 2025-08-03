'use client'

import { motion } from 'framer-motion'
import { Code, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { AuroraBackground } from '@/components/ui/aurora-background'

export default function NoCodePage() {
  return (
    <AuroraBackground>
      <div className="w-full max-w-md mx-auto flex flex-col relative z-10 min-h-screen">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex-1 px-6 pb-8"
        >
          {/* Page Title */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-500/20 backdrop-blur-sm mx-auto mb-6">
              <Code className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              No-code разработка
            </h1>
            <p className="text-neutral-200 text-base sm:text-lg">
              Создание без программирования
            </p>
          </div>

          {/* Content Cards */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="glass-button p-6 rounded-2xl"
            >
              <h3 className="text-lg font-semibold text-white mb-3">
                Основы No-code
              </h3>
              <p className="text-neutral-200 text-sm mb-4">
                Введение в мир разработки без программирования и обзор популярных платформ.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 text-sm font-medium">
                  Начальный уровень
                </span>
                <span className="text-neutral-300 text-xs">
                  2 часа
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="glass-button p-6 rounded-2xl"
            >
              <h3 className="text-lg font-semibold text-white mb-3">
                Создание веб-приложений
              </h3>
              <p className="text-neutral-200 text-sm mb-4">
                Практическое создание полноценных веб-приложений с помощью Bubble, Webflow и других платформ.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 text-sm font-medium">
                  Средний уровень
                </span>
                <span className="text-neutral-300 text-xs">
                  6 часов
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="glass-button p-6 rounded-2xl"
            >
              <h3 className="text-lg font-semibold text-white mb-3">
                Автоматизация бизнеса
              </h3>
              <p className="text-neutral-200 text-sm mb-4">
                Создание автоматизированных рабочих процессов с помощью Zapier, Make и других инструментов.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 text-sm font-medium">
                  Продвинутый уровень
                </span>
                <span className="text-neutral-300 text-xs">
                  4 часа
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </AuroraBackground>
  )
}
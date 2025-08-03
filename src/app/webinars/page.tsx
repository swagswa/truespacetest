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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glass-card p-6 rounded-2xl"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Основы ИИ для начинающих
                  </h3>
                  <p className="text-neutral-300 text-sm mb-3">
                    Интерактивный вебинар о том, как начать работать с искусственным интеллектом
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-orange-400 font-medium">Завтра в 19:00</span>
                    <span className="text-neutral-400">90 минут</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="glass-card p-6 rounded-2xl"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    ChatGPT для бизнеса
                  </h3>
                  <p className="text-neutral-300 text-sm mb-3">
                    Практические кейсы использования ИИ в работе и бизнес-процессах
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-400 font-medium">15 января в 20:00</span>
                    <span className="text-neutral-400">120 минут</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="glass-card p-6 rounded-2xl"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Video className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Автоматизация с ИИ
                  </h3>
                  <p className="text-neutral-300 text-sm mb-3">
                    Создание автоматических процессов с помощью искусственного интеллекта
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-400 font-medium">22 января в 19:30</span>
                    <span className="text-neutral-400">105 минут</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </AuroraBackground>
  )
}
'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useSpring, animated } from '@react-spring/web'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { AuroraBackground } from '@/components/ui/aurora-background'

import { isTelegramWebApp, hapticFeedback } from '@/lib/telegram'
import { apiClient, getTelegramId } from '@/lib/api'

// Иконки
import { BookOpen, Zap, Lightbulb, Video, Heart, CheckCircle } from 'lucide-react'

// 4 направления обучения согласно ТЗ TrueBase Mini App
const menuItems = [
  {
    title: 'AI Агенты',
    description: 'Создание и обучение ИИ-агентов',
    icon: <Zap className="w-6 h-6 text-white" />,
    href: '/direction/ai-agents/options'
  },
  {
    title: 'No-Code',
    description: 'Разработка без программирования',
    icon: <Lightbulb className="w-6 h-6 text-white" />,
    href: '/direction/no-code/options'
  },
  {
    title: 'Графический ИИ',
    description: 'Создание изображений с помощью ИИ',
    icon: <Video className="w-6 h-6 text-white" />,
    href: '/direction/graphics-ai/options'
  },
  {
    title: 'Для начинающих',
    description: 'Основы ИИ и машинного обучения',
    icon: <BookOpen className="w-6 h-6 text-white" />,
    href: '/direction/beginners/options'
  }
]

export default function TrueSpaceApp() {
  const [activeButton, setActiveButton] = useState<number | null>(null)
  const [isInTelegram, setIsInTelegram] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Настройки производительности
  const performanceSettings = {
    animationDuration: 300,
    blurAmount: 5,
    particleCount: 10,
    updateInterval: 60,
    enableComplexAnimations: false,
  };

  // Конфигурация анимации
  const animationConfig = {
    tension: 300,
    friction: 30,
    mass: 1,
    precision: 0.01,
    velocity: 0.01,
    restVelocity: 0.01,
    restDisplacement: 0.01,
  };

  // Инициализируем состояние приложения
  useEffect(() => {
    const initApp = async () => {
      setMounted(true);
      const isTg = isTelegramWebApp();
      setIsInTelegram(isTg);
      
      // Telegram WebApp initialization is now handled by TelegramWebApp component

      // Автоматическая регистрация/инициализация пользователя
      await initializeUser();
    };

    initApp();
  }, []);

  // Функция для автоматической инициализации пользователя
  const initializeUser = async () => {
    try {
      // Ждем немного, чтобы Telegram WebApp успел инициализироваться
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('=== НАЧАЛО ИНИЦИАЛИЗАЦИИ ПОЛЬЗОВАТЕЛЯ ===');
      console.log('Telegram объект:', typeof window !== 'undefined' ? window.Telegram : 'undefined');
      
      const telegramId = getTelegramId();
      if (!telegramId) {
        console.log('Telegram ID не найден, пропускаем инициализацию пользователя');
        return;
      }

      console.log('Инициализация пользователя с Telegram ID:', telegramId);
      
      // Проверяем, существует ли пользователь
      try {
        const existingUser = await apiClient.getUser(telegramId);
        console.log('Пользователь уже существует:', existingUser);
      } catch (error: unknown) {
        // Если пользователь не найден (404), создаем нового
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStatus = (error as { status?: number })?.status;
        if (errorMessage?.includes('404') || errorStatus === 404) {
          console.log('Пользователь не найден, создаем нового...');
          
          // Получаем данные пользователя из Telegram WebApp
          let userData: {
            telegramId: string;
            firstName?: string;
            lastName?: string;
            username?: string;
          } = {
            telegramId: telegramId
          };

          // Пробуем получить данные из initDataUnsafe
          if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user) {
            const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
            userData = {
              telegramId: telegramId,
              username: tgUser.username,
              firstName: tgUser.first_name,
              lastName: tgUser.last_name
            };
            console.log('Данные получены из initDataUnsafe:', tgUser);
          }
          // Пробуем получить данные из initDataUnsafe как fallback
          else if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user) {
            try {
              const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
              userData = {
                telegramId: telegramId,
                username: tgUser.username,
                firstName: tgUser.first_name,
                lastName: tgUser.last_name
              };
              console.log('Данные получены из initData:', tgUser);
            } catch (parseError) {
              console.error('Ошибка парсинга initData:', parseError);
            }
          }

          console.log('Создание пользователя с данными:', userData);
          const newUser = await apiClient.createUser(userData);
          console.log('Новый пользователь создан:', newUser);
        } else {
          console.error('Ошибка при получении пользователя:', error);
        }
      }
      console.log('=== КОНЕЦ ИНИЦИАЛИЗАЦИИ ПОЛЬЗОВАТЕЛЯ ===');
    } catch (error) {
      console.error('Ошибка инициализации пользователя:', error);
    }
  };

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
    
    // Добавляем тактильную обратную связь в Telegram
    if (isInTelegram) {
      hapticFeedback('impact', 'light');
    }
    
    // Добавляем небольшую задержку для анимации
    setTimeout(() => {
      window.location.href = href
    }, performanceSettings.animationDuration)
  }, [performanceSettings.animationDuration, isInTelegram])

  return (
    <main className={`min-h-screen bg-black text-white relative ${mounted && isInTelegram ? 'tg-viewport' : ''}`}>
      <AuroraBackground>
        <div className="relative z-10 min-h-screen flex flex-col">
          <div className="w-full max-w-sm mx-auto flex flex-col relative z-10 py-8 pb-32" style={{
            minHeight: mounted && isInTelegram ? '100vh' : 'auto',
            overflow: mounted && isInTelegram ? 'visible' : 'auto'
          }}>
          <animated.header 
            style={headerSpring}
            className="relative z-10 pb-6 px-4 flex-shrink-0"
          >
            <div className="text-center">
              <div className="mb-1 flex justify-center">
                {mounted ? (
                  <button
                    onClick={() => router.push('/admin')}
                    className="transition-transform hover:scale-110 active:scale-95 duration-200"
                  >
                    <Image
                      src="/Logo.svg"
                      alt="TrueSpace Logo"
                      width={80}
                      height={80}
                      className="filter invert drop-shadow-lg"
                    />
                  </button>
                ) : (
                  <Image
                    src="/Logo.svg"
                    alt="TrueSpace Logo"
                    width={80}
                    height={80}
                    className="filter invert drop-shadow-lg"
                  />
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white text-center tracking-tight drop-shadow-lg">
                TrueBase
              </h1>
              <p className="text-neutral-200 mt-1 font-medium text-sm sm:text-base">
                Найди свой урок
              </p>
            </div>
          </animated.header>

          <animated.div 
            style={menuSpring}
            className="flex-1 px-4 pb-6 relative z-10"
          >
            {/* Quick Access Buttons */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-3">
                <button
                   onClick={() => handleButtonClick(-1, '/favorites')}
                   className="glass-button p-3 rounded-2xl text-center transition-all duration-300 hover:scale-105"
                 >
                   <Heart 
                     className="w-4 h-4 mx-auto mb-1" 
                     style={{ color: '#ef4444', fill: '#ef4444' }}
                   />
                   <span className="text-white text-sm font-medium">Избранное</span>
                 </button>
                 
                 <button
                   onClick={() => handleButtonClick(-2, '/completed')}
                   className="glass-button p-3 rounded-2xl text-center transition-all duration-300 hover:scale-105"
                 >
                   <CheckCircle 
                     className="w-4 h-4 mx-auto mb-1" 
                     style={{ color: '#10b981', stroke: '#10b981', fill: 'none' }}
                   />
                   <span className="text-white text-sm font-medium">Пройденные</span>
                 </button>
              </div>
            </div>

            <div className="space-y-6">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleButtonClick(index, item.href)}
                  className={`glass-button w-full p-4 rounded-2xl transition-all transform hover:scale-105 active:scale-95 ${
                    activeButton === index ? 'scale-95 opacity-80' : ''
                  } ${isInTelegram ? 'telegram-button' : ''}`}
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

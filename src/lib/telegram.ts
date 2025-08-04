// Утилиты для работы с Telegram Web App

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        BackButton: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        close: () => void;
        sendData: (data: string) => void;
      };
    };
  }
}

/**
 * Проверяет, запущено ли приложение в Telegram Web App
 */
export const isTelegramWebApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window.Telegram?.WebApp);
};

/**
 * Инициализирует Telegram Web App
 */
export const initTelegramWebApp = () => {
  if (!isTelegramWebApp()) return null;

  const tg = window.Telegram!.WebApp;
  
  // Готовность приложения
  tg.ready();
  
  // Разворачиваем на весь экран
  tg.expand();
  
  // Включаем подтверждение закрытия
  tg.enableClosingConfirmation();
  
  // Улучшенные настройки скролла для Telegram Web App
  const optimizeScrolling = () => {
    // Настройки для body
    document.body.style.overflow = 'auto';
    document.body.style.height = '100%';
    document.body.style.setProperty('-webkit-overflow-scrolling', 'touch');
    document.body.style.setProperty('overscroll-behavior', 'contain');
    document.body.style.setProperty('touch-action', 'pan-y');
    document.body.style.setProperty('scroll-behavior', 'smooth');
    document.body.style.setProperty('transform', 'translateZ(0)');
    document.body.style.setProperty('backface-visibility', 'hidden');
    document.body.style.setProperty('-webkit-backface-visibility', 'hidden');
    document.body.style.setProperty('will-change', 'scroll-position');
    
    // Настройки для html
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.height = '100%';
    document.documentElement.style.setProperty('-webkit-overflow-scrolling', 'touch');
    document.documentElement.style.setProperty('scroll-behavior', 'smooth');
    document.documentElement.style.setProperty('overscroll-behavior', 'contain');
    
    // Добавляем мета-тег для viewport если его нет
    let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    
    // Предотвращаем зум на iOS
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('gesturechange', (e) => e.preventDefault());
    document.addEventListener('gestureend', (e) => e.preventDefault());
    
    // Оптимизация для touch событий
    document.addEventListener('touchstart', (e) => {
      // Разрешаем только вертикальный скролл
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });
  };
  
  // Применяем оптимизации
  optimizeScrolling();
  
  // Добавляем класс для стилизации
  document.body.classList.add('telegram-web-app');
  
  // Переинициализация при изменении размера окна
  window.addEventListener('resize', () => {
    setTimeout(optimizeScrolling, 100);
  });
  
  return tg;
};

/**
 * Получает данные пользователя из Telegram Web App
 */
export const getTelegramUser = () => {
  if (!isTelegramWebApp()) return null;
  
  const tg = window.Telegram!.WebApp;
  return tg.initDataUnsafe?.user || null;
};

/**
 * Показывает главную кнопку Telegram
 */
export const showMainButton = (text: string, onClick: () => void) => {
  if (!isTelegramWebApp()) return;
  
  const tg = window.Telegram!.WebApp;
  tg.MainButton.setText(text);
  tg.MainButton.onClick(onClick);
  tg.MainButton.show();
};

/**
 * Скрывает главную кнопку Telegram
 */
export const hideMainButton = () => {
  if (!isTelegramWebApp()) return;
  
  const tg = window.Telegram!.WebApp;
  tg.MainButton.hide();
};

/**
 * Показывает кнопку "Назад" Telegram
 */
export const showBackButton = (onClick: () => void) => {
  if (!isTelegramWebApp()) return;
  
  const tg = window.Telegram!.WebApp;
  tg.BackButton.onClick(onClick);
  tg.BackButton.show();
};

/**
 * Скрывает кнопку "Назад" Telegram
 */
export const hideBackButton = () => {
  if (!isTelegramWebApp()) return;
  
  const tg = window.Telegram!.WebApp;
  tg.BackButton.hide();
};

/**
 * Вибрация в Telegram
 */
export const hapticFeedback = (
  type: 'impact' | 'notification' | 'selection', 
  style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | 'error' | 'success' | 'warning'
) => {
  if (!isTelegramWebApp()) return;
  
  const tg = window.Telegram!.WebApp;
  
  switch (type) {
    case 'impact':
      tg.HapticFeedback.impactOccurred((style as 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') || 'medium');
      break;
    case 'notification':
      tg.HapticFeedback.notificationOccurred((style as 'error' | 'success' | 'warning') || 'success');
      break;
    case 'selection':
      tg.HapticFeedback.selectionChanged();
      break;
  }
};

/**
 * Закрывает Telegram Web App
 */
export const closeTelegramWebApp = () => {
  if (!isTelegramWebApp()) return;
  
  const tg = window.Telegram!.WebApp;
  tg.close();
};
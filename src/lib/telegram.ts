// Утилиты для работы с Telegram Web App

/**
 * Проверяет, запущено ли приложение в Telegram Web App
 */
export const isTelegramWebApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window.Telegram?.WebApp);
};

/**
 * Инициализирует Telegram Web App (deprecated - use TelegramWebApp component instead)
 * @deprecated Use TelegramWebApp component for proper SSR compatibility
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
// Утилиты для оптимизации производительности на мобильных устройствах

/**
 * Определяет, является ли устройство мобильным
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return window.innerWidth < 768 || 
         /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Определяет, поддерживает ли устройство аппаратное ускорение
 */
export const supportsHardwareAcceleration = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  return !!gl;
};

/**
 * Оптимизированные настройки анимации для мобильных устройств
 */
export const getOptimizedAnimationConfig = () => {
  const mobile = isMobileDevice();
  
  return {
    tension: mobile ? 300 : 200,
    friction: mobile ? 30 : 25,
    mass: mobile ? 1.2 : 1,
    precision: mobile ? 0.01 : 0.001,
    velocity: mobile ? 0.01 : 0.005,
    restVelocity: mobile ? 0.01 : 0.001,
    restDisplacement: mobile ? 0.01 : 0.001,
  };
};

/**
 * Дебаунс функция для оптимизации событий
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Троттлинг функция для оптимизации событий
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Проверка поддержки Intersection Observer
export function supportsIntersectionObserver(): boolean {
  try {
    return typeof window !== 'undefined' && 'IntersectionObserver' in window;
  } catch {
    return false;
  }
}

// Проверка поддержки пассивных слушателей событий
export function supportsPassiveEvents(): boolean {
  let supportsPassive = false;
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: function() {
        supportsPassive = true;
        return true;
      }
    });
    const testHandler = () => {};
    window.addEventListener('testPassive', testHandler, opts);
    window.removeEventListener('testPassive', testHandler, opts);
  } catch {
    // Игнорируем ошибки
  }
  return supportsPassive;
}

/**
 * Оптимизированные опции для event listeners
 */
export const getOptimizedEventOptions = () => {
  const passive = supportsPassiveEvents();
  
  return {
    passive: passive,
    capture: false,
  };
};

/**
 * Проверяет производительность устройства
 */
export const getDevicePerformance = (): 'low' | 'medium' | 'high' => {
  if (typeof window === 'undefined') return 'medium';
  
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    hardwareConcurrency?: number;
  };
  const memory = nav.deviceMemory;
  const cores = nav.hardwareConcurrency;
  
  if (memory && memory < 4) return 'low';
  if (cores && cores < 4) return 'low';
  if (isMobileDevice()) return 'medium';
  
  return 'high';
};

/**
 * Получает оптимизированные настройки на основе производительности устройства
 */
export const getPerformanceOptimizedSettings = () => {
  const performance = getDevicePerformance();
  const mobile = isMobileDevice();
  
  switch (performance) {
    case 'low':
      return {
        animationDuration: 200,
        blurAmount: mobile ? 3 : 5,
        particleCount: mobile ? 5 : 10,
        updateInterval: 100,
        enableComplexAnimations: false,
      };
    case 'medium':
      return {
        animationDuration: 300,
        blurAmount: mobile ? 5 : 8,
        particleCount: mobile ? 10 : 15,
        updateInterval: 60,
        enableComplexAnimations: !mobile,
      };
    case 'high':
    default:
      return {
        animationDuration: 400,
        blurAmount: 10,
        particleCount: 20,
        updateInterval: 16,
        enableComplexAnimations: true,
      };
  }
};
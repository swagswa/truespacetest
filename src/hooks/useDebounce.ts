import { useCallback, useRef } from 'react'

/**
 * Хук для дебаунсинга функций
 * Предотвращает множественные вызовы API при быстрых действиях пользователя
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      // Отменяем предыдущий таймер
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Устанавливаем новый таймер
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  ) as T

  return debouncedCallback
}

/**
 * Хук для throttling функций
 * Ограничивает частоту вызовов функции
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCallRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      const timeSinceLastCall = now - lastCallRef.current

      if (timeSinceLastCall >= delay) {
        // Выполняем немедленно
        lastCallRef.current = now
        callback(...args)
      } else {
        // Планируем выполнение
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now()
          callback(...args)
        }, delay - timeSinceLastCall)
      }
    },
    [callback, delay]
  ) as T

  return throttledCallback
}
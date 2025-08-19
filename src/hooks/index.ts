/**
 * Центральный файл экспорта хуков для плавной миграции
 * 
 * Этот файл позволяет постепенно мигрировать компоненты с Context API на Zustand
 * путем изменения импортов без изменения логики компонентов
 */

// Оригинальные хуки Context API (для обратной совместимости)
export {
  useLessons,
  useFavoriteLessons,
  useCompletedLessons,
  useLessonsByDirection,
  useLessonToggle,
} from '@/contexts/LessonsContext'

// Новые адаптеры Zustand (для миграции)
export {
  useLessonsAdapter,
  useFavoriteLessonsAdapter,
  useCompletedLessonsAdapter,
  useLessonsByDirectionAdapter,
  useLessonToggleAdapter,
} from './useLessonsAdapter'

// Прямой доступ к Zustand store (для новых компонентов)
export { useLessonStore } from '@/stores/lesson-store'

/**
 * Алиасы для постепенной миграции
 * 
 * Раскомментируйте эти строки, когда будете готовы к полной миграции:
 * 
 * export {
 *   useLessonsAdapter as useLessons,
 *   useFavoriteLessonsAdapter as useFavoriteLessons,
 *   useCompletedLessonsAdapter as useCompletedLessons,
 *   useLessonsByDirectionAdapter as useLessonsByDirection,
 *   useLessonToggleAdapter as useLessonToggle,
 * } from './useLessonsAdapter'
 */

/**
 * Пример использования для миграции компонента:
 * 
 * // Шаг 1: Замените импорт
 * // Было:
 * // import { useLessons } from '@/contexts/LessonsContext'
 * 
 * // Стало:
 * // import { useLessonsAdapter as useLessons } from '@/hooks'
 * 
 * // Шаг 2: Компонент остается без изменений
 * // const { state, loadLessons, toggleFavorite } = useLessons()
 * 
 * // Шаг 3: После тестирования можно использовать прямой Zustand store
 * // import { useLessonStore } from '@/hooks'
 */
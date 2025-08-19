# Исправленный план системы управления уроками

## Анализ существующей архитектуры

### Текущая структура проекта

**Frontend (Next.js 14 App Router):**
- **Framework**: Next.js 14 с App Router
- **Styling**: TailwindCSS + shadcn/ui компоненты
- **State Management**: React Context API (`LessonsContext`)
- **Data Fetching**: React Query + кастомные хуки
- **Validation**: Zod схемы
- **WebSocket**: Кастомная реализация для синхронизации
- **API Client**: Типизированный клиент с обработкой ошибок

**Backend:**
- **Отсутствует отдельный backend сервер** - используются Next.js API Routes
- **Database**: Prisma ORM + SQLite
- **API**: RESTful endpoints через Next.js API Routes
- **Validation**: Zod схемы
- **WebSocket**: Socket.IO интеграция

### Существующие компоненты и хуки

#### Компоненты
1. **UnifiedLessonCard** - универсальная карточка урока с поддержкой различных вариантов отображения
2. **UnifiedLessonList** - универсальный список уроков с виртуализацией и настраиваемой плотностью
3. **OptimizedLessonCard** - оптимизированная версия с debounce и мемоизацией
4. **lesson-card** - базовая карточка урока

#### Хуки и контекст
1. **LessonsContext** - основной контекст для управления состоянием уроков
2. **useLessonList** - универсальный хук для управления списками уроков
3. **useLessonsQuery** - хук для React Query операций
4. **useWebSocketSync** - синхронизация через WebSocket
5. **useLessonToggle** - переключение статусов избранного/завершенного

#### API структура
1. **ApiClient класс** - типизированный клиент с retry логикой
2. **Zod схемы** - валидация для Lesson, Direction, User
3. **API Routes** - Next.js endpoints для проксирования к backend

### Существующие типы данных

```typescript
// Основные интерфейсы
interface Lesson {
  id: string
  slug: string
  title: string
  description?: string | null
  content?: string | null
  chatLink?: string | null
  difficulty?: number
  duration?: number | null
  tags?: string | null
  published?: boolean
  featured?: boolean
  order: number
  directionId: number
  createdAt?: string
  updatedAt?: string
  is_favorite?: boolean
  is_completed?: boolean
  completed_at?: string | null
  directionName?: string | null
  direction_slug?: string | null
  direction_icon?: string | null
  directionColor?: string | null
}

interface Direction {
  id: number
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  createdAt: string
}

interface LessonWithStatus extends Lesson {
  is_favorite: boolean
  is_completed: boolean
  direction: {
    id: number
    name: string
    slug: string
    icon?: string
    color?: string
  }
}
```

### Prisma схема (существующая)

```prisma
model Lesson {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  description String?
  content     String?
  chatLink    String?
  difficulty  Int?
  duration    Int?
  tags        String?
  published   Boolean  @default(false)
  featured    Boolean  @default(false)
  order       Int      @unique
  directionId Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  direction Direction @relation(fields: [directionId], references: [id])
  favorites Favorite[]
  completions Completion[]
  progress LessonProgress[]

  @@index([directionId])
  @@index([published])
  @@index([order])
}

model Direction {
  id          Int      @id @default(autoincrement())
  name        String
  slug        String   @unique
  description String?
  icon        String?
  color       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  lessons Lesson[]
}

model User {
  id         String   @id @default(cuid())
  telegramId String   @unique
  username   String?
  firstName  String?
  lastName   String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  favorites Favorite[]
  completions Completion[]
  progress LessonProgress[]
  analytics Analytics[]
}

model Favorite {
  id       Int    @id @default(autoincrement())
  userId   String
  lessonId String
  createdAt DateTime @default(now())

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([userId, lessonId])
}

model Completion {
  id          Int      @id @default(autoincrement())
  userId      String
  lessonId    String
  completedAt DateTime @default(now())
  createdAt   DateTime @default(now())

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([userId, lessonId])
}

model LessonProgress {
  id           Int      @id @default(autoincrement())
  userId       String
  lessonId     String
  progress     Float    @default(0)
  lastAccessed DateTime @default(now())
  timeSpent    Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([userId, lessonId])
}
```

## Выявленные проблемы

### Архитектурные проблемы
1. **Отсутствие отдельного backend сервера** - все API логика в Next.js routes
2. **Фрагментированное состояние** - множественные источники истины
3. **Неконсистентная типизация** - различные интерфейсы для одних данных
4. **Отсутствие централизованного кеширования**
5. **Неоптимальные API вызовы** - множественные запросы для получения связанных данных

### Технические проблемы
1. **Context API ограничения** - производительность при больших списках
2. **Дублирование логики** - повторяющийся код в компонентах
3. **Неконсистентная обработка ошибок**
4. **Отсутствие оптимистичных обновлений**
5. **Проблемы с синхронизацией WebSocket**

### UX проблемы
1. **Медленные переключения статусов** - отсутствие оптимистичных обновлений
2. **Неконсистентное состояние UI** - рассинхронизация между компонентами
3. **Отсутствие индикаторов загрузки** в некоторых местах
4. **Проблемы с производительностью** при больших списках

## Предлагаемые изменения

### 1. Улучшение Prisma схемы

**Добавить метаданные для уроков:**

```prisma
model Lesson {
  // ... существующие поля
  
  // Новые поля для метаданных
  estimatedTime    Int?     // Примерное время изучения в минутах
  prerequisites    String?  // JSON массив ID предварительных уроков
  learningGoals    String?  // JSON массив целей обучения
  resources        String?  // JSON массив дополнительных ресурсов
  assessmentType   String?  // Тип оценки (quiz, project, etc.)
  thumbnailUrl     String?  // URL превью изображения
  videoUrl         String?  // URL видео урока
  downloadableFiles String? // JSON массив файлов для скачивания
  
  // Индексы для поиска и фильтрации
  @@index([difficulty])
  @@index([estimatedTime])
  @@index([featured, published])
}
```

### 2. Создание унифицированного LessonService

**Новый сервисный слой для backend:**

```typescript
// src/lib/services/LessonService.ts
class LessonService {
  // Получение уроков с пользовательскими данными
  async getLessonsWithUserData(userId: string, filters?: LessonFilters): Promise<LessonWithUserData[]>
  
  // Получение одного урока с полными данными
  async getLessonWithUserData(lessonId: string, userId: string): Promise<LessonWithUserData>
  
  // Переключение статуса избранного
  async toggleFavorite(lessonId: string, userId: string): Promise<ToggleResult>
  
  // Переключение статуса завершения
  async toggleCompleted(lessonId: string, userId: string): Promise<ToggleResult>
  
  // Батчевые операции
  async batchToggleStatuses(operations: BatchOperation[], userId: string): Promise<BatchResult>
  
  // Обновление прогресса
  async updateProgress(lessonId: string, userId: string, progress: ProgressUpdate): Promise<void>
  
  // Инвалидация кеша
  async invalidateUserCache(userId: string): Promise<void>
}
```

### 3. Рефакторинг API endpoints

**Улучшенная структура API:**

```typescript
// Новые унифицированные endpoints
GET    /api/lessons                    // Все уроки с фильтрацией
GET    /api/lessons/:id                // Конкретный урок
GET    /api/lessons/:id/status         // Статус урока для пользователя
POST   /api/lessons/:id/favorite       // Переключение избранного
POST   /api/lessons/:id/completed      // Переключение завершения
POST   /api/lessons/:id/progress       // Обновление прогресса
POST   /api/lessons/batch              // Батчевые операции

GET    /api/users/:id/lessons          // Уроки пользователя с статусами
GET    /api/users/:id/favorites        // Избранные уроки
GET    /api/users/:id/completed        // Завершенные уроки
GET    /api/users/:id/progress         // Прогресс по урокам
```

### 4. Замена Context API на Zustand

**Новый LessonStore:**

```typescript
// src/stores/lessonStore.ts
interface LessonStore {
  // Состояние
  lessons: Map<string, LessonWithUserData>
  directions: Map<number, Direction>
  userStatuses: Map<string, UserLessonStatus>
  loading: boolean
  error: string | null
  
  // Действия
  loadLessons: (filters?: LessonFilters) => Promise<void>
  loadLesson: (id: string) => Promise<void>
  toggleFavorite: (lessonId: string) => Promise<void>
  toggleCompleted: (lessonId: string) => Promise<void>
  updateProgress: (lessonId: string, progress: number) => Promise<void>
  
  // Селекторы
  getLessonsByDirection: (directionId: number) => LessonWithUserData[]
  getFavoriteLessons: () => LessonWithUserData[]
  getCompletedLessons: () => LessonWithUserData[]
  getLessonProgress: (lessonId: string) => number
  
  // Утилиты
  invalidateCache: () => void
  syncWithWebSocket: (event: WebSocketEvent) => void
}
```

### 5. Обновленные TypeScript типы

**Унифицированные интерфейсы:**

```typescript
// src/types/lesson.ts
export interface LessonContent {
  type: 'text' | 'video' | 'interactive' | 'quiz'
  data: string | VideoContent | InteractiveContent | QuizContent
}

export interface LessonMetadata {
  estimatedTime?: number
  prerequisites: string[]
  learningGoals: string[]
  resources: Resource[]
  assessmentType?: 'quiz' | 'project' | 'discussion' | 'none'
  thumbnailUrl?: string
  videoUrl?: string
  downloadableFiles: DownloadableFile[]
}

export interface UserLessonStatus {
  isFavorite: boolean
  isCompleted: boolean
  progress: number
  timeSpent: number
  lastAccessed?: Date
  completedAt?: Date
}

export interface LessonWithUserData extends Lesson {
  metadata: LessonMetadata
  userStatus: UserLessonStatus
  direction: Direction
}
```

### 6. Улучшенные компоненты

**Рефакторинг существующих компонентов:**

1. **UnifiedLessonCard** - добавить поддержку новых метаданных
2. **UnifiedLessonList** - интеграция с Zustand store
3. **OptimizedLessonCard** - улучшенная мемоизация
4. Новый **LessonDetailView** - детальный просмотр урока
5. Новый **LessonProgressIndicator** - индикатор прогресса

### 7. WebSocket интеграция

**События для синхронизации:**

```typescript
// WebSocket события
interface WebSocketEvents {
  'lesson:favorite:toggle': { lessonId: string, userId: string, isFavorite: boolean }
  'lesson:completed:toggle': { lessonId: string, userId: string, isCompleted: boolean }
  'lesson:progress:update': { lessonId: string, userId: string, progress: number }
  'user:activity': { userId: string, lessonId: string, action: string }
}
```

### 8. Кеширование и оптимизация

**Стратегии кеширования:**

1. **React Query** - кеширование API запросов
2. **Zustand persist** - локальное хранение состояния
3. **Service Worker** - кеширование статических данных
4. **Оптимистичные обновления** - мгновенный UI отклик

## План реализации

### Фаза 1: Основа (1-2 недели)
1. ✅ Анализ существующей архитектуры
2. ✅ Создание исправленного плана
3. 🔄 Обновление Prisma схемы
4. 🔄 Создание LessonService
5. 🔄 Рефакторинг API endpoints

### Фаза 2: State Management (1 неделя)
6. 🔄 Создание Zustand store
7. 🔄 Обновление TypeScript типов
8. 🔄 Миграция с Context API на Zustand

### Фаза 3: Компоненты (1-2 недели)
9. 🔄 Рефакторинг существующих компонентов
10. 🔄 Создание новых компонентов
11. 🔄 Улучшение UX и производительности

### Фаза 4: Интеграция (1 неделя)
12. 🔄 WebSocket интеграция
13. 🔄 Оптимизация кеширования
14. 🔄 Тестирование и отладка

### Фаза 5: Тестирование и документация (1 неделя)
15. 🔄 E2E тесты с Playwright
16. 🔄 Unit тесты для сервисов
17. 🔄 Документация API
18. 🔄 Руководство по миграции

## Критерии успеха

### Производительность
- [ ] Время загрузки списка уроков < 500ms
- [ ] Время отклика на переключение статусов < 100ms
- [ ] Поддержка списков до 1000+ уроков без деградации
- [ ] Оптимистичные обновления для всех пользовательских действий

### Надежность
- [ ] 99.9% успешных API запросов
- [ ] Автоматическое восстановление после сбоев WebSocket
- [ ] Graceful degradation при отсутствии сети
- [ ] Консистентность данных между компонентами

### Разработка
- [ ] 100% типизация TypeScript
- [ ] Покрытие тестами > 80%
- [ ] Автоматические E2E тесты для критических сценариев
- [ ] Документация для всех публичных API

### UX
- [ ] Мгновенный отклик на пользовательские действия
- [ ] Понятные индикаторы состояния загрузки
- [ ] Graceful error handling с понятными сообщениями
- [ ] Поддержка offline режима для просмотра кешированных данных

## Заключение

Данный исправленный план учитывает всю существующую архитектуру проекта и предлагает эволюционный подход к улучшению системы управления уроками. Основные изменения направлены на:

1. **Сохранение работающих компонентов** - UnifiedLessonCard, UnifiedLessonList и другие
2. **Постепенную миграцию** - от Context API к Zustand без breaking changes
3. **Улучшение производительности** - оптимизация существующих решений
4. **Расширение функциональности** - добавление новых возможностей
5. **Улучшение DX** - лучшая типизация и инструменты разработки

План позволяет сохранить стабильность существующего кода при значительном улучшении архитектуры и пользовательского опыта.
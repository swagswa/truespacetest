// API клиент для работы с сервером

import { z } from 'zod'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

// Zod schemas for runtime validation
export const LessonSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  chatLink: z.string().nullable().optional(),
  difficulty: z.number().optional(),
  duration: z.number().nullable().optional(),
  tags: z.string().nullable().optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  order: z.number(),
  directionId: z.number(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  is_favorite: z.boolean().optional(),
  is_completed: z.boolean().optional(),
  completed_at: z.string().nullable().optional(),
  directionName: z.string().nullable().optional(),
  direction_slug: z.string().nullable().optional(),
  direction_icon: z.string().nullable().optional(),
  directionColor: z.string().nullable().optional(),
})

export const DirectionSchema = z.object({
  id: z.number(), // Changed from string to number to match Prisma schema
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  createdAt: z.string(),
})

export const UserSchema = z.object({
  id: z.string(),
  telegramId: z.string(),
  username: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// Класс для типизированных ошибок API
export interface ApiErrorData {
  error?: string
  message?: string
  details?: string
  [key: string]: unknown
}

export class ApiError extends Error {
  public readonly status: number
  public readonly data?: ApiErrorData
  public readonly timestamp: Date

  constructor(message: string, status: number, data?: ApiErrorData) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
    this.timestamp = new Date()
    
    // Поддержка stack trace в V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError)
    }
  }

  // Проверка типа ошибки
  isNetworkError(): boolean {
    return this.status === 0
  }

  isClientError(): boolean {
    return this.status >= 400 && this.status < 500
  }

  isServerError(): boolean {
    return this.status >= 500 && this.status < 600
  }

  // Получение пользовательского сообщения
  getUserMessage(): string {
    return this.message
  }

  // Получение технических деталей для логирования
  getTechnicalDetails(): object {
    return {
      message: this.message,
      status: this.status,
      data: this.data,
      timestamp: this.timestamp,
      stack: this.stack
    }
  }
}

export interface User {
  id: string
  telegramId: string
  username?: string
  firstName?: string
  lastName?: string
  createdAt: string
  updatedAt: string
}

export interface Direction {
  id: number // Changed from string to number to match Prisma schema
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  createdAt: string
}

export interface Lesson {
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
  directionId: number // Changed from string to number to match Prisma schema
  createdAt?: string
  updatedAt?: string
  is_favorite?: boolean
  is_completed?: boolean
  completed_at?: string | null
  // Direction properties for favorites API
  directionName?: string | null
  direction_slug?: string | null
  direction_icon?: string | null
  directionColor?: string | null
}

export interface UserProgress {
  id: number
  user_id: number
  lesson_id: number
  is_completed: boolean
  is_favorite: boolean
  completed_at?: string | null
  created_at: string
  updated_at: string
  progress_data?: ProgressData | null
  last_accessed?: string | null
}

export interface RequestOptions extends RequestInit {
  timeout?: number
}

class ApiClient {
  private baseUrl: string
  private defaultTimeout: number = 10000 // 10 секунд
  private maxRetries: number = 3
  private retryDelay: number = 1000 // 1 секунда

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  // Метод для настройки таймаутов и retry
  configure(options: {
    timeout?: number
    maxRetries?: number
    retryDelay?: number
  }) {
    if (options.timeout) this.defaultTimeout = options.timeout
    if (options.maxRetries !== undefined) this.maxRetries = options.maxRetries
    if (options.retryDelay) this.retryDelay = options.retryDelay
  }

  // Утилита для задержки
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Проверка, нужно ли повторить запрос
  private shouldRetry(error: ApiError, attempt: number): boolean {
    if (attempt >= this.maxRetries) return false
    
    // Повторяем только для сетевых ошибок и серверных ошибок 5xx
    return error.isNetworkError() || 
           error.status === 429 || // Rate limiting
           error.isServerError()
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    // Добавляем timeout к запросу
    const timeout = options.timeout || this.defaultTimeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    }

    let lastError: ApiError
    
    // Retry loop
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, config)
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`
          let errorData: ApiErrorData | null = null
          
          try {
            errorData = await response.json()
            if (errorData.message) {
              errorMessage = errorData.message
            }
          } catch {
            // Если не удается распарсить JSON, используем статус текст
          }
          
          // Создаем специфичные ошибки для разных статусов
          let apiError: ApiError
          switch (response.status) {
            case 400:
              apiError = new ApiError('Неверный запрос. Проверьте переданные данные.', response.status, errorData)
              break
            case 401:
              apiError = new ApiError('Ошибка авторизации. Войдите в систему заново.', response.status, errorData)
              break
            case 403:
              apiError = new ApiError('Доступ запрещен. У вас нет прав для выполнения этого действия.', response.status, errorData)
              break
            case 404:
              apiError = new ApiError('Ресурс не найден. Проверьте правильность запроса.', response.status, errorData)
              break
            case 409:
              apiError = new ApiError('Конфликт данных. Возможно, ресурс уже существует.', response.status, errorData)
              break
            case 422:
              apiError = new ApiError('Ошибка валидации данных.', response.status, errorData)
              break
            case 429:
              apiError = new ApiError('Слишком много запросов. Попробуйте позже.', response.status, errorData)
              break
            case 500:
              apiError = new ApiError('Внутренняя ошибка сервера. Попробуйте позже.', response.status, errorData)
              break
            case 502:
            case 503:
            case 504:
              apiError = new ApiError('Сервер временно недоступен. Попробуйте позже.', response.status, errorData)
              break
            default:
              apiError = new ApiError(errorMessage, response.status, errorData)
          }
          
          // Проверяем, нужно ли повторить запрос
          if (this.shouldRetry(apiError, attempt)) {
            lastError = apiError
            console.warn(`API request failed (attempt ${attempt + 1}/${this.maxRetries + 1}):`, apiError.getUserMessage())
            await this.delay(this.retryDelay * Math.pow(2, attempt)) // Exponential backoff
            continue
          }
          
          throw apiError
        }
        
        // Проверяем, что ответ содержит JSON
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          throw new ApiError('Сервер вернул некорректный формат данных.', response.status)
        }
        
        return await response.json()
        
      } catch (error) {
        clearTimeout(timeoutId)
        
        // Если это уже наша ApiError, проверяем retry
        if (error instanceof ApiError) {
          if (this.shouldRetry(error, attempt)) {
            lastError = error
            console.warn(`API request failed (attempt ${attempt + 1}/${this.maxRetries + 1}):`, error.getUserMessage())
            await this.delay(this.retryDelay * Math.pow(2, attempt))
            continue
          }
          throw error
        }
        
        // Обрабатываем timeout
        if (error.name === 'AbortError') {
          const timeoutError = new ApiError(`Превышено время ожидания ответа (${timeout}ms).`, 0)
          if (this.shouldRetry(timeoutError, attempt)) {
            lastError = timeoutError
            console.warn(`API request timeout (attempt ${attempt + 1}/${this.maxRetries + 1})`)
            await this.delay(this.retryDelay * Math.pow(2, attempt))
            continue
          }
          throw timeoutError
        }
        
        // Обрабатываем сетевые ошибки
        if (error instanceof TypeError && error.message.includes('fetch')) {
          const networkError = new ApiError('Ошибка сети. Проверьте подключение к интернету.', 0)
          if (this.shouldRetry(networkError, attempt)) {
            lastError = networkError
            console.warn(`Network error (attempt ${attempt + 1}/${this.maxRetries + 1}):`, error.message)
            await this.delay(this.retryDelay * Math.pow(2, attempt))
            continue
          }
          throw networkError
        }
        
        // Обрабатываем ошибки парсинга JSON
        if (error instanceof SyntaxError) {
          throw new ApiError('Ошибка обработки ответа сервера.', 0)
        }
        
        // Для всех остальных ошибок
        console.error('API request failed:', error)
        throw new ApiError('Произошла неожиданная ошибка.', 0, error)
      }
    }
    
    // Если мы дошли сюда, значит все попытки исчерпаны
    throw lastError || new ApiError('Все попытки запроса исчерпаны.', 0)
  }

  // Convenience methods for common HTTP verbs
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }

  // Пользователи
  async createUser(userData: {
    telegramId: string
    username?: string
    firstName?: string
    lastName?: string
  }): Promise<User> {
    return this.request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async getUser(telegramId: string): Promise<User> {
    return this.request<User>(`/api/users/${telegramId}`)
  }

  // Направления
  async getDirections(): Promise<Direction[]> {
    const response = await this.request<{data: Direction[], meta: any}>('/api/directions/')
    // Extract data from paginated response
    const data = response.data || response
    return z.array(DirectionSchema).parse(data)
  }

  async getDirection(slug: string): Promise<Direction> {
    const data = await this.request<Direction>(`/api/directions/${slug}/`)
    return DirectionSchema.parse(data)
  }

  async getLessonsByDirection(directionSlug: string): Promise<Lesson[]> {
    const response = await this.request<{data: Lesson[], meta: any}>(`/api/directions/${directionSlug}/lessons/`)
    // Extract data from paginated response
    const data = response.data || response
    return z.array(LessonSchema).parse(data)
  }

  // Уроки
  async getLessons(): Promise<Lesson[]> {
    const response = await this.request<{data: Lesson[], meta: any}>('/api/lessons/')
    // Extract data from paginated response
    const data = response.data || response
    return z.array(LessonSchema).parse(data)
  }

  async getLesson(lessonSlug: string): Promise<Lesson> {
    return this.request<Lesson>(`/api/lessons/${lessonSlug}/`)
  }

  // Избранные уроки (обновлено для работы без telegramId)
  async toggleFavoriteStatus(lessonOrder: number): Promise<{ message: string; isFavorite: boolean }> {
    const validOrder = validateLessonOrder(lessonOrder)
    const userId = getTelegramId()
    if (!userId) {
      throw new ApiError('User not authenticated', 401)
    }
    
    return this.request(`/api/lessons/${validOrder}/favorite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    })
  }

  async getLessonStatus(lessonOrder: number): Promise<{ isFavorite: boolean; isCompleted: boolean }> {
    const validOrder = validateLessonOrder(lessonOrder)
    const userId = getTelegramId()
    if (!userId) {
      throw new ApiError('User not authenticated', 401)
    }
    
    return this.request(`/api/lessons/${validOrder}/status?userId=${encodeURIComponent(userId)}`)
  }

  // Завершенные уроки (обновлено для работы без telegramId)
  async toggleCompletedStatus(lessonOrder: number): Promise<{ message: string; isCompleted: boolean }> {
    const validOrder = validateLessonOrder(lessonOrder)
    const userId = getTelegramId()
    if (!userId) {
      throw new ApiError('User not authenticated', 401)
    }
    
    return this.request(`/api/lessons/${validOrder}/completed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    })
  }

  // Прогресс пользователя
  async getUserProgress(telegramId: string): Promise<UserProgress[]> {
    return this.request<UserProgress[]>(`/api/users/${telegramId}/progress`)
  }

  async getFavorites(telegramId: string): Promise<Lesson[]> {
    const response = await this.request<{data: Lesson[], meta: any}>(`/api/users/${telegramId}/favorites`)
    // Extract data from paginated response
    const data = Array.isArray(response) ? response : response.data
    return z.array(LessonSchema).parse(data)
  }

  async getCompleted(telegramId: string): Promise<Lesson[]> {
    const response = await this.request<{data: Lesson[], meta: any}>(`/api/users/${telegramId}/completed`)
    // Extract data from paginated response
    const data = Array.isArray(response) ? response : response.data
    return z.array(LessonSchema).parse(data)
  }
}

// Создаем и экспортируем экземпляр API клиента
export const apiClient = new ApiClient()

// Настраиваем клиент с разумными значениями по умолчанию
apiClient.configure({
  timeout: 10000,    // 10 секунд
  maxRetries: 3,     // 3 попытки
  retryDelay: 1000   // 1 секунда базовая задержка
})

// Utility functions for safe type conversion
export function validateLessonOrder(order: unknown): number {
  if (typeof order === 'number' && Number.isInteger(order) && order > 0) {
    return order
  }
  if (typeof order === 'string') {
    const parsed = parseInt(order, 10)
    if (!isNaN(parsed) && parsed > 0) {
      return parsed
    }
  }
  throw new Error(`Invalid lesson order: ${order}. Must be a positive integer.`)
}

export function validateLessonId(id: unknown): string {
  if (typeof id === 'string' && id.length > 0) {
    return id
  }
  throw new Error(`Invalid lesson id: ${id}. Must be a non-empty string.`)
}

// Хелперы для получения telegram_id
export function getTelegramId(): string | null {
  if (typeof window === 'undefined') return 'test_user_123'
  
  // Для локального тестирования всегда используем тестовый ID
  console.log('Используется тестовый Telegram ID для локальной разработки')
  return 'test_user_123'
}

// Хелперы для работы с избранным и пройденными
export async function toggleFavorite(lessonOrder: number): Promise<boolean> {
  console.log('toggleFavorite called with lessonOrder:', lessonOrder)
  
  try {
    const validOrder = validateLessonOrder(lessonOrder)
    console.log('Toggling favorite status...')
    const result = await apiClient.toggleFavoriteStatus(validOrder)
    console.log('Toggle result:', result)
    return result.isFavorite
  } catch (error) {
    console.error('Error toggling favorite:', error)
    throw error
  }
}

export async function toggleCompleted(lessonOrder: number): Promise<boolean> {
  console.log('toggleCompleted called with lessonOrder:', lessonOrder)
  
  try {
    const validOrder = validateLessonOrder(lessonOrder)
    console.log('Toggling completed status...')
    const result = await apiClient.toggleCompletedStatus(validOrder)
    console.log('Toggle result:', result)
    return result.isCompleted
  } catch (error) {
    console.error('Error toggling completed:', error)
    throw error
  }
}

// Хелпер для получения статуса урока
export async function getLessonStatus(lessonOrder: number): Promise<{ isFavorite: boolean; isCompleted: boolean }> {
  try {
    const validOrder = validateLessonOrder(lessonOrder)
    const status = await apiClient.getLessonStatus(validOrder)
    return status
  } catch (error) {
    console.error('Error getting lesson status:', error)
    return { isFavorite: false, isCompleted: false }
  }
}
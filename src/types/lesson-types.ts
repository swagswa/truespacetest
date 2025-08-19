// Frontend TypeScript types for the lesson management system

// Base lesson content structure
export interface LessonContentBlock {
  type: 'text' | 'video' | 'exercise' | 'demo' | 'gallery' | 'examples';
  content?: string;
  url?: string;
  images?: string[];
  prompts?: string[];
}

export interface LessonContent {
  type: 'lesson';
  blocks: LessonContentBlock[];
}

// Resource types for lesson metadata
export interface LessonResource {
  title: string;
  url: string;
  type: 'video' | 'article' | 'documentation' | 'tool';
}

export interface DownloadableFile {
  name: string;
  url: string;
  size?: number;
}

// Lesson metadata structure
export interface LessonMetadata {
  estimatedTime?: number; // in minutes
  prerequisites?: string[];
  learningGoals?: string[];
  resources?: LessonResource[];
  assessmentType?: 'quiz' | 'project' | 'peer_review' | 'self_assessment';
  thumbnailUrl?: string;
  videoUrl?: string;
  downloadableFiles?: DownloadableFile[];
}

// User lesson status
export interface UserLessonStatus {
  isFavorite: boolean;
  isCompleted: boolean;
  completedAt?: Date | null;
  favoritedAt?: Date | null;
  progress?: Record<string, any> | null;
  lastAccessed?: Date | null;
}

// Complete lesson with user data
export interface LessonWithUserData {
  id: string;
  slug: string;
  title: string;
  description: string;
  content?: LessonContent | null;
  chatLink?: string | null;
  difficulty?: number | null;
  duration?: number | null; // deprecated, use estimatedTime from metadata
  tags?: string[] | null;
  published: boolean;
  featured: boolean;
  order: number;
  directionId: number;
  createdAt: Date;
  updatedAt: Date;
  
  // New metadata fields
  estimatedTime?: number | null;
  prerequisites?: string[] | null;
  learningGoals?: string[] | null;
  resources?: LessonResource[] | null;
  assessmentType?: string | null;
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
  downloadableFiles?: DownloadableFile[] | null;
  
  // User-specific data (optional)
  userStatus?: UserLessonStatus;
}

// Lesson filters for API queries
export interface LessonFilters {
  directionId?: number;
  difficulty?: number;
  tags?: string[];
  featured?: boolean;
  completed?: boolean;
  favorited?: boolean;
  search?: string;
}

// Pagination parameters
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Pagination response
export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Lesson service response with pagination
export interface LessonsWithPagination {
  lessons: LessonWithUserData[];
  pagination: PaginationResponse;
}

// Lesson statistics
export interface LessonStats {
  totalViews: number;
  totalCompletions: number;
  totalFavorites: number;
  averageProgress: number;
  completionRate: number;
  favoriteRate: number;
}

// Batch operation types
export interface BatchOperation {
  lessonId: string;
  userId: string;
  action: 'favorite' | 'unfavorite' | 'complete' | 'uncomplete';
}

export interface BatchOperationResult {
  lessonId: string;
  userId: string;
  action: string;
  success: boolean;
  error?: string;
}

// Progress data structure
export interface LessonProgress {
  currentStep?: number;
  totalSteps?: number;
  completedSteps?: number[];
  timeSpent?: number; // in seconds
  lastPosition?: {
    blockIndex: number;
    scrollPosition?: number;
  };
  answers?: Record<string, any>; // for exercises and quizzes
  notes?: string;
  bookmarks?: number[]; // block indices
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LessonsApiResponse extends ApiResponse<LessonWithUserData[]> {
  pagination?: PaginationResponse;
}

export interface LessonApiResponse extends ApiResponse<LessonWithUserData> {}

export interface LessonStatsApiResponse extends ApiResponse<LessonStats> {}

export interface BatchOperationApiResponse extends ApiResponse<BatchOperationResult[]> {}

// Zustand store types
export interface LessonStore {
  lessons: LessonWithUserData[];
  currentLesson: LessonWithUserData | null;
  loading: boolean;
  error: string | null;
  filters: LessonFilters;
  pagination: PaginationResponse;
  searchResults: LessonWithUserData[];
  searchLoading: boolean;
  stats: Record<string, LessonStats>;
  optimisticUpdates: Record<string, Partial<LessonWithUserData>>;
  
  // Actions
  fetchLessons: (filters?: LessonFilters, pagination?: PaginationParams) => Promise<void>;
  fetchLessonById: (id: string, userId?: string) => Promise<void>;
  fetchLessonBySlug: (slug: string, userId?: string) => Promise<void>;
  toggleFavorite: (lessonId: string, userId: string) => Promise<void>;
  toggleCompletion: (lessonId: string, userId: string) => Promise<void>;
  updateProgress: (lessonId: string, userId: string, progress: LessonProgress) => Promise<void>;
  batchUpdateStatus: (operations: BatchOperation[]) => Promise<BatchOperationResult[]>;
  searchLessons: (query: string, pagination?: PaginationParams, userId?: string) => Promise<void>;
  fetchLessonStats: (lessonId: string) => Promise<void>;
  setFilters: (filters: Partial<LessonFilters>) => void;
  setPagination: (pagination: Partial<PaginationResponse>) => void;
  setCurrentLesson: (lesson: LessonWithUserData | null) => void;
  updateLessonInList: (lessonId: string, updates: Partial<LessonWithUserData>) => void;
  addOptimisticUpdate: (lessonId: string, updates: Partial<LessonWithUserData>) => void;
  removeOptimisticUpdate: (lessonId: string) => void;
  clearError: () => void;
  reset: () => void;
  resetSearch: () => void;
}

// Component prop types
export interface LessonCardProps {
  lesson: LessonWithUserData;
  userId?: string;
  onFavoriteToggle?: (lessonId: string, isFavorite: boolean) => void;
  onCompletionToggle?: (lessonId: string, isCompleted: boolean) => void;
  onProgressUpdate?: (lessonId: string, progress: LessonProgress) => void;
  compact?: boolean;
  showProgress?: boolean;
  className?: string;
}

export interface LessonListProps {
  lessons: LessonWithUserData[];
  userId?: string;
  loading?: boolean;
  error?: string | null;
  onLoadMore?: () => void;
  hasMore?: boolean;
  filters?: LessonFilters;
  onFiltersChange?: (filters: Partial<LessonFilters>) => void;
  className?: string;
}

export interface LessonDetailViewProps {
  lesson: LessonWithUserData;
  userId?: string;
  onProgressUpdate?: (progress: LessonProgress) => void;
  onFavoriteToggle?: (isFavorite: boolean) => void;
  onCompletionToggle?: (isCompleted: boolean) => void;
  className?: string;
}

export interface LessonProgressIndicatorProps {
  progress: LessonProgress;
  totalSteps?: number;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

// WebSocket event types
export interface WebSocketLessonEvent {
  type: 'lesson_favorite_toggled' | 'lesson_completed' | 'lesson_progress_updated';
  lessonId: string;
  userId: string;
  data: {
    isFavorite?: boolean;
    isCompleted?: boolean;
    progress?: LessonProgress;
    timestamp: Date;
  };
}

// Error types
export class LessonNotFoundError extends Error {
  constructor(identifier: string) {
    super(`Lesson not found: ${identifier}`);
    this.name = 'LessonNotFoundError';
  }
}

export class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`User not found: ${userId}`);
    this.name = 'UserNotFoundError';
  }
}

export class InvalidProgressDataError extends Error {
  constructor(message: string) {
    super(`Invalid progress data: ${message}`);
    this.name = 'InvalidProgressDataError';
  }
}

// Utility types
export type LessonSortField = 'createdAt' | 'title' | 'order' | 'difficulty' | 'estimatedTime';
export type SortOrder = 'asc' | 'desc';
export type LessonStatus = 'draft' | 'published' | 'archived';
export type UserRole = 'student' | 'instructor' | 'admin';

// Direction types (based on existing structure)
export interface Direction {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
}

// Filter component types
export interface LessonFilterProps {
  filters: LessonFilters;
  onFiltersChange: (filters: Partial<LessonFilters>) => void;
  directions?: Direction[];
  className?: string;
}

// Search component types
export interface LessonSearchProps {
  onSearch: (query: string) => void;
  loading?: boolean;
  placeholder?: string;
  className?: string;
}

// Virtualization types (for large lists)
export interface VirtualizedLessonListProps extends LessonListProps {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

// Performance monitoring types
export interface LessonPerformanceMetrics {
  renderTime: number;
  loadTime: number;
  interactionTime: number;
  memoryUsage?: number;
}

// Cache types
export interface LessonCacheEntry {
  data: LessonWithUserData;
  timestamp: number;
  ttl: number;
}

export interface LessonCache {
  lessons: Record<string, LessonCacheEntry>;
  lists: Record<string, {
    data: LessonWithUserData[];
    pagination: PaginationResponse;
    timestamp: number;
    ttl: number;
  }>;
}

// Hook return types
export interface UseLessonListReturn {
  lessons: LessonWithUserData[];
  loading: boolean;
  error: string | null;
  pagination: PaginationResponse;
  fetchMore: () => Promise<void>;
  refresh: () => Promise<void>;
  hasMore: boolean;
}

export interface UseLessonReturn {
  lesson: LessonWithUserData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export interface UseBatchOperationsReturn {
  batchUpdate: (operations: BatchOperation[]) => Promise<BatchOperationResult[]>;
  loading: boolean;
  error: string | null;
}

// Telegram WebApp types (extending existing)
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramWebAppData {
  user?: TelegramUser;
  chat_instance?: string;
  chat_type?: string;
  auth_date: number;
  hash: string;
}

// Theme types
export interface LessonTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

// Animation types
export interface LessonAnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

export interface LessonTransition {
  enter: LessonAnimationConfig;
  exit: LessonAnimationConfig;
}
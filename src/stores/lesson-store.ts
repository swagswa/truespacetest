import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  LessonWithUserData,
  LessonFilters,
  PaginationParams,
  PaginationResponse,
  LessonProgress,
  LessonStats,
  BatchOperation,
  BatchOperationResult,
  LessonStore
} from '../types/lesson-types';
import { apiClient as api } from '../lib/api';
import { LessonUpdate, UserActivity } from '../lib/websocket-server';

interface LessonStoreState {
  // State
  lessons: LessonWithUserData[];
  currentLesson: LessonWithUserData | null;
  loading: boolean;
  error: string | null;
  filters: LessonFilters;
  pagination: PaginationResponse;
  searchResults: LessonWithUserData[];
  searchLoading: boolean;
  stats: Record<string, LessonStats>; // lessonId -> stats
  
  // Cache for optimistic updates
  optimisticUpdates: Record<string, Partial<LessonWithUserData>>;
  
  // WebSocket state removed
  
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
  
  // WebSocket actions removed
  
  // State management
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

const initialState = {
  lessons: [],
  currentLesson: null,
  loading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  },
  searchResults: [],
  searchLoading: false,
  stats: {},
  optimisticUpdates: {},
  // WebSocket state removed
};

export const useLessonStore = create<LessonStoreState>()()
  (devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        fetchLessons: async (filters = {}, pagination = { page: 1, limit: 20 }) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const queryParams = new URLSearchParams();
            
            // Add pagination
            queryParams.append('page', pagination.page.toString());
            queryParams.append('limit', pagination.limit.toString());
            
            // Add filters
            if (filters.directionId) queryParams.append('directionId', filters.directionId.toString());
            if (filters.difficulty) queryParams.append('difficulty', filters.difficulty.toString());
            if (filters.tags?.length) queryParams.append('tags', filters.tags.join(','));
            if (filters.featured !== undefined) queryParams.append('featured', filters.featured.toString());
            if (filters.completed !== undefined) queryParams.append('completed', filters.completed.toString());
            if (filters.favorited !== undefined) queryParams.append('favorited', filters.favorited.toString());
            if (filters.search) queryParams.append('search', filters.search);
            
            const response = await api.get(`/api/lessons/unified?${queryParams.toString()}`);
            
            if (!response.ok) {
              throw new Error(`Failed to fetch lessons: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            set((state) => {
              state.lessons = data.data || [];
              state.pagination = data.pagination || initialState.pagination;
              state.filters = filters;
              state.loading = false;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to fetch lessons';
              state.loading = false;
            });
          }
        },

        fetchLessonById: async (id: string, userId?: string) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const queryParams = userId ? `?userId=${userId}` : '';
            const response = await api.get(`/api/lessons/unified/${id}${queryParams}`);
            
            if (!response.ok) {
              throw new Error(`Failed to fetch lesson: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            set((state) => {
              state.currentLesson = data.data;
              state.loading = false;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to fetch lesson';
              state.loading = false;
            });
          }
        },

        fetchLessonBySlug: async (slug: string, userId?: string) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const queryParams = userId ? `?userId=${userId}` : '';
            const response = await api.get(`/api/lessons/unified/slug/${slug}${queryParams}`);
            
            if (!response.ok) {
              throw new Error(`Failed to fetch lesson: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            set((state) => {
              state.currentLesson = data.data;
              state.loading = false;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to fetch lesson';
              state.loading = false;
            });
          }
        },

        toggleFavorite: async (lessonId: string, userId: string) => {
          // Optimistic update
          const currentLesson = get().lessons.find(l => l.id === lessonId) || get().currentLesson;
          const currentFavoriteStatus = currentLesson?.userStatus?.isFavorite || false;
          
          set((state) => {
            state.addOptimisticUpdate(lessonId, {
              userStatus: {
                ...currentLesson?.userStatus,
                isFavorite: !currentFavoriteStatus,
                favoritedAt: !currentFavoriteStatus ? new Date() : null
              }
            });
          });

          try {
            const response = await api.post(`/api/lessons/unified/${lessonId}/favorite`, {
              userId
            });
            
            if (!response.ok) {
              throw new Error(`Failed to toggle favorite: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            set((state) => {
              state.updateLessonInList(lessonId, data.data);
              state.removeOptimisticUpdate(lessonId);
              if (state.currentLesson?.id === lessonId) {
                state.currentLesson = { ...state.currentLesson, ...data.data };
              }
            });
          } catch (error) {
            // Revert optimistic update
            set((state) => {
              state.removeOptimisticUpdate(lessonId);
              state.error = error instanceof Error ? error.message : 'Failed to toggle favorite';
            });
          }
        },

        toggleCompletion: async (lessonId: string, userId: string) => {
          // Optimistic update
          const currentLesson = get().lessons.find(l => l.id === lessonId) || get().currentLesson;
          const currentCompletionStatus = currentLesson?.userStatus?.isCompleted || false;
          
          set((state) => {
            state.addOptimisticUpdate(lessonId, {
              userStatus: {
                ...currentLesson?.userStatus,
                isCompleted: !currentCompletionStatus,
                completedAt: !currentCompletionStatus ? new Date() : null
              }
            });
          });

          try {
            const response = await api.post(`/api/lessons/unified/${lessonId}/complete`, {
              userId
            });
            
            if (!response.ok) {
              throw new Error(`Failed to toggle completion: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            set((state) => {
              state.updateLessonInList(lessonId, data.data);
              state.removeOptimisticUpdate(lessonId);
              if (state.currentLesson?.id === lessonId) {
                state.currentLesson = { ...state.currentLesson, ...data.data };
              }
            });
          } catch (error) {
            // Revert optimistic update
            set((state) => {
              state.removeOptimisticUpdate(lessonId);
              state.error = error instanceof Error ? error.message : 'Failed to toggle completion';
            });
          }
        },

        updateProgress: async (lessonId: string, userId: string, progress: LessonProgress) => {
          // Optimistic update
          set((state) => {
            state.addOptimisticUpdate(lessonId, {
              userStatus: {
                ...get().lessons.find(l => l.id === lessonId)?.userStatus,
                progress,
                lastAccessed: new Date()
              }
            });
          });

          try {
            const response = await api.post(`/api/lessons/unified/${lessonId}/progress`, {
              userId,
              progressData: progress
            });
            
            if (!response.ok) {
              throw new Error(`Failed to update progress: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            set((state) => {
              state.updateLessonInList(lessonId, data.data);
              state.removeOptimisticUpdate(lessonId);
              if (state.currentLesson?.id === lessonId) {
                state.currentLesson = { ...state.currentLesson, ...data.data };
              }
            });
          } catch (error) {
            // Revert optimistic update
            set((state) => {
              state.removeOptimisticUpdate(lessonId);
              state.error = error instanceof Error ? error.message : 'Failed to update progress';
            });
          }
        },

        batchUpdateStatus: async (operations: BatchOperation[]) => {
          try {
            const response = await api.post('/api/lessons/unified/batch', {
              operations
            });
            
            if (!response.ok) {
              throw new Error(`Failed to batch update: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Refresh lessons after batch update
            await get().fetchLessons(get().filters, {
              page: get().pagination.page,
              limit: get().pagination.limit
            });
            
            return data.data;
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to batch update';
            });
            throw error;
          }
        },

        searchLessons: async (query: string, pagination = { page: 1, limit: 20 }, userId?: string) => {
          set((state) => {
            state.searchLoading = true;
            state.error = null;
          });

          try {
            const queryParams = new URLSearchParams();
            queryParams.append('q', query);
            queryParams.append('page', pagination.page.toString());
            queryParams.append('limit', pagination.limit.toString());
            if (userId) queryParams.append('userId', userId);
            
            const response = await api.get(`/api/lessons/unified/search?${queryParams.toString()}`);
            
            if (!response.ok) {
              throw new Error(`Failed to search lessons: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            set((state) => {
              state.searchResults = data.data || [];
              state.searchLoading = false;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to search lessons';
              state.searchLoading = false;
            });
          }
        },

        fetchLessonStats: async (lessonId: string) => {
          try {
            const response = await api.get(`/api/lessons/unified/${lessonId}/stats`);
            
            if (!response.ok) {
              throw new Error(`Failed to fetch lesson stats: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            set((state) => {
              state.stats[lessonId] = data.data;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to fetch lesson stats';
            });
          }
        },

        setFilters: (filters: Partial<LessonFilters>) => {
          set((state) => {
            state.filters = { ...state.filters, ...filters };
          });
        },

        setPagination: (pagination: Partial<PaginationResponse>) => {
          set((state) => {
            state.pagination = { ...state.pagination, ...pagination };
          });
        },

        setCurrentLesson: (lesson: LessonWithUserData | null) => {
          set((state) => {
            state.currentLesson = lesson;
          });
        },

        updateLessonInList: (lessonId: string, updates: Partial<LessonWithUserData>) => {
          set((state) => {
            const index = state.lessons.findIndex(l => l.id === lessonId);
            if (index !== -1) {
              state.lessons[index] = { ...state.lessons[index], ...updates };
            }
            
            const searchIndex = state.searchResults.findIndex(l => l.id === lessonId);
            if (searchIndex !== -1) {
              state.searchResults[searchIndex] = { ...state.searchResults[searchIndex], ...updates };
            }
          });
        },

        addOptimisticUpdate: (lessonId: string, updates: Partial<LessonWithUserData>) => {
          set((state) => {
            state.optimisticUpdates[lessonId] = updates;
            state.updateLessonInList(lessonId, updates);
          });
        },

        removeOptimisticUpdate: (lessonId: string) => {
          set((state) => {
            delete state.optimisticUpdates[lessonId];
          });
        },

        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },

        reset: () => {
          set((state) => {
            Object.assign(state, initialState);
          });
        },

        resetSearch: () => {
          set((state) => {
            state.searchResults = [];
            state.searchLoading = false;
          });
        },

        // WebSocket functionality removed
      })),
      {
        name: 'lesson-store',
        partialize: (state) => ({
          filters: state.filters,
          pagination: state.pagination
        })
      }
    )
  )
);

// Selectors for better performance
export const useLessons = () => useLessonStore((state) => state.lessons);
export const useCurrentLesson = () => useLessonStore((state) => state.currentLesson);
export const useLessonLoading = () => useLessonStore((state) => state.loading);
export const useLessonError = () => useLessonStore((state) => state.error);
export const useLessonFilters = () => useLessonStore((state) => state.filters);
export const useLessonPagination = () => useLessonStore((state) => state.pagination);
export const useSearchResults = () => useLessonStore((state) => state.searchResults);
export const useSearchLoading = () => useLessonStore((state) => state.searchLoading);
export const useLessonStats = (lessonId: string) => useLessonStore((state) => state.stats[lessonId]);

// Action selectors
export const useLessonActions = () => useLessonStore((state) => ({
  fetchLessons: state.fetchLessons,
  fetchLessonById: state.fetchLessonById,
  fetchLessonBySlug: state.fetchLessonBySlug,
  toggleFavorite: state.toggleFavorite,
  toggleCompletion: state.toggleCompletion,
  updateProgress: state.updateProgress,
  batchUpdateStatus: state.batchUpdateStatus,
  searchLessons: state.searchLessons,
  fetchLessonStats: state.fetchLessonStats,
  setFilters: state.setFilters,
  setPagination: state.setPagination,
  setCurrentLesson: state.setCurrentLesson,
  clearError: state.clearError,
  reset: state.reset,
  resetSearch: state.resetSearch
}));

export default useLessonStore;
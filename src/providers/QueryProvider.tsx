'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Кэшировать данные на 5 минут
            staleTime: 5 * 60 * 1000,
            // Держать неактивные данные в кэше 10 минут
            gcTime: 10 * 60 * 1000,
            // Повторять запросы при ошибках
            retry: 2,
            // Не обновлять при фокусе окна для снижения нагрузки
            refetchOnWindowFocus: false,
            // Не обновлять при переподключении
            refetchOnReconnect: false,
          },
          mutations: {
            // Повторять мутации при ошибках
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
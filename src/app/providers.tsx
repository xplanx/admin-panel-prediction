'use client'

import { ApolloProvider } from '@apollo/client'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { SessionProvider } from 'next-auth/react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { apolloClient } from '@/lib/apollo'
import { config } from '@/lib/wagmi'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#7C3AED',
            accentColorForeground: 'white',
            borderRadius: 'medium',
          })}
        >
          <SessionProvider>
            <ApolloProvider client={apolloClient}>
              {children}
            </ApolloProvider>
          </SessionProvider>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
} 
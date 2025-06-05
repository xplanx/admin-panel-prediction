'use client'

import { ApolloProvider } from '@apollo/client'
import { RainbowKitProvider, getDefaultWallets, darkTheme } from '@rainbow-me/rainbowkit'
import { SessionProvider } from 'next-auth/react'
import { WagmiConfig, createConfig } from 'wagmi'
import { mainnet, bscTestnet } from 'wagmi/chains'
import { http } from 'viem'
import { apolloClient } from '@/lib/apollo'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [config, setConfig] = useState<any>(null)

  useEffect(() => {
    const { connectors } = getDefaultWallets({
      appName: 'Prediction Admin Dashboard',
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
    })

    const wagmiConfig = createConfig({
      chains: [mainnet, bscTestnet],
      transports: {
        [mainnet.id]: http(),
        [bscTestnet.id]: http(),
      },
      connectors,
    })

    setConfig(wagmiConfig)
    setMounted(true)
  }, [])

  if (!mounted || !config) {
    return (
      <QueryClientProvider client={queryClient}>
        <ApolloProvider client={apolloClient}>
          {children}
        </ApolloProvider>
      </QueryClientProvider>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>
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
      </WagmiConfig>
    </QueryClientProvider>
  )
} 
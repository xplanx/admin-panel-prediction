'use client'

import { ApolloProvider } from '@apollo/client'
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit'
import { SessionProvider } from 'next-auth/react'
import { WagmiConfig, createConfig } from 'wagmi'
import { mainnet, bscTestnet } from 'wagmi/chains'
import { http } from 'viem'
import { apolloClient } from '@/lib/apollo'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const { connectors } = getDefaultWallets({
  appName: 'Prediction Admin Dashboard',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
})

const config = createConfig({
  chains: [mainnet, bscTestnet],
  transports: {
    [mainnet.id]: http(),
    [bscTestnet.id]: http(),
  },
  connectors,
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>
        <RainbowKitProvider>
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
'use client'

import { ApolloProvider } from '@apollo/client'
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit'
import { SessionProvider } from 'next-auth/react'
import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { mainnet, bscTestnet } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { apolloClient } from '@/lib/apollo'

const { chains, publicClient } = configureChains(
  [mainnet, bscTestnet],
  [publicProvider()]
)

const { connectors } = getDefaultWallets({
  appName: 'Prediction Admin Dashboard',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
  chains,
})

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains}>
          <ApolloProvider client={apolloClient}>
            {children}
          </ApolloProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </SessionProvider>
  )
} 
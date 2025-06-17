import { http, createConfig } from 'wagmi'
import { monadTestnet } from 'wagmi/chains'
import { getDefaultWallets } from '@rainbow-me/rainbowkit'

const { connectors } = getDefaultWallets({
  appName: 'Prediction Admin Dashboard',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
})

export const config = createConfig({
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http(),
  },
  connectors,
  ssr: true,
}) 
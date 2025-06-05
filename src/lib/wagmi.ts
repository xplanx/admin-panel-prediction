import { http, createConfig } from 'wagmi'
import { mainnet, bscTestnet } from 'wagmi/chains'
import { getDefaultWallets } from '@rainbow-me/rainbowkit'

const { connectors } = getDefaultWallets({
  appName: 'Prediction Admin Dashboard',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
})

export const config = createConfig({
  chains: [mainnet, bscTestnet],
  transports: {
    [mainnet.id]: http(),
    [bscTestnet.id]: http(),
  },
  connectors,
}) 
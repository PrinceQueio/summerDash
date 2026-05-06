import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { avalanche, avalancheFuji } from '@reown/appkit/networks'

// 1. Get projectId
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || '809cd54a4116a440b4f28d282bd98563'

// 2. Set networks
const networks = [avalanche, avalancheFuji]

// 3. Create a metadata object
const metadata = {
    name: 'Summer Dash',
    description: 'Escape the Glitch. Run Forever.',
    url: 'https://summerdash.com', // Origin must match your Reown dashboard
    icons: ['https://avatars.githubusercontent.com/u/179229932'] // Use a stable remote icon for testing
}

// 4. Create a AppKit instance
createAppKit({
    adapters: [new EthersAdapter()],
    networks,
    metadata,
    projectId,
    features: {
        analytics: true // Optional - defaults to your Cloud configuration
    }
})

export function Web3Provider({ children }) {
    return children
}

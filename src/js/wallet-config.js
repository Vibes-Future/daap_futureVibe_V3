// Wallet Configuration for VIBES Admin DApp
// This file sets up the Solana wallet adapter properly

import { 
    ConnectionProvider, 
    WalletProvider as BaseWalletProvider 
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    TrustWalletAdapter,
    TorusWalletAdapter,
    LedgerWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { Connection } from '@solana/web3.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

// Network configuration
const RPC_ENDPOINT = process.env.RPC_URL || 'https://devnet.helius-rpc.com/?api-key=your-api-key';

// Create connection
export const connection = new Connection(RPC_ENDPOINT, 'confirmed');

// Wallet adapters
export const wallets = [
    new PhantomWalletAdapter(),
    new TrustWalletAdapter(),
    new SolflareWalletAdapter(),
    new TorusWalletAdapter(),
    new LedgerWalletAdapter(),
];

// Error handler
export const onError = (error) => {
    console.error('Wallet Error:', error.message);
};

// Export wallet configuration
export const walletConfig = {
    wallets,
    connection,
    onError,
    autoConnect: true,
};

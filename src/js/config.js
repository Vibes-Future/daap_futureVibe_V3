// Configuration for VIBES DeFi Basic DApp
// Smart Contract Configuration

// Program IDs (Mainnet Deployment - October 12, 2025)
const PROGRAM_IDS = {
    PRESALE_V3: 'HNPuLPxycypT4YtD5vMZPdcrr53MLKAajYrQwNTv4ujH',
    STAKING: '3ZaKegZktvjwt4SreDvitLECG47UnPdd4EFzNAnyHDaW',
    VESTING: '3EnPSZpZbKDwVetAiXo9bos4XMDvqg1yqJvew8zh4keP'
};

// Network Configuration
const NETWORK_CONFIG = {
    // Using Helius RPC for mainnet (private API key)
    RPC_URL: 'https://mainnet.helius-rpc.com/?api-key=e4246c12-6fa3-40ff-b319-c96c9e1e9c9c',
    // Fallback to Helius mainnet for best performance
    FALLBACK_RPC: 'https://mainnet.helius-rpc.com/?api-key=e4246c12-6fa3-40ff-b319-c96c9e1e9c9c',
    // Public mainnet RPC (backup)
    MAINNET_RPC: 'https://api.mainnet-beta.solana.com',
    // Current network (mainnet-beta)
    NETWORK: 'mainnet-beta'
};

// Token Configuration (Mainnet tokens)
const TOKEN_CONFIG = {
    // USDC mint address - OFFICIAL MAINNET USDC (Circle)
    USDC_MINT: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    // VIBES token mint (Mainnet)
    VIBES_MINT: 'G5n3KqfKZB4qeJAQA3k5dKbj7X264oCjV1vXMnBpwL43',
    // Token decimals
    USDC_DECIMALS: 6,
    VIBES_DECIMALS: 6,
    SOL_DECIMALS: 9
};

// Presale Configuration (from smart contract)
const PRESALE_CONFIG = {
    // These will be fetched from the smart contract
    START_TS: null,
    END_TS: null,
    HARD_CAP_TOTAL: null,
    FEE_RATE_BPS: 50, // 0.5%
    MAX_PURCHASE_PER_WALLET: null,
    MIN_PURCHASE_SOL: null,
    STAKING_APY_BPS: 4000, // 40%
    CHARITY_RATE_BPS: 300, // 3%
    OPTIONAL_STAKING: true
};

// DApp Business Limits (Policy limits enforced by UI)
const DAPP_LIMITS = {
    // Business policy: 250K VIBES maximum per wallet (enforced by DApp)
    MAX_PURCHASE_PER_WALLET_VIBES: 250000,
    // Technical limit: 1M VIBES (contract technical maximum, not enforced in UI)
    CONTRACT_TECHNICAL_LIMIT_VIBES: 1000000,
    // Minimum purchase amounts
    MIN_PURCHASE_SOL: 0.1,
    MIN_PURCHASE_USDC: 1,
    // Other limits
    HARD_CAP_TOTAL_VIBES: 40000000 // 40M VIBES
};

// Wallet Configuration
const WALLET_CONFIG = {
    // Supported wallet adapters
    SUPPORTED_WALLETS: ['Phantom', 'Solflare', 'Sollet', 'Trust Wallet', 'Backpack', 'Coinbase'],
    // Auto-connect on page load (disabled for multi-wallet support)
    AUTO_CONNECT: false,
    // Connection timeout (ms)
    CONNECTION_TIMEOUT: 10000
};

// UI Configuration
const UI_CONFIG = {
    // Refresh intervals (ms)
    BALANCE_REFRESH_INTERVAL: 30000, // 30 seconds
    PRESALE_REFRESH_INTERVAL: 60000, // 1 minute
    // Transaction confirmation timeout (ms)
    TX_TIMEOUT: 60000, // 1 minute
    // Max retries for failed transactions
    MAX_RETRIES: 3
};

// Error Messages
const ERROR_MESSAGES = {
    WALLET_NOT_CONNECTED: 'Please connect your wallet first',
    INSUFFICIENT_BALANCE: 'Insufficient balance for this transaction',
    TRANSACTION_FAILED: 'Transaction failed. Please try again',
    NETWORK_ERROR: 'Network error. Please check your connection',
    INVALID_AMOUNT: 'Please enter a valid amount',
    PRESALE_NOT_ACTIVE: 'Presale is not currently active',
    PRESALE_ENDED: 'Presale has ended',
    WALLET_LIMIT_EXCEEDED: 'Purchase would exceed wallet limit',
    INVALID_WALLET: 'Invalid wallet connection'
};

// Success Messages
const SUCCESS_MESSAGES = {
    WALLET_CONNECTED: 'Wallet connected successfully',
    TRANSACTION_SUCCESS: 'Transaction completed successfully',
    TOKENS_PURCHASED: 'VIBES tokens purchased successfully',
    STAKING_OPTED_IN: 'Successfully opted into staking',
    STAKING_OPTED_OUT: 'Successfully opted out of staking',
    REWARDS_CLAIMED: 'Rewards claimed successfully',
    TOKENS_CLAIMED: 'Tokens claimed successfully',
    VESTING_TRANSFERRED: 'Tokens transferred to vesting successfully'
};

// Export configuration for use in browser (global window object)
if (typeof window !== 'undefined') {
    window.PROGRAM_IDS = PROGRAM_IDS;
    window.NETWORK_CONFIG = NETWORK_CONFIG;
    window.TOKEN_CONFIG = TOKEN_CONFIG;
    window.PRESALE_CONFIG = PRESALE_CONFIG;
    window.DAPP_LIMITS = DAPP_LIMITS;
    window.WALLET_CONFIG = WALLET_CONFIG;
    window.UI_CONFIG = UI_CONFIG;
    window.ERROR_MESSAGES = ERROR_MESSAGES;
    window.SUCCESS_MESSAGES = SUCCESS_MESSAGES;
    
    console.log('✅ Configuration loaded successfully');
    console.log('📊 Network:', NETWORK_CONFIG.NETWORK);
    // SECURITY: Do not log RPC URL as it contains API key
    console.log('🔗 RPC Endpoint:', NETWORK_CONFIG.RPC_URL.split('?')[0] + '?api-key=[REDACTED]');
}

// Export configuration for Node.js (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PROGRAM_IDS,
        NETWORK_CONFIG,
        TOKEN_CONFIG,
        PRESALE_CONFIG,
        DAPP_LIMITS,
        WALLET_CONFIG,
        UI_CONFIG,
        ERROR_MESSAGES,
        SUCCESS_MESSAGES
    };
}

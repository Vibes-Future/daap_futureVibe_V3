// VIBES DeFi Admin DApp - Simplified Wallet Implementation
// This version uses a proper wallet adapter approach similar to the working React app

class VibesDApp {
    constructor() {
        console.log('🏗️ Creating VibesDApp instance...');
        this.connection = null;
        this.walletAdapter = null;
        this.isConnected = false;
        this.isConnecting = false;
        this.publicKey = null;
        this.balances = { sol: 0, usdc: 0 };
        this.presaleData = null;
        this.userData = null;
        
        console.log('🚀 Starting DApp initialization...');
        this.init();
    }

    // Initialize the DApp
    async init() {
        try {
            console.log('🔧 Init method called');
            
            // Check if required dependencies are available
            if (typeof window.solanaWeb3 === 'undefined') {
                console.error('❌ solanaWeb3 not available!');
                throw new Error('solanaWeb3 library not loaded');
            }
            
            if (typeof NETWORK_CONFIG === 'undefined') {
                console.error('❌ NETWORK_CONFIG not available!');
                throw new Error('config.js not loaded');
            }
            
            this.log('Initializing VIBES DApp...', 'info');
            
            // Initialize Solana connection
            this.connection = new solanaWeb3.Connection(
                NETWORK_CONFIG.RPC_URL,
                'confirmed'
            );
            
            console.log('✅ Connection initialized');
            
            // Initialize wallet adapter
            console.log('🔧 Creating wallet adapter...');
            console.log('🔍 VanillaWalletAdapter available:', typeof VanillaWalletAdapter);
            
            if (typeof VanillaWalletAdapter === 'undefined') {
                throw new Error('VanillaWalletAdapter class not available');
            }
            
            this.walletAdapter = new VanillaWalletAdapter();
            console.log('✅ Wallet adapter created:', this.walletAdapter);
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Make app instance globally available
            window.app = this;
            
            console.log('✅ DApp initialized successfully');
            
        } catch (error) {
            console.error('❌ DApp initialization failed:', error);
            this.log('Failed to initialize DApp: ' + error.message, 'error');
        }
    }

    setupEventListeners() {
        // Wallet connection button
        const connectBtn = document.getElementById('connect-wallet');
        if (connectBtn) {
            connectBtn.addEventListener('click', () => {
                this.log('Connect wallet button clicked', 'info');
                this.connectWallet();
            });
        } else {
            this.log('Connect wallet button not found', 'error');
        }
        
        // Wallet disconnection button
        const disconnectBtn = document.getElementById('disconnect-wallet');
        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', () => {
                this.log('Disconnect wallet button clicked', 'info');
                this.disconnectWallet();
            });
        } else {
            this.log('Disconnect wallet button not found', 'error');
        }
        
        // Purchase buttons
        const buySolBtn = document.getElementById('buy-sol');
        const buyUsdcBtn = document.getElementById('buy-usdc');
        
        if (buySolBtn) {
            buySolBtn.addEventListener('click', () => {
                this.log('Buy SOL button clicked', 'info');
                this.buyWithSol();
            });
        }
        
        if (buyUsdcBtn) {
            buyUsdcBtn.addEventListener('click', () => {
                this.log('Buy USDC button clicked', 'info');
                this.buyWithUsdc();
            });
        }
        
        // Listen to wallet adapter events
        if (this.walletAdapter) {
            this.walletAdapter.on('connect', (data) => {
                this.handleWalletConnect(data);
            });
            
            this.walletAdapter.on('disconnect', () => {
                this.handleWalletDisconnect();
            });
        }
    }

    // Connect wallet - SIMPLIFIED APPROACH
    async connectWallet() {
        try {
            console.log('🔌 VibesDApp.connectWallet() called');
            console.log('🔍 Wallet adapter state:', {
                adapter: this.walletAdapter,
                isConnected: this.isConnected,
                isConnecting: this.isConnecting
            });
            
            if (!this.walletAdapter) {
                throw new Error('Wallet adapter not initialized');
            }
            
            if (this.isConnecting) {
                console.log('⚠️ Already connecting, ignoring duplicate request');
                return;
            }
            
            this.isConnecting = true;
            this.log('Connecting to wallet...', 'info');
            
            // Use the wallet adapter to connect
            const result = await this.walletAdapter.connect();
            
            console.log('📦 Connection result:', result);
            
            if (result && result.publicKey) {
                this.publicKey = result.publicKey;
                this.isConnected = true;
                this.isConnecting = false;
                
                console.log('✅ Wallet connected successfully:', this.publicKey.toString());
                this.log('Wallet connected: ' + this.publicKey.toString(), 'success');
                
                // Update UI
                this.updateWalletUI();
                
                // Load user data
                await this.loadUserData();
                
            } else {
                throw new Error('Connection failed - no public key received');
            }
            
        } catch (error) {
            this.isConnecting = false;
            console.error('❌ Wallet connection error:', error);
            this.log('Wallet connection failed: ' + error.message, 'error');
            
            // Show user-friendly error message
            if (error.message.includes('User rejected')) {
                this.log('Connection cancelled by user', 'warning');
            } else if (error.message.includes('timeout')) {
                this.log('Connection timeout - please try again', 'error');
            } else {
                this.log('Connection failed - please try again', 'error');
            }
        }
    }

    // Disconnect wallet
    async disconnectWallet() {
        try {
            if (!this.walletAdapter || !this.isConnected) {
                return;
            }
            
            this.log('Disconnecting wallet...', 'info');
            
            await this.walletAdapter.disconnect();
            
            this.isConnected = false;
            this.publicKey = null;
            this.balances = { sol: 0, usdc: 0 };
            this.userData = null;
            
            console.log('✅ Wallet disconnected');
            this.log('Wallet disconnected', 'success');
            
            // Update UI
            this.updateWalletUI();
            
        } catch (error) {
            console.error('❌ Wallet disconnection error:', error);
            this.log('Disconnection failed: ' + error.message, 'error');
        }
    }

    // Handle wallet connection event
    handleWalletConnect(data) {
        console.log('🔄 Wallet connected event received:', data);
        this.updateWalletUI();
    }

    // Handle wallet disconnection event
    handleWalletDisconnect() {
        console.log('🔄 Wallet disconnected event received');
        this.isConnected = false;
        this.publicKey = null;
        this.balances = { sol: 0, usdc: 0 };
        this.userData = null;
        this.updateWalletUI();
    }

    // Update wallet UI
    updateWalletUI() {
        const connectBtn = document.getElementById('connect-wallet');
        const disconnectBtn = document.getElementById('disconnect-wallet');
        const walletInfo = document.getElementById('wallet-info');
        
        if (this.isConnected && this.publicKey) {
            // Show connected state
            if (connectBtn) {
                connectBtn.style.display = 'none';
            }
            if (disconnectBtn) {
                disconnectBtn.style.display = 'block';
            }
            if (walletInfo) {
                const shortAddress = this.publicKey.toString().slice(0, 4) + '...' + this.publicKey.toString().slice(-4);
                walletInfo.textContent = `Connected: ${shortAddress}`;
                walletInfo.style.display = 'block';
            }
        } else {
            // Show disconnected state
            if (connectBtn) {
                connectBtn.style.display = 'block';
            }
            if (disconnectBtn) {
                disconnectBtn.style.display = 'none';
            }
            if (walletInfo) {
                walletInfo.style.display = 'none';
            }
        }
    }

    // Load user data after connection
    async loadUserData() {
        if (!this.isConnected || !this.publicKey) {
            return;
        }
        
        try {
            this.log('Loading user data...', 'info');
            
            // Load SOL balance
            const solBalance = await this.connection.getBalance(this.publicKey);
            this.balances.sol = solBalance / solanaWeb3.LAMPORTS_PER_SOL;
            
            console.log('💰 SOL Balance:', this.balances.sol);
            this.log(`SOL Balance: ${this.balances.sol.toFixed(4)}`, 'info');
            
            // Update balance display
            this.updateBalanceDisplay();
            
        } catch (error) {
            console.error('❌ Error loading user data:', error);
            this.log('Failed to load user data: ' + error.message, 'error');
        }
    }

    // Update balance display
    updateBalanceDisplay() {
        const solBalanceEl = document.getElementById('sol-balance');
        if (solBalanceEl) {
            solBalanceEl.textContent = `${this.balances.sol.toFixed(4)} SOL`;
        }
    }

    // Buy with SOL
    async buyWithSol() {
        if (!this.isConnected) {
            this.log('Please connect your wallet first', 'warning');
            return;
        }
        
        this.log('Buy with SOL functionality - coming soon', 'info');
    }

    // Buy with USDC
    async buyWithUsdc() {
        if (!this.isConnected) {
            this.log('Please connect your wallet first', 'warning');
            return;
        }
        
        this.log('Buy with USDC functionality - coming soon', 'info');
    }

    // Utility method for logging
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        
        console.log(logMessage);
        
        // Update log display if available
        const logElement = document.getElementById('log');
        if (logElement) {
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry log-${type}`;
            logEntry.textContent = logMessage;
            logElement.appendChild(logEntry);
            logElement.scrollTop = logElement.scrollHeight;
        }
    }

    // Get wallet adapter for external use
    getWalletAdapter() {
        return this.walletAdapter;
    }

    // Get connection for external use
    getConnection() {
        return this.connection;
    }

    // Get public key
    getPublicKey() {
        return this.publicKey;
    }

    // Check if connected
    isWalletConnected() {
        return this.isConnected && this.publicKey !== null;
    }

    // Debug method for testing
    debugWalletAdapter() {
        console.log('🔍 Debugging wallet adapter...');
        console.log('📊 Wallet adapter state:', {
            adapter: this.walletAdapter,
            isConnected: this.isConnected,
            isConnecting: this.isConnecting,
            publicKey: this.publicKey
        });
        
        if (this.walletAdapter) {
            const wallets = this.walletAdapter.detectWallets();
            console.log('🔍 Detected wallets:', wallets);
        }
        
        return {
            adapter: this.walletAdapter,
            wallets: this.walletAdapter ? this.walletAdapter.detectWallets() : []
        };
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, initializing VIBES DApp...');
    window.vibesApp = new VibesDApp();
});
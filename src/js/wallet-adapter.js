// Vanilla JavaScript Wallet Adapter Implementation
// This provides a simple interface to the Solana wallet adapter for vanilla JS apps

class VanillaWalletAdapter {
    constructor() {
        console.log('🏗️ VanillaWalletAdapter constructor called');
        this.connection = null;
        this.wallet = null;
        this.isConnected = false;
        this.isConnecting = false;
        this.publicKey = null;
        this.listeners = new Map();
        
        // Initialize asynchronously to avoid blocking
        this.init().catch(error => {
            console.error('❌ VanillaWalletAdapter init failed:', error);
        });
    }

    async init() {
        try {
            // Wait for NETWORK_CONFIG to be available
            let attempts = 0;
            while (!window.NETWORK_CONFIG && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (!window.NETWORK_CONFIG) {
                throw new Error('NETWORK_CONFIG not available');
            }
            
            // Initialize connection
            this.connection = new solanaWeb3.Connection(
                NETWORK_CONFIG.RPC_URL,
                'confirmed'
            );
            
            console.log('✅ Wallet adapter initialized');
            
            // Wait a bit for wallets to load, then detect
            setTimeout(() => {
                this.setupWalletDetection();
            }, 1000);
        } catch (error) {
            console.error('❌ Failed to initialize wallet adapter:', error);
        }
    }

    setupWalletDetection() {
        // Detect available wallets
        const wallets = this.detectWallets();
        console.log('🔍 Detected wallets:', wallets.map(w => w.name));
        console.log('🔍 Wallet details:', wallets);
        
        // Auto-select Phantom if available
        const phantom = wallets.find(w => w.name === 'Phantom');
        if (phantom) {
            this.wallet = phantom.provider;
            console.log('👻 Phantom wallet selected:', this.wallet);
        } else {
            console.log('⚠️ No Phantom wallet found, available wallets:', wallets);
        }
    }

    detectWallets() {
        const wallets = [];
        
        // Phantom
        if (window.solana && window.solana.isPhantom) {
            wallets.push({
                name: 'Phantom',
                provider: window.solana,
                icon: 'phantom'
            });
        }
        
        // Solflare
        if (window.solflare) {
            wallets.push({
                name: 'Solflare',
                provider: window.solflare,
                icon: 'solflare'
            });
        }
        
        // Trust Wallet
        if (window.trustWallet) {
            wallets.push({
                name: 'Trust Wallet',
                provider: window.trustWallet,
                icon: 'trustwallet'
            });
        }
        
        return wallets;
    }

    async connect() {
        console.log('🔌 VanillaWalletAdapter.connect() called');
        console.log('🔍 Current wallet state:', {
            wallet: this.wallet,
            isConnected: this.isConnected,
            isConnecting: this.isConnecting
        });
        
        // If no wallet detected, try to detect again
        if (!this.wallet) {
            console.log('🔄 No wallet detected, trying to detect again...');
            this.setupWalletDetection();
            
            if (!this.wallet) {
                console.error('❌ No wallet available after re-detection');
                throw new Error('No wallet available. Please install Phantom wallet or refresh the page.');
            }
        }
        
        if (this.isConnecting) {
            console.log('⚠️ Already connecting...');
            return;
        }
        
        this.isConnecting = true;
        
        try {
            console.log('🔌 Connecting to wallet...', this.wallet);
            
            // Connect to wallet
            const response = await this.wallet.connect();
            
            console.log('📦 Wallet response:', response);
            
            if (response && response.publicKey) {
                this.publicKey = response.publicKey;
                this.isConnected = true;
                this.isConnecting = false;
                
                console.log('✅ Wallet connected successfully:', this.publicKey.toString());
                
                // Trigger connection event
                this.emit('connect', {
                    publicKey: this.publicKey,
                    wallet: this.wallet
                });
                
                return {
                    publicKey: this.publicKey,
                    wallet: this.wallet
                };
            } else {
                throw new Error('Connection failed - no public key received');
            }
        } catch (error) {
            this.isConnecting = false;
            console.error('❌ Wallet connection failed:', error);
            throw error;
        }
    }

    async disconnect() {
        if (!this.wallet || !this.isConnected) {
            return;
        }
        
        try {
            console.log('🔌 Disconnecting wallet...');
            
            await this.wallet.disconnect();
            
            this.isConnected = false;
            this.publicKey = null;
            
            console.log('✅ Wallet disconnected');
            
            // Trigger disconnection event
            this.emit('disconnect');
        } catch (error) {
            console.error('❌ Wallet disconnection failed:', error);
            throw error;
        }
    }

    async signTransaction(transaction) {
        if (!this.wallet || !this.isConnected) {
            throw new Error('Wallet not connected');
        }
        
        try {
            return await this.wallet.signTransaction(transaction);
        } catch (error) {
            console.error('❌ Transaction signing failed:', error);
            throw error;
        }
    }

    async signAllTransactions(transactions) {
        if (!this.wallet || !this.isConnected) {
            throw new Error('Wallet not connected');
        }
        
        try {
            return await this.wallet.signAllTransactions(transactions);
        } catch (error) {
            console.error('❌ Transaction signing failed:', error);
            throw error;
        }
    }

    // Event system
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (!this.listeners.has(event)) return;
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    emit(event, data) {
        if (!this.listeners.has(event)) return;
        this.listeners.get(event).forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Error in event callback:', error);
            }
        });
    }

    // Utility methods
    getPublicKey() {
        return this.publicKey;
    }

    isWalletConnected() {
        return this.isConnected && this.publicKey !== null;
    }

    getWalletName() {
        if (!this.wallet) return 'Unknown';
        
        if (this.wallet.isPhantom) return 'Phantom';
        if (this.wallet.isSolflare) return 'Solflare';
        if (this.wallet.isTrust) return 'Trust Wallet';
        
        return 'Wallet';
    }
}

// Export for global use
window.VanillaWalletAdapter = VanillaWalletAdapter;

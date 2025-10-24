/**
 * Solana Wallet Standard Implementation
 * Professional wallet connection handler for vanilla JavaScript
 * Compatible with all standard Solana wallets (Phantom, Solflare, Trust, etc.)
 * 
 * @author VIBES DeFi Team
 * @version 2.0.0
 */

class SolanaWalletManager {
    constructor() {
        this.wallet = null;
        this.publicKey = null;
        this.connected = false;
        this.connecting = false;
        this.eventListeners = new Map();
        this.availableWallets = [];
        this.autoConnectEnabled = true; // Enable auto-connect by default
        
        console.log('🔧 SolanaWalletManager initialized');
        
        // Detect available wallets on initialization
        this.detectWallets();
        
        // Setup wallet detection for dynamically loaded wallets
        this.setupWalletDetection();
        
        // Check for saved connection and auto-reconnect
        this.checkAutoConnect();
    }

    /**
     * Setup wallet detection listener
     * Wallets may load after page load, so we need to detect them dynamically
     */
    setupWalletDetection() {
        // Listen for wallet announcements
        if (typeof window !== 'undefined') {
            window.addEventListener('wallet-standard:app-ready', () => {
                console.log('📢 Wallet standard app ready event received');
                this.detectWallets();
            });
            
            // Re-detect wallets after a delay to catch late-loading wallets
            setTimeout(() => {
                this.detectWallets();
            }, 1000);
        }
    }

    /**
     * Check for saved connection and auto-reconnect
     */
    async checkAutoConnect() {
        if (!this.autoConnectEnabled) {
            console.log('🔒 Auto-connect disabled');
            return;
        }

        try {
            // Check if there's a saved wallet preference
            const savedWalletName = localStorage.getItem('vibes_connected_wallet');
            
            if (!savedWalletName) {
                console.log('📍 No saved wallet connection found');
                return;
            }

            console.log('🔄 Attempting to auto-reconnect to:', savedWalletName);

            // Wait a bit for wallets to load
            setTimeout(async () => {
                try {
                    // Re-detect wallets
                    this.detectWallets();

                    // Find the saved wallet
                    const savedWallet = this.availableWallets.find(
                        w => w.name === savedWalletName
                    );

                    if (!savedWallet) {
                        console.log('⚠️ Saved wallet not available:', savedWalletName);
                        // Clear saved preference
                        localStorage.removeItem('vibes_connected_wallet');
                        return;
                    }

                    // Try to connect silently
                    console.log('🔗 Auto-connecting to', savedWalletName);
                    await this.connect(savedWalletName);

                } catch (error) {
                    console.log('⚠️ Auto-connect failed:', error.message);
                    // Clear saved preference if connection fails
                    localStorage.removeItem('vibes_connected_wallet');
                }
            }, 1500); // Wait 1.5 seconds for wallets to load

        } catch (error) {
            console.error('❌ Error in checkAutoConnect:', error);
        }
    }

    /**
     * Save wallet connection preference
     */
    saveConnection(walletName) {
        try {
            localStorage.setItem('vibes_connected_wallet', walletName);
            console.log('💾 Saved connection preference:', walletName);
        } catch (error) {
            console.error('❌ Failed to save connection:', error);
        }
    }

    /**
     * Clear wallet connection preference
     */
    clearConnection() {
        try {
            localStorage.removeItem('vibes_connected_wallet');
            console.log('🗑️ Cleared connection preference');
        } catch (error) {
            console.error('❌ Failed to clear connection:', error);
        }
    }

    /**
     * Detect all available Solana wallets
     * Follows the Wallet Standard protocol
     */
    detectWallets() {
        this.availableWallets = [];
        
        // Track detected wallet types to avoid duplicates
        const detectedTypes = new Set();

        // Phantom Wallet - Check first to prioritize it
        if (window.solana?.isPhantom && !detectedTypes.has('phantom')) {
            this.availableWallets.push({
                name: 'Phantom',
                adapter: window.solana,
                icon: 'https://raw.githubusercontent.com/solana-labs/wallet-adapter/master/packages/wallets/icons/phantom.svg',
                installed: true
            });
            detectedTypes.add('phantom');
            console.log('✅ Phantom wallet detected');
        }

        // Trust Wallet - Multiple detection methods
        // Method 1: window.trustwallet.solana (most common)
        if (window.trustwallet?.solana && !detectedTypes.has('trust')) {
            this.availableWallets.push({
                name: 'Trust Wallet',
                adapter: window.trustwallet.solana,
                icon: 'https://raw.githubusercontent.com/solana-labs/wallet-adapter/master/packages/wallets/icons/trust.svg',
                installed: true
            });
            detectedTypes.add('trust');
            console.log('✅ Trust Wallet detected (trustwallet.solana)');
        }
        // Method 2: window.solana with isTrust flag
        else if (window.solana?.isTrust && !detectedTypes.has('trust') && !detectedTypes.has('phantom')) {
            this.availableWallets.push({
                name: 'Trust Wallet',
                adapter: window.solana,
                icon: 'https://raw.githubusercontent.com/solana-labs/wallet-adapter/master/packages/wallets/icons/trust.svg',
                installed: true
            });
            detectedTypes.add('trust');
            console.log('✅ Trust Wallet detected (solana.isTrust)');
        }
        // Method 3: window.solana with isTrustWallet flag
        else if (window.solana?.isTrustWallet && !detectedTypes.has('trust') && !detectedTypes.has('phantom')) {
            this.availableWallets.push({
                name: 'Trust Wallet',
                adapter: window.solana,
                icon: 'https://raw.githubusercontent.com/solana-labs/wallet-adapter/master/packages/wallets/icons/trust.svg',
                installed: true
            });
            detectedTypes.add('trust');
            console.log('✅ Trust Wallet detected (solana.isTrustWallet)');
        }

        // Solflare Wallet
        if (window.solflare?.isSolflare && !detectedTypes.has('solflare')) {
            this.availableWallets.push({
                name: 'Solflare',
                adapter: window.solflare,
                icon: 'https://raw.githubusercontent.com/solana-labs/wallet-adapter/master/packages/wallets/icons/solflare.svg',
                installed: true
            });
            detectedTypes.add('solflare');
            console.log('✅ Solflare wallet detected');
        }

        // Coinbase Wallet
        if (window.coinbaseSolana && !detectedTypes.has('coinbase')) {
            this.availableWallets.push({
                name: 'Coinbase Wallet',
                adapter: window.coinbaseSolana,
                icon: 'https://raw.githubusercontent.com/solana-labs/wallet-adapter/master/packages/wallets/icons/coinbase.svg',
                installed: true
            });
            detectedTypes.add('coinbase');
            console.log('✅ Coinbase Wallet detected');
        }

        // Backpack Wallet
        if (window.backpack?.isBackpack && !detectedTypes.has('backpack')) {
            this.availableWallets.push({
                name: 'Backpack',
                adapter: window.backpack,
                icon: 'https://raw.githubusercontent.com/solana-labs/wallet-adapter/master/packages/wallets/icons/backpack.svg',
                installed: true
            });
            detectedTypes.add('backpack');
            console.log('✅ Backpack wallet detected');
        }

        console.log(`📊 Total wallets detected: ${this.availableWallets.length}`, this.availableWallets);
        
        // Debug: Log all window.solana properties to help detect Trust Wallet
        if (window.solana && this.availableWallets.length > 0) {
            const solanaProps = Object.keys(window.solana).filter(key => 
                key.toLowerCase().includes('trust') || 
                key.toLowerCase().includes('is') ||
                key.toLowerCase().includes('name')
            );
            if (solanaProps.length > 0) {
                console.log('🔍 window.solana detection properties:', solanaProps);
            }
        }

        // Emit wallet detection event
        this.emit('walletsDetected', this.availableWallets);

        return this.availableWallets;
    }

    /**
     * Get list of available wallets
     */
    getAvailableWallets() {
        return this.availableWallets;
    }

    /**
     * Connect to a specific wallet
     * @param {string} walletName - Name of the wallet to connect (optional, defaults to Phantom)
     */
    async connect(walletName = null) {
        if (this.connecting) {
            console.warn('⚠️ Connection already in progress');
            return null;
        }

        if (this.connected) {
            console.warn('⚠️ Wallet already connected');
            return {
                publicKey: this.publicKey,
                wallet: this.wallet
            };
        }

        this.connecting = true;

        try {
            // Re-detect wallets to ensure we have the latest list
            this.detectWallets();

            // Select wallet
            let selectedWallet;
            if (walletName) {
                selectedWallet = this.availableWallets.find(
                    w => w.name.toLowerCase() === walletName.toLowerCase()
                );
                if (!selectedWallet) {
                    throw new Error(`Wallet "${walletName}" not found. Please install it first.`);
                }
            } else {
                // Default to first available wallet (usually Phantom)
                selectedWallet = this.availableWallets[0];
                if (!selectedWallet) {
                    throw new Error('No Solana wallet detected. Please install Phantom, Solflare, or another Solana wallet.');
                }
            }

            console.log(`🔌 Connecting to ${selectedWallet.name}...`);

            // Connect to wallet
            let response;
            try {
                // Try to connect - different wallets return different types
                response = await selectedWallet.adapter.connect();
                console.log('📦 Connection response:', response);
            } catch (connectError) {
                // If connect() fails, check if wallet is already connected
                if (selectedWallet.adapter.publicKey && selectedWallet.adapter.isConnected) {
                    console.log('📍 Wallet was already connected');
                    response = { publicKey: selectedWallet.adapter.publicKey };
                } else {
                    throw connectError;
                }
            }

            // Get public key - try multiple methods
            this.publicKey = null;
            
            // Method 1: From response
            if (response?.publicKey) {
                this.publicKey = response.publicKey;
            }
            // Method 2: From adapter directly
            else if (selectedWallet.adapter.publicKey) {
                this.publicKey = selectedWallet.adapter.publicKey;
            }
            // Method 3: Check if response IS the publicKey
            else if (response && typeof response.toBase58 === 'function') {
                this.publicKey = response;
            }
            
            if (!this.publicKey) {
                console.error('❌ Could not get public key. Response:', response);
                console.error('❌ Adapter publicKey:', selectedWallet.adapter.publicKey);
                throw new Error('Failed to get public key from wallet');
            }

            this.wallet = selectedWallet;
            this.connected = true;
            this.connecting = false;

            console.log('✅ Wallet connected successfully:', this.publicKey.toString());

            // Save connection preference for auto-reconnect
            this.saveConnection(selectedWallet.name);

            // Setup event listeners on the wallet
            this.setupWalletEventListeners(selectedWallet.adapter);

            // Emit connection event
            this.emit('connect', {
                publicKey: this.publicKey,
                wallet: this.wallet
            });

            return {
                publicKey: this.publicKey,
                wallet: this.wallet
            };

        } catch (error) {
            this.connecting = false;
            console.error('❌ Wallet connection failed:', error);
            
            // Emit error event
            this.emit('error', {
                type: 'connection',
                error: error,
                message: error.message
            });

            throw error;
        }
    }

    /**
     * Setup wallet event listeners for disconnect detection
     */
    setupWalletEventListeners(walletAdapter) {
        if (walletAdapter && walletAdapter.on) {
            walletAdapter.on('disconnect', () => {
                console.log('📢 Wallet disconnected (from wallet)');
                this.handleDisconnect();
            });

            walletAdapter.on('accountChanged', (publicKey) => {
                console.log('📢 Account changed:', publicKey?.toString());
                this.publicKey = publicKey;
                this.emit('accountChanged', { publicKey });
            });
        }
    }

    /**
     * Disconnect wallet
     */
    async disconnect() {
        if (!this.connected || !this.wallet) {
            console.warn('⚠️ No wallet to disconnect');
            return;
        }

        try {
            console.log('🔌 Disconnecting wallet...');

            // Clear saved connection preference
            this.clearConnection();

            // Disconnect from wallet
            if (this.wallet.adapter && this.wallet.adapter.disconnect) {
                await this.wallet.adapter.disconnect();
            }

            this.handleDisconnect();

            console.log('✅ Wallet disconnected successfully');

        } catch (error) {
            console.error('❌ Wallet disconnection failed:', error);
            
            // Force disconnect even if wallet adapter fails
            this.handleDisconnect();
            
            throw error;
        }
    }

    /**
     * Handle disconnect cleanup
     */
    handleDisconnect() {
        this.connected = false;
        this.publicKey = null;
        const previousWallet = this.wallet;
        this.wallet = null;

        // Emit disconnect event
        this.emit('disconnect', { wallet: previousWallet });
    }

    /**
     * Sign a transaction
     * @param {Transaction} transaction - Solana transaction to sign
     */
    async signTransaction(transaction) {
        if (!this.connected || !this.wallet) {
            throw new Error('Wallet not connected');
        }

        try {
            console.log('✍️ Signing transaction...');
            
            const signedTransaction = await this.wallet.adapter.signTransaction(transaction);
            
            console.log('✅ Transaction signed successfully');
            
            return signedTransaction;
        } catch (error) {
            console.error('❌ Transaction signing failed:', error);
            this.emit('error', {
                type: 'signing',
                error: error,
                message: error.message
            });
            throw error;
        }
    }

    /**
     * Sign multiple transactions
     * @param {Transaction[]} transactions - Array of transactions to sign
     */
    async signAllTransactions(transactions) {
        if (!this.connected || !this.wallet) {
            throw new Error('Wallet not connected');
        }

        try {
            console.log(`✍️ Signing ${transactions.length} transactions...`);
            
            const signedTransactions = await this.wallet.adapter.signAllTransactions(transactions);
            
            console.log('✅ All transactions signed successfully');
            
            return signedTransactions;
        } catch (error) {
            console.error('❌ Transactions signing failed:', error);
            this.emit('error', {
                type: 'signing',
                error: error,
                message: error.message
            });
            throw error;
        }
    }

    /**
     * Sign a message
     * @param {Uint8Array} message - Message to sign
     */
    async signMessage(message) {
        if (!this.connected || !this.wallet) {
            throw new Error('Wallet not connected');
        }

        if (!this.wallet.adapter.signMessage) {
            throw new Error('Wallet does not support message signing');
        }

        try {
            console.log('✍️ Signing message...');
            
            const signature = await this.wallet.adapter.signMessage(message);
            
            console.log('✅ Message signed successfully');
            
            return signature;
        } catch (error) {
            console.error('❌ Message signing failed:', error);
            this.emit('error', {
                type: 'signing',
                error: error,
                message: error.message
            });
            throw error;
        }
    }

    /**
     * Event system - Register event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
        
        return () => this.off(event, callback); // Return unsubscribe function
    }

    /**
     * Event system - Unregister event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    off(event, callback) {
        if (!this.eventListeners.has(event)) return;
        
        const callbacks = this.eventListeners.get(event);
        const index = callbacks.indexOf(callback);
        
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    /**
     * Event system - Emit event
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data) {
        if (!this.eventListeners.has(event)) return;
        
        const callbacks = this.eventListeners.get(event);
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in ${event} event callback:`, error);
            }
        });
    }

    /**
     * Get current connection state
     */
    isConnected() {
        return this.connected && this.publicKey !== null;
    }

    /**
     * Get public key
     */
    getPublicKey() {
        return this.publicKey;
    }

    /**
     * Get connected wallet info
     */
    getWallet() {
        return this.wallet;
    }

    /**
     * Get wallet name
     */
    getWalletName() {
        return this.wallet?.name || null;
    }
}

// Export for global use
if (typeof window !== 'undefined') {
    window.SolanaWalletManager = SolanaWalletManager;
}


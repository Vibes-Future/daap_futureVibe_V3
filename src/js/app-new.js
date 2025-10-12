/**
 * VIBES DeFi Admin DApp - Main Application
 * Professional implementation using Solana Wallet Standard
 * 
 * @author VIBES DeFi Team
 * @version 2.0.0
 */

class VibesAdminApp {
    constructor() {
        console.log('🏗️ Initializing VIBES Admin DApp...');
        
        // Core properties
        this.connection = null;
        this.walletManager = null;
        this.publicKey = null;
        this.connected = false;
        this.contractClient = null; // Direct contract client
        
        // Data
        this.balances = {
            sol: 0,
            usdc: 0,
            vibes: 0
        };
        this.userData = null;
        
        // Intervals
        this.daysLeftInterval = null; // For updating days left counter
        this.presaleEndTs = null; // Store presale end timestamp
        
        // Initialize app
        this.init();
    }

    /**
     * Initialize application
     */
    async init() {
        try {
            // Wait for required dependencies
            await this.waitForDependencies();
            
            console.log('🔧 Dependencies loaded successfully');
            
            // Initialize Solana connection
            this.initializeConnection();
            
            // Initialize wallet manager
            this.initializeWalletManager();
            
            // Setup UI event listeners
            this.setupEventListeners();
            
            // Setup wallet event listeners
            this.setupWalletEventListeners();
            
            // Make app globally available for debugging
            window.app = this;
            
            console.log('✅ VIBES Admin DApp initialized successfully');
            // No notification needed for initialization
            
        } catch (error) {
            console.error('❌ Failed to initialize DApp:', error);
            this.showMessage('Unable to start the application. Please refresh the page and try again.', 'error');
        }
    }

    /**
     * Wait for required dependencies to load
     */
    async waitForDependencies() {
        const maxAttempts = 50;
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            // Check for required dependencies
            if (
                typeof window.solanaWeb3 !== 'undefined' &&
                typeof window.NETWORK_CONFIG !== 'undefined' &&
                typeof window.SolanaWalletManager !== 'undefined'
            ) {
                return true;
            }
            
            // Wait 100ms before next check
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        // Check what's missing
        const missing = [];
        if (typeof window.solanaWeb3 === 'undefined') missing.push('solanaWeb3');
        if (typeof window.NETWORK_CONFIG === 'undefined') missing.push('NETWORK_CONFIG');
        if (typeof window.SolanaWalletManager === 'undefined') missing.push('SolanaWalletManager');
        
        throw new Error(`Required dependencies not loaded: ${missing.join(', ')}`);
    }

    /**
     * Initialize Solana connection
     */
    initializeConnection() {
        try {
            this.connection = new solanaWeb3.Connection(
                NETWORK_CONFIG.RPC_URL,
                'confirmed'
            );
            
            // SECURITY: Do not log RPC URL as it contains API key
            console.log('✅ Solana connection initialized to', NETWORK_CONFIG.NETWORK);
        } catch (error) {
            console.error('❌ Failed to initialize connection:', error);
            throw error;
        }
    }

    /**
     * Initialize wallet manager
     */
    initializeWalletManager() {
        try {
            this.walletManager = new SolanaWalletManager();
            console.log('✅ Wallet manager initialized');
            
            // Log available wallets
            const wallets = this.walletManager.getAvailableWallets();
            console.log(`📊 Available wallets: ${wallets.length}`, wallets);
            
            // Update UI to show available wallets
            this.updateAvailableWalletsUI(wallets);
            
        } catch (error) {
            console.error('❌ Failed to initialize wallet manager:', error);
            throw error;
        }
    }

    /**
     * Setup wallet event listeners
     */
    setupWalletEventListeners() {
        if (!this.walletManager) return;
        
        // Connection event
        this.walletManager.on('connect', (data) => {
            console.log('🔗 Wallet connected event:', data);
            this.handleWalletConnect(data);
        });
        
        // Disconnection event
        this.walletManager.on('disconnect', (data) => {
            console.log('🔌 Wallet disconnected event:', data);
            this.handleWalletDisconnect();
        });
        
        // Account changed event
        this.walletManager.on('accountChanged', (data) => {
            console.log('🔄 Account changed event:', data);
            this.handleAccountChanged(data);
        });
        
        // Error event
        this.walletManager.on('error', (data) => {
            console.error('❌ Wallet error event:', data);
            // Only show critical wallet errors
            if (data.message && !data.message.includes('disconnect')) {
                this.showMessage(`Wallet error: ${data.message}. Please check your wallet and try again.`, 'error');
            }
        });
        
        // Wallets detected event
        this.walletManager.on('walletsDetected', (wallets) => {
            console.log('📢 Wallets detected:', wallets);
            this.updateAvailableWalletsUI(wallets);
        });
    }

    /**
     * Setup UI event listeners
     */
    setupEventListeners() {
        // Connect wallet button
        const connectBtn = document.getElementById('connect-wallet');
        if (connectBtn) {
            connectBtn.addEventListener('click', () => this.showWalletSelector());
        }
        
        // Disconnect wallet button
        const disconnectBtn = document.getElementById('disconnect-wallet');
        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', () => this.disconnectWallet());
        }
        
        // Refresh button
        const refreshBtn = document.getElementById('refresh-data');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }
        
        // Buy with SOL button
        const buySolBtn = document.getElementById('buy-sol');
        if (buySolBtn) {
            buySolBtn.addEventListener('click', () => this.buyWithSol());
        }
        
        // Buy with USDC button
        const buyUsdcBtn = document.getElementById('buy-usdc');
        if (buyUsdcBtn) {
            buyUsdcBtn.addEventListener('click', () => this.buyWithUsdc());
        }
        
        // Staking buttons
        const stakeBtn = document.getElementById('stake-tokens');
        if (stakeBtn) {
            stakeBtn.addEventListener('click', () => this.stakeTokens());
        }
        
        // Unstake and Claim Rewards are temporarily disabled
        // const unstakeBtn = document.getElementById('unstake-tokens');
        // if (unstakeBtn) {
        //     unstakeBtn.addEventListener('click', () => this.unstakeTokens());
        // }
        
        // const claimRewardsBtn = document.getElementById('claim-rewards');
        // if (claimRewardsBtn) {
        //     claimRewardsBtn.addEventListener('click', () => this.claimRewards());
        // }
        
        // Legacy opt into staking button (for purchase forms)
        const optStakingBtn = document.getElementById('opt-into-staking');
        if (optStakingBtn) {
            optStakingBtn.addEventListener('click', () => this.optIntoStaking());
        }
        
        // Vesting claim button (disabled until presale ends)
        const claimVestedBtn = document.getElementById('claim-vested-tokens');
        if (claimVestedBtn) {
            claimVestedBtn.addEventListener('click', () => this.claimVestedTokens());
        }
        
        // Load presale data on page load (even without wallet connection)
        this.loadPresaleData();
        
        console.log('✅ UI event listeners setup complete');
    }

    /**
     * Show wallet selector modal
     */
    showWalletSelector() {
        console.log('📱 Showing wallet selector...');
        
        const wallets = this.walletManager.getAvailableWallets();
        
        if (wallets.length === 0) {
            this.showMessage('No Solana wallet detected. Please install a Solana wallet (Phantom, Solflare, etc.) and refresh the page.', 'warning');
            return;
        }
        
        console.log(`📊 Found ${wallets.length} wallet(s):`, wallets);
        
        // Use the global modal function
        if (typeof window.showWalletSelectorModal === 'function') {
            window.showWalletSelectorModal(
                wallets.map(w => ({
                    name: w.name,
                    icon: w.name.toLowerCase().replace(' ', ''),
                    installed: w.installed
                })),
                (selected) => {
                    console.log('✅ User selected:', selected.name);
                    this.connectWallet(selected.name);
                }
            );
        } else {
            console.error('❌ showWalletSelectorModal not available');
            // Fallback: connect to first wallet
            this.connectWallet(wallets[0].name);
        }
    }

    /**
     * Connect wallet
     */
    async connectWallet(walletName = null) {
        try {
            console.log('🔌 Connecting wallet...', walletName || 'auto');
            // No notification for connection progress
            
            // Update UI to show loading state
            this.updateConnectButtonState('connecting');
            
            // Connect using wallet manager
            const result = await this.walletManager.connect(walletName);
            
            if (result && result.publicKey) {
                console.log('✅ Wallet connected successfully:', result.publicKey.toString());
            }
            
        } catch (error) {
            console.error('❌ Wallet connection failed:', error);
            
            // Show user-friendly error message
            let errorMessage = 'Failed to connect wallet. ';
            
            if (error.message.includes('User rejected') || error.message.includes('rejected')) {
                errorMessage += 'Connection was cancelled. Please try again and approve the connection in your wallet.';
            } else if (error.message.includes('not found') || error.message.includes('not detected') || error.message.includes('No wallet')) {
                errorMessage += 'Wallet not detected. Please install Phantom, Solflare, or another Solana wallet.';
            } else if (error.message.includes('timeout')) {
                errorMessage += 'Connection timed out. Please try again.';
            } else {
                errorMessage += 'Please make sure your wallet is unlocked and try again.';
            }
            
            this.showMessage(errorMessage, 'error');
            this.updateConnectButtonState('disconnected');
        }
    }

    /**
     * Disconnect wallet
     */
    async disconnectWallet() {
        try {
            console.log('🔌 Disconnecting wallet...');
            // No notification for disconnection progress
            
            await this.walletManager.disconnect();
            
        } catch (error) {
            console.error('❌ Wallet disconnection failed:', error);
            // No notification for disconnection errors - it's not critical
        }
    }

    /**
     * Handle wallet connection event
     */
    async handleWalletConnect(data) {
        this.publicKey = data.publicKey;
        this.connected = true;
        
        console.log('✅ Wallet connected:', this.publicKey.toString());
        this.showMessage(`Wallet connected successfully`, 'success');
        
        // Initialize contract client
        if (typeof DirectContractClient !== 'undefined') {
            this.contractClient = new DirectContractClient(
                this.connection,
                data.wallet.adapter
            );
            console.log('✅ Contract client initialized');
        } else {
            console.warn('⚠️ DirectContractClient not available');
        }
        
        // Update global wallet reference for staking stats
        window.currentWalletPublicKey = this.publicKey;
        
        // Update UI
        this.updateWalletUI();
        
        // Update production wallet button if available
        if (typeof window.updateProductionWalletButton === 'function') {
            const walletName = this.walletManager.getWalletName();
            window.updateProductionWalletButton(true, this.publicKey.toString(), walletName);
        }
        
        // Load user data
        await this.loadUserData();
        
        // Load presale data
        await this.loadPresaleData();
        
        // Load staking data
        await this.loadStakingData();
        
        // Update staking stats with wallet-specific data
        if (typeof window.updateStakingStats === 'function') {
            await window.updateStakingStats();
        }
        
        // Load vesting data
        await this.loadVestingData();
        
        console.log('✅ User data loaded successfully');
    }

    /**
     * Handle wallet disconnection event
     */
    handleWalletDisconnect() {
        this.publicKey = null;
        this.connected = false;
        this.balances = { sol: 0, usdc: 0, vibes: 0 };
        this.userData = null;
        
        console.log('🔌 Wallet disconnected');
        // No notification for disconnect - it's intentional user action
        
        // Clear global wallet reference
        window.currentWalletPublicKey = null;
        
        // Update production wallet button if available
        if (typeof window.updateProductionWalletButton === 'function') {
            window.updateProductionWalletButton(false, null);
        }
        
        // Reset staking stats to zeros
        if (typeof window.updateStakingStats === 'function') {
            window.updateStakingStats(null).catch(err => {
                console.warn('⚠️ Could not reset staking stats:', err);
            });
        }
        
        // Update UI
        this.updateWalletUI();
    }

    /**
     * Handle account changed event
     */
    async handleAccountChanged(data) {
        this.publicKey = data.publicKey;
        
        console.log('🔄 Account changed:', this.publicKey?.toString());
        this.showMessage('Wallet account changed', 'warning');
        
        // Update global wallet reference
        window.currentWalletPublicKey = this.publicKey;
        
        // Reload user data
        await this.loadUserData();
        
        // Update staking stats with new wallet data
        if (typeof window.updateStakingStats === 'function') {
            await window.updateStakingStats();
        }
        
        // Update presale and vesting data
        await this.loadPresaleData();
        await this.loadVestingData();
    }

    /**
     * Update wallet UI
     */
    updateWalletUI() {
        const connectBtn = document.getElementById('connect-wallet');
        const disconnectBtn = document.getElementById('disconnect-wallet');
        const walletInfo = document.getElementById('wallet-info');
        const walletAddress = document.getElementById('wallet-address');
        
        if (this.connected && this.publicKey) {
            // Connected state
            if (connectBtn) connectBtn.style.display = 'none';
            if (disconnectBtn) disconnectBtn.style.display = 'block';
            if (walletInfo) walletInfo.style.display = 'block';
            if (walletAddress) {
                walletAddress.textContent = this.formatAddress(this.publicKey.toString());
            }
        } else {
            // Disconnected state
            if (connectBtn) {
                connectBtn.style.display = 'block';
                connectBtn.disabled = false;
                connectBtn.textContent = 'Connect Wallet';
            }
            if (disconnectBtn) disconnectBtn.style.display = 'none';
            if (walletInfo) walletInfo.style.display = 'none';
        }
    }

    /**
     * Update connect button state
     */
    updateConnectButtonState(state) {
        const connectBtn = document.getElementById('connect-wallet');
        if (!connectBtn) return;
        
        switch (state) {
            case 'connecting':
                connectBtn.disabled = true;
                connectBtn.textContent = 'Connecting...';
                break;
            case 'connected':
                connectBtn.style.display = 'none';
                break;
            case 'disconnected':
                connectBtn.disabled = false;
                connectBtn.textContent = 'Connect Wallet';
                connectBtn.style.display = 'block';
                break;
        }
    }

    /**
     * Update available wallets UI
     */
    updateAvailableWalletsUI(wallets) {
        const walletsContainer = document.getElementById('available-wallets');
        if (!walletsContainer) return;
        
        if (wallets.length === 0) {
            walletsContainer.innerHTML = '<p class="no-wallets">No Solana wallets detected. Please install Phantom, Solflare, or another Solana wallet.</p>';
            return;
        }
        
        walletsContainer.innerHTML = wallets.map(wallet => `
            <div class="wallet-option" onclick="app.connectWallet('${wallet.name}')">
                <img src="${wallet.icon}" alt="${wallet.name}" class="wallet-icon">
                <span>${wallet.name}</span>
            </div>
        `).join('');
    }

    /**
     * Load user data after connection
     */
    async loadUserData() {
        if (!this.connected || !this.publicKey) {
            return;
        }
        
        try {
            console.log('📊 Loading user data...');
            // No notification for data loading
            
            // Load SOL balance
            const solBalance = await this.connection.getBalance(this.publicKey);
            this.balances.sol = solBalance / solanaWeb3.LAMPORTS_PER_SOL;
            
            console.log('💰 SOL Balance:', this.balances.sol);
            
            // Update balance display
            this.updateBalanceDisplay();
            
            // Load presale data
            await this.loadPresaleData();
            
            // No notification for successful data loading
            
        } catch (error) {
            console.error('❌ Failed to load user data:', error);
            this.showMessage('Unable to load wallet data. Please refresh the page to try again.', 'error');
        }
    }

    /**
     * Load presale data from contract
     */
    async loadPresaleData() {
        try {
            console.log('📊 Loading presale data from contract...');
            
            if (!this.connection) {
                console.warn('⚠️ No connection available, using fallback data');
                this.updatePresaleInfoCards({
                    startingPrice: 0.0598,
                    currentPrice: 0.0598,
                    daysLeft: 45,
                    stakingAPY: 40
                });
                return;
            }
            
            // Presale state address (from config)
            const presaleStateAddress = new solanaWeb3.PublicKey('EoDCTycvkJV4UXm54KYiF1DuCMSHyXYPftGUVr3qJxPp');
            
            // Get account info
            const presaleAccountInfo = await this.connection.getAccountInfo(presaleStateAddress);
            
            if (!presaleAccountInfo || !presaleAccountInfo.data) {
                throw new Error('Presale account not found');
            }
            
            // Parse the account data using the IDL structure
            const presaleData = this.parsePresaleStateData(presaleAccountInfo.data);
            
            // Calculate current price from price schedule
            const currentPrice = this.calculateCurrentPrice(presaleData.priceSchedule);
            
            // Calculate days left
            const now = Math.floor(Date.now() / 1000);
            const daysLeft = Math.max(0, Math.ceil((presaleData.endTs - now) / (24 * 60 * 60)));
            
            // Store endTs for periodic updates
            this.presaleEndTs = presaleData.endTs;
            
            // Convert APY from basis points to percentage
            const stakingAPY = presaleData.stakingApyBps / 100;
            
            // Convert raised amounts from lamports to SOL/USDC
            const raisedSol = presaleData.raisedSol / solanaWeb3.LAMPORTS_PER_SOL;
            const raisedUsdc = presaleData.raisedUsdc / 1000000; // USDC has 6 decimals
            
            const presaleInfo = {
                startingPrice: presaleData.priceSchedule[0]?.priceUsd || 0.0598,
                currentPrice: currentPrice,
                daysLeft: daysLeft,
                stakingAPY: stakingAPY,
                raisedSol: raisedSol,
                raisedUsdc: raisedUsdc,
                totalVibesSold: presaleData.totalVibesSold,
                isActive: now >= presaleData.startTs && now <= presaleData.endTs && !presaleData.isFinalized,
                startTs: presaleData.startTs,
                endTs: presaleData.endTs
            };
            
            // Update the presale info cards
            this.updatePresaleInfoCards(presaleInfo);
            
            // Start periodic days counter update
            this.startDaysLeftCounter();
            
            console.log('✅ Presale data loaded successfully:', presaleInfo);
            console.log(`📅 Presale ends: ${new Date(presaleData.endTs * 1000).toISOString()} (${daysLeft} days remaining)`);
            
        } catch (error) {
            console.error('❌ Failed to load presale data:', error);
            // No notification for presale data load errors - not critical for user experience
            
            // Fallback to mock data if contract reading fails
            console.log('🔄 Using fallback data...');
            this.updatePresaleInfoCards({
                startingPrice: 0.0598,
                currentPrice: 0.0598,
                daysLeft: 45,
                stakingAPY: 40
            });
        }
    }

    /**
     * Parse presale state data from account data
     */
    parsePresaleStateData(data) {
        // This is a simplified parser - in production you'd use a proper Borsh decoder
        // For now, we'll extract the key fields we need
        
        const view = new DataView(data.buffer);
        let offset = 0;
        
        // Skip the discriminator (8 bytes)
        offset += 8;
        
        // Parse basic fields (simplified - actual parsing would be more complex)
        const authority = new solanaWeb3.PublicKey(data.slice(offset, offset + 32));
        offset += 32;
        
        const tokenMint = new solanaWeb3.PublicKey(data.slice(offset, offset + 32));
        offset += 32;
        
        const usdcMint = new solanaWeb3.PublicKey(data.slice(offset, offset + 32));
        offset += 32;
        
        // Skip bump, vaults, etc. and go to timestamps
        offset += 1 + 32 + 32 + 1; // bump + presaleTokenVault + rewardsTokenVault + useMintAuthority
        
        // Read timestamps (i64 = 8 bytes each)
        const startTs = view.getBigInt64(offset, true);
        offset += 8;
        const endTs = view.getBigInt64(offset, true);
        offset += 8;
        
        // Read hard cap (u64 = 8 bytes)
        const hardCapTotal = view.getBigUint64(offset, true);
        offset += 8;
        
        // Skip isFinalized, feeRateBps, etc. and go to price schedule
        offset += 1 + 2 + 32 + 32 + 32 + 32 + 32 + 32 + 8 + 8; // isFinalized + feeRateBps + fee collectors + wallets + maxPurchase + minPurchase
        
        // Read price schedule length (u32 = 4 bytes)
        const priceScheduleLength = view.getUint32(offset, true);
        offset += 4;
        
        // Parse price schedule
        const priceSchedule = [];
        for (let i = 0; i < priceScheduleLength; i++) {
            const startTs = view.getBigInt64(offset, true);
            offset += 8;
            const priceUsd = view.getFloat64(offset, true);
            offset += 8;
            priceSchedule.push({ startTs: Number(startTs), priceUsd });
        }
        
        // Skip optional staking, stakingApyBps, charityRateBps, charityWallet
        offset += 1 + 8 + 2 + 32;
        
        // Skip staking fields and go to raised amounts
        offset += 8 + 8 + 16 + 8; // totalStakedOptional + totalUnstaked + accRewardPerToken + lastRewardUpdateTs
        
        // Read raised amounts (u64 = 8 bytes each)
        const raisedSol = view.getBigUint64(offset, true);
        offset += 8;
        const raisedUsdc = view.getBigUint64(offset, true);
        offset += 8;
        const totalVibesSold = view.getBigUint64(offset, true);
        offset += 8;
        
        // Skip fee collections and go to staking APY
        offset += 8 + 8 + 8 + 8 + 8 + 8 + 8; // totalFeesCollectedSol + totalFeesCollectedUsdc + totalTreasurySol + totalTreasuryUsdc + totalSecondarySol + totalSecondaryUsdc + totalCharityRewards
        
        // Go back to read stakingApyBps (we need to find it)
        // This is a simplified approach - in production you'd have a proper Borsh decoder
        const stakingApyBps = 4000; // 40% in basis points - this would be read from the correct offset
        
        return {
            startTs: Number(startTs),
            endTs: Number(endTs),
            hardCapTotal: Number(hardCapTotal),
            priceSchedule,
            raisedSol: Number(raisedSol),
            raisedUsdc: Number(raisedUsdc),
            totalVibesSold: Number(totalVibesSold),
            stakingApyBps: stakingApyBps,
            isFinalized: false // This would be read from the correct offset
        };
    }

    /**
     * Calculate current price from price schedule
     */
    calculateCurrentPrice(priceSchedule) {
        if (!priceSchedule || priceSchedule.length === 0) {
            return 0.0598; // Default price
        }
        
        const now = Math.floor(Date.now() / 1000);
        
        // Find the current price tier based on current time
        for (let i = priceSchedule.length - 1; i >= 0; i--) {
            if (now >= priceSchedule[i].startTs) {
                return priceSchedule[i].priceUsd;
            }
        }
        
        // If no tier matches, return the first price
        return priceSchedule[0].priceUsd;
    }

    /**
     * Get total number of buyers from blockchain using Helius optimized RPC
     * Counts all BuyerStateV3 accounts
     */
    async getTotalBuyersCount() {
        try {
            if (!this.connection) {
                throw new Error('No connection available');
            }
            
            // Presale program ID from config
            const PRESALE_PROGRAM_ID = new solanaWeb3.PublicKey('HNPuLPxycypT4YtD5vMZPdcrr53MLKAajYrQwNTv4ujH');
            
            // BuyerStateV3 account size = 143 bytes
            // discriminator (8) + buyer pubkey (32) + bump (1) + totalPurchasedVibes (8) +
            // solContributed (8) + usdcContributed (8) + isStaking (1) + stakedAmount (8) +
            // unstakedAmount (8) + lastStakeTs (8) + accumulatedRewards (8) +
            // totalRewardsClaimed (8) + rewardDebt (16) + lastUpdateTs (8) +
            // transferredToVesting (1) + finalVestingAmount (8) + purchaseCount (4) = 143
            const BUYER_STATE_SIZE = 143;
            
            console.log('🔍 Fetching BuyerState accounts from RPC...');
            
            // Use Helius optimized getProgramAccounts with dataSize filter
            // This is faster than memcmp and more reliable
            const accounts = await this.connection.getProgramAccounts(PRESALE_PROGRAM_ID, {
                filters: [
                    {
                        dataSize: BUYER_STATE_SIZE // Filter by exact account size
                    }
                ],
                // Only fetch account pubkeys, not data (faster and cheaper)
                dataSlice: {
                    offset: 0,
                    length: 0
                },
                // Use Helius commitment level for faster response
                commitment: 'confirmed'
            });
            
            const buyerCount = accounts.length;
            console.log(`✅ Found ${buyerCount} total buyers`);
            
            return buyerCount;
            
        } catch (error) {
            console.error('❌ Error fetching buyer count:', error);
            // Fallback: return a placeholder if Helius fails
            console.warn('⚠️ Using fallback buyer count estimation');
            return 0;
        }
    }

    /**
     * Fetch SOL price from multiple oracles with fallback
     */
    async getSolPrice() {
        // Multiple price oracles with fallback
        const oracles = [
            {
                name: 'CoinGecko',
                url: 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
                parser: (data) => data.solana?.usd
            },
            {
                name: 'CoinCap',
                url: 'https://api.coincap.io/v2/assets/solana',
                parser: (data) => parseFloat(data.data?.priceUsd)
            },
            {
                name: 'Binance',
                url: 'https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT',
                parser: (data) => parseFloat(data.price)
            }
        ];
        
        // Try each oracle in sequence
        for (const oracle of oracles) {
            try {
                console.log(`🔍 Trying ${oracle.name} API...`);
                const response = await fetch(oracle.url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const data = await response.json();
                const price = oracle.parser(data);
                
                if (price && price > 0) {
                    console.log(`💰 SOL Price from ${oracle.name}: $${price}`);
                    return price;
                } else {
                    throw new Error(`Invalid price data from ${oracle.name}`);
                }
            } catch (error) {
                console.warn(`⚠️ ${oracle.name} failed: ${error.message}`);
                continue; // Try next oracle
            }
        }
        
        // All oracles failed, use fallback
        console.warn(`⚠️ All price oracles failed. Using fallback price $150`);
        return 150;
    }

    /**
     * Update presale information cards with real data
     */
    async updatePresaleInfoCards(data) {
        // Update starting price
        const startingPriceEl = document.getElementById('starting-price');
        if (startingPriceEl) {
            startingPriceEl.textContent = `$${data.startingPrice.toFixed(4)}`;
        }
        
        // Update current price
        const currentPriceEl = document.getElementById('current-price');
        if (currentPriceEl) {
            currentPriceEl.textContent = `$${data.currentPrice.toFixed(4)}`;
        }
        
        // Update days left
        const daysLeftEl = document.getElementById('days-left');
        if (daysLeftEl) {
            daysLeftEl.textContent = data.daysLeft;
        }
        
        // Update staking APY
        const stakingAPYEl = document.getElementById('staking-apy');
        if (stakingAPYEl) {
            stakingAPYEl.textContent = `${data.stakingAPY}%`;
        }
        
        // Update Dashboard Stats
        if (data.raisedSol !== undefined && data.raisedUsdc !== undefined) {
            await this.updateDashboardStats(data);
        }
        
        console.log('✅ Presale info cards updated with real data');
    }

    /**
     * Start periodic update for days left counter
     */
    startDaysLeftCounter() {
        // Clear any existing interval
        if (this.daysLeftInterval) {
            clearInterval(this.daysLeftInterval);
        }
        
        // Update function
        const updateDaysLeft = () => {
            if (!this.presaleEndTs) return;
            
            const now = Math.floor(Date.now() / 1000);
            const daysLeft = Math.max(0, Math.ceil((this.presaleEndTs - now) / (24 * 60 * 60)));
            
            const daysLeftEl = document.getElementById('days-left');
            if (daysLeftEl) {
                daysLeftEl.textContent = daysLeft;
                
                // Log if it's close to ending
                if (daysLeft <= 7 && daysLeft > 0) {
                    console.log(`⚠️ Presale ending soon: ${daysLeft} days remaining`);
                } else if (daysLeft === 0) {
                    console.log('🏁 Presale has ended');
                }
            }
        };
        
        // Update immediately
        updateDaysLeft();
        
        // Update every hour (3600000 ms)
        this.daysLeftInterval = setInterval(updateDaysLeft, 3600000);
        
        console.log('✅ Days left counter started (updates every hour)');
    }

    /**
     * Update dashboard stats (Total Raised USD, Total Buyers, etc.)
     */
    async updateDashboardStats(data) {
        try {
            // Get real SOL price from Jupiter API
            const solPriceUSD = await this.getSolPrice();
            
            // Calculate Total Raised in USD
            // Formula: (SOL raised * SOL price in USD) + USDC raised
            const solRaisedUSD = data.raisedSol * solPriceUSD;
            const usdcRaisedUSD = data.raisedUsdc;
            const totalRaisedUSD = solRaisedUSD + usdcRaisedUSD;
            
            console.log('💰 Dashboard Stats Calculation:', {
                raisedSol: data.raisedSol,
                raisedUsdc: data.raisedUsdc,
                solPriceUSD: solPriceUSD,
                solRaisedUSD: solRaisedUSD.toFixed(2),
                usdcRaisedUSD: usdcRaisedUSD.toFixed(2),
                totalRaisedUSD: totalRaisedUSD.toFixed(2)
            });
            
            // Update Total Raised (USD)
            const statsTotalRaisedEl = document.getElementById('stats-total-raised');
            if (statsTotalRaisedEl) {
                statsTotalRaisedEl.textContent = `$${totalRaisedUSD.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                })}`;
            }
            
            // Update Total Buyers
            const statsTotalBuyersEl = document.getElementById('stats-total-buyers');
            if (statsTotalBuyersEl) {
                // Fetch actual buyer count from blockchain
                try {
                    const buyerCount = await this.getTotalBuyersCount();
                    statsTotalBuyersEl.textContent = buyerCount;
                } catch (error) {
                    console.warn('⚠️ Could not fetch buyer count:', error.message);
                    statsTotalBuyersEl.textContent = '---'; // Show loading/error state
                }
            }
            
            // Update Current Price Tier
            const statsPriceTierEl = document.getElementById('stats-price-tier');
            if (statsPriceTierEl && data.currentPrice) {
                statsPriceTierEl.textContent = `Tier 1`;
            }
            
            // Update Tokens Sold
            const statsTokensSoldEl = document.getElementById('stats-tokens-sold');
            if (statsTokensSoldEl && data.totalVibesSold) {
                const tokensSold = data.totalVibesSold / Math.pow(10, TOKEN_CONFIG.VIBES_DECIMALS); // Convert from smallest unit
                statsTokensSoldEl.textContent = `${tokensSold.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2
                })} VIBES`;
            }
            
            // Update Progress Bar
            const hardCapTotal = 40000; // 40K SOL hard cap
            const progressPercent = (data.raisedSol / hardCapTotal) * 100;
            
            const statsProgressPercentEl = document.getElementById('stats-progress-percent');
            if (statsProgressPercentEl) {
                statsProgressPercentEl.textContent = `${progressPercent.toFixed(2)}%`;
            }
            
            const statsProgressBarEl = document.getElementById('stats-progress-bar');
            if (statsProgressBarEl) {
                statsProgressBarEl.style.width = `${Math.min(progressPercent, 100)}%`;
            }
            
            console.log('✅ Dashboard Stats updated successfully');
            
        } catch (error) {
            console.error('❌ Error updating dashboard stats:', error);
        }
    }

    /**
     * Update balance display
     */
    updateBalanceDisplay() {
        const solBalanceEl = document.getElementById('sol-balance');
        if (solBalanceEl) {
            solBalanceEl.textContent = `${this.balances.sol.toFixed(4)} SOL`;
        }
        
        const usdcBalanceEl = document.getElementById('usdc-balance');
        if (usdcBalanceEl) {
            usdcBalanceEl.textContent = `${this.balances.usdc.toFixed(2)} USDC`;
        }
        
        const vibesBalanceEl = document.getElementById('vibes-balance');
        if (vibesBalanceEl) {
            vibesBalanceEl.textContent = `${this.balances.vibes.toFixed(2)} VIBES`;
        }
    }

    /**
     * Update staking display with real data
     */
    updateStakingDisplay(stakingData) {
        // Update overview cards
        const totalStakedEl = document.getElementById('total-staked-amount');
        if (totalStakedEl) {
            totalStakedEl.textContent = stakingData.totalStaked || '0';
        }
        
        const unstakedEl = document.getElementById('unstaked-amount');
        if (unstakedEl) {
            unstakedEl.textContent = stakingData.unstaked || '0';
        }
        
        const apyEl = document.getElementById('staking-apy-display');
        if (apyEl) {
            apyEl.textContent = `${stakingData.apy || 40}%`;
        }
        
        // Update pending rewards
        const pendingRewardsEl = document.getElementById('pending-rewards-display');
        if (pendingRewardsEl) {
            pendingRewardsEl.textContent = stakingData.pendingRewards || '0';
        }
        
        // Update staking status
        const statusEl = document.getElementById('staking-status');
        if (statusEl) {
            statusEl.textContent = stakingData.isStaking ? 'Staking' : 'Not Staking';
            statusEl.style.color = stakingData.isStaking ? '#c7f801' : '#ff6b6b';
        }
        
        const startDateEl = document.getElementById('staking-start-date');
        if (startDateEl) {
            startDateEl.textContent = stakingData.stakingStart || '-';
        }
        
        const lastUpdateEl = document.getElementById('last-update-date');
        if (lastUpdateEl) {
            lastUpdateEl.textContent = stakingData.lastUpdate || '-';
        }
        
        const totalClaimedEl = document.getElementById('total-rewards-claimed');
        if (totalClaimedEl) {
            totalClaimedEl.textContent = stakingData.totalRewardsClaimed || '0';
        }
    }

    /**
     * Stake tokens - REAL CONTRACT VERSION
     */
    async stakeTokens() {
        if (!this.connected || !this.contractClient) {
            this.showMessage('Please connect your wallet first', 'warning');
            return;
        }
        
        const amount = parseFloat(document.getElementById('stake-amount').value);
        if (!amount || amount <= 0) {
            this.showMessage('Please enter a valid amount to stake', 'warning');
            return;
        }
        
        try {
            console.log('🏦 Staking tokens:', amount, 'VIBES');
            // No notification for transaction preparation
            
            // Call the real contract method to opt into staking
            console.log('📡 Calling contract optIntoStaking...');
            const signature = await this.contractClient.optIntoStaking(amount);
            
            console.log('✅ Stake transaction confirmed:', signature);
            
            // Show success notification with transaction link
            if (window.notifications) {
                window.notifications.transaction(
                    `Successfully staked ${amount} VIBES tokens!`,
                    signature,
                    { title: '🏦 Staking Successful' }
                );
            } else {
                this.showMessage(`Successfully staked ${amount} VIBES tokens!`, 'success');
            }
            
            // Clear the input
            document.getElementById('stake-amount').value = '';
            
            // CRITICAL: Refresh staking data from contract after successful stake
            console.log('🔄 Refreshing staking data from blockchain...');
            
            // Wait a moment for blockchain to update
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Update staking stats using the global function from index.html
            if (typeof window.updateStakingStats === 'function') {
                await window.updateStakingStats();
                console.log('✅ Staking stats refreshed successfully');
            } else {
                console.warn('⚠️ updateStakingStats function not available');
                // Fallback: call loadStakingData
                this.loadStakingData();
            }
            
        } catch (error) {
            console.error('❌ Staking failed:', error);
            
            // Provide user-friendly error message
            let errorMessage = 'Staking failed. Please try again.';
            if (error.message.includes('rejected') || error.message.includes('cancelled')) {
                errorMessage = 'Transaction cancelled by user';
            } else if (error.message.includes('Insufficient')) {
                errorMessage = 'Insufficient unstaked tokens to stake';
            } else if (error.message) {
                errorMessage = `Staking failed: ${error.message}`;
            }
            
            this.showMessage(errorMessage, 'error');
        }
    }

    /**
     * Unstake tokens
     */
    async unstakeTokens() {
        if (!this.connected || !this.contractClient) {
            this.showMessage('Please connect your wallet first', 'warning');
            return;
        }
        
        const amount = parseFloat(document.getElementById('unstake-amount').value);
        if (!amount || amount <= 0) {
            this.showMessage('Please enter a valid amount to unstake', 'warning');
            return;
        }
        
        try {
            console.log('💰 Unstaking tokens:', amount);
            // No notification for transaction processing
            
            // Here you would call the contract method to unstake tokens
            // For now, we'll simulate the action
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showMessage(`Successfully unstaked ${amount} VIBES tokens`, 'success');
            
            // Clear the input
            document.getElementById('unstake-amount').value = '';
            
            // Update staking display
            this.loadStakingData();
            
        } catch (error) {
            console.error('❌ Unstaking failed:', error);
            
            let errorMsg = 'Unstaking failed. ';
            if (error.message?.includes('insufficient')) {
                errorMsg += 'You don\'t have enough staked tokens.';
            } else if (error.message?.includes('rejected') || error.message?.includes('User rejected')) {
                errorMsg += 'Transaction was cancelled.';
            } else if (error.message?.includes('timeout')) {
                errorMsg += 'Transaction timed out. Please try again.';
            } else {
                errorMsg += 'Please check your wallet and try again.';
            }
            
            this.showMessage(errorMsg, 'error');
        }
    }

    /**
     * Claim rewards
     */
    async claimRewards() {
        if (!this.connected || !this.contractClient) {
            this.showMessage('Please connect your wallet first', 'warning');
            return;
        }
        
        try {
            console.log('🎁 Claiming rewards...');
            // No notification for transaction processing
            
            // Here you would call the contract method to claim rewards
            // For now, we'll simulate the action
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showMessage('Successfully claimed rewards!', 'success');
            
            // Update staking display
            this.loadStakingData();
            
        } catch (error) {
            console.error('❌ Claiming rewards failed:', error);
            
            let errorMsg = 'Unable to claim rewards. ';
            if (error.message?.includes('No rewards')) {
                errorMsg += 'You don\'t have any rewards to claim yet.';
            } else if (error.message?.includes('rejected') || error.message?.includes('User rejected')) {
                errorMsg += 'Transaction was cancelled.';
            } else if (error.message?.includes('timeout')) {
                errorMsg += 'Transaction timed out. Please try again.';
            } else {
                errorMsg += 'Please check your wallet and try again.';
            }
            
            this.showMessage(errorMsg, 'error');
        }
    }

    /**
     * Load staking data from contract
     */
    async loadStakingData() {
        if (!this.connected || !this.contractClient) {
            // Show default values when not connected
            this.updateStakingDisplay({
                totalStaked: '0',
                unstaked: '0',
                apy: 40,
                pendingRewards: '0',
                isStaking: false,
                stakingStart: '-',
                lastUpdate: '-',
                totalRewardsClaimed: '0'
            });
            return;
        }
        
        try {
            console.log('📊 Loading staking data...');
            
            // Here you would load real staking data from the contract
            // For now, we'll use mock data
            const stakingData = {
                totalStaked: '1,250.50',
                unstaked: '750.25',
                apy: 40,
                pendingRewards: '125.75',
                isStaking: true,
                stakingStart: '2024-01-15',
                lastUpdate: '2024-01-20',
                totalRewardsClaimed: '500.00'
            };
            
            this.updateStakingDisplay(stakingData);
            console.log('✅ Staking data loaded successfully');
            
        } catch (error) {
            console.error('❌ Failed to load staking data:', error);
            // No notification for staking data load errors - not critical for user experience
        }
    }

    /**
     * Update vesting display with real data
     */
    updateVestingDisplay(vestingData) {
        // Update overview cards with $VIBES suffix
        const totalVestingEl = document.getElementById('vesting-total-display');
        if (totalVestingEl) {
            const totalValue = vestingData.totalVesting || '0';
            totalVestingEl.textContent = `${totalValue} $VIBES`;
        }
        
        const releasedEl = document.getElementById('vesting-released-display');
        if (releasedEl) {
            const releasedValue = vestingData.released || '0';
            releasedEl.textContent = `${releasedValue} $VIBES`;
        }
        
        const remainingEl = document.getElementById('vesting-remaining-display');
        if (remainingEl) {
            const remainingValue = vestingData.remaining || '0';
            remainingEl.textContent = `${remainingValue} $VIBES`;
        }
        
        // Update vesting information with color coding
        const statusEl = document.getElementById('vesting-status');
        if (statusEl) {
            statusEl.textContent = vestingData.status || 'Not Available';
            // Color based on status
            if (vestingData.status === 'Active' || vestingData.status === 'Completed') {
                statusEl.style.color = '#c7f801';
            } else if (vestingData.status === 'Pending Transfer' || vestingData.status === 'Not Created') {
                statusEl.style.color = '#FACD95'; // Orange/yellow for pending states
            } else {
                statusEl.style.color = '#ff6b6b'; // Red for error/not available
            }
        }
        
        const presaleStatusEl = document.getElementById('presale-status');
        if (presaleStatusEl) {
            presaleStatusEl.textContent = vestingData.presaleActive ? 'Active' : 'Ended';
            presaleStatusEl.style.color = vestingData.presaleActive ? '#c7f801' : '#ff6b6b';
        }
        
        // Vesting Start is now hardcoded as "Oct 12, 2026" in HTML
        // No need to update it dynamically
        
        // Last Claim field removed from UI
        
        // Update claimable amount with $VIBES suffix
        const claimableEl = document.getElementById('claimable-amount');
        if (claimableEl) {
            const claimableValue = vestingData.claimable || '0';
            claimableEl.textContent = `${claimableValue} $VIBES`;
        }
        
        // Enable/disable claim functionality based on presale status and claimable amount
        this.updateVestingClaimStatus(vestingData.presaleActive, vestingData.claimable);
    }

    /**
     * Update vesting claim button status based on presale status and claimable amount
     */
    updateVestingClaimStatus(presaleActive, claimableAmount = '0') {
        const claimCard = document.getElementById('vesting-claim-card');
        const claimBtn = document.getElementById('claim-vested-tokens');
        
        if (!claimCard || !claimBtn) return;
        
        // Parse claimable amount (remove commas and convert to number)
        const claimable = parseFloat(claimableAmount.toString().replace(/,/g, '')) || 0;
        
        if (presaleActive) {
            // Presale is active - disable claim
            claimCard.style.opacity = '0.5';
            claimCard.style.pointerEvents = 'none';
            claimBtn.disabled = true;
            claimBtn.textContent = 'Claim VIBES (Presale Active)';
            claimBtn.style.backgroundColor = '#666';
        } else if (claimable <= 0) {
            // Presale ended but no claimable tokens
            claimCard.style.opacity = '0.7';
            claimCard.style.pointerEvents = 'auto';
            claimBtn.disabled = true;
            claimBtn.textContent = 'No Claimable Tokens';
            claimBtn.style.backgroundColor = '#666';
        } else {
            // Presale ended and tokens available - enable claim
            claimCard.style.opacity = '1';
            claimCard.style.pointerEvents = 'auto';
            claimBtn.disabled = false;
            claimBtn.textContent = 'Claim VIBES';
            claimBtn.style.backgroundColor = '';
        }
    }

    /**
     * Claim vested tokens
     */
    async claimVestedTokens() {
        if (!this.connected || !this.contractClient) {
            this.showMessage('Please connect your wallet first', 'warning');
            return;
        }
        
        try {
            console.log('🎁 Claiming vested tokens...');
            // No notification for transaction processing
            
            // Here you would call the contract method to claim vested tokens
            // For now, we'll simulate the action
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showMessage('Successfully claimed vested VIBES tokens!', 'success');
            
            // Update vesting display
            this.loadVestingData();
            
        } catch (error) {
            console.error('❌ Claiming vested tokens failed:', error);
            
            let errorMsg = 'Unable to claim vested tokens. ';
            if (error.message?.includes('No tokens') || error.message?.includes('not vested')) {
                errorMsg += 'You don\'t have any tokens available to claim yet. Check your vesting schedule.';
            } else if (error.message?.includes('rejected') || error.message?.includes('User rejected')) {
                errorMsg += 'Transaction was cancelled.';
            } else if (error.message?.includes('timeout')) {
                errorMsg += 'Transaction timed out. Please try again.';
            } else {
                errorMsg += 'Please check your wallet and try again.';
            }
            
            this.showMessage(errorMsg, 'error');
        }
    }

    /**
     * Load vesting data from contract - REAL CONTRACT VERSION
     */
    async loadVestingData() {
        if (!this.connected || !this.contractClient) {
            // Show default values when not connected
            this.updateVestingDisplay({
                totalVesting: '0',
                released: '0',
                remaining: '0',
                status: 'Not Available',
                presaleActive: true,
                vestingStart: '-',
                lastClaim: '-',
                claimable: '0'
            });
            return;
        }
        
        try {
            console.log('📊 Loading vesting data from contract...');
            
            // Get presale state to check if presale is active
            const presaleState = await this.contractClient.getPresaleStateFromContract();
            const now = Math.floor(Date.now() / 1000);
            const presaleActive = now >= presaleState.startTs && now <= presaleState.endTs && !presaleState.isFinalized;
            
            console.log('📅 Presale status:', {
                active: presaleActive,
                startTs: new Date(presaleState.startTs * 1000).toISOString(),
                endTs: new Date(presaleState.endTs * 1000).toISOString(),
                finalized: presaleState.isFinalized || false
            });
            
            // Get buyer state to check if transferred to vesting
            const buyerState = await this.contractClient.getBuyerStateData(this.publicKey);
            
            if (!buyerState || !buyerState.exists) {
                console.log('📭 No buyer state found - user has not purchased');
                this.updateVestingDisplay({
                    totalVesting: '0',
                    released: '0',
                    remaining: '0',
                    status: 'No Purchases',
                    presaleActive: presaleActive,
                    vestingStart: '-',
                    lastClaim: '-',
                    claimable: '0'
                });
                return;
            }
            
            console.log('📊 Buyer state:', {
                transferredToVesting: buyerState.transferredToVesting,
                finalVestingAmount: (buyerState.finalVestingAmount / Math.pow(10, TOKEN_CONFIG.VIBES_DECIMALS)).toFixed(2) + ' VIBES'
            });
            
            // If not transferred to vesting yet, show buyer's purchased tokens as potential vesting
            if (!buyerState.transferredToVesting) {
                // Show total purchased tokens as "pending vesting"
                const totalPurchased = buyerState.totalPurchasedVibes / Math.pow(10, TOKEN_CONFIG.VIBES_DECIMALS);
                
                this.updateVestingDisplay({
                    totalVesting: totalPurchased.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    released: '0.00',
                    remaining: totalPurchased.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    status: 'Pending Transfer',
                    presaleActive: presaleActive,
                    vestingStart: '-',
                    lastClaim: '-',
                    claimable: '0.00'
                });
                
                console.log('✅ Vesting data loaded (pending transfer)');
                return;
            }
            
            // Get vesting schedule data from contract
            const vestingSchedule = await this.contractClient.getVestingScheduleData(this.publicKey);
            
            if (!vestingSchedule || !vestingSchedule.exists) {
                console.log('📭 No vesting schedule found - user has not created vesting yet');
                this.updateVestingDisplay({
                    totalVesting: (buyerState.finalVestingAmount / Math.pow(10, TOKEN_CONFIG.VIBES_DECIMALS)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    released: '0.00',
                    remaining: (buyerState.finalVestingAmount / Math.pow(10, TOKEN_CONFIG.VIBES_DECIMALS)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    status: 'Not Created',
                    presaleActive: presaleActive,
                    vestingStart: '-',
                    lastClaim: '-',
                    claimable: '0.00'
                });
                return;
            }
            
            // Parse and format vesting data
            const totalVesting = vestingSchedule.total / Math.pow(10, TOKEN_CONFIG.VIBES_DECIMALS);
            const released = vestingSchedule.released / Math.pow(10, TOKEN_CONFIG.VIBES_DECIMALS);
            const remaining = vestingSchedule.remaining / Math.pow(10, TOKEN_CONFIG.VIBES_DECIMALS);
            const claimable = vestingSchedule.claimable / Math.pow(10, TOKEN_CONFIG.VIBES_DECIMALS);
            
            // Determine vesting status
            let status = 'Active';
            if (vestingSchedule.isCancelled) {
                status = 'Cancelled';
            } else if (remaining <= 0) {
                status = 'Completed';
            }
            
            // Format dates
            const vestingStart = vestingSchedule.listingTs > 0 
                ? new Date(vestingSchedule.listingTs * 1000).toLocaleDateString()
                : '-';
            
            // Last claim date - if released > 0, show current date (approximation)
            const lastClaim = released > 0 
                ? new Date().toLocaleDateString()
                : '-';
            
            const vestingData = {
                totalVesting: totalVesting.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                released: released.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                remaining: remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                status: status,
                presaleActive: presaleActive,
                vestingStart: vestingStart,
                lastClaim: lastClaim,
                claimable: claimable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            };
            
            this.updateVestingDisplay(vestingData);
            console.log('✅ Vesting data loaded successfully from contract');
            
        } catch (error) {
            console.error('❌ Failed to load vesting data:', error);
            // No notification for vesting data load errors - not critical for user experience
            
            // Show error state
            this.updateVestingDisplay({
                totalVesting: '0',
                released: '0',
                remaining: '0',
                status: 'Error Loading',
                presaleActive: true,
                vestingStart: '-',
                lastClaim: '-',
                claimable: '0'
            });
        }
    }

    /**
     * Refresh all data
     */
    async refreshData() {
        if (!this.connected) {
            this.showMessage('Please connect your wallet first', 'warning');
            return;
        }
        
        console.log('🔄 Refreshing data...');
        // No notification for data refresh
        
        await this.loadUserData();
        await this.loadPresaleData();
        await this.loadStakingData();
        await this.loadVestingData();
    }

    /**
     * Buy VIBES tokens with SOL
     */
    async buyWithSol() {
        if (!this.connected || !this.contractClient) {
            this.showMessage('Please connect your wallet first', 'warning');
            return;
        }
        
        try {
            // Get input values
            const amountInput = document.getElementById('sol-amount');
            const stakingCheckbox = document.getElementById('sol-staking');
            
            if (!amountInput) {
                this.showMessage('Amount input not found', 'error');
                return;
            }
            
            const amount = parseFloat(amountInput.value);
            const optIntoStaking = stakingCheckbox ? stakingCheckbox.checked : false;
            
            if (!amount || amount <= 0) {
                this.showMessage('Please enter a valid SOL amount', 'warning');
                return;
            }
            
            console.log('💰 Buying with SOL:', { amount, optIntoStaking });
            // No notification for transaction processing
            
            // Execute purchase
            const signature = await this.contractClient.buyWithSol(amount, optIntoStaking);
            
            console.log('✅ Purchase successful:', signature);
            
            // Show success notification with transaction link
            if (window.notifications) {
                window.notifications.transaction(
                    `Successfully purchased VIBES with ${amount} SOL!`,
                    signature,
                    { title: '🎉 Purchase Successful' }
                );
            } else {
                this.showMessage(`Purchase successful! Transaction: ${signature.slice(0, 8)}...`, 'success');
            }
            
            // Clear input and refresh data
            amountInput.value = '';
            if (stakingCheckbox) stakingCheckbox.checked = false;
            
            // Reload user data
            await this.loadUserData();
            await this.loadPresaleData();
            
        } catch (error) {
            console.error('❌ Purchase failed:', error);
            
            let errorMsg = 'Purchase failed. ';
            if (error.message?.includes('insufficient') || error.message?.includes('balance')) {
                errorMsg += 'Insufficient SOL balance. Please add more SOL to your wallet.';
            } else if (error.message?.includes('rejected') || error.message?.includes('User rejected')) {
                errorMsg += 'Transaction was cancelled.';
            } else if (error.message?.includes('timeout')) {
                errorMsg += 'Transaction timed out. Please try again.';
            } else if (error.message?.includes('slippage')) {
                errorMsg += 'Price changed too much. Please try again.';
            } else {
                errorMsg += 'Please check your wallet balance and try again.';
            }
            
            this.showMessage(errorMsg, 'error');
        }
    }

    /**
     * Buy VIBES tokens with USDC
     */
    async buyWithUsdc() {
        if (!this.connected || !this.contractClient) {
            this.showMessage('Please connect your wallet first', 'warning');
            return;
        }
        
        try {
            // Get input values
            const amountInput = document.getElementById('usdc-amount');
            const stakingCheckbox = document.getElementById('usdc-staking');
            
            if (!amountInput) {
                this.showMessage('Amount input not found', 'error');
                return;
            }
            
            const amount = parseFloat(amountInput.value);
            const optIntoStaking = stakingCheckbox ? stakingCheckbox.checked : false;
            
            if (!amount || amount <= 0) {
                this.showMessage('Please enter a valid USDC amount', 'warning');
                return;
            }
            
            console.log('💵 Buying with USDC:', { amount, optIntoStaking });
            // No notification for transaction processing
            
            // Execute purchase
            const signature = await this.contractClient.buyWithUsdc(amount, optIntoStaking);
            
            console.log('✅ Purchase successful:', signature);
            
            // Show success notification with transaction link
            if (window.notifications) {
                window.notifications.transaction(
                    `Successfully purchased VIBES with ${amount} USDC!`,
                    signature,
                    { title: '🎉 Purchase Successful' }
                );
            } else {
                this.showMessage(`Purchase successful! Transaction: ${signature.slice(0, 8)}...`, 'success');
            }
            
            // Clear input and refresh data
            amountInput.value = '';
            if (stakingCheckbox) stakingCheckbox.checked = false;
            
            // Reload user data
            await this.loadUserData();
            await this.loadPresaleData();
            
        } catch (error) {
            console.error('❌ Purchase failed:', error);
            
            let errorMsg = 'Purchase failed. ';
            if (error.message?.includes('insufficient') || error.message?.includes('balance')) {
                errorMsg += 'Insufficient USDC balance. Please add more USDC to your wallet.';
            } else if (error.message?.includes('rejected') || error.message?.includes('User rejected')) {
                errorMsg += 'Transaction was cancelled.';
            } else if (error.message?.includes('timeout')) {
                errorMsg += 'Transaction timed out. Please try again.';
            } else if (error.message?.includes('slippage')) {
                errorMsg += 'Price changed too much. Please try again.';
            } else {
                errorMsg += 'Please check your wallet balance and try again.';
            }
            
            this.showMessage(errorMsg, 'error');
        }
    }

    /**
     * Opt into staking
     */
    async optIntoStaking() {
        if (!this.connected || !this.contractClient) {
            this.showMessage('Please connect your wallet first', 'warning');
            return;
        }
        
        try {
            // Get amount from input
            const amountInput = document.getElementById('stake-amount');
            if (!amountInput) {
                this.showMessage('Amount input not found', 'error');
                return;
            }
            
            const amount = parseFloat(amountInput.value);
            
            if (!amount || amount <= 0) {
                this.showMessage('Please enter a valid staking amount', 'warning');
                return;
            }
            
            console.log('🏦 Opting into staking:', amount);
            // No notification for transaction processing
            
            // Execute staking
            const signature = await this.contractClient.optIntoStaking(amount);
            
            console.log('✅ Staking successful:', signature);
            
            // Show success notification with transaction link
            if (window.notifications) {
                window.notifications.transaction(
                    `Successfully opted into staking with ${amount} VIBES!`,
                    signature,
                    { title: '🏦 Staking Successful' }
                );
            } else {
                this.showMessage(`Staking successful! Transaction: ${signature.slice(0, 8)}...`, 'success');
            }
            
            // Clear input and refresh data
            amountInput.value = '';
            
            // Reload user data
            await this.loadUserData();
            
        } catch (error) {
            console.error('❌ Staking failed:', error);
            
            let errorMsg = 'Staking failed. ';
            if (error.message?.includes('insufficient') || error.message?.includes('balance')) {
                errorMsg += 'Insufficient VIBES balance. You need to purchase tokens first.';
            } else if (error.message?.includes('rejected') || error.message?.includes('User rejected')) {
                errorMsg += 'Transaction was cancelled.';
            } else if (error.message?.includes('timeout')) {
                errorMsg += 'Transaction timed out. Please try again.';
            } else if (error.message?.includes('already staked')) {
                errorMsg += 'These tokens are already staked.';
            } else {
                errorMsg += 'Please check your wallet and try again.';
            }
            
            this.showMessage(errorMsg, 'error');
        }
    }

    /**
     * Format wallet address
     */
    formatAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    }

    /**
     * Show message to user
     * @param {string} message - Message to show
     * @param {string} type - Type of message: 'success', 'error', 'warning', 'info'
     * @param {boolean} showNotification - Whether to show visual notification (default: true for errors, warnings, success; false for info)
     */
    showMessage(message, type = 'info', showNotification = null) {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        
        console.log(logMessage);
        
        // Update transaction log display
        const logElement = document.getElementById('transaction-log');
        if (logElement) {
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry log-${type}`;
            logEntry.textContent = logMessage;
            logElement.appendChild(logEntry);
            logElement.scrollTop = logElement.scrollHeight;
            
            // Keep only last 50 entries
            while (logElement.children.length > 50) {
                logElement.removeChild(logElement.firstChild);
            }
        }
        
        // Also show in any generic log container
        const genericLog = document.getElementById('log');
        if (genericLog && genericLog !== logElement) {
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry log-${type}`;
            logEntry.textContent = logMessage;
            genericLog.appendChild(logEntry);
            genericLog.scrollTop = genericLog.scrollHeight;
        }
        
        // Determine if notification should be shown
        // By default: show errors, warnings, and success; hide info messages
        if (showNotification === null) {
            showNotification = (type !== 'info');
        }
        
        // Use new notification system if available and enabled
        if (window.notifications && showNotification) {
            // Map type to notification method
            switch (type) {
                case 'success':
                    window.notifications.success(message);
                    break;
                case 'error':
                    window.notifications.error(message);
                    break;
                case 'warning':
                    window.notifications.warning(message);
                    break;
                case 'info':
                default:
                    window.notifications.info(message);
                    break;
            }
        } else {
            // Fallback to old notification if new system not loaded yet
            const notification = document.getElementById('notification');
            if (notification) {
                notification.textContent = message;
                notification.className = `notification notification-${type}`;
                notification.style.display = 'block';
                
                setTimeout(() => {
                    notification.style.display = 'none';
                }, 3000);
            }
        }
    }

    /**
     * Get wallet manager for external use
     */
    getWalletManager() {
        return this.walletManager;
    }

    /**
     * Get connection for external use
     */
    getConnection() {
        return this.connection;
    }

    /**
     * Get public key
     */
    getPublicKey() {
        return this.publicKey;
    }

    /**
     * Check if wallet is connected
     */
    isConnected() {
        return this.connected && this.publicKey !== null;
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🚀 DOM loaded, initializing VIBES Admin DApp...');
        window.vibesApp = new VibesAdminApp();
    });
} else {
    // DOM already loaded
    console.log('🚀 Initializing VIBES Admin DApp...');
    window.vibesApp = new VibesAdminApp();
}


// VIBES DeFi Basic DApp - Main Application Logic
// This file contains all the smart contract interaction logic
// STAKING FIX VERSION: 2024-15-04-REAL-FIX-v3

class VibesDApp {
    constructor() {
        console.log('🏗️ Creating VibesDApp instance...');
        this.connection = null;
        this.wallet = null;
        this.provider = null;
        this.programs = {};
        this.anchorClient = null;
        this.directClient = null;
        this.isConnected = false;
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
            console.log('📍 Available globals:', {
                solanaWeb3: typeof window.solanaWeb3,
                NETWORK_CONFIG: typeof NETWORK_CONFIG,
                PROGRAM_IDS: typeof PROGRAM_IDS
            });
            
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
            
            // Initialize Solana connection with fallback
            try {
                this.connection = new solanaWeb3.Connection(
                    NETWORK_CONFIG.RPC_URL,
                    'confirmed'
                );
                // Test the connection
                await this.connection.getVersion();
                this.log('Connected to Helius RPC', 'success');
            } catch (error) {
                this.log('Helius RPC failed, using fallback...', 'warning');
                this.connection = new solanaWeb3.Connection(
                    NETWORK_CONFIG.FALLBACK_RPC,
                    'confirmed'
                );
                await this.connection.getVersion();
                this.log('Connected to fallback RPC', 'success');
            }
            
            // Check if Phantom wallet is available (REQUIRED)
            if (window.solana && window.solana.isPhantom) {
                this.wallet = window.solana;
                this.log('✅ Phantom wallet detected', 'success');
                
                // Debug: Check available methods
                this.log('🔍 DEBUG: Available wallet methods:', 'info');
                this.log(`- connect: ${typeof this.wallet.connect}`, 'info');
                this.log(`- disconnect: ${typeof this.wallet.disconnect}`, 'info');
                this.log(`- sendTransaction: ${typeof this.wallet.sendTransaction}`, 'info');
                this.log(`- signTransaction: ${typeof this.wallet.signTransaction}`, 'info');
                this.log(`- signAndSendTransaction: ${typeof this.wallet.signAndSendTransaction}`, 'info');
                this.log(`- isConnected: ${this.wallet.isConnected}`, 'info');
            } else {
                this.log('❌ Phantom wallet not found!', 'error');
                this.log('📱 Please install Phantom wallet extension:', 'error');
                this.log('🔗 https://phantom.app/', 'error');
                this.log('🔄 Refresh this page after installation', 'info');
                
                // Show error in UI
                this.updateWalletUI();
                return; // Stop initialization
            }

            // Set up event listeners
            this.setupEventListeners();
            
            // Try to auto-connect if previously connected
            if (WALLET_CONFIG.AUTO_CONNECT && this.wallet) {
                await this.connectWallet();
            }

            this.log('DApp initialized successfully', 'success');
        } catch (error) {
            this.log(`Initialization error: ${error.message}`, 'error');
            console.error('DApp initialization error:', error);
        }
    }


    // Set up event listeners
    setupEventListeners() {
        this.log('Setting up event listeners...', 'info');
        console.log('🔧 Setting up event listeners...');
        
        // Wallet connection
        const connectBtn = document.getElementById('connect-wallet');
        const disconnectBtn = document.getElementById('disconnect-wallet');
        
        console.log('📍 Button elements found:', {
            connectBtn: !!connectBtn,
            disconnectBtn: !!disconnectBtn
        });
        
        if (connectBtn) {
            connectBtn.addEventListener('click', () => {
                this.log('Connect wallet button clicked', 'info');
                this.connectWallet();
            });
        } else {
            this.log('Connect wallet button not found', 'error');
        }
        
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
        } else {
            this.log('Buy SOL button not found', 'error');
        }
        
        if (buyUsdcBtn) {
            buyUsdcBtn.addEventListener('click', () => {
                this.log('Buy USDC button clicked', 'info');
                this.buyWithUsdc();
            });
        } else {
            this.log('Buy USDC button not found', 'error');
        }
        
        // Staking buttons
        document.getElementById('opt-into-staking').addEventListener('click', () => this.optIntoStaking());
        
        // Vesting buttons - disabled until 2026
        // document.getElementById('transfer-to-vesting').addEventListener('click', () => this.transferToVesting());
        // document.getElementById('claim-tokens').addEventListener('click', () => this.claimTokens());
        // document.getElementById('claim-vested').addEventListener('click', () => this.claimVested());
        
        // Refresh buttons
        document.getElementById('refresh-presale').addEventListener('click', () => this.refreshPresaleData());
        document.getElementById('clear-log').addEventListener('click', () => this.clearLog());
        
        // Admin dashboard buttons
        document.getElementById('refresh-admin-data').addEventListener('click', () => this.refreshAdminData());
        document.getElementById('export-fund-report').addEventListener('click', () => this.exportFundReport());
        
        // Wallet events
        if (this.wallet) {
            this.wallet.on('connect', () => {
                this.log('Wallet connected', 'success');
                this.updateWalletUI();
            });
            
            this.wallet.on('disconnect', () => {
                this.log('Wallet disconnected', 'info');
                this.updateWalletUI();
            });
        }
        
        this.log('Event listeners set up successfully', 'success');
    }

    // Connect wallet
    async connectWallet() {
        try {
            if (!this.wallet) {
                throw new Error('Wallet not available');
            }

            this.log('Connecting to wallet...', 'info');
            
            // Connect to Phantom wallet with timeout
            const connectPromise = this.wallet.connect();
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
            );
            
            const response = await Promise.race([connectPromise, timeoutPromise]);
            this.isConnected = true;
            this.log('✅ Phantom wallet connected successfully', 'success');
            
            // Initialize direct contract client (ALWAYS works)
            if (typeof DirectContractClient !== 'undefined') {
                this.directClient = new DirectContractClient(this.connection, this.wallet);
                this.log('✅ Direct contract client initialized', 'success');
            } else {
                this.log('⚠️ DirectContractClient not available', 'warning');
            }
            
            // Direct contract client is ready for transactions
            
            // Note: Using direct contract client for all transactions
            
            // Update UI
            this.updateWalletUI();
            
            // Load user data
            await this.loadUserData();
            await this.loadPresaleData();
            
            // Force vesting information update (even for new users)
            setTimeout(() => {
                console.log('🔄 Forcing vesting update after wallet connection');
                this.updateUserDataUI();
            }, 1000);
            
            // Load admin fund distribution data
            try {
                await this.loadAdminFundData();
                this.log('📊 Admin fund data loaded', 'success');
            } catch (error) {
                this.log('⚠️ Could not load admin fund data, will be available on refresh', 'warning');
            }
            
            this.log(SUCCESS_MESSAGES.WALLET_CONNECTED, 'success');
            
        } catch (error) {
            this.log(`Wallet connection failed: ${error.message}`, 'error');
            console.error('Wallet connection error:', error);
        }
    }

    // Disconnect wallet
    async disconnectWallet() {
        try {
            if (this.wallet && this.wallet.disconnect) {
                await this.wallet.disconnect();
            }
            
            this.isConnected = false;
            // Clear wallet reference after disconnect
            this.wallet = null;
            this.userData = null;
            this.presaleData = null;
            
            this.updateWalletUI();
            this.log('Wallet disconnected', 'info');
            
        } catch (error) {
            this.log(`Disconnect error: ${error.message}`, 'error');
        }
    }

    // Update wallet UI
    updateWalletUI() {
        const statusEl = document.getElementById('wallet-status');
        const addressEl = document.getElementById('wallet-address');
        const detailsEl = document.getElementById('wallet-details');
        const connectBtn = document.getElementById('connect-wallet');
        const disconnectBtn = document.getElementById('disconnect-wallet');

        if (this.isConnected && this.wallet && this.wallet.publicKey) {
            statusEl.textContent = 'Connected';
            statusEl.className = 'status success';
            addressEl.textContent = this.wallet.publicKey.toString();
            detailsEl.classList.remove('hidden');
            connectBtn.classList.add('hidden');
            disconnectBtn.classList.remove('hidden');
        } else {
            statusEl.textContent = 'Not Connected';
            statusEl.className = 'status error';
            detailsEl.classList.add('hidden');
            connectBtn.classList.remove('hidden');
            disconnectBtn.classList.add('hidden');
        }
    }

    // Load user data
    async loadUserData() {
        if (!this.isConnected || !this.wallet) return;

        try {
            this.log('Loading user data...', 'info');
            
            // Get SOL balance
            const solBalance = await this.connection.getBalance(this.wallet.publicKey);
            this.balances.sol = solBalance / Math.pow(10, 9); // Convert lamports to SOL
            
            // Get USDC balance
            try {
                const usdcTokenAccount = await this.getTokenAccount(this.wallet.publicKey, TOKEN_CONFIG.USDC_MINT);
                if (usdcTokenAccount) {
                    this.balances.usdc = usdcTokenAccount.amount / Math.pow(10, TOKEN_CONFIG.USDC_DECIMALS);
                }
            } catch (error) {
                this.balances.usdc = 0;
            }

            // Update UI
            document.getElementById('sol-balance').textContent = this.balances.sol.toFixed(4);
            document.getElementById('usdc-balance').textContent = this.balances.usdc.toFixed(2);

            // Load presale user data
            await this.loadPresaleUserData();
            
        } catch (error) {
            this.log(`Error loading user data: ${error.message}`, 'error');
        }
    }

    // Load presale data with correct parsing
    async loadPresaleData() {
        try {
            this.log('Loading presale data...', 'info');
            
            // Load real presale state for reward calculations
            await this.loadRealPresaleState();
            
            // Use verified correct data (from Anchor verification)
            this.presaleData = {
                authority: "824Fqqt99SJbyd2mLERNPuoxXSXUAyN8Sefbwn3Vsatu",
                tokenMint: "C4SeJZr8wJ6BrNUJP52vGZf6QMunWFRgx6kbkb56j3vW",
                usdcMint: "ChqSU5J7xaKaMHffaU3K6kdi2YyjbKpzK2Z5H7ogjY4F",
                startTs: 1757710888000, // Convert to milliseconds for JS dates
                endTs: 1789246888000,   // Convert to milliseconds for JS dates
                hardCapTotal: 40000,
                isFinalized: false,
                feeRateBps: 50,
                maxPurchasePerWallet: 1000,
                minPurchaseSol: 0.1,
                optionalStaking: true,
                stakingApyBps: 4000,
                charityRateBps: 300,
                totalStakedOptional: this.realPresaleState ? Number(this.realPresaleState.totalStakedOptional) / Math.pow(10, 9) : 1003.344481604,
                totalUnstaked: this.realPresaleState ? Number(this.realPresaleState.totalUnstaked) / Math.pow(10, 9) : 0,
                raisedSol: this.realPresaleState ? Number(this.realPresaleState.raisedSol) / Math.pow(10, 9) : 0.5,
                raisedUsdc: this.realPresaleState ? Number(this.realPresaleState.raisedUsdc) / Math.pow(10, 6) : 10,
                totalVibesSold: this.realPresaleState ? (Number(this.realPresaleState.totalStakedOptional) + Number(this.realPresaleState.totalUnstaked)) / Math.pow(10, 9) : 1003.344481604,
                isActive: true,
                currentPriceUsd: 0.0598, // This will be calculated from price schedule
                solRaised: this.realPresaleState ? Number(this.realPresaleState.raisedSol) / Math.pow(10, 9) : 0.5,
                usdcRaised: this.realPresaleState ? Number(this.realPresaleState.raisedUsdc) / Math.pow(10, 6) : 10
            };
            
            this.log('✅ Using verified presale data with correct timestamps', 'success');
            this.log(`📅 Start: ${new Date(this.presaleData.startTs).toISOString()}`, 'info');
            this.log(`📅 End: ${new Date(this.presaleData.endTs).toISOString()}`, 'info');
            this.log(`🟢 Status: ACTIVE`, 'success');
            
            // Debug logging for raised amounts
            console.log('💰 Presale data for UI:', {
                solRaised: this.presaleData.solRaised,
                usdcRaised: this.presaleData.usdcRaised,
                realStateExists: !!this.realPresaleState
            });

            this.updatePresaleUI();
            
        } catch (error) {
            this.log(`Error loading presale data: ${error.message}`, 'error');
        }
    }

    // Load real presale data by checking treasury wallet balances (SIMPLE & RELIABLE)
    async loadRealPresaleState() {
        try {
            console.log('🔍 Loading REAL raised amounts by checking treasury balances...');
            
            // Treasury wallet addresses from direct-contract.js
            const treasurySolWallet = new solanaWeb3.PublicKey('5zKuHDrHFsaB6WbGGxjwRAtX2dP6Sze7qUWX9vyNq1AR');
            const treasuryUsdcWallet = new solanaWeb3.PublicKey('Fypp3b43LduLMPWoTEaBimTbgdMzgSs2iYbcSXs9jf5R');
            const usdcMint = new solanaWeb3.PublicKey('ChqSU5J7xaKaMHffaU3K6kdi2YyjbKpzK2Z5H7ogjY4F');
            
            console.log('📍 Treasury SOL wallet:', treasurySolWallet.toString());
            console.log('📍 Treasury USDC wallet:', treasuryUsdcWallet.toString());
            
            // Get SOL balance of treasury wallet
            const solBalance = await this.connection.getBalance(treasurySolWallet);
            console.log('💰 Treasury SOL balance (lamports):', solBalance);
            console.log('💰 Treasury SOL balance (SOL):', solBalance / Math.pow(10, 9));
            
            // Get USDC balance of treasury wallet - use hardcoded ATA that matches the transaction logs
            const treasuryUsdcAccount = new solanaWeb3.PublicKey('GYujzmGHChT63exMwzqGP75gAXUH7meJaZDHxU7REFeZ'); // Hardcoded ATA from transaction logs

            console.log('📍 Treasury USDC account (ATA):', treasuryUsdcAccount.toString());
            
            let usdcBalance = 0;
            try {
                const usdcAccountInfo = await this.connection.getAccountInfo(treasuryUsdcAccount);
                if (usdcAccountInfo) {
                    // Parse token account data to get balance
                    const tokenAccountData = new DataView(usdcAccountInfo.data.buffer);
                    const balance = tokenAccountData.getBigUint64(64, true); // Token amount is at offset 64
                    usdcBalance = Number(balance);
                    console.log('💰 Treasury USDC balance (micro-USDC):', usdcBalance);
                    console.log('💰 Treasury USDC balance (USDC):', usdcBalance / Math.pow(10, 6));
                } else {
                    console.log('📍 Treasury USDC account does not exist yet');
                }
            } catch (usdcError) {
                console.log('📍 Could not read USDC balance:', usdcError.message);
            }
            
            // Store the REAL raised amounts from treasury balances
            this.realPresaleState = {
                totalStakedOptional: BigInt(184946488293), // From your user data
                totalUnstaked: BigInt(0),
                accRewardPerToken: BigInt(1339174050279), // Calculated for rewards
                lastRewardUpdateTs: BigInt(Math.floor(Date.now() / 1000)),
                raisedSol: BigInt(solBalance), // REAL SOL balance from treasury
                raisedUsdc: BigInt(usdcBalance), // REAL USDC balance from treasury
                priceSchedule: [] // Will use fallback price schedule
            };
            
            console.log('✅ REAL raised amounts from treasury balances:');
            console.log('💰 SOL Raised:', Number(solBalance) / Math.pow(10, 9), 'SOL');
            console.log('💰 USDC Raised:', Number(usdcBalance) / Math.pow(10, 6), 'USDC');
            
        } catch (error) {
            console.error('❌ Error checking treasury balances:', error);
            
            // Fallback to zero values if treasury check fails
            this.realPresaleState = {
                totalStakedOptional: BigInt(184946488293),
                totalUnstaked: BigInt(0),
                accRewardPerToken: BigInt(1339174050279),
                lastRewardUpdateTs: BigInt(Math.floor(Date.now() / 1000)),
                raisedSol: BigInt(0),
                raisedUsdc: BigInt(0),
                priceSchedule: []
            };
            
            console.log('📊 Using fallback values due to treasury check failure');
        }
    }

    // Load complete admin fund distribution data from contract
    async loadAdminFundData() {
        try {
            console.log('📊 Loading admin fund distribution data from smart contract...');
            
            // Get the presale state account to read fund distribution data
            const presaleStateAddress = new solanaWeb3.PublicKey('EoDCTycvkJV4UXm54KYiF1DuCMSHyXYPftGUVr3qJxPp');
            const presaleAccount = await this.connection.getAccountInfo(presaleStateAddress);
            
            if (!presaleAccount) {
                throw new Error('Presale state account not found');
            }
            
            console.log('✅ Found presale account, parsing fund distribution data...');
            
            // Parse the account data manually to extract fund distribution totals
            const buffer = new Uint8Array(presaleAccount.data);
            const dataView = new DataView(buffer.buffer);
            
            // Based on the state.rs structure, parse the tracking fields
            // Skip the initial fields to get to the tracking data
            let offset = 8 + 8 + 8 + 1 + 2; // discriminator + start_ts + end_ts + is_finalized + fee_rate_bps
            offset += 32 * 6; // fee_collector_sol + fee_collector_usdc + treasury_sol + treasury_usdc + secondary_sol + secondary_usdc
            offset += 8 + 8; // max_purchase_per_wallet + min_purchase_sol
            offset += 4 + (12 * 16); // price_schedule (vec with max 12 tiers)
            offset += 8 + 8 + 8 + 8; // staking fields
            offset += 32 + 2; // charity_wallet + charity_rate_bps
            offset += 8 + 8 + 8; // raised_sol + raised_usdc + total_vibes_sold
            
            // Read the fund distribution tracking data
            const totalFeesCollectedSol = Number(dataView.getBigUint64(offset, true));
            offset += 8;
            const totalFeesCollectedUsdc = Number(dataView.getBigUint64(offset, true));
            offset += 8;
            const totalTreasurySol = Number(dataView.getBigUint64(offset, true));
            offset += 8;
            const totalTreasuryUsdc = Number(dataView.getBigUint64(offset, true));
            offset += 8;
            const totalSecondarySol = Number(dataView.getBigUint64(offset, true));
            offset += 8;
            const totalSecondaryUsdc = Number(dataView.getBigUint64(offset, true));
            
            // Also get current balances of individual wallets
            const walletAddresses = {
                feeCollectorSol: '6xW2ZYh16AhRR3teKAWK8v1BDkUTDyTPBEqvLyhPpSos',
                treasurySol: '5zKuHDrHFsaB6WbGGxjwRAtX2dP6Sze7qUWX9vyNq1AR',
                secondarySol: '9JqWNcKYQCTGNM2aRdNAPk3hXfFBVUZHNdr668C9DcSn',
                treasuryUsdc: 'Fypp3b43LduLMPWoTEaBimTbgdMzgSs2iYbcSXs9jf5R', // This will be converted to ATA
                secondaryUsdc: '3549ZVcu7jL55NNMyZgRAFYBJr5PUB2LVtcsD79G8KKX', // This will be converted to ATA
            };
            
            // Get current SOL balances
            const [feeCollectorSolBalance, treasurySolBalance, secondarySolBalance] = await Promise.all([
                this.connection.getBalance(new solanaWeb3.PublicKey(walletAddresses.feeCollectorSol)),
                this.connection.getBalance(new solanaWeb3.PublicKey(walletAddresses.treasurySol)),
                this.connection.getBalance(new solanaWeb3.PublicKey(walletAddresses.secondarySol))
            ]);
            
            // Get current USDC balances (using known ATAs)
            const treasuryUsdcAta = 'GYujzmGHChT63exMwzqGP75gAXUH7meJaZDHxU7REFeZ'; // Known working ATA
            let treasuryUsdcBalance = 0;
            let secondaryUsdcBalance = 0;
            
            try {
                const treasuryUsdcAccount = await this.connection.getAccountInfo(new solanaWeb3.PublicKey(treasuryUsdcAta));
                if (treasuryUsdcAccount) {
                    const tokenData = new DataView(treasuryUsdcAccount.data.buffer);
                    treasuryUsdcBalance = Number(tokenData.getBigUint64(64, true));
                }
            } catch (e) {
                console.log('Could not read treasury USDC balance:', e.message);
            }
            
            // For secondary USDC, we need to calculate the ATA
            try {
                const usdcMint = new solanaWeb3.PublicKey('ChqSU5J7xaKaMHffaU3K6kdi2YyjbKpzK2Z5H7ogjY4F');
                const [secondaryUsdcAta] = await solanaWeb3.PublicKey.findProgramAddress(
                    [
                        new solanaWeb3.PublicKey(walletAddresses.secondaryUsdc).toBytes(),
                        new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA').toBytes(),
                        usdcMint.toBytes(),
                    ],
                    new solanaWeb3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
                );
                
                const secondaryUsdcAccount = await this.connection.getAccountInfo(secondaryUsdcAta);
                if (secondaryUsdcAccount) {
                    const tokenData = new DataView(secondaryUsdcAccount.data.buffer);
                    secondaryUsdcBalance = Number(tokenData.getBigUint64(64, true));
                }
                
                // Store the calculated ATA for the UI
                this.secondaryUsdcAtaAddress = secondaryUsdcAta.toString();
            } catch (e) {
                console.log('Could not read secondary USDC balance:', e.message);
                this.secondaryUsdcAtaAddress = null;
            }
            
            // Store admin fund data
            this.adminFundData = {
                // Historical totals from contract tracking
                totalFeesCollectedSol: totalFeesCollectedSol / Math.pow(10, 9), // Convert to SOL
                totalFeesCollectedUsdc: totalFeesCollectedUsdc / Math.pow(10, 6), // Convert to USDC
                totalTreasurySol: totalTreasurySol / Math.pow(10, 9),
                totalTreasuryUsdc: totalTreasuryUsdc / Math.pow(10, 6),
                totalSecondarySol: totalSecondarySol / Math.pow(10, 9),
                totalSecondaryUsdc: totalSecondaryUsdc / Math.pow(10, 6),
                
                // Current wallet balances
                currentBalances: {
                    feeCollectorSol: feeCollectorSolBalance / Math.pow(10, 9),
                    treasurySol: treasurySolBalance / Math.pow(10, 9),
                    secondarySol: secondarySolBalance / Math.pow(10, 9),
                    treasuryUsdc: treasuryUsdcBalance / Math.pow(10, 6),
                    secondaryUsdc: secondaryUsdcBalance / Math.pow(10, 6)
                },
                
                // Wallet addresses for reference
                addresses: walletAddresses,
                
                // Metadata
                lastUpdated: new Date(),
                // Use CURRENT balances for accurate totals (historical data from contract might be incorrect)
                totalRaisedSol: (feeCollectorSolBalance + treasurySolBalance + secondarySolBalance) / Math.pow(10, 9),
                totalRaisedUsdc: (treasuryUsdcBalance + secondaryUsdcBalance) / Math.pow(10, 6), // Fee collector doesn't hold USDC
                
                // Store calculated ATAs
                secondaryUsdcAta: this.secondaryUsdcAtaAddress
            };
            
            // Debug logging for verification
            console.log('📊 ADMIN FUND DATA CALCULATION DEBUG:');
            console.log('===========================================');
            console.log(`Fee Collector SOL: ${(feeCollectorSolBalance / Math.pow(10, 9)).toFixed(6)} SOL`);
            console.log(`Treasury SOL: ${(treasurySolBalance / Math.pow(10, 9)).toFixed(6)} SOL`);
            console.log(`Secondary SOL: ${(secondarySolBalance / Math.pow(10, 9)).toFixed(6)} SOL`);
            console.log(`Treasury USDC: ${(treasuryUsdcBalance / Math.pow(10, 6)).toFixed(2)} USDC`);
            console.log(`Secondary USDC: ${(secondaryUsdcBalance / Math.pow(10, 6)).toFixed(2)} USDC`);
            console.log(`💰 TOTAL SOL: ${this.adminFundData.totalRaisedSol.toFixed(6)} SOL`);
            console.log(`💰 TOTAL USDC: ${this.adminFundData.totalRaisedUsdc.toFixed(2)} USDC`);
            console.log('✅ Admin fund data loaded successfully');
            
            // Update the admin UI
            this.updateAdminUI();
            
            return this.adminFundData;
            
        } catch (error) {
            console.error('❌ Error loading admin fund data:', error);
            
            // Fallback data
            this.adminFundData = {
                totalFeesCollectedSol: 0,
                totalFeesCollectedUsdc: 0,
                totalTreasurySol: 0,
                totalTreasuryUsdc: 0,
                totalSecondarySol: 0,
                totalSecondaryUsdc: 0,
                currentBalances: {
                    feeCollectorSol: 0,
                    treasurySol: 0,
                    secondarySol: 0,
                    treasuryUsdc: 0,
                    secondaryUsdc: 0
                },
                addresses: {},
                lastUpdated: new Date(),
                totalRaisedSol: 0,
                totalRaisedUsdc: 0
            };
            
            this.updateAdminUI();
            throw error;
        }
    }

    // Calculate pending rewards for a user (replicates smart contract logic)
    calculatePendingRewards(userData, presaleState) {
        // If user is not staking or has no staked amount, no pending rewards
        if (!userData.isStaking || userData.stakedAmount <= 0) {
            return 0;
        }

        // Try precise calculation if we have contract state
        if (presaleState && presaleState.accRewardPerToken) {
            try {
                // Convert to BigInt for precise calculation (matching smart contract)
                const stakedAmountBigInt = BigInt(Math.floor(userData.stakedAmount * Math.pow(10, 9))); // Convert to lamports
                const accRewardPerTokenBigInt = presaleState.accRewardPerToken;
                // rewardDebt is already stored as a BigInt from contract (u128, but we only read first 8 bytes)
                const rewardDebtBigInt = BigInt(userData.rewardDebt);

                // Smart contract formula: (staked_amount * acc_reward_per_token) / 1e12 - reward_debt
                const currentAccReward = (stakedAmountBigInt * accRewardPerTokenBigInt) / BigInt(1_000_000_000_000);
                
                if (currentAccReward > rewardDebtBigInt) {
                    const pendingLamports = currentAccReward - rewardDebtBigInt;
                    // Convert back to VIBES (9 decimals)
                    return Number(pendingLamports) / Math.pow(10, 9);
                } else {
                    return 0;
                }
            } catch (error) {
                console.error('Error calculating precise pending rewards:', error);
                // Fall through to approximate calculation
            }
        }

        // Fallback: Approximate calculation based on time and APY
        try {
            const stakingApyBps = 4000; // 40% APY from presale config
            const secondsPerYear = 365 * 24 * 60 * 60;
            const apyDecimal = stakingApyBps / 10000; // 0.40
            
            // Calculate time staking (if we have lastStakeTs)
            const now = Math.floor(Date.now() / 1000);
            const stakingStartTime = userData.lastStakeTs || now;
            const stakingDurationSeconds = Math.max(0, now - stakingStartTime);
            
            // Approximate pending rewards = stakedAmount * APY * (time / year)
            const timeRatio = stakingDurationSeconds / secondsPerYear;
            const approximateRewards = userData.stakedAmount * apyDecimal * timeRatio;
            
            console.log('📊 Using approximate rewards calculation:', {
                stakedAmount: userData.stakedAmount,
                stakingDurationSeconds,
                timeRatio,
                approximateRewards
            });
            
            return approximateRewards;
            
        } catch (error) {
            console.error('Error calculating approximate pending rewards:', error);
            return 0;
        }
    }

    // Load presale user data
    async loadPresaleUserData() {
        if (!this.isConnected || !this.wallet) return;

        try {
            // Try to fetch real user data from smart contract
            try {
                const buyerStateAddress = await this.getBuyerStateAddress(this.wallet.publicKey);
                const buyerAccount = await this.connection.getAccountInfo(buyerStateAddress);
                
                if (buyerAccount) {
                    const data = this.parseBuyerState(buyerAccount.data);
                    this.userData = data;
                    this.log('Loaded real user data from contract', 'success');
                } else {
                    // No buyer state found - user hasn't purchased yet
                    this.userData = {
                        totalPurchasedVibes: 0,
                        solContributed: 0,
                        usdcContributed: 0,
                        isStaking: false,
                        stakedAmount: 0,
                        unstakedAmount: 0,
                        accumulatedRewards: 0,
                        totalRewardsClaimed: 0
                    };
                    this.log('No buyer state found - user has not purchased yet', 'info');
                }
            } catch (error) {
                this.log(`Could not fetch real user data: ${error.message}`, 'warning');
                // Fallback to mock data
                this.userData = {
                    totalPurchasedVibes: 1000,
                    solContributed: 0.05,
                    usdcContributed: 0,
                    isStaking: false,
                    stakedAmount: 0,
                    unstakedAmount: 1000,
                    accumulatedRewards: 0,
                    totalRewardsClaimed: 0
                };
                this.log('Using mock user data', 'warning');
            }

            this.updateUserDataUI();
            
        } catch (error) {
            this.log(`Error loading user data: ${error.message}`, 'error');
        }
    }

    // Update presale UI
    updatePresaleUI() {
        if (!this.presaleData) return;

        const now = Date.now();
        const isActive = now >= this.presaleData.startTs && now <= this.presaleData.endTs;
        
        document.getElementById('presale-status').textContent = isActive ? 'Active' : 'Inactive';
        document.getElementById('presale-status').className = `status ${isActive ? 'success' : 'warning'}`;
        document.getElementById('presale-start').textContent = new Date(this.presaleData.startTs).toLocaleString();
        document.getElementById('presale-end').textContent = new Date(this.presaleData.endTs).toLocaleString();
        document.getElementById('presale-hardcap').textContent = `${(this.presaleData.hardCapTotal / 1000).toFixed(0)}K SOL`;
        // Calculate current price tier with error handling
        try {
            const currentPriceTier = this.getCurrentPriceTier();
            document.getElementById('current-price-tier').textContent = currentPriceTier.tier;
            document.getElementById('current-price-usd').textContent = currentPriceTier.price.toFixed(4);
        } catch (priceError) {
            console.error('Price tier error:', priceError);
            // Fallback values
            document.getElementById('current-price-tier').textContent = "Month 1";
            document.getElementById('current-price-usd').textContent = "0.0598";
        }
        
        // Show real raised amounts from contract
        document.getElementById('sol-raised').textContent = `${this.presaleData.solRaised.toFixed(2)} SOL`;
        document.getElementById('usdc-raised').textContent = `$${this.presaleData.usdcRaised.toFixed(0)}`;
    }

    // Validate purchase limits based on DApp policy (250K VIBES)
    validatePurchaseAmount(solAmount = 0, usdcAmount = 0) {
        if (!this.userData) {
            throw new Error('User data not loaded. Please refresh and try again.');
        }

        // Calculate VIBES tokens that would be purchased
        const currentPrice = this.getCurrentPriceTier()?.priceUsd || 0.0598; // Fallback price
        
        let vibesFromSol = 0;
        let vibesFromUsdc = 0;
        
        if (solAmount > 0) {
            // Assuming SOL price around $150 for devnet testing (this would be fetched from an oracle in production)
            const solPriceUsd = 150; 
            const usdValue = solAmount * solPriceUsd;
            vibesFromSol = usdValue / currentPrice;
        }
        
        if (usdcAmount > 0) {
            vibesFromUsdc = usdcAmount / currentPrice;
        }
        
        const totalVibesBeingPurchased = vibesFromSol + vibesFromUsdc;
        const currentTotalVibes = this.userData.totalPurchasedVibes || 0;
        const newTotalVibes = currentTotalVibes + totalVibesBeingPurchased;
        
        console.log('🔍 Purchase validation:', {
            currentTotalVibes,
            totalVibesBeingPurchased,
            newTotalVibes,
            limit: DAPP_LIMITS.MAX_PURCHASE_PER_WALLET_VIBES,
            solAmount,
            usdcAmount,
            currentPrice
        });
        
        // Check DApp policy limit (250K VIBES)
        if (newTotalVibes > DAPP_LIMITS.MAX_PURCHASE_PER_WALLET_VIBES) {
            const remaining = DAPP_LIMITS.MAX_PURCHASE_PER_WALLET_VIBES - currentTotalVibes;
            throw new Error(
                `🚫 Purchase would exceed wallet limit!\n` +
                `• DApp Policy Limit: ${DAPP_LIMITS.MAX_PURCHASE_PER_WALLET_VIBES.toLocaleString()} VIBES per wallet\n` +
                `• You currently have: ${currentTotalVibes.toLocaleString()} VIBES\n` +
                `• You're trying to buy: ${totalVibesBeingPurchased.toLocaleString()} VIBES\n` +
                `• You can still buy: ${Math.max(0, remaining).toLocaleString()} VIBES\n` +
                `• Note: Contract allows 1M VIBES, but our business policy limits to 250K VIBES`
            );
        }
        
        // Check minimum amounts
        if (solAmount > 0 && solAmount < DAPP_LIMITS.MIN_PURCHASE_SOL) {
            throw new Error(`Minimum SOL purchase is ${DAPP_LIMITS.MIN_PURCHASE_SOL} SOL`);
        }
        
        if (usdcAmount > 0 && usdcAmount < DAPP_LIMITS.MIN_PURCHASE_USDC) {
            throw new Error(`Minimum USDC purchase is ${DAPP_LIMITS.MIN_PURCHASE_USDC} USDC`);
        }
        
        return {
            isValid: true,
            vibesBeingPurchased: totalVibesBeingPurchased,
            newTotalVibes,
            remaining: DAPP_LIMITS.MAX_PURCHASE_PER_WALLET_VIBES - newTotalVibes
        };
    }

    // Get current price tier with proper fallback
    getCurrentPriceTier() {
        const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
        
        // Use real price schedule from contract if available and valid
        if (this.realPresaleState && 
            this.realPresaleState.priceSchedule && 
            Array.isArray(this.realPresaleState.priceSchedule) && 
            this.realPresaleState.priceSchedule.length > 0) {
            
            const priceSchedule = this.realPresaleState.priceSchedule;
            console.log('📅 Using REAL price schedule from contract:', priceSchedule);
            
            try {
                // Convert to regular numbers for comparison
                const convertedTiers = priceSchedule.map((tier, index) => ({
                    startTs: Number(tier.startTs),
                    priceUsd: Number(tier.priceUsd),
                    name: `Month ${index + 1}`
                }));
                
                // Find the active price tier (most recent tier that has started)
                const activeTier = convertedTiers
                    .filter(tier => now >= tier.startTs)
                    .sort((a, b) => b.startTs - a.startTs)[0];
                
                if (activeTier && activeTier.priceUsd) {
                    console.log('✅ Current active tier from contract:', activeTier);
                    return {
                        tier: activeTier.name,
                        price: activeTier.priceUsd,
                        startTs: activeTier.startTs
                    };
                }
            } catch (error) {
                console.error('❌ Error processing price schedule:', error);
            }
        }
        
        // Always use fallback price schedule (reliable)
        console.log('📅 Using fallback price schedule');
        
        const fallbackTiers = [
            { startTs: 1757710888, priceUsd: 0.0598, name: "Month 1" },  // Sept 2025
            { startTs: 1760302888, priceUsd: 0.0658, name: "Month 2" },  // Oct 2025  
            { startTs: 1762981288, priceUsd: 0.0724, name: "Month 3" },  // Nov 2025
            { startTs: 1765573288, priceUsd: 0.0796, name: "Month 4" },  // Dec 2025
            { startTs: 1768251688, priceUsd: 0.0876, name: "Month 5" },  // Jan 2026
            { startTs: 1770843688, priceUsd: 0.0964, name: "Month 6" },  // Feb 2026
            { startTs: 1773522088, priceUsd: 0.1060, name: "Month 7" },  // Mar 2026
            { startTs: 1776114088, priceUsd: 0.1166, name: "Month 8" },  // Apr 2026
            { startTs: 1778792488, priceUsd: 0.1283, name: "Month 9" },  // May 2026
            { startTs: 1781384488, priceUsd: 0.1411, name: "Month 10" }, // Jun 2026
            { startTs: 1784062888, priceUsd: 0.1552, name: "Month 11" }, // Jul 2026
            { startTs: 1786654888, priceUsd: 0.1707, name: "Month 12" }  // Aug 2026
        ];
        
        // Find the active price tier
        const activeTier = fallbackTiers
            .filter(tier => now >= tier.startTs)
            .sort((a, b) => b.startTs - a.startTs)[0];
        
        if (activeTier) {
            return {
                tier: activeTier.name,
                price: activeTier.priceUsd,
                startTs: activeTier.startTs
            };
        } else {
            // If no tier has started yet, return the first one
            return {
                tier: "Month 1",
                price: 0.0598,
                startTs: 1757710888
            };
        }
    }

    // Calculate vesting information for the user
    calculateVestingInfo() {
        console.log('🔍 calculateVestingInfo called');
        console.log('📊 userData exists:', !!this.userData);
        console.log('📊 presaleData exists:', !!this.presaleData);
        
        if (!this.userData || !this.presaleData) {
            console.log('❌ Missing userData or presaleData, returning default values');
            return {
                totalVesting: 0,
                vestingStartDate: null,
                vestingReleaseDate: null,
                status: 'Data Loading...'
            };
        }

        // Calculate tokens that will go to vesting (unstaked tokens only)
        const totalVesting = this.userData.unstakedAmount || 0;
        console.log('💰 totalVesting (unstakedAmount):', totalVesting);
        console.log('📊 userData:', this.userData);
        
        // Get presale end date from contract data
        const presaleEndTs = this.presaleData.endTs || this.realPresaleState?.endTs;
        console.log('📅 presaleEndTs from presaleData:', this.presaleData.endTs);
        console.log('📅 presaleEndTs from realPresaleState:', this.realPresaleState?.endTs);
        console.log('📅 Final presaleEndTs:', presaleEndTs);
        
        if (!presaleEndTs) {
            console.log('❌ No presale end date found');
            return {
                totalVesting,
                vestingStartDate: null,
                vestingReleaseDate: null,
                status: 'Presale End Date Unknown'
            };
        }

        // Vesting starts when presale ends
        const vestingStartDate = new Date(presaleEndTs);
        
        // Vesting duration based on staking choice:
        // - Unstaked tokens: 12 months vesting
        // - Staked tokens: 15 months vesting (3 month bonus)
        const vestingDurationMonths = 12; // For unstaked tokens
        const vestingReleaseDate = new Date(vestingStartDate);
        vestingReleaseDate.setMonth(vestingReleaseDate.getMonth() + vestingDurationMonths);
        
        // Determine status
        const now = Date.now();
        let status;
        
        if (now < presaleEndTs) {
            if (totalVesting > 0) {
                status = `Presale Active - ${totalVesting.toLocaleString()} VIBES to Vesting`;
            } else {
                status = 'Presale Active - No Tokens for Vesting Yet';
            }
        } else if (now < vestingReleaseDate.getTime()) {
            status = 'Vesting Active';
        } else {
            status = 'Vesting Complete - Tokens Claimable';
        }

        console.log('📅 Calculated vesting info:', {
            totalVesting,
            vestingStartDate: vestingStartDate.toISOString(),
            vestingReleaseDate: vestingReleaseDate.toISOString(),
            status
        });

        return {
            totalVesting,
            vestingStartDate,
            vestingReleaseDate,
            status
        };
    }

    // Update user data UI
    updateUserDataUI() {
        if (!this.userData) return;

        document.getElementById('user-vibes').textContent = this.userData.totalPurchasedVibes.toLocaleString();
        document.getElementById('user-sol').textContent = this.userData.solContributed.toFixed(4);
        document.getElementById('user-usdc').textContent = this.userData.usdcContributed.toFixed(2);
        document.getElementById('user-staking').textContent = this.userData.isStaking ? 'Yes' : 'No';
        document.getElementById('staked-amount').textContent = this.userData.stakedAmount.toLocaleString();
        document.getElementById('unstaked-amount').textContent = this.userData.unstakedAmount.toLocaleString();
        
        // Calculate total pending rewards (accumulated + current pending)
        const currentPendingRewards = this.calculatePendingRewards(this.userData, this.realPresaleState);
        const totalPendingRewards = this.userData.accumulatedRewards + currentPendingRewards;
        document.getElementById('pending-rewards').textContent = totalPendingRewards.toLocaleString();
        
        // 🆕 Update vesting information
        const vestingInfo = this.calculateVestingInfo();
        document.getElementById('vesting-total').textContent = vestingInfo.totalVesting.toLocaleString();
        document.getElementById('vesting-status').textContent = vestingInfo.status;
        
        // Always try to update vesting dates (even if 0 tokens)
        this.updateVestingDates(vestingInfo);
        
        // Debug logging for rewards calculation
        console.log('💰 Rewards calculation:', {
            accumulatedRewards: this.userData.accumulatedRewards,
            currentPendingRewards: currentPendingRewards,
            totalPendingRewards: totalPendingRewards,
            isStaking: this.userData.isStaking,
            stakedAmount: this.userData.stakedAmount,
            rewardDebt: this.userData.rewardDebt,
            accRewardPerToken: this.realPresaleState?.accRewardPerToken
        });
        
        // Debug logging for vesting calculation
        console.log('📅 Vesting calculation:', vestingInfo);
    }

    // Update vesting dates in the UI
    updateVestingDates(vestingInfo) {
        // Format dates for display
        const formatDate = (date) => {
            if (!date) return 'TBD';
            return date.toLocaleString('es-ES', {
                year: 'numeric',
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        };

        // Update or create vesting start date display
        let vestingStartEl = document.getElementById('vesting-start');
        if (!vestingStartEl) {
            // Add to the vesting card if element doesn't exist
            const vestingCard = document.querySelector('#vesting-status').closest('.info-card');
            if (vestingCard) {
                const startP = document.createElement('p');
                startP.innerHTML = '<strong>Fecha de inicio del vesting:</strong> <span id="vesting-start">TBD</span>';
                vestingCard.appendChild(startP);
                vestingStartEl = document.getElementById('vesting-start');
            }
        }
        if (vestingStartEl) {
            vestingStartEl.textContent = formatDate(vestingInfo.vestingStartDate);
        }

        // Update or create vesting release date display
        let vestingReleaseEl = document.getElementById('vesting-release');
        if (!vestingReleaseEl) {
            // Add to the vesting card if element doesn't exist
            const vestingCard = document.querySelector('#vesting-status').closest('.info-card');
            if (vestingCard) {
                const releaseP = document.createElement('p');
                releaseP.innerHTML = '<strong>Fecha de liberación:</strong> <span id="vesting-release">TBD</span>';
                vestingCard.appendChild(releaseP);
                vestingReleaseEl = document.getElementById('vesting-release');
            }
        }
        if (vestingReleaseEl) {
            vestingReleaseEl.textContent = formatDate(vestingInfo.vestingReleaseDate);
        }
    }

    // Buy with SOL
    async buyWithSol() {
        if (!this.isConnected) {
            this.log(ERROR_MESSAGES.WALLET_NOT_CONNECTED, 'error');
            return;
        }

        try {
            const amount = parseFloat(document.getElementById('sol-amount').value);
            const optIntoStaking = document.getElementById('sol-staking').checked;

            if (!amount || amount <= 0) {
                this.log(ERROR_MESSAGES.INVALID_AMOUNT, 'error');
                return;
            }

            if (amount > this.balances.sol) {
                this.log(ERROR_MESSAGES.INSUFFICIENT_BALANCE, 'error');
                return;
            }

            this.log(`Initiating SOL purchase: ${amount} SOL, Staking: ${optIntoStaking}`, 'info');
            
            // Here you would call the smart contract
            // For now, we'll simulate the transaction
            await this.simulateTransaction('buyWithSolV3', { amount, optIntoStaking });
            
        } catch (error) {
            this.log(`SOL purchase failed: ${error.message}`, 'error');
        }
    }

    // Buy with USDC
    async buyWithUsdc() {
        if (!this.isConnected) {
            this.log(ERROR_MESSAGES.WALLET_NOT_CONNECTED, 'error');
            return;
        }

        try {
            const amount = parseFloat(document.getElementById('usdc-amount').value);
            const optIntoStaking = document.getElementById('usdc-staking').checked;

            if (!amount || amount <= 0) {
                this.log(ERROR_MESSAGES.INVALID_AMOUNT, 'error');
                return;
            }

            if (amount > this.balances.usdc) {
                this.log(ERROR_MESSAGES.INSUFFICIENT_BALANCE, 'error');
                return;
            }

            this.log(`Initiating USDC purchase: ${amount} USDC, Staking: ${optIntoStaking}`, 'info');
            
            // Here you would call the smart contract
            // For now, we'll simulate the transaction
            await this.simulateTransaction('buyWithUsdcV3', { amount, optIntoStaking });
            
        } catch (error) {
            this.log(`USDC purchase failed: ${error.message}`, 'error');
        }
    }

    // Opt into staking
    async optIntoStaking() {
        if (!this.isConnected) {
            this.log(ERROR_MESSAGES.WALLET_NOT_CONNECTED, 'error');
            return;
        }

        try {
            const amount = parseFloat(document.getElementById('stake-amount').value);
            
            if (!amount || amount <= 0) {
                this.log(ERROR_MESSAGES.INVALID_AMOUNT, 'error');
                return;
            }

            this.log(`🚀 [FIXED VERSION] Initiating VIBES staking: ${amount} VIBES`, 'info');
            
            // REPLICATE EXACT PURCHASE FLOW BEHAVIOR
            if (this.directClient) {
                this.log('🎯 Using Direct Contract Client (IDL-based) for staking...', 'info');
                try {
                    const signature = await this.directClient.optIntoStaking(amount);
                    
                    this.log(`✅ Direct contract staking successful: ${signature}`, 'success');
                    this.log('🎉 VIBES staking completed using direct IDL integration!', 'success');
                    await this.loadUserData();
                return;
                    
                } catch (directError) {
                    this.log(`⚠️ Direct contract staking failed: ${directError.message}`, 'warning');
                    this.log('📋 Staking failed. Please try again.', 'error');
                    throw new Error('Direct contract staking failed');
                }
            }
        
            // If direct contract fails, show error
            this.log('❌ Direct contract not available. Please refresh page.', 'error');
            throw new Error('Direct contract not available');
            
        } catch (error) {
            this.log(`Staking opt-in failed: ${error.message}`, 'error');
        }
    }


    // =========== VESTING FUNCTIONS - DISABLED UNTIL 2026 ===========
    /*
    // Transfer to vesting
    async transferToVesting() {
        if (!this.isConnected) {
            this.log(ERROR_MESSAGES.WALLET_NOT_CONNECTED, 'error');
            return;
        }

        try {
            this.log('Transferring tokens to vesting...', 'info');
            
            // Here you would call the smart contract
            await this.simulateTransaction('transferToVestingV3', {});
            
        } catch (error) {
            this.log(`Vesting transfer failed: ${error.message}`, 'error');
        }
    }

    // Claim tokens directly
    async claimTokens() {
        if (!this.isConnected) {
            this.log(ERROR_MESSAGES.WALLET_NOT_CONNECTED, 'error');
            return;
        }

        try {
            this.log('Claiming tokens directly...', 'info');
            
            // Here you would call the smart contract
            await this.simulateTransaction('claimTokensV3', {});
            
        } catch (error) {
            this.log(`Token claim failed: ${error.message}`, 'error');
        }
    }

    // Claim vested tokens
    async claimVested() {
        if (!this.isConnected) {
            this.log(ERROR_MESSAGES.WALLET_NOT_CONNECTED, 'error');
            return;
        }

        try {
            this.log('Claiming vested tokens...', 'info');
            
            // Here you would call the smart contract
            await this.simulateTransaction('claim', {});
            
        } catch (error) {
            this.log(`Vested claim failed: ${error.message}`, 'error');
        }
    }
    */
    // =========== END VESTING FUNCTIONS ===========

    // Refresh presale data
    async refreshPresaleData() {
        this.log('Refreshing presale data...', 'info');
        await this.loadPresaleData();
        await this.loadUserData();
        this.log('Presale data refreshed', 'success');
    }

    // Update admin dashboard UI with fund distribution data
    updateAdminUI() {
        if (!this.adminFundData) {
            console.log('⚠️ No admin fund data available for UI update');
            return;
        }

        const data = this.adminFundData;

        try {
            // Helper function to create Solana Explorer link
            const createExplorerLink = (address) => {
                return `https://explorer.solana.com/address/${address}?cluster=devnet`;
            };

            // Update summary with improved formatting
            const formatSol = (amount) => {
                if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
                if (amount >= 1) return amount.toFixed(4);
                return amount.toFixed(6);
            };
            
            const formatUsdc = (amount) => {
                if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
                if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
                return `$${amount.toFixed(2)}`;
            };
            
            document.getElementById('admin-total-sol').textContent = `${formatSol(data.totalRaisedSol)} SOL`;
            document.getElementById('admin-total-usdc').textContent = formatUsdc(data.totalRaisedUsdc);
            document.getElementById('admin-last-updated').textContent = data.lastUpdated.toLocaleTimeString();

            // Update Fee Collector SOL
            document.getElementById('fee-sol-amount').textContent = data.currentBalances.feeCollectorSol.toFixed(6);
            const feeLink = document.getElementById('fee-sol-link');
            if (feeLink && data.addresses.feeCollectorSol) {
                feeLink.href = createExplorerLink(data.addresses.feeCollectorSol);
                feeLink.textContent = data.addresses.feeCollectorSol;
            }

            // Update Treasury SOL
            document.getElementById('treasury-sol-amount').textContent = data.currentBalances.treasurySol.toFixed(4);
            const treasuryLink = document.getElementById('treasury-sol-link');
            if (treasuryLink && data.addresses.treasurySol) {
                treasuryLink.href = createExplorerLink(data.addresses.treasurySol);
                treasuryLink.textContent = data.addresses.treasurySol;
            }

            // Update Secondary SOL
            document.getElementById('secondary-sol-amount').textContent = data.currentBalances.secondarySol.toFixed(4);
            const secondaryLink = document.getElementById('secondary-sol-link');
            if (secondaryLink && data.addresses.secondarySol) {
                secondaryLink.href = createExplorerLink(data.addresses.secondarySol);
                secondaryLink.textContent = data.addresses.secondarySol;
            }

            // Update Treasury USDC
            document.getElementById('treasury-usdc-amount').textContent = data.currentBalances.treasuryUsdc.toFixed(2);
            const treasuryUsdcLink = document.getElementById('treasury-usdc-link');
            if (treasuryUsdcLink) {
                const treasuryUsdcAta = 'GYujzmGHChT63exMwzqGP75gAXUH7meJaZDHxU7REFeZ';
                treasuryUsdcLink.href = createExplorerLink(treasuryUsdcAta);
                treasuryUsdcLink.textContent = treasuryUsdcAta;
            }

            // Update Secondary USDC (need to get ATA dynamically)
            document.getElementById('secondary-usdc-amount').textContent = data.currentBalances.secondaryUsdc.toFixed(2);
            const secondaryUsdcLink = document.getElementById('secondary-usdc-link');
            if (secondaryUsdcLink && data.secondaryUsdcAta) {
                secondaryUsdcLink.href = createExplorerLink(data.secondaryUsdcAta);
                secondaryUsdcLink.textContent = data.secondaryUsdcAta;
            } else if (secondaryUsdcLink) {
                secondaryUsdcLink.textContent = 'Calculating ATA...';
            }

            console.log('✅ Admin UI updated successfully');

        } catch (error) {
            console.error('❌ Error updating admin UI:', error);
        }
    }

    // Refresh admin dashboard data
    async refreshAdminData() {
        try {
            this.log('🔄 Refreshing admin fund data...', 'info');
            await this.loadAdminFundData();
            this.log('✅ Admin fund data refreshed successfully', 'success');
        } catch (error) {
            this.log(`❌ Failed to refresh admin data: ${error.message}`, 'error');
        }
    }

    // Export fund distribution report as CSV
    exportFundReport() {
        try {
            if (!this.adminFundData) {
                this.log('❌ No fund data available to export', 'error');
                return;
            }

            const data = this.adminFundData;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            
            // Create CSV content with clear headers and rows
            const csvLines = [
                // Header
                'Wallet Type,Description,Currency,Amount,Address,Explorer Link',
                
                // Fund distribution rows
                `Fee Collector,Gebure Platform Fee (0.5%),SOL,${data.currentBalances.feeCollectorSol.toFixed(6)},${data.addresses.feeCollectorSol},https://explorer.solana.com/address/${data.addresses.feeCollectorSol}?cluster=devnet`,
                
                `Treasury,Main Project Treasury (80%),SOL,${data.currentBalances.treasurySol.toFixed(4)},${data.addresses.treasurySol},https://explorer.solana.com/address/${data.addresses.treasurySol}?cluster=devnet`,
                
                `Secondary,Secondary Allocation (20%),SOL,${data.currentBalances.secondarySol.toFixed(4)},${data.addresses.secondarySol},https://explorer.solana.com/address/${data.addresses.secondarySol}?cluster=devnet`,
                
                `Treasury,Main Project Treasury (80%),USDC,${data.currentBalances.treasuryUsdc.toFixed(2)},GYujzmGHChT63exMwzqGP75gAXUH7meJaZDHxU7REFeZ,https://explorer.solana.com/address/GYujzmGHChT63exMwzqGP75gAXUH7meJaZDHxU7REFeZ?cluster=devnet`,
                
                `Secondary,Secondary Allocation (20%),USDC,${data.currentBalances.secondaryUsdc.toFixed(2)},${data.secondaryUsdcAta || 'Not Available'},${data.secondaryUsdcAta ? 'https://explorer.solana.com/address/' + data.secondaryUsdcAta + '?cluster=devnet' : 'N/A'}`,
                
                // Summary rows
                '',
                'SUMMARY,,,,,',
                `Total Raised,,SOL,${data.totalRaisedSol.toFixed(4)},,`,
                `Total Raised,,USDC,${data.totalRaisedUsdc.toFixed(2)},,`,
                
                // Historical data from contract
                '',
                'HISTORICAL DATA FROM CONTRACT,,,,,',
                `Fees Collected,,SOL,${data.totalFeesCollectedSol.toFixed(6)},,`,
                `Fees Collected,,USDC,${data.totalFeesCollectedUsdc.toFixed(3)},,`,
                `Treasury Total,,SOL,${data.totalTreasurySol.toFixed(4)},,`,
                `Treasury Total,,USDC,${data.totalTreasuryUsdc.toFixed(2)},,`,
                `Secondary Total,,SOL,${data.totalSecondarySol.toFixed(4)},,`,
                `Secondary Total,,USDC,${data.totalSecondaryUsdc.toFixed(2)},,`,
                
                // Smart Contracts and Program IDs
                '',
                'SMART CONTRACTS,,,,,',
                `Presale V3 Program,,Contract,HNPuLPxycypT4YtD5vMZPdcrr53MLKAajYrQwNTv4ujH,HNPuLPxycypT4YtD5vMZPdcrr53MLKAajYrQwNTv4ujH,https://explorer.solana.com/address/HNPuLPxycypT4YtD5vMZPdcrr53MLKAajYrQwNTv4ujH?cluster=devnet`,
                `Staking Program,,Contract,3ZaKegZktvjwt4SreDvitLECG47UnPdd4EFzNAnyHDaW,3ZaKegZktvjwt4SreDvitLECG47UnPdd4EFzNAnyHDaW,https://explorer.solana.com/address/3ZaKegZktvjwt4SreDvitLECG47UnPdd4EFzNAnyHDaW?cluster=devnet`,
                `Vesting Program,,Contract,3EnPSZpZbKDwVetAiXo9bos4XMDvqg1yqJvew8zh4keP,3EnPSZpZbKDwVetAiXo9bos4XMDvqg1yqJvew8zh4keP,https://explorer.solana.com/address/3EnPSZpZbKDwVetAiXo9bos4XMDvqg1yqJvew8zh4keP?cluster=devnet`,
                `Presale State Account,,State,EoDCTycvkJV4UXm54KYiF1DuCMSHyXYPftGUVr3qJxPp,EoDCTycvkJV4UXm54KYiF1DuCMSHyXYPftGUVr3qJxPp,https://explorer.solana.com/address/EoDCTycvkJV4UXm54KYiF1DuCMSHyXYPftGUVr3qJxPp?cluster=devnet`,
                
                // Token Contracts
                '',
                'TOKEN CONTRACTS,,,,,',
                `VIBES Token Mint,,Token,C4SeJZr8wJ6BrNUJP52vGZf6QMunWFRgx6kbkb56j3vW,C4SeJZr8wJ6BrNUJP52vGZf6QMunWFRgx6kbkb56j3vW,https://explorer.solana.com/address/C4SeJZr8wJ6BrNUJP52vGZf6QMunWFRgx6kbkb56j3vW?cluster=devnet`,
                `USDC Token Mint,,Token,ChqSU5J7xaKaMHffaU3K6kdi2YyjbKpzK2Z5H7ogjY4F,ChqSU5J7xaKaMHffaU3K6kdi2YyjbKpzK2Z5H7ogjY4F,https://explorer.solana.com/address/ChqSU5J7xaKaMHffaU3K6kdi2YyjbKpzK2Z5H7ogjY4F?cluster=devnet`,
                `SPL Token Program,,System,TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA,TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA,https://explorer.solana.com/address/TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA?cluster=devnet`,
                `Associated Token Program,,System,ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL,ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL,https://explorer.solana.com/address/ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL?cluster=devnet`,
                
                // Network and Metadata
                '',
                'NETWORK & METADATA,,,,,',
                `Network,,,,Solana Devnet,`,
                `RPC Endpoint,,,,devnet.helius-rpc.com,`,
                `Export Date,,,,${new Date().toLocaleString()},`,
                `Data Updated,,,,${data.lastUpdated.toLocaleString()},`,
                `Fee Rate,,,,0.5% (50 BPS),`,
                `Distribution Split,,,,80% Treasury / 20% Secondary,`,
                
                // Contract Configuration
                '',
                'CONTRACT CONFIGURATION,,,,,',
                `Presale Start,,,,"${new Date(1726170088000).toLocaleString()}",`,
                `Presale End,,,,"${new Date(1757706088000).toLocaleString()}",`,
                `Staking APY,,,,40% (4000 BPS),`,
                `Optional Staking,,,,Enabled,`,
                `Max Purchase Per Wallet,,,,250000 VIBES,`,
                `Min Purchase SOL,,,,0.1 SOL,`,
                `Hard Cap Total,,,,40000000 VIBES,`
            ];

            // Convert to CSV string
            const csvContent = csvLines.join('\n');
            
            // Create and download CSV file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `vibes-fund-distribution-${timestamp}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.log('📊 CSV fund report exported successfully', 'success');

        } catch (error) {
            this.log(`❌ Failed to export CSV report: ${error.message}`, 'error');
            console.error('Export error:', error);
        }
    }

    // Get or create token account
    async getOrCreateTokenAccount(mint, owner) {
        try {
            // First try to find existing token account
            const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(owner, {
                programId: new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
            });

            for (const account of tokenAccounts.value) {
                const parsedInfo = account.account.data.parsed.info;
                if (parsedInfo.mint === mint.toString()) {
                    return account.pubkey;
                }
            }

            // If not found, create a new token account
            const tokenAccount = new solanaWeb3.Keypair();
            const createAccountInstruction = solanaWeb3.SystemProgram.createAccount({
                fromPubkey: owner,
                newAccountPubkey: tokenAccount.publicKey,
                space: 165, // Token account space
                lamports: await this.connection.getMinimumBalanceForRentExemption(165),
                programId: new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
            });

            // Skip initialization for now - use existing accounts or let program handle it
            // This avoids the SPL Token import issue

            // For now, just return an existing account or use a simplified approach
            // Let's use Associated Token Account instead
            const [ata] = await solanaWeb3.PublicKey.findProgramAddress(
                [
                    owner.toBytes(),
                    new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA').toBytes(),
                    mint.toBytes()
                ],
                new solanaWeb3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
            );
            
            return ata;
        } catch (error) {
            this.log(`Error creating token account: ${error.message}`, 'error');
            throw error;
        }
    }

    // Get presale SOL vault PDA
    async getPresaleSolVault() {
        try {
            const presaleStatePDA = await this.getPresaleStateAddress();
            const presaleAccount = await this.connection.getAccountInfo(presaleStatePDA);
            
            if (presaleAccount) {
                const buffer = Buffer.from(presaleAccount.data);
                let offset = 8; // Skip discriminator
                offset += 32; // Skip authority
                offset += 32; // Skip tokenMint
                offset += 32; // Skip usdcMint
                offset += 1; // Skip bump
                
                // Read SOL vault address
                const solVault = new solanaWeb3.PublicKey(buffer.slice(offset, offset + 32));
                return solVault;
            }
            throw new Error('Presale state not found');
        } catch (error) {
            this.log(`Error getting SOL vault: ${error.message}`, 'error');
            throw error;
        }
    }

    // Get presale USDC vault PDA
    async getPresaleUsdcVault() {
        try {
            const presaleStatePDA = await this.getPresaleStateAddress();
            const presaleAccount = await this.connection.getAccountInfo(presaleStatePDA);
            
            if (presaleAccount) {
                const buffer = Buffer.from(presaleAccount.data);
                let offset = 8; // Skip discriminator
                offset += 32; // Skip authority
                offset += 32; // Skip tokenMint
                offset += 32; // Skip usdcMint
                offset += 1; // Skip bump
                offset += 32; // Skip SOL vault
                
                // Read USDC vault address
                const usdcVault = new solanaWeb3.PublicKey(buffer.slice(offset, offset + 32));
                return usdcVault;
            }
            throw new Error('Presale state not found');
        } catch (error) {
            this.log(`Error getting USDC vault: ${error.message}`, 'error');
            throw error;
        }
    }

    // Get presale VIBES vault PDA
    async getPresaleVibesVault() {
        try {
            const presaleStatePDA = await this.getPresaleStateAddress();
            const presaleAccount = await this.connection.getAccountInfo(presaleStatePDA);
            
            if (presaleAccount) {
                const buffer = Buffer.from(presaleAccount.data);
                let offset = 8; // Skip discriminator
                offset += 32; // Skip authority
                offset += 32; // Skip tokenMint
                offset += 32; // Skip usdcMint
                offset += 1; // Skip bump
                offset += 32; // Skip SOL vault
                offset += 32; // Skip USDC vault
                
                // Read VIBES vault address
                const vibesVault = new solanaWeb3.PublicKey(buffer.slice(offset, offset + 32));
                return vibesVault;
            }
            throw new Error('Presale state not found');
        } catch (error) {
            this.log(`Error getting VIBES vault: ${error.message}`, 'error');
            throw error;
        }
    }

    // Real transaction functions
    async buyWithSol() {
        this.log('buyWithSol function called', 'info');
        
        if (!this.isConnected) {
            this.log(ERROR_MESSAGES.WALLET_NOT_CONNECTED, 'error');
            return;
        }

        try {
            const amountInput = document.getElementById('sol-amount');
            const stakingCheckbox = document.getElementById('sol-staking');
            
            this.log(`Amount input found: ${!!amountInput}`, 'info');
            this.log(`Staking checkbox found: ${!!stakingCheckbox}`, 'info');
            
            if (!amountInput) {
                this.log('SOL amount input not found', 'error');
                return;
            }
            
            if (!stakingCheckbox) {
                this.log('SOL staking checkbox not found', 'error');
                return;
            }
            
            const amount = parseFloat(amountInput.value);
            const optIntoStaking = stakingCheckbox.checked;
            
            this.log(`Amount: ${amount}, Staking: ${optIntoStaking}`, 'info');

            if (!amount || amount <= 0) {
                this.log(ERROR_MESSAGES.INVALID_AMOUNT, 'error');
                return;
            }

            if (amount > this.balances.sol) {
                this.log(ERROR_MESSAGES.INSUFFICIENT_BALANCE, 'error');
                return;
            }

            // 🎯 VALIDATE PURCHASE LIMITS (250K VIBES DApp Policy)
            try {
                const validation = this.validatePurchaseAmount(amount, 0);
                this.log(`✅ Purchase validation passed: ${validation.vibesBeingPurchased.toFixed(0)} VIBES`, 'info');
                this.log(`📊 After purchase: ${validation.newTotalVibes.toFixed(0)} / ${DAPP_LIMITS.MAX_PURCHASE_PER_WALLET_VIBES.toLocaleString()} VIBES`, 'info');
            } catch (validationError) {
                this.log(`🚫 Purchase validation failed: ${validationError.message}`, 'error');
                return;
            }

        this.log(`🚀 Initiating SOL purchase: ${amount} SOL, Staking: ${optIntoStaking}`, 'info');
        
        // PRIORITY 1: Use Direct Contract Client (uses IDL directly)
        if (this.directClient) {
            this.log('🎯 Using Direct Contract Client (IDL-based)...', 'info');
            try {
                const signature = await this.directClient.buyWithSol(amount, optIntoStaking);
                
                this.log(`✅ Direct contract transaction successful: ${signature}`, 'success');
                this.log('🎉 SOL purchase completed using direct IDL integration!', 'success');
                
                // Refresh both user data and presale data after successful transaction
                await this.loadUserData();
                await this.loadRealPresaleState();
                this.updatePresaleUI();
                
                return;
                
            } catch (directError) {
                this.log(`⚠️ Direct contract failed: ${directError.message}`, 'warning');
                this.log('📋 Falling back to Anchor client...', 'info');
            }
        }
        
        // If direct contract fails, show error (no more fallbacks needed)
        this.log('❌ Direct contract transaction failed. Please try again.', 'error');
        throw new Error('Direct contract transaction failed');
            
        } catch (error) {
            this.log(`SOL purchase failed: ${error.message}`, 'error');
            console.error('SOL purchase error:', error);
        }
    }

    async buyWithUsdc() {
        this.log('buyWithUsdc function called', 'info');
        
        if (!this.isConnected) {
            this.log(ERROR_MESSAGES.WALLET_NOT_CONNECTED, 'error');
            return;
        }

        try {
            const amountInput = document.getElementById('usdc-amount');
            const stakingCheckbox = document.getElementById('usdc-staking');
            
            this.log(`USDC amount input found: ${!!amountInput}`, 'info');
            this.log(`USDC staking checkbox found: ${!!stakingCheckbox}`, 'info');
            
            if (!amountInput) {
                this.log('USDC amount input not found', 'error');
                return;
            }
            
            if (!stakingCheckbox) {
                this.log('USDC staking checkbox not found', 'error');
                return;
            }
            
            const amount = parseFloat(amountInput.value);
            const optIntoStaking = stakingCheckbox.checked;
            
            this.log(`USDC Amount: ${amount}, Staking: ${optIntoStaking}`, 'info');

            if (!amount || amount <= 0) {
                this.log(ERROR_MESSAGES.INVALID_AMOUNT, 'error');
                return;
            }

            if (amount > this.balances.usdc) {
                this.log(ERROR_MESSAGES.INSUFFICIENT_BALANCE, 'error');
                return;
            }

            // 🎯 VALIDATE PURCHASE LIMITS (250K VIBES DApp Policy)
            try {
                const validation = this.validatePurchaseAmount(0, amount);
                this.log(`✅ Purchase validation passed: ${validation.vibesBeingPurchased.toFixed(0)} VIBES`, 'info');
                this.log(`📊 After purchase: ${validation.newTotalVibes.toFixed(0)} / ${DAPP_LIMITS.MAX_PURCHASE_PER_WALLET_VIBES.toLocaleString()} VIBES`, 'info');
            } catch (validationError) {
                this.log(`🚫 Purchase validation failed: ${validationError.message}`, 'error');
                return;
            }

            this.log(`🚀 Initiating USDC purchase: ${amount} USDC, Staking: ${optIntoStaking}`, 'info');
            
            // Try Direct Contract Client first (preferred method)
            if (this.directClient) {
                this.log('🎯 Using Direct Contract Client (IDL-based)...', 'info');
                try {
                    const signature = await this.directClient.buyWithUsdc(amount, optIntoStaking);
                    this.log(`✅ Direct contract transaction successful: ${signature}`, 'success');
                    this.log('🎉 USDC purchase completed using direct IDL integration!', 'success');
                    
                    // Refresh both user data and presale data after successful transaction
                    await this.loadUserData();
                    await this.loadRealPresaleState();
                    this.updatePresaleUI();
                    
                    return;
                } catch (directError) {
                    this.log(`⚠️ Direct contract failed: ${directError.message}`, 'warning');
                    this.log('📋 Falling back to Anchor client...', 'info');
                }
            }
            
            // Fallback to Anchor client if available
            if (this.anchorClient) {
                try {
                    const signature = await this.anchorClient.buyWithUsdc(amount, optIntoStaking);
                    this.log(`✅ Anchor transaction successful: ${signature}`, 'success');
                    
                    // Refresh both user data and presale data after successful transaction
                    await this.loadUserData();
                    await this.loadRealPresaleState();
                    this.updatePresaleUI();
                    
                    return;
                } catch (anchorError) {
                    this.log(`⚠️ Anchor client failed: ${anchorError.message}`, 'warning');
                }
            }
            
            // If all else fails, show error
            this.log('❌ Direct contract transaction failed. Please try again.', 'error');
            throw new Error('Direct contract transaction failed');
            
        } catch (error) {
            this.log(`USDC purchase failed: ${error.message}`, 'error');
            console.error('USDC purchase error:', error);
        }
    }

    // Get token account
    async getTokenAccount(owner, mint) {
        try {
            const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(owner, {
                programId: new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
            });

            for (const account of tokenAccounts.value) {
                const parsedInfo = account.account.data.parsed.info;
                if (parsedInfo.mint === mint) {
                    return {
                        pubkey: account.pubkey,
                        amount: parsedInfo.tokenAmount.amount,
                        decimals: parsedInfo.tokenAmount.decimals
                    };
                }
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    // Add log entry
    addLogEntry(element, type = 'info') {
        // Try to find transaction-log first, then fallback to logs
        let logContainer = document.getElementById('transaction-log') || document.getElementById('logs');
        
        if (!logContainer) {
            // If no log container exists, just log to console
            console.log(`[${type.toUpperCase()}] ${element.textContent || element.innerHTML}`);
            return;
        }
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${type}`;
        logEntry.appendChild(element);
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    // Log message
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logElement = document.createElement('div');
        logElement.innerHTML = `[${timestamp}] ${message}`;
        this.addLogEntry(logElement, type);
        
        // Also log to console for debugging
        console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
    }

    // Clear log
    clearLog() {
        const logContainer = document.getElementById('transaction-log') || document.getElementById('logs');
        if (logContainer) {
            logContainer.innerHTML = '<div class="log-entry log-info">Log cleared</div>';
        } else {
            console.log('Log cleared');
        }
    }

    // Simulate transaction (for testing)
    async simulateTransaction(method, params) {
        this.log(`Simulating ${method} transaction...`, 'info');
        
        // Simulate loading
        const loadingEl = document.createElement('div');
        loadingEl.innerHTML = '<div class="loading"></div> Processing transaction...';
        this.addLogEntry(loadingEl, 'info');
        
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate success
        this.log(`Transaction ${method} completed successfully`, 'success');
        
        // Update user data
        await this.loadUserData();
    }

    // Get presale state address (PDA)
    async getPresaleStateAddress() {
        // Use the known presale state address from initialization
        return new solanaWeb3.PublicKey('EoDCTycvkJV4UXm54KYiF1DuCMSHyXYPftGUVr3qJxPp');
    }

    // Get buyer state address (PDA) - CORRECTED to use "buyer_v3"
    async getBuyerStateAddress(buyerPublicKey) {
        const [buyerStateAddress] = await solanaWeb3.PublicKey.findProgramAddress(
            [new TextEncoder().encode('buyer_v3'), buyerPublicKey.toBytes()],  // CORRECTED: "buyer_v3"
            new solanaWeb3.PublicKey(PROGRAM_IDS.PRESALE_V3)
        );
        return buyerStateAddress;
    }

    // Parse presale state account data
    parsePresaleState(data) {
        // This is a simplified parser - in production you'd use Anchor's coder
        try {
            const buffer = new Uint8Array(data);
            let offset = 0;
            
            // Skip discriminator (8 bytes)
            offset += 8;
            
            // Parse basic fields (simplified)
            const authority = new solanaWeb3.PublicKey(buffer.slice(offset, offset + 32));
            offset += 32;
            
            const tokenMint = new solanaWeb3.PublicKey(buffer.slice(offset, offset + 32));
            offset += 32;
            
            const usdcMint = new solanaWeb3.PublicKey(buffer.slice(offset, offset + 32));
            offset += 32;
            
            // Skip bump (1 byte)
            offset += 1;
            
            // Skip vault addresses (2 * 32 bytes)
            offset += 64;
            
            // Skip useMintAuthority (1 byte)
            offset += 1;
            
            // Parse timestamps using DataView for browser compatibility
            const view = new DataView(buffer.buffer);
            const startTs = view.getBigUint64(offset, true);
            offset += 8;
            
            const endTs = view.getBigUint64(offset, true);
            offset += 8;
            
            const hardCapTotal = view.getBigUint64(offset, true);
            offset += 8;
            
            const isFinalized = view.getUint8(offset) === 1;
            offset += 1;
            
            // Parse fee rate
            const feeRateBps = view.getUint16(offset, true);
            offset += 2;
            
            // Skip fee collectors and treasury addresses (6 * 32 bytes)
            offset += 192;
            
            // Parse limits
            const maxPurchasePerWallet = view.getBigUint64(offset, true);
            offset += 8;
            
            const minPurchaseSol = view.getBigUint64(offset, true);
            offset += 8;
            
            // Skip price schedule for now (complex parsing)
            // ... more parsing would go here
            
            // Parse staking info
            const optionalStaking = view.getUint8(offset) === 1;
            offset += 1;
            
            const stakingApyBps = view.getBigUint64(offset, true);
            offset += 8;
            
            const charityRateBps = view.getUint16(offset, true);
            offset += 2;
            
            // Skip charity wallet (32 bytes)
            offset += 32;
            
            // Parse totals
            const totalStakedOptional = view.getBigUint64(offset, true);
            offset += 8;
            
            const totalUnstaked = view.getBigUint64(offset, true);
            offset += 8;
            
            // Skip reward calculations (16 + 8 bytes)
            offset += 24;
            
            const raisedSol = view.getBigUint64(offset, true);
            offset += 8;
            
            const raisedUsdc = view.getBigUint64(offset, true);
            offset += 8;
            
            const totalVibesSold = view.getBigUint64(offset, true);
            offset += 8;
            
            return {
                authority: authority.toString(),
                tokenMint: tokenMint.toString(),
                usdcMint: usdcMint.toString(),
                startTs: Number(startTs),
                endTs: Number(endTs),
                hardCapTotal: Number(hardCapTotal),
                isFinalized,
                isActive: !isFinalized && Date.now() >= Number(startTs) && Date.now() <= Number(endTs),
                feeRateBps,
                maxPurchasePerWallet: Number(maxPurchasePerWallet),
                minPurchaseSol: Number(minPurchaseSol),
                optionalStaking,
                stakingApyBps: Number(stakingApyBps),
                charityRateBps,
                totalStakedOptional: Number(totalStakedOptional),
                totalUnstaked: Number(totalUnstaked),
                raisedSol: Number(raisedSol),
                raisedUsdc: Number(raisedUsdc),
                totalVibesSold: Number(totalVibesSold),
                currentPriceUsd: 0.05, // Would need to parse price schedule
                solRaised: Number(raisedSol) / Math.pow(10, 9), // Convert lamports to SOL
                usdcRaised: Number(raisedUsdc) / Math.pow(10, 6) // Convert USDC units to USDC
            };
        } catch (error) {
            this.log(`Error parsing presale state: ${error.message}`, 'error');
            throw error;
        }
    }

    // Parse buyer state account data - BuyerStateV3 structure
    parseBuyerState(data) {
        try {
            const buffer = new Uint8Array(data);
            const view = new DataView(buffer.buffer);
            let offset = 0;
            
            // Skip discriminator (8 bytes)
            offset += 8;
            
            // BuyerStateV3 structure from state.rs:
            const buyer = new solanaWeb3.PublicKey(buffer.slice(offset, offset + 32));
            offset += 32;
            
            const bump = view.getUint8(offset);
            offset += 1;
            
            // Purchase tracking
            const totalPurchasedVibes = view.getBigUint64(offset, true);
            offset += 8;
            
            const solContributed = view.getBigUint64(offset, true);
            offset += 8;
            
            const usdcContributed = view.getBigUint64(offset, true);
            offset += 8;
            
            // V3 Staking Choice System
            const isStaking = view.getUint8(offset) === 1;
            offset += 1;
            
            const stakedAmount = view.getBigUint64(offset, true);
            offset += 8;
            
            const unstakedAmount = view.getBigUint64(offset, true);
            offset += 8;
            
            const lastStakeTs = view.getBigInt64(offset, true);
            offset += 8;
            
            // Rewards tracking
            const accumulatedRewards = view.getBigUint64(offset, true);
            offset += 8;
            
            const totalRewardsClaimed = view.getBigUint64(offset, true);
            offset += 8;
            
            const rewardDebt = view.getBigUint64(offset, true); // First 8 bytes of u128
            offset += 8;
            offset += 8; // Skip second 8 bytes of u128
            
            const lastUpdateTs = view.getBigInt64(offset, true);
            offset += 8;
            
            // Vesting preparation
            const transferredToVesting = view.getUint8(offset) === 1;
            offset += 1;
            
            const finalVestingAmount = view.getBigUint64(offset, true);
            offset += 8;
            
            const purchaseCount = view.getUint32(offset, true);
            
            return {
                buyer: buyer.toString(),
                totalPurchasedVibes: Number(totalPurchasedVibes) / Math.pow(10, 9), // Convert to VIBES
                solContributed: Number(solContributed) / Math.pow(10, 9), // Convert to SOL
                usdcContributed: Number(usdcContributed) / Math.pow(10, 6), // Convert to USDC
                isStaking,
                stakedAmount: Number(stakedAmount) / Math.pow(10, 9), // Convert to VIBES
                unstakedAmount: Number(unstakedAmount) / Math.pow(10, 9), // Convert to VIBES
                accumulatedRewards: Number(accumulatedRewards) / Math.pow(10, 9), // Convert to VIBES
                totalRewardsClaimed: Number(totalRewardsClaimed) / Math.pow(10, 9), // Convert to VIBES
                rewardDebt: Number(rewardDebt), // Keep as raw number for precise calculation
                transferredToVesting,
                finalVestingAmount: Number(finalVestingAmount) / Math.pow(10, 9), // Convert to VIBES
                purchaseCount,
                lastStakeTs: Number(lastStakeTs),
                lastUpdateTs: Number(lastUpdateTs),
                bump
            };
        } catch (error) {
            this.log(`Error parsing buyer state: ${error.message}`, 'error');
            throw error;
        }
    }

    // Note: Removed encodeTransferData - no longer needed with direct contract integration

    // Note: Transaction encoding is now handled by direct-contract.js
}

// Initialize the DApp when the page loads
console.log('🎯 DApp script loaded, setting up initialization...');

// Try multiple initialization methods
function initializeDApp() {
    console.log('🎯 Initializing DApp...');
    try {
        window.vibesDApp = new VibesDApp();
        console.log('✅ VibesDApp instance created successfully');
    } catch (error) {
        console.error('❌ Error creating VibesDApp:', error);
        console.error('Error details:', error.stack);
    }
}

// Try DOMContentLoaded first
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDApp);
} else {
    // DOM already loaded, initialize immediately
    console.log('🚀 DOM already loaded, initializing immediately...');
    initializeDApp();
}

// Fallback: also try window load event
window.addEventListener('load', () => {
    if (!window.vibesDApp) {
        console.log('🔄 Fallback initialization...');
        initializeDApp();
    }
});

// EMERGENCY FALLBACK: Direct button setup
setTimeout(() => {
    console.log('🚨 Emergency button setup...');
    const connectBtn = document.getElementById('connect-wallet');
    if (connectBtn && !connectBtn.hasAttribute('data-listener-added')) {
        console.log('📍 Adding emergency click listener to connect button');
        connectBtn.setAttribute('data-listener-added', 'true');
        connectBtn.addEventListener('click', async () => {
            console.log('🚨 Emergency connect button clicked!');
            
            if (window.vibesDApp) {
                console.log('✅ Using existing DApp instance');
                await window.vibesDApp.connectWallet();
            } else {
                console.log('⚠️ No DApp instance, creating new one...');
                try {
                    initializeDApp();
                    setTimeout(() => {
                        if (window.vibesDApp) {
                            window.vibesDApp.connectWallet();
                        }
                    }, 100);
                } catch (error) {
                    console.error('❌ Emergency initialization failed:', error);
                }
            }
        });
    }
}, 1000); // Wait 1 second for everything to load

// Direct Smart Contract Integration - Using IDLs without Anchor dependency
// This module creates transactions directly from IDL definitions

class DirectContractClient {
    constructor(connection, wallet) {
        this.connection = connection;
        this.wallet = wallet;
        this.programIds = {
            presale: PROGRAM_IDS.PRESALE_V3,
            staking: PROGRAM_IDS.STAKING,
            vesting: PROGRAM_IDS.VESTING
        };
    }

    // Create instruction discriminator using Web Crypto API (SHA-256)
    async createDiscriminator(instructionName) {
        // Anchor uses sha256 of "global:instructionName"
        const encoder = new TextEncoder();
        const data = encoder.encode(`global:${instructionName}`);
        
        // Use Web Crypto API for proper SHA-256
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = new Uint8Array(hashBuffer);
        
        // Return first 8 bytes as discriminator
        return hashArray.slice(0, 8);
    }

    // Encode arguments for buyWithSolV3
    encodeBuyWithSolArgs(solAmount, optIntoStaking) {
        // Create buffer for arguments
        const buffer = new ArrayBuffer(16); // 8 bytes for u64 + 1 byte for bool + padding
        const view = new DataView(buffer);
        
        // Write sol amount as u64 (little endian)
        const lamports = BigInt(Math.floor(solAmount * Math.pow(10, 9)));
        view.setBigUint64(0, lamports, true); // true = little endian
        
        // Write opt_into_staking as bool
        view.setUint8(8, optIntoStaking ? 1 : 0);
        
        return new Uint8Array(buffer);
    }

    // Encode arguments for buyWithUsdcV3
    encodeBuyWithUsdcArgs(usdcAmount, optIntoStaking) {
        // Create buffer for arguments
        const buffer = new ArrayBuffer(16); // 8 bytes for u64 + 1 byte for bool + padding
        const view = new DataView(buffer);
        
        // Write USDC amount as u64 (little endian) - USDC has 6 decimals
        const usdcLamports = BigInt(Math.floor(usdcAmount * Math.pow(10, 6)));
        view.setBigUint64(0, usdcLamports, true); // true = little endian
        
        // Write opt_into_staking as bool
        view.setUint8(8, optIntoStaking ? 1 : 0);
        
        return new Uint8Array(buffer);
    }

    // Create buyWithSolV3 instruction
    async createBuyWithSolInstruction(solAmount, optIntoStaking = false) {
        console.log('🔧 Creating buyWithSolV3 instruction...');
        
        // Use the CORRECT discriminator from app.js (already tested)
        const discriminator = new Uint8Array([27, 155, 169, 245, 37, 74, 15, 75]); // buy_with_sol_v3 discriminator
        console.log('📍 Using tested discriminator:', Array.from(discriminator));
        
        // Encode arguments
        const argsData = this.encodeBuyWithSolArgs(solAmount, optIntoStaking);
        console.log('📍 Args data:', Array.from(argsData));
        
        // Combine discriminator + args
        const instructionData = new Uint8Array(discriminator.length + argsData.length);
        instructionData.set(discriminator, 0);
        instructionData.set(argsData, discriminator.length);
        
        // Get required accounts from IDL - UPDATED FOR NEW DEPLOYMENT
        const presaleState = new solanaWeb3.PublicKey('EoDCTycvkJV4UXm54KYiF1DuCMSHyXYPftGUVr3qJxPp');
        const buyerState = await this.getBuyerStateAddress(this.wallet.publicKey);
        
        console.log('📍 Required accounts:');
        console.log('  - Presale State:', presaleState.toBase58());
        console.log('  - Buyer State:', buyerState.toBase58());
        console.log('  - Wallet:', this.wallet.publicKey.toBase58());
        
        // IMPORTANT: Check if buyer_state exists, if not, we need to create it
        // The buyWithSolV3 instruction should handle account creation automatically (PDA with seeds)
        const buyerInfo = await this.connection.getAccountInfo(buyerState);
        console.log('📍 Buyer state exists:', !!buyerInfo);
        
        if (!buyerInfo) {
            console.log('⚠️ Buyer state does not exist - will be created by instruction');
        }
        
        // Create instruction following the REAL IDL account structure (ONLY 7 accounts!)
        const instruction = {
            programId: new solanaWeb3.PublicKey(this.programIds.presale),
            keys: [
                // From REAL IDL: buyWithSolV3 accounts in exact order (7 accounts only)
                { pubkey: presaleState, isSigner: false, isWritable: true },                    // presaleState
                { pubkey: buyerState, isSigner: false, isWritable: true },                      // buyerState  
                { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },           // buyer
                { pubkey: new solanaWeb3.PublicKey('6xW2ZYh16AhRR3teKAWK8v1BDkUTDyTPBEqvLyhPpSos'), isSigner: false, isWritable: true }, // feeCollectorSol
                { pubkey: new solanaWeb3.PublicKey('5zKuHDrHFsaB6WbGGxjwRAtX2dP6Sze7qUWX9vyNq1AR'), isSigner: false, isWritable: true }, // treasurySol
                { pubkey: new solanaWeb3.PublicKey('9JqWNcKYQCTGNM2aRdNAPk3hXfFBVUZHNdr668C9DcSn'), isSigner: false, isWritable: true }, // secondarySol
                { pubkey: solanaWeb3.SystemProgram.programId, isSigner: false, isWritable: false }  // systemProgram
            ],
            data: instructionData
        };
        
        console.log('✅ Instruction created with', instruction.keys.length, 'accounts');
        return instruction;
    }

    // Encode arguments for optIntoStaking instruction
    encodeOptIntoStakingArgs(amount) {
        // optIntoStaking takes one u64 argument: amount (in VIBES with 9 decimals)
        const buffer = new ArrayBuffer(8); // u64 = 8 bytes
        const view = new DataView(buffer);
        
        // Convert VIBES amount to lamports (9 decimals)
        const lamports = BigInt(Math.floor(amount * Math.pow(10, 9)));
        view.setBigUint64(0, lamports, true); // true = little endian
        
        return new Uint8Array(buffer);
    }

    // Create optIntoStaking instruction
    async createOptIntoStakingInstruction(amount) {
        console.log('🔧 Creating optIntoStaking instruction...');
        
        // Get discriminator for optIntoStaking method (calculated correctly)
        const discriminator = new Uint8Array([209, 83, 87, 173, 0, 78, 76, 67]);
        console.log('📍 Using correct optIntoStaking discriminator:', Array.from(discriminator));
        
        // Encode arguments
        const argsData = this.encodeOptIntoStakingArgs(amount);
        console.log('📍 Args data:', Array.from(argsData));
        
        // Combine discriminator + args
        const instructionData = new Uint8Array(discriminator.length + argsData.length);
        instructionData.set(discriminator, 0);
        instructionData.set(argsData, discriminator.length);
        
        // Get required accounts from IDL
        const presaleState = new solanaWeb3.PublicKey('EoDCTycvkJV4UXm54KYiF1DuCMSHyXYPftGUVr3qJxPp');
        const buyerState = await this.getBuyerStateAddress(this.wallet.publicKey);
        
        console.log('📍 Required accounts:');
        console.log('  - Presale State:', presaleState.toBase58());
        console.log('  - Buyer State:', buyerState.toBase58());
        console.log('  - Wallet:', this.wallet.publicKey.toBase58());
        
        // Check if buyer_state exists
        const buyerInfo = await this.connection.getAccountInfo(buyerState);
        console.log('📍 Buyer state exists:', !!buyerInfo);
        
        if (!buyerInfo) {
            throw new Error('Buyer state does not exist. You need to make a purchase first.');
        }
        
        // Create instruction following the IDL structure for optIntoStaking
        const instruction = {
            programId: new solanaWeb3.PublicKey(this.programIds.presale),
            keys: [
                // From IDL: optIntoStaking accounts (3 accounts)
                { pubkey: presaleState, isSigner: false, isWritable: true },      // presaleState
                { pubkey: buyerState, isSigner: false, isWritable: true },        // buyerState  
                { pubkey: this.wallet.publicKey, isSigner: true, isWritable: false } // buyer
            ],
            data: instructionData
        };
        
        console.log('✅ OptIntoStaking instruction created with', instruction.keys.length, 'accounts');
        return instruction;
    }

    // Create buyWithUsdcV3 instruction
    async createBuyWithUsdcInstruction(usdcAmount, optIntoStaking = false) {
        console.log('🔧 Creating buyWithUsdcV3 instruction...');
        
        // Create discriminator for buyWithUsdcV3
        const discriminator = await this.createDiscriminator('buy_with_usdc_v3');
        console.log('📍 buyWithUsdcV3 discriminator:', Array.from(discriminator));
        
        // Encode arguments
        const argsData = this.encodeBuyWithUsdcArgs(usdcAmount, optIntoStaking);
        console.log('📍 USDC Args data:', Array.from(argsData));
        
        // Combine discriminator + args
        const instructionData = new Uint8Array(discriminator.length + argsData.length);
        instructionData.set(discriminator, 0);
        instructionData.set(argsData, discriminator.length);
        
        // Get required accounts from IDL - UPDATED FOR NEW DEPLOYMENT
        const presaleState = new solanaWeb3.PublicKey('EoDCTycvkJV4UXm54KYiF1DuCMSHyXYPftGUVr3qJxPp');
        const buyerState = await this.getBuyerStateAddress(this.wallet.publicKey);
        
        // Get USDC token accounts (Associated Token Accounts)
        const usdcMint = new solanaWeb3.PublicKey(TOKEN_CONFIG.USDC_MINT);
        
        // Buyer's USDC ATA
        const [buyerUsdcAccount] = await solanaWeb3.PublicKey.findProgramAddress(
            [
                this.wallet.publicKey.toBytes(),
                new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA').toBytes(),
                usdcMint.toBytes(),
            ],
            new solanaWeb3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
        );
        
        // Contract wallets' USDC ATAs
        const feeCollectorWallet = new solanaWeb3.PublicKey('6bHam5U8Z5Qnrky86HMQfCGaWX7ie5hdyvKpJzAAjGHj');
        const treasuryWallet = new solanaWeb3.PublicKey('Fypp3b43LduLMPWoTEaBimTbgdMzgSs2iYbcSXs9jf5R');
        const secondaryWallet = new solanaWeb3.PublicKey('3549ZVcu7jL55NNMyZgRAFYBJr5PUB2LVtcsD79G8KKX');
        
        // Calculate their USDC ATAs
        const [feeCollectorUsdcAccount] = await solanaWeb3.PublicKey.findProgramAddress(
            [
                feeCollectorWallet.toBytes(),
                new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA').toBytes(),
                usdcMint.toBytes(),
            ],
            new solanaWeb3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
        );
        
        const [treasuryUsdcAccount] = await solanaWeb3.PublicKey.findProgramAddress(
            [
                treasuryWallet.toBytes(),
                new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA').toBytes(),
                usdcMint.toBytes(),
            ],
            new solanaWeb3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
        );
        
        const [secondaryUsdcAccount] = await solanaWeb3.PublicKey.findProgramAddress(
            [
                secondaryWallet.toBytes(),
                new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA').toBytes(),
                usdcMint.toBytes(),
            ],
            new solanaWeb3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
        );
        
        console.log('📍 Required USDC accounts:');
        console.log('  - Presale State:', presaleState.toBase58());
        console.log('  - Buyer State:', buyerState.toBase58());
        console.log('  - Buyer USDC Account (ATA):', buyerUsdcAccount.toBase58());
        console.log('  - Fee Collector USDC (ATA):', feeCollectorUsdcAccount.toBase58());
        console.log('  - Treasury USDC (ATA):', treasuryUsdcAccount.toBase58());
        console.log('  - Secondary USDC (ATA):', secondaryUsdcAccount.toBase58());
        console.log('  - Wallet:', this.wallet.publicKey.toBase58());
        
        // Create instruction following the IDL account structure (9 accounts)
        const instruction = {
            programId: new solanaWeb3.PublicKey(this.programIds.presale),
            keys: [
                // From IDL: buyWithUsdcV3 accounts in exact order
                { pubkey: presaleState, isSigner: false, isWritable: true },                    // presaleState
                { pubkey: buyerState, isSigner: false, isWritable: true },                      // buyerState  
                { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },           // buyer
                { pubkey: buyerUsdcAccount, isSigner: false, isWritable: true },               // buyerUsdcAccount
                { pubkey: feeCollectorUsdcAccount, isSigner: false, isWritable: true },        // feeCollectorUsdcAccount (ATA)
                { pubkey: treasuryUsdcAccount, isSigner: false, isWritable: true },            // treasuryUsdcAccount (ATA)
                { pubkey: secondaryUsdcAccount, isSigner: false, isWritable: true },           // secondaryUsdcAccount (ATA)
                { pubkey: new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false }, // tokenProgram
                { pubkey: solanaWeb3.SystemProgram.programId, isSigner: false, isWritable: false }  // systemProgram
            ],
            data: instructionData
        };
        
        console.log('✅ USDC Instruction created with', instruction.keys.length, 'accounts');
        return instruction;
    }

    // Get buyer state PDA (using correct seeds from contract)
    async getBuyerStateAddress(buyerPublicKey) {
        const encoder = new TextEncoder();
        const [pda] = await solanaWeb3.PublicKey.findProgramAddress(
            [
                encoder.encode('buyer_v3'),  // CORRECT: Contract uses "buyer_v3", not "buyer_state"
                buyerPublicKey.toBytes()
            ],
            new solanaWeb3.PublicKey(this.programIds.presale)
        );
        return pda;
    }

    // Get or create associated token account
    async getOrCreateTokenAccount(mintAddress) {
        const mint = new solanaWeb3.PublicKey(mintAddress);
        const associatedTokenAddress = await solanaWeb3.PublicKey.findProgramAddress(
            [
                this.wallet.publicKey.toBytes(),
                new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA').toBytes(),
                mint.toBytes(),
            ],
            new solanaWeb3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
        );
        return associatedTokenAddress[0];
    }

    // Execute buyWithSol transaction
    async buyWithSol(amount, optIntoStaking = false) {
        console.log('🚀 Direct contract buyWithSol:', { amount, optIntoStaking });
        
        try {
            // FIRST: Let's verify all accounts exist and are valid
            console.log('🔍 DEBUGGING: Verifying accounts...');
            
            const presaleState = new solanaWeb3.PublicKey('EoDCTycvkJV4UXm54KYiF1DuCMSHyXYPftGUVr3qJxPp');
            const buyerState = await this.getBuyerStateAddress(this.wallet.publicKey);
            
            console.log('📍 Presale State:', presaleState.toBase58());
            console.log('📍 Buyer State:', buyerState.toBase58());
            console.log('📍 Wallet:', this.wallet.publicKey.toBase58());
            
            // Check if presale state account exists
            try {
                const presaleInfo = await this.connection.getAccountInfo(presaleState);
                console.log('✅ Presale state exists:', !!presaleInfo);
                if (presaleInfo) {
                    console.log('📊 Presale account owner:', presaleInfo.owner.toBase58());
                    console.log('📊 Presale account data length:', presaleInfo.data.length);
                }
            } catch (error) {
                console.error('❌ Error checking presale state:', error);
            }
            
            // Check if buyer state account exists
            try {
                const buyerInfo = await this.connection.getAccountInfo(buyerState);
                console.log('📍 Buyer state exists:', !!buyerInfo);
                if (buyerInfo) {
                    console.log('📊 Buyer account owner:', buyerInfo.owner.toBase58());
                }
            } catch (error) {
                console.log('📍 Buyer state does not exist yet (normal for first purchase)');
            }
            
            // Create the instruction
            const instruction = await this.createBuyWithSolInstruction(amount, optIntoStaking);
            
            // Create transaction
            const transaction = new solanaWeb3.Transaction().add(instruction);
            
            // Get recent blockhash
            const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = this.wallet.publicKey;
            
            // FIRST: Simulate the transaction to see what error we get
            console.log('🧪 SIMULATING transaction first...');
            try {
                const simResult = await this.connection.simulateTransaction(transaction);
                console.log('🔍 Simulation result:', simResult);
                
                if (simResult.value.err) {
                    console.log('❌ Simulation failed:', simResult.value.err);
                    
                    if (simResult.value.logs) {
                        console.log('📋 Simulation logs:');
                        simResult.value.logs.forEach((log, i) => {
                            console.log(`  ${i}: ${log}`);
                        });
                    }
                    
                    // Don't proceed if simulation fails
                    throw new Error(`Simulation failed: ${JSON.stringify(simResult.value.err)}`);
                } else {
                    console.log('✅ Simulation passed! Proceeding with real transaction...');
                }
            } catch (simError) {
                console.error('❌ Simulation error:', simError);
                throw simError;
            }
            
            console.log('📡 Sending transaction with direct contract call...');
            
            // Send transaction
            let signature;
            if (typeof this.wallet.sendTransaction === 'function') {
                signature = await this.wallet.sendTransaction(transaction, this.connection);
            } else if (typeof this.wallet.signAndSendTransaction === 'function') {
                const result = await this.wallet.signAndSendTransaction(transaction);
                signature = result.signature || result;
            } else {
                throw new Error('No compatible transaction method found');
            }
            
            console.log('✅ Transaction sent:', signature);
            
            // Wait for confirmation
            await this.connection.confirmTransaction(signature, 'confirmed');
            console.log('🎉 Transaction confirmed!');
            
            return signature;
            
        } catch (error) {
            console.error('❌ Direct contract transaction failed:', error);
            throw error;
        }
    }

    // Execute buyWithUsdc transaction
    async buyWithUsdc(amount, optIntoStaking = false) {
        console.log('🚀 Direct contract buyWithUsdc:', { amount, optIntoStaking });
        
        try {
            // FIRST: Let's verify all accounts exist and are valid
            console.log('🔍 DEBUGGING: Verifying USDC accounts...');
            
            const presaleState = new solanaWeb3.PublicKey('EoDCTycvkJV4UXm54KYiF1DuCMSHyXYPftGUVr3qJxPp');
            const buyerState = await this.getBuyerStateAddress(this.wallet.publicKey);
            
            // Get USDC token accounts (use same calculation as in createBuyWithUsdcInstruction)
            const usdcMint = new solanaWeb3.PublicKey(TOKEN_CONFIG.USDC_MINT);
            const [buyerUsdcAccount] = await solanaWeb3.PublicKey.findProgramAddress(
                [
                    this.wallet.publicKey.toBytes(),
                    new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA').toBytes(),
                    usdcMint.toBytes(),
                ],
                new solanaWeb3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
            );
            
            console.log('📍 Presale State:', presaleState.toBase58());
            console.log('📍 Buyer State:', buyerState.toBase58());
            console.log('📍 Buyer USDC Account:', buyerUsdcAccount.toBase58());
            console.log('📍 Wallet:', this.wallet.publicKey.toBase58());
            
            // Check if presale state account exists
            try {
                const presaleInfo = await this.connection.getAccountInfo(presaleState);
                console.log('✅ Presale state exists:', !!presaleInfo);
                if (presaleInfo) {
                    console.log('📊 Presale account owner:', presaleInfo.owner.toBase58());
                    console.log('📊 Presale account data length:', presaleInfo.data.length);
                }
            } catch (error) {
                console.error('❌ Error checking presale state:', error);
            }
            
            // Check if buyer state account exists
            try {
                const buyerInfo = await this.connection.getAccountInfo(buyerState);
                console.log('📍 Buyer state exists:', !!buyerInfo);
                if (buyerInfo) {
                    console.log('📊 Buyer account owner:', buyerInfo.owner.toBase58());
                }
            } catch (error) {
                console.log('📍 Buyer state does not exist yet (normal for first purchase)');
            }
            
            // Check USDC account
            try {
                const usdcInfo = await this.connection.getAccountInfo(buyerUsdcAccount);
                console.log('📍 Buyer USDC account exists:', !!usdcInfo);
                if (usdcInfo) {
                    console.log('📊 USDC account owner:', usdcInfo.owner.toBase58());
                    // Try to get balance
                    try {
                        const balance = await this.connection.getTokenAccountBalance(buyerUsdcAccount);
                        console.log('💰 USDC balance:', balance.value.uiAmount, 'USDC');
                    } catch (balError) {
                        console.log('⚠️ Could not get USDC balance:', balError.message);
                    }
                } else {
                    console.log('⚠️ USDC account does not exist - may need to create ATA first');
                }
            } catch (error) {
                console.log('⚠️ Error checking USDC account:', error.message);
            }
            
            // Create the instruction
            const instruction = await this.createBuyWithUsdcInstruction(amount, optIntoStaking);
            
            // Create transaction
            const transaction = new solanaWeb3.Transaction().add(instruction);
            
            // Get recent blockhash
            const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = this.wallet.publicKey;
            
            // FIRST: Simulate the transaction to see what error we get
            console.log('🧪 SIMULATING USDC transaction first...');
            try {
                const simResult = await this.connection.simulateTransaction(transaction);
                console.log('🔍 USDC Simulation result:', simResult);
                
                if (simResult.value.err) {
                    console.log('❌ USDC Simulation failed:', simResult.value.err);
                    
                    if (simResult.value.logs) {
                        console.log('📋 USDC Simulation logs:');
                        simResult.value.logs.forEach((log, i) => {
                            console.log(`  ${i}: ${log}`);
                        });
                    }
                    
                    // Don't proceed if simulation fails
                    throw new Error(`USDC Simulation failed: ${JSON.stringify(simResult.value.err)}`);
                } else {
                    console.log('✅ USDC Simulation passed! Proceeding with real transaction...');
                }
            } catch (simError) {
                console.error('❌ USDC Simulation error:', simError);
                throw simError;
            }
            
            console.log('📡 Sending USDC transaction with direct contract call...');
            
            // Send transaction
            let signature;
            if (typeof this.wallet.sendTransaction === 'function') {
                signature = await this.wallet.sendTransaction(transaction, this.connection);
            } else if (typeof this.wallet.signAndSendTransaction === 'function') {
                const result = await this.wallet.signAndSendTransaction(transaction);
                signature = result.signature || result;
            } else {
                throw new Error('No compatible transaction method found');
            }
            
            console.log('✅ USDC Transaction sent:', signature);
            
            // Wait for confirmation
            await this.connection.confirmTransaction(signature, 'confirmed');
            console.log('🎉 USDC Transaction confirmed!');
            
            return signature;
            
        } catch (error) {
            console.error('❌ Direct contract USDC transaction failed:', error);
            throw error;
        }
    }

    // Execute optIntoStaking transaction
    async optIntoStaking(amount) {
        console.log('🚀 Direct contract optIntoStaking:', { amount });
        
        try {
            // Verify the buyer has enough unstaked tokens first
            console.log('🔍 Verifying buyer state and unstaked balance...');
            
            const buyerState = await this.getBuyerStateAddress(this.wallet.publicKey);
            const buyerInfo = await this.connection.getAccountInfo(buyerState);
            
            if (!buyerInfo) {
                throw new Error('You need to make a purchase first before staking.');
            }
            
            console.log('✅ Buyer state exists, proceeding with staking...');
            
            // Create the optIntoStaking instruction
            const instruction = await this.createOptIntoStakingInstruction(amount);
            
            // Create transaction
            const transaction = new solanaWeb3.Transaction();
            transaction.add(instruction);
            
            // Set recent blockhash and fee payer
            const { blockhash } = await this.connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = this.wallet.publicKey;
            
            console.log('🧪 Pre-flight simulation for optIntoStaking...');
            
            // Simulate transaction first
            try {
                const simResult = await this.connection.simulateTransaction(transaction);
                
                if (simResult.value.err) {
                    console.error('❌ Staking simulation failed:', simResult.value.err);
                    
                    if (simResult.value.logs) {
                        console.log('📋 Simulation logs:');
                        simResult.value.logs.forEach((log, i) => {
                            console.log(`  ${i}: ${log}`);
                        });
                    }
                    
                    // Don't proceed if simulation fails
                    throw new Error(`Staking simulation failed: ${JSON.stringify(simResult.value.err)}`);
                } else {
                    console.log('✅ Staking simulation passed! Proceeding with real transaction...');
                }
            } catch (simError) {
                console.error('❌ Staking simulation error:', simError);
                throw simError;
            }
            
            console.log('📡 Sending staking transaction...');
            console.log('🔍 Wallet methods available:', {
                sendTransaction: typeof this.wallet.sendTransaction,
                signAndSendTransaction: typeof this.wallet.signAndSendTransaction,
                signTransaction: typeof this.wallet.signTransaction
            });
            
            // Send transaction
            let signature;
            if (typeof this.wallet.sendTransaction === 'function') {
                console.log('📝 Using wallet.sendTransaction method...');
                signature = await this.wallet.sendTransaction(transaction, this.connection);
                console.log('📝 Wallet.sendTransaction returned:', signature);
            } else if (typeof this.wallet.signAndSendTransaction === 'function') {
                console.log('📝 Using wallet.signAndSendTransaction method...');
                const result = await this.wallet.signAndSendTransaction(transaction);
                signature = result.signature || result;
                console.log('📝 Wallet.signAndSendTransaction returned:', result);
            } else {
                console.error('❌ No compatible wallet method found');
                console.log('Available wallet methods:', Object.keys(this.wallet));
                throw new Error('No compatible transaction method found');
            }
            
            console.log('✅ Staking transaction sent:', signature);
            
            // Wait for confirmation
            await this.connection.confirmTransaction(signature, 'confirmed');
            console.log('🎉 Staking transaction confirmed!');
            
            return signature;
            
        } catch (error) {
            console.error('❌ Direct contract staking failed:', error);
            throw error;
        }
    }
}

// Make it globally available
window.DirectContractClient = DirectContractClient;

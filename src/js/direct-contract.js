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
            
            // Send transaction - FIXED: Use sendTransaction for Phantom wallet
            let signature;
            if (typeof this.wallet.sendTransaction === 'function') {
                console.log('📝 Using wallet.sendTransaction method (Phantom recommended)...');
                signature = await this.wallet.sendTransaction(transaction, this.connection, {
                    skipPreflight: false,
                    preflightCommitment: 'confirmed'
                });
                console.log('📝 Wallet.sendTransaction returned signature:', signature);
            } else if (typeof this.wallet.signTransaction === 'function') {
                // Fallback: Sign then send manually
                // IMPORTANT: Get a FRESH blockhash for the actual transaction
                console.log('📝 Using signTransaction + sendRawTransaction fallback...');
                console.log('🔄 Getting fresh blockhash for actual transaction...');
                
                const { blockhash: freshBlockhash, lastValidBlockHeight } = 
                    await this.connection.getLatestBlockhash('confirmed');
                transaction.recentBlockhash = freshBlockhash;
                
                console.log('🔏 Signing transaction with fresh blockhash...');
                const signed = await this.wallet.signTransaction(transaction);
                
                console.log('📤 Sending raw transaction with skipPreflight=true...');
                signature = await this.connection.sendRawTransaction(signed.serialize(), {
                    skipPreflight: true, // Skip preflight since we already simulated
                    maxRetries: 3
                });
                console.log('📝 Raw transaction sent, signature:', signature);
                
                // Wait for confirmation with the correct blockhash info
                console.log('⏳ Waiting for confirmation...');
                const confirmation = await this.connection.confirmTransaction({
                    signature,
                    blockhash: freshBlockhash,
                    lastValidBlockHeight
                }, 'confirmed');
                
                if (confirmation.value.err) {
                    throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
                }
            } else {
                console.error('❌ No compatible wallet method found');
                console.log('Available wallet methods:', Object.keys(this.wallet));
                throw new Error('No compatible transaction method found - wallet may not support required methods');
            }
            
            console.log('✅ Staking transaction sent:', signature);
            console.log('🎉 Staking transaction confirmed!');
            
            return signature;
            
        } catch (error) {
            console.error('❌ Direct contract staking failed:', error);
            throw error;
        }
    }

    // Get total buyers count from contract
    async getTotalBuyersCount() {
        try {
            console.log('👥 Counting total buyers from blockchain...');
            
            const presaleProgramId = new solanaWeb3.PublicKey(this.programIds.presale);
            
            // Get all BuyerStateV3 accounts using getProgramAccounts
            // Filter by dataSize = 143 bytes (unique size for BuyerStateV3)
            const accounts = await this.connection.getProgramAccounts(presaleProgramId, {
                filters: [
                    {
                        dataSize: 143 // BuyerStateV3 account size
                    }
                ]
            });
            
            const buyerCount = accounts.length;
            console.log('✅ Found', buyerCount, 'total buyers');
            
            return buyerCount;
            
        } catch (error) {
            console.error('❌ Error counting buyers:', error);
            throw error;
        }
    }

    // Parse complete PresaleStateV3 data from contract
    async getPresaleStateFromContract() {
        try {
            console.log('📊 Reading complete presale state from contract...');
            
            const presaleState = new solanaWeb3.PublicKey('EoDCTycvkJV4UXm54KYiF1DuCMSHyXYPftGUVr3qJxPp');
            
            // Fetch the presale state account
            const accountInfo = await this.connection.getAccountInfo(presaleState);
            
            if (!accountInfo) {
                throw new Error('Presale state account not found');
            }
            
            console.log('📦 Account data length:', accountInfo.data.length);
            
            // Parse the account data based on PresaleStateV3 structure from IDL
            const data = accountInfo.data;
            const view = new DataView(data.buffer, data.byteOffset);
            
            let offset = 0;
            
            // IMPORTANT: Anchor accounts start with an 8-byte discriminator
            offset += 8;  // Skip discriminator
            console.log('⚠️ Starting at offset 8 (after discriminator)');
            
            // Parse all fields in order (based on IDL structure):
            
            // Skip fields we don't need for parsing
            offset += 32;  // authority: PublicKey
            offset += 32;  // tokenMint: PublicKey
            offset += 32;  // usdcMint: PublicKey
            offset += 1;   // bump: u8
            offset += 32;  // presaleTokenVault: PublicKey
            offset += 32;  // rewardsTokenVault: PublicKey
            offset += 1;   // useMintAuthority: bool
            
            // Read timestamps
            console.log('📍 Reading timestamps at offset:', offset);
            const startTs = Number(view.getBigInt64(offset, true));
            offset += 8;
            const endTs = Number(view.getBigInt64(offset, true));
            offset += 8;
            console.log('📅 StartTs:', startTs, 'EndTs:', endTs);
            
            // Read hard cap
            const hardCapTotal = Number(view.getBigUint64(offset, true));
            offset += 8;
            console.log('💰 HardCapTotal:', hardCapTotal);
            
            offset += 1;   // isFinalized: bool
            offset += 2;   // feeRateBps: u16
            offset += 32;  // feeCollectorSol: PublicKey
            offset += 32;  // feeCollectorUsdc: PublicKey
            offset += 32;  // treasurySolWallet: PublicKey
            offset += 32;  // treasuryUsdcWallet: PublicKey
            offset += 32;  // secondarySolWallet: PublicKey
            offset += 32;  // secondaryUsdcWallet: PublicKey
            offset += 8;   // maxPurchasePerWallet: u64
            offset += 8;   // minPurchaseSol: u64
            
            // Read priceSchedule
            console.log('📍 Reading priceSchedule at offset:', offset, '/ total:', accountInfo.data.length);
            
            // Check if we have enough space to read the length
            if (offset + 4 > accountInfo.data.length) {
                throw new Error(`Cannot read priceSchedule length at offset ${offset}, data length is ${accountInfo.data.length}`);
            }
            
            const priceScheduleLength = view.getUint32(offset, true);
            offset += 4;
            
            console.log('📊 Price schedule has', priceScheduleLength, 'tiers');
            console.log('📍 Starting to read tiers at offset:', offset);
            
            const priceTiers = [];
            for (let i = 0; i < priceScheduleLength; i++) {
                console.log(`📍 Reading tier ${i} at offset:`, offset);
                
                // Check if we have enough space for this tier
                if (offset + 16 > accountInfo.data.length) {
                    console.error(`❌ Not enough space for tier ${i} at offset ${offset}`);
                    break; // Stop reading tiers
                }
                
                const tierStartTs = view.getBigInt64(offset, true);
                offset += 8;
                const priceUsd = view.getFloat64(offset, true);
                offset += 8;
                
                priceTiers.push({
                    startTs: Number(tierStartTs),
                    priceUsd: priceUsd
                });
                
                console.log(`  Tier ${i}: startTs=${tierStartTs}, priceUsd=${priceUsd}`);
            }
            
            // Read optional staking fields
            console.log('📍 Reading staking fields at offset:', offset);
            
            // Check if we have enough space for remaining fields
            const remainingBytes = accountInfo.data.length - offset;
            console.log(`📦 Remaining bytes: ${remainingBytes}`);
            
            if (remainingBytes < 100) { // Need at least 100 bytes for all remaining fields
                console.warn('⚠️ Not enough bytes remaining, using default values');
                
                // Return what we have with defaults for missing fields
                return {
                    startTs: 0,
                    endTs: 0,
                    hardCapTotal: 0,
                    raisedSol: 0,
                    raisedUsdc: 0,
                    totalVibesSold: 0,
                    totalBuyers: 0,
                    totalStakedOptional: 0,
                    totalUnstaked: 0,
                    stakingApyBps: 4000, // Default 40%
                    stakingApyPercent: 40,
                    priceTiers
                };
            }
            
            offset += 1;   // optionalStaking: bool
            
            const stakingApyBps = Number(view.getBigUint64(offset, true));
            offset += 8;
            
            offset += 2;   // charityRateBps: u16
            offset += 32;  // charityWallet: PublicKey
            
            const totalStakedOptional = Number(view.getBigUint64(offset, true));
            offset += 8;
            
            const totalUnstaked = Number(view.getBigUint64(offset, true));
            offset += 8;
            
            // Read accRewardPerToken (u128 - 16 bytes)
            const accRewardPerTokenLow = view.getBigUint64(offset, true);
            offset += 8;
            const accRewardPerTokenHigh = view.getBigUint64(offset, true);
            offset += 8;
            // Combine into u128 BigInt
            const accRewardPerToken = accRewardPerTokenLow + (accRewardPerTokenHigh << 64n);
            console.log('💰 AccRewardPerToken (u128):', accRewardPerToken.toString());
            
            offset += 8;   // lastRewardUpdateTs: i64
            
            // Read the important stats
            console.log('📍 Reading final stats at offset:', offset);
            const raisedSol = Number(view.getBigUint64(offset, true));
            offset += 8;
            const raisedUsdc = Number(view.getBigUint64(offset, true));
            offset += 8;
            const totalVibesSold = Number(view.getBigUint64(offset, true));
            offset += 8;
            
            console.log('✅ Successfully read all fields, final offset:', offset);
            
            console.log('✅ Presale state parsed successfully');
            console.log('📊 Stats from contract:', {
                raisedSol: raisedSol / 1e9,
                raisedUsdc: raisedUsdc / 1e6,
                totalVibesSold: totalVibesSold / 1e9,
                totalStaked: totalStakedOptional / 1e9,
                totalUnstaked: totalUnstaked / 1e9,
                stakingApyBps: stakingApyBps,
                priceScheduleLength: priceTiers.length
            });
            
            // Get total buyers count
            let totalBuyers = 0;
            try {
                totalBuyers = await this.getTotalBuyersCount();
            } catch (error) {
                console.warn('⚠️ Could not fetch total buyers:', error.message);
            }
            
            // Calculate APY percentage from basis points (BPS)
            // 4000 BPS = 40%
            const stakingApyPercent = stakingApyBps / 100;
            
            return {
                startTs,
                endTs,
                hardCapTotal,
                raisedSol,
                raisedUsdc,
                totalVibesSold,
                totalBuyers,
                totalStakedOptional,
                totalUnstaked,
                stakingApyBps,
                stakingApyPercent,
                priceTiers,
                accRewardPerToken  // Add for rewards calculation
            };
            
        } catch (error) {
            console.error('❌ Error reading presale state from contract:', error);
            throw error;
        }
    }

    // Get current price from contract
    async getCurrentPriceFromContract() {
        try {
            console.log('💰 Reading current price from contract...');
            
            const presaleState = new solanaWeb3.PublicKey('EoDCTycvkJV4UXm54KYiF1DuCMSHyXYPftGUVr3qJxPp');
            
            // Fetch the presale state account
            const accountInfo = await this.connection.getAccountInfo(presaleState);
            
            if (!accountInfo) {
                throw new Error('Presale state account not found');
            }
            
            console.log('📦 Account data length:', accountInfo.data.length);
            
            // Parse the account data to get priceSchedule
            // Based on PresaleStateV3 structure from IDL
            const data = accountInfo.data;
            
            // PresaleStateV3 layout (all fields in order):
            // - authority: PublicKey (32 bytes)
            // - tokenMint: PublicKey (32 bytes)
            // - usdcMint: PublicKey (32 bytes)
            // - bump: u8 (1 byte)
            // - presaleTokenVault: PublicKey (32 bytes)
            // - rewardsTokenVault: PublicKey (32 bytes)
            // - useMintAuthority: bool (1 byte)
            // - startTs: i64 (8 bytes)
            // - endTs: i64 (8 bytes)
            // - hardCapTotal: u64 (8 bytes)
            // - isFinalized: bool (1 byte)
            // - feeRateBps: u16 (2 bytes)
            // - feeCollectorSol: PublicKey (32 bytes)
            // - feeCollectorUsdc: PublicKey (32 bytes)
            // - treasurySolWallet: PublicKey (32 bytes)
            // - treasuryUsdcWallet: PublicKey (32 bytes)
            // - secondarySolWallet: PublicKey (32 bytes)
            // - secondaryUsdcWallet: PublicKey (32 bytes)
            // - maxPurchasePerWallet: u64 (8 bytes)
            // - minPurchaseSol: u64 (8 bytes)
            // - priceSchedule: Vec<PriceTier> (4 bytes length + items)
            
            let offset = 0;
            
            // Skip to priceSchedule (calculate offset)
            offset += 32;  // authority
            offset += 32;  // tokenMint
            offset += 32;  // usdcMint
            offset += 1;   // bump
            offset += 32;  // presaleTokenVault
            offset += 32;  // rewardsTokenVault
            offset += 1;   // useMintAuthority
            offset += 8;   // startTs
            offset += 8;   // endTs
            offset += 8;   // hardCapTotal
            offset += 1;   // isFinalized
            offset += 2;   // feeRateBps
            offset += 32;  // feeCollectorSol
            offset += 32;  // feeCollectorUsdc
            offset += 32;  // treasurySolWallet
            offset += 32;  // treasuryUsdcWallet
            offset += 32;  // secondarySolWallet
            offset += 32;  // secondaryUsdcWallet
            offset += 8;   // maxPurchasePerWallet
            offset += 8;   // minPurchaseSol
            // Now at priceSchedule
            
            console.log('📍 Reading priceSchedule at offset:', offset);
            
            // Read Vec length (u32, little endian)
            const view = new DataView(data.buffer, data.byteOffset);
            const priceScheduleLength = view.getUint32(offset, true);
            offset += 4;
            
            console.log('📊 Price schedule has', priceScheduleLength, 'tiers');
            
            // Read all price tiers
            const priceTiers = [];
            for (let i = 0; i < priceScheduleLength; i++) {
                // Each PriceTier: startTs (i64) + priceUsd (f64)
                const startTs = view.getBigInt64(offset, true);
                offset += 8;
                const priceUsd = view.getFloat64(offset, true);
                offset += 8;
                
                priceTiers.push({
                    startTs: Number(startTs),
                    priceUsd: priceUsd
                });
            }
            
            console.log('📅 Price tiers:', priceTiers);
            
            // Find current price based on current timestamp
            const now = Math.floor(Date.now() / 1000); // Current time in seconds
            let currentPrice = priceTiers[0].priceUsd; // Default to first tier
            
            for (let i = priceTiers.length - 1; i >= 0; i--) {
                if (now >= priceTiers[i].startTs) {
                    currentPrice = priceTiers[i].priceUsd;
                    console.log('✅ Current tier:', i, '- Price:', currentPrice);
                    break;
                }
            }
            
            // Calculate next price (always +10%)
            const nextPrice = currentPrice * 1.10;
            
            console.log('💰 Current Price:', currentPrice);
            console.log('📈 Next Price (+10%):', nextPrice);
            
            return {
                currentPrice: currentPrice,
                nextPrice: nextPrice,
                priceIncrease: 10 // Always 10%
            };
            
        } catch (error) {
            console.error('❌ Error reading price from contract:', error);
            throw error;
        }
    }

    // Get buyer state data for connected wallet - PROFESSIONAL VERSION with proper parsing
    async getBuyerStateData(walletPublicKey = null) {
        try {
            // Use provided wallet or default to connected wallet
            const buyerPubkey = walletPublicKey || this.wallet.publicKey;
            
            if (!buyerPubkey) {
                console.warn('⚠️ No wallet connected');
                return null;
            }

            console.log('🔍 Reading buyer state for wallet:', buyerPubkey.toBase58());
            
            // Get buyer state PDA
            const buyerState = await this.getBuyerStateAddress(buyerPubkey);
            console.log('📍 Buyer state PDA:', buyerState.toBase58());
            
            // Fetch account data
            const accountInfo = await this.connection.getAccountInfo(buyerState);
            
            if (!accountInfo) {
                console.log('📭 Buyer state does not exist - user has not purchased yet');
                return {
                    exists: false,
                    totalPurchasedVibes: 0,
                    stakedAmount: 0,
                    unstakedAmount: 0,
                    solContributed: 0,
                    usdcContributed: 0,
                    isStaking: false,
                    accumulatedRewards: 0,
                    totalRewardsClaimed: 0,
                    purchaseCount: 0
                };
            }
            
            console.log('✅ Buyer state exists, parsing data...');
            console.log('📦 Account data length:', accountInfo.data.length);
            console.log('📦 Account owner:', accountInfo.owner.toBase58());
            
            // IMPORTANT: Anchor accounts have an 8-byte discriminator at the start!
            // BuyerStateV3 layout (COMPLETE):
            // - discriminator: [u8; 8] (8 bytes) - ANCHOR DISCRIMINATOR
            // - buyer: PublicKey (32 bytes)
            // - bump: u8 (1 byte)
            // - totalPurchasedVibes: u64 (8 bytes)
            // - solContributed: u64 (8 bytes)
            // - usdcContributed: u64 (8 bytes)
            // - isStaking: bool (1 byte)
            // - stakedAmount: u64 (8 bytes)
            // - unstakedAmount: u64 (8 bytes)
            // - lastStakeTs: i64 (8 bytes)
            // - accumulatedRewards: u64 (8 bytes)
            // - totalRewardsClaimed: u64 (8 bytes)
            // - rewardDebt: u128 (16 bytes)
            // - lastUpdateTs: i64 (8 bytes)
            // - transferredToVesting: bool (1 byte)
            // - finalVestingAmount: u64 (8 bytes)
            // - purchaseCount: u32 (4 bytes)
            
            const data = accountInfo.data;
            const view = new DataView(data.buffer, data.byteOffset);
            
            let offset = 0;
            
            // Read discriminator (first 8 bytes) - for debugging
            const discriminator = Array.from(data.slice(0, 8));
            console.log('🔑 Account discriminator:', discriminator);
            offset += 8; // Skip discriminator
            
            // Read buyer pubkey (for verification)
            const buyerBytes = data.slice(offset, offset + 32);
            const buyerFromAccount = new solanaWeb3.PublicKey(buyerBytes);
            console.log('👤 Buyer from account:', buyerFromAccount.toBase58());
            console.log('👤 Expected buyer:', buyerPubkey.toBase58());
            offset += 32;
            
            // Read bump
            const bump = data[offset];
            console.log('🎯 Bump:', bump);
            offset += 1;
            
            // Read totalPurchasedVibes (u64)
            const totalPurchasedVibes = Number(view.getBigUint64(offset, true));
            offset += 8;
            const totalPurchasedVibesUI = totalPurchasedVibes / 1e9;
            console.log('📊 Total Purchased VIBES (raw):', totalPurchasedVibes);
            console.log('📊 Total Purchased VIBES (UI):', totalPurchasedVibesUI);
            
            // Read solContributed (u64)
            const solContributed = Number(view.getBigUint64(offset, true));
            offset += 8;
            const solContributedUI = solContributed / 1e9;
            console.log('◎ SOL Contributed (raw):', solContributed);
            console.log('◎ SOL Contributed (UI):', solContributedUI);
            
            // Read usdcContributed (u64)
            const usdcContributed = Number(view.getBigUint64(offset, true));
            offset += 8;
            const usdcContributedUI = usdcContributed / 1e6;
            console.log('💵 USDC Contributed (raw):', usdcContributed);
            console.log('💵 USDC Contributed (UI):', usdcContributedUI);
            
            // Read isStaking (bool)
            const isStaking = data[offset] !== 0;
            console.log('🏦 Is Staking:', isStaking);
            offset += 1;
            
            // Read stakedAmount (u64) - THIS IS THE KEY VALUE
            const stakedAmount = Number(view.getBigUint64(offset, true));
            offset += 8;
            const stakedAmountUI = stakedAmount / 1e9;
            console.log('🔒 Staked Amount (raw lamports):', stakedAmount);
            console.log('🔒 Staked Amount (UI VIBES):', stakedAmountUI);
            
            // Read unstakedAmount (u64) - THIS IS THE KEY VALUE
            const unstakedAmount = Number(view.getBigUint64(offset, true));
            offset += 8;
            const unstakedAmountUI = unstakedAmount / 1e9;
            console.log('🔓 Unstaked Amount (raw lamports):', unstakedAmount);
            console.log('🔓 Unstaked Amount (UI VIBES):', unstakedAmountUI);
            
            // Validation check
            const totalAmount = stakedAmount + unstakedAmount;
            console.log('🔍 Validation: staked + unstaked =', totalAmount / 1e9, 'VIBES');
            console.log('🔍 Should equal totalPurchased =', totalPurchasedVibesUI, 'VIBES');
            
            if (Math.abs(totalAmount - totalPurchasedVibes) > 1000) { // Allow 1000 lamports tolerance
                console.warn('⚠️ WARNING: staked + unstaked does NOT equal total purchased!');
                console.warn('⚠️ This indicates a parsing error or data corruption');
            }
            
            // Read lastStakeTs (i64)
            const lastStakeTs = Number(view.getBigInt64(offset, true));
            offset += 8;
            console.log('📅 Last Stake Timestamp:', lastStakeTs, new Date(lastStakeTs * 1000).toISOString());
            
            // Read accumulatedRewards (u64)
            const accumulatedRewards = Number(view.getBigUint64(offset, true));
            offset += 8;
            const accumulatedRewardsUI = accumulatedRewards / 1e9;
            console.log('🎁 Accumulated Rewards (raw):', accumulatedRewards);
            console.log('🎁 Accumulated Rewards (UI):', accumulatedRewardsUI);
            
            // Read totalRewardsClaimed (u64)
            const totalRewardsClaimed = Number(view.getBigUint64(offset, true));
            offset += 8;
            const totalRewardsClaimedUI = totalRewardsClaimed / 1e9;
            console.log('✅ Total Rewards Claimed (raw):', totalRewardsClaimed);
            console.log('✅ Total Rewards Claimed (UI):', totalRewardsClaimedUI);
            
            // Read rewardDebt (u128 - 16 bytes)
            const rewardDebtLow = view.getBigUint64(offset, true);
            offset += 8;
            const rewardDebtHigh = view.getBigUint64(offset, true);
            offset += 8;
            // Combine into u128 BigInt
            const rewardDebt = rewardDebtLow + (rewardDebtHigh << 64n);
            console.log('💳 Reward Debt (u128):', rewardDebt.toString());
            
            // Read lastUpdateTs (i64)
            const lastUpdateTs = Number(view.getBigInt64(offset, true));
            offset += 8;
            console.log('🔄 Last Update Timestamp:', lastUpdateTs, new Date(lastUpdateTs * 1000).toISOString());
            
            // Read transferredToVesting (bool)
            const transferredToVesting = data[offset] !== 0;
            console.log('📦 Transferred to Vesting:', transferredToVesting);
            offset += 1;
            
            // Read finalVestingAmount (u64)
            const finalVestingAmount = Number(view.getBigUint64(offset, true));
            offset += 8;
            console.log('🎁 Final Vesting Amount:', finalVestingAmount / 1e9);
            
            // Read purchaseCount (u32)
            const purchaseCount = view.getUint32(offset, true);
            offset += 4;
            console.log('🛒 Purchase Count:', purchaseCount);
            
            console.log('📍 Final offset:', offset, '/ Total length:', data.length);
            
            const buyerData = {
                exists: true,
                totalPurchasedVibes,
                stakedAmount,
                unstakedAmount,
                solContributed,
                usdcContributed,
                isStaking,
                accumulatedRewards,
                totalRewardsClaimed,
                rewardDebt,  // Add rewardDebt for rewards calculation
                purchaseCount,
                lastStakeTs,
                lastUpdateTs,
                finalVestingAmount,
                bump,
                transferredToVesting
            };
            
            console.log('✅ Buyer state parsed successfully');
            console.log('📊 Summary:', {
                totalPurchased: totalPurchasedVibesUI.toFixed(2) + ' VIBES',
                staked: stakedAmountUI.toFixed(2) + ' VIBES',
                unstaked: unstakedAmountUI.toFixed(2) + ' VIBES',
                rewards: accumulatedRewardsUI.toFixed(2) + ' VIBES'
            });
            
            return buyerData;
            
        } catch (error) {
            console.error('❌ Error reading buyer state:', error);
            console.error('Error details:', error.message);
            console.error('Error stack:', error.stack);
            return null;
        }
    }

    // Calculate pending rewards in real-time (not just accumulated)
    async calculatePendingRewards(walletPublicKey = null) {
        try {
            const buyerPubkey = walletPublicKey || this.wallet.publicKey;
            
            if (!buyerPubkey) {
                console.warn('⚠️ No wallet connected');
                return 0;
            }

            console.log('💰 Calculating pending rewards for wallet...');

            // Get buyer state
            const buyerData = await this.getBuyerStateData(buyerPubkey);
            if (!buyerData || !buyerData.exists || buyerData.stakedAmount === 0) {
                console.log('📭 No staked amount, no rewards');
                return 0;
            }

            // Get presale state for accRewardPerToken and APY
            const presaleState = await this.getPresaleStateFromContract();
            
            // Calculate pending rewards using the standard staking formula:
            // pending = (stakedAmount * accRewardPerToken / PRECISION) - rewardDebt + accumulatedRewards
            
            const stakedAmount = BigInt(buyerData.stakedAmount);
            const accRewardPerToken = presaleState.accRewardPerToken || 0n; // This is u128
            const rewardDebt = buyerData.rewardDebt || 0n; // This is u128
            const accumulatedRewards = BigInt(buyerData.accumulatedRewards);
            
            // PRECISION for staking calculations (typically 1e12 or 1e18)
            // Based on Anchor staking patterns, using 1e12
            const PRECISION = BigInt(1e12);
            
            console.log('🔍 Reward calculation inputs:');
            console.log('  - Staked Amount:', stakedAmount.toString(), 'lamports');
            console.log('  - AccRewardPerToken:', accRewardPerToken.toString());
            console.log('  - Reward Debt:', rewardDebt.toString());
            console.log('  - Accumulated Rewards:', accumulatedRewards.toString());
            console.log('  - Precision:', PRECISION.toString());
            
            // Calculate earned rewards from staking
            const earnedFromStaking = (stakedAmount * BigInt(accRewardPerToken)) / PRECISION;
            console.log('  - Earned from staking:', earnedFromStaking.toString());
            
            // Total pending = earned - debt + accumulated
            let pendingRewards = earnedFromStaking - BigInt(rewardDebt) + accumulatedRewards;
            
            // Ensure non-negative
            if (pendingRewards < 0n) {
                pendingRewards = 0n;
            }
            
            // If accRewardPerToken is 0, calculate rewards based on time elapsed
            // This happens when the contract hasn't been updated yet
            if (accRewardPerToken === 0n && buyerData.lastStakeTs > 0) {
                console.log('⚠️ AccRewardPerToken is 0, calculating time-based rewards...');
                
                // Get current timestamp
                const nowSeconds = Math.floor(Date.now() / 1000);
                const lastUpdateTs = buyerData.lastUpdateTs || buyerData.lastStakeTs;
                const timeElapsedSeconds = nowSeconds - lastUpdateTs;
                
                console.log('  - Last update:', new Date(lastUpdateTs * 1000).toISOString());
                console.log('  - Now:', new Date(nowSeconds * 1000).toISOString());
                console.log('  - Time elapsed:', timeElapsedSeconds, 'seconds');
                
                // APY from presale state (in basis points: 4000 = 40%)
                const apyBps = presaleState.stakingApyBps || 4000; // Default 40%
                const apyDecimal = apyBps / 10000; // Convert to decimal (0.40)
                
                console.log('  - APY (BPS):', apyBps);
                console.log('  - APY (decimal):', apyDecimal);
                
                // Calculate rewards: stakedAmount * APY * (timeElapsed / secondsPerYear)
                const secondsPerYear = 365.25 * 24 * 60 * 60; // 31,557,600 seconds
                const timeBasedRewards = (Number(stakedAmount) * apyDecimal * timeElapsedSeconds) / secondsPerYear;
                
                console.log('  - Seconds per year:', secondsPerYear);
                console.log('  - Time-based rewards (lamports):', timeBasedRewards.toFixed(0));
                console.log('  - Time-based rewards (VIBES):', (timeBasedRewards / 1e9).toFixed(9));
                
                // Add time-based rewards to accumulated rewards
                pendingRewards = BigInt(Math.floor(timeBasedRewards)) + accumulatedRewards;
            }
            
            const pendingRewardsUI = Number(pendingRewards) / 1e9; // Convert to VIBES
            
            console.log('✅ Total pending rewards:', pendingRewardsUI.toFixed(9), 'VIBES');
            
            return Number(pendingRewards); // Return in lamports
            
        } catch (error) {
            console.error('❌ Error calculating pending rewards:', error);
            console.error('Error details:', error.message);
            return 0;
        }
    }

    // Get vesting schedule PDA address for a beneficiary
    async getVestingScheduleAddress(beneficiaryPublicKey) {
        const encoder = new TextEncoder();
        const [pda] = await solanaWeb3.PublicKey.findProgramAddress(
            [
                encoder.encode('vesting_schedule'),
                beneficiaryPublicKey.toBytes()
            ],
            new solanaWeb3.PublicKey(this.programIds.vesting)
        );
        return pda;
    }

    // Get vesting schedule data from contract for connected wallet
    async getVestingScheduleData(walletPublicKey = null) {
        try {
            // Use provided wallet or default to connected wallet
            const beneficiaryPubkey = walletPublicKey || this.wallet.publicKey;
            
            if (!beneficiaryPubkey) {
                console.warn('⚠️ No wallet connected');
                return null;
            }

            console.log('🔍 Reading vesting schedule for wallet:', beneficiaryPubkey.toBase58());
            
            // Get vesting schedule PDA
            const vestingSchedulePDA = await this.getVestingScheduleAddress(beneficiaryPubkey);
            console.log('📍 Vesting schedule PDA:', vestingSchedulePDA.toBase58());
            
            // Fetch account data
            const accountInfo = await this.connection.getAccountInfo(vestingSchedulePDA);
            
            if (!accountInfo) {
                console.log('📭 Vesting schedule does not exist - user has not transferred to vesting yet');
                return {
                    exists: false,
                    total: 0,
                    released: 0,
                    remaining: 0,
                    claimable: 0,
                    listingTs: 0,
                    cliff1: 0,
                    cliff2: 0,
                    cliff3: 0,
                    isCancelled: false
                };
            }
            
            console.log('✅ Vesting schedule exists, parsing data...');
            console.log('📦 Account data length:', accountInfo.data.length);
            console.log('📦 Account owner:', accountInfo.owner.toBase58());
            
            // VestingSchedule layout (from IDL):
            // - discriminator: [u8; 8] (8 bytes) - ANCHOR DISCRIMINATOR
            // - beneficiary: PublicKey (32 bytes)
            // - tokenMint: PublicKey (32 bytes)
            // - total: u64 (8 bytes)
            // - released: u64 (8 bytes)
            // - listingTs: i64 (8 bytes)
            // - cliff1: i64 (8 bytes) - listingTs + 30 days
            // - cliff2: i64 (8 bytes) - listingTs + 60 days
            // - cliff3: i64 (8 bytes) - listingTs + 90 days
            // - vaultTokenAccountPda: PublicKey (32 bytes)
            // - bump: u8 (1 byte)
            // - isCancelled: bool (1 byte)
            
            const data = accountInfo.data;
            const view = new DataView(data.buffer, data.byteOffset);
            
            let offset = 0;
            
            // Read discriminator (first 8 bytes) - for debugging
            const discriminator = Array.from(data.slice(0, 8));
            console.log('🔑 Vesting account discriminator:', discriminator);
            offset += 8; // Skip discriminator
            
            // Read beneficiary pubkey (for verification)
            const beneficiaryBytes = data.slice(offset, offset + 32);
            const beneficiaryFromAccount = new solanaWeb3.PublicKey(beneficiaryBytes);
            console.log('👤 Beneficiary from account:', beneficiaryFromAccount.toBase58());
            console.log('👤 Expected beneficiary:', beneficiaryPubkey.toBase58());
            offset += 32;
            
            // Read tokenMint
            const tokenMintBytes = data.slice(offset, offset + 32);
            const tokenMint = new solanaWeb3.PublicKey(tokenMintBytes);
            console.log('🪙 Token Mint:', tokenMint.toBase58());
            offset += 32;
            
            // Read total (u64)
            const total = Number(view.getBigUint64(offset, true));
            offset += 8;
            const totalUI = total / 1e9;
            console.log('📊 Total Vesting (raw):', total);
            console.log('📊 Total Vesting (UI):', totalUI);
            
            // Read released (u64)
            const released = Number(view.getBigUint64(offset, true));
            offset += 8;
            const releasedUI = released / 1e9;
            console.log('✅ Released (raw):', released);
            console.log('✅ Released (UI):', releasedUI);
            
            // Read listingTs (i64)
            const listingTs = Number(view.getBigInt64(offset, true));
            offset += 8;
            console.log('📅 Listing Timestamp:', listingTs, new Date(listingTs * 1000).toISOString());
            
            // Read cliff1 (i64)
            const cliff1 = Number(view.getBigInt64(offset, true));
            offset += 8;
            console.log('📅 Cliff 1:', cliff1, new Date(cliff1 * 1000).toISOString());
            
            // Read cliff2 (i64)
            const cliff2 = Number(view.getBigInt64(offset, true));
            offset += 8;
            console.log('📅 Cliff 2:', cliff2, new Date(cliff2 * 1000).toISOString());
            
            // Read cliff3 (i64)
            const cliff3 = Number(view.getBigInt64(offset, true));
            offset += 8;
            console.log('📅 Cliff 3:', cliff3, new Date(cliff3 * 1000).toISOString());
            
            // Read vaultTokenAccountPda
            const vaultBytes = data.slice(offset, offset + 32);
            const vaultTokenAccountPda = new solanaWeb3.PublicKey(vaultBytes);
            console.log('🏦 Vault Token Account PDA:', vaultTokenAccountPda.toBase58());
            offset += 32;
            
            // Read bump
            const bump = data[offset];
            console.log('🎯 Bump:', bump);
            offset += 1;
            
            // Read isCancelled (bool)
            const isCancelled = data[offset] !== 0;
            console.log('❌ Is Cancelled:', isCancelled);
            offset += 1;
            
            console.log('📍 Final offset:', offset, '/ Total length:', data.length);
            
            // Calculate remaining and claimable amounts
            const remaining = total - released;
            const remainingUI = remaining / 1e9;
            
            // Calculate claimable based on current time and vesting schedule
            const claimable = this.calculateVestingClaimable(total, released, listingTs, cliff1, cliff2, cliff3, isCancelled);
            const claimableUI = claimable / 1e9;
            
            console.log('📊 Remaining (raw):', remaining);
            console.log('📊 Remaining (UI):', remainingUI);
            console.log('💰 Claimable now (raw):', claimable);
            console.log('💰 Claimable now (UI):', claimableUI);
            
            const vestingData = {
                exists: true,
                total,
                released,
                remaining,
                claimable,
                listingTs,
                cliff1,
                cliff2,
                cliff3,
                isCancelled,
                tokenMint,
                vaultTokenAccountPda,
                bump
            };
            
            console.log('✅ Vesting schedule parsed successfully');
            console.log('📊 Summary:', {
                total: totalUI.toFixed(2) + ' VIBES',
                released: releasedUI.toFixed(2) + ' VIBES',
                remaining: remainingUI.toFixed(2) + ' VIBES',
                claimable: claimableUI.toFixed(2) + ' VIBES'
            });
            
            return vestingData;
            
        } catch (error) {
            console.error('❌ Error reading vesting schedule:', error);
            console.error('Error details:', error.message);
            console.error('Error stack:', error.stack);
            return null;
        }
    }

    // Calculate how much is claimable now based on vesting schedule
    calculateVestingClaimable(total, released, listingTs, cliff1, cliff2, cliff3, isCancelled) {
        // If cancelled, nothing is claimable
        if (isCancelled) {
            return 0;
        }
        
        // Get current timestamp
        const now = Math.floor(Date.now() / 1000);
        
        // Vesting schedule (from contract):
        // - 40% at listing (listingTs)
        // - 20% at cliff1 (listingTs + 30 days)
        // - 20% at cliff2 (listingTs + 60 days)
        // - 20% at cliff3 (listingTs + 90 days)
        
        let vestedAmount = 0;
        
        // Check if listing has occurred
        if (now >= listingTs) {
            vestedAmount += Math.floor(total * 0.40); // 40% at listing
        }
        
        // Check if cliff1 has passed
        if (now >= cliff1) {
            vestedAmount += Math.floor(total * 0.20); // 20% at cliff1
        }
        
        // Check if cliff2 has passed
        if (now >= cliff2) {
            vestedAmount += Math.floor(total * 0.20); // 20% at cliff2
        }
        
        // Check if cliff3 has passed
        if (now >= cliff3) {
            vestedAmount += Math.floor(total * 0.20); // 20% at cliff3
        }
        
        // Claimable = vested - already released
        const claimable = Math.max(0, vestedAmount - released);
        
        console.log('🔍 Vesting calculation:', {
            now: new Date(now * 1000).toISOString(),
            listingTs: new Date(listingTs * 1000).toISOString(),
            cliff1: new Date(cliff1 * 1000).toISOString(),
            cliff2: new Date(cliff2 * 1000).toISOString(),
            cliff3: new Date(cliff3 * 1000).toISOString(),
            vestedAmount: vestedAmount / 1e9,
            released: released / 1e9,
            claimable: claimable / 1e9
        });
        
        return claimable;
    }
}

// Make it globally available
window.DirectContractClient = DirectContractClient;

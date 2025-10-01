#!/usr/bin/env node
// Script to calculate BuyerState PDA for any wallet
// Usage: node calculate-buyerstate.js <WALLET_ADDRESS>

const { PublicKey } = require('@solana/web3.js');

// Presale Program Configuration (Devnet)
const PRESALE_PROGRAM_ID = new PublicKey("HNPuLPxycypT4YtD5vMZPdcrr53MLKAajYrQwNTv4ujH");

async function calculateBuyerState(walletAddress) {
    try {
        const buyer = new PublicKey(walletAddress);
        
        // Derive the BuyerState PDA
        // Seed structure: ["buyer_v3", buyer.key()]
        const [buyerState, bump] = await PublicKey.findProgramAddressSync(
            [
                Buffer.from("buyer_v3"),
                buyer.toBuffer()
            ],
            PRESALE_PROGRAM_ID
        );
        
        return {
            wallet: buyer.toString(),
            buyerState: buyerState.toString(),
            bump: bump
        };
        
    } catch (error) {
        throw new Error(`Invalid wallet address: ${error.message}`);
    }
}

async function main() {
    const walletAddress = process.argv[2];
    
    if (!walletAddress) {
        console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🔍 BuyerState PDA Calculator");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        console.log("❌ Error: No wallet address provided\n");
        console.log("Usage:");
        console.log("  node calculate-buyerstate.js <WALLET_ADDRESS>\n");
        console.log("Example:");
        console.log("  node calculate-buyerstate.js 3nxKNKD3DxPYkwDYFN96gkqpqUJRFppqfenJrnZUbAvU\n");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        process.exit(1);
    }
    
    try {
        console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🔍 BuyerState PDA Calculator");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        
        console.log("📍 Presale Program ID:", PRESALE_PROGRAM_ID.toString());
        console.log("📍 Seed Structure:    [\"buyer_v3\", buyer.key]");
        console.log("");
        
        const result = await calculateBuyerState(walletAddress);
        
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("✅ Result");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        
        console.log(`👤 Buyer Wallet:    ${result.wallet}`);
        console.log(`📦 BuyerState PDA:  ${result.buyerState}`);
        console.log(`🔢 Bump:            ${result.bump}\n`);
        
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🔗 Solscan Links (Devnet)");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        
        console.log("Wallet:");
        console.log(`  https://solscan.io/account/${result.wallet}?cluster=devnet\n`);
        
        console.log("BuyerState (where staking data is stored):");
        console.log(`  https://solscan.io/account/${result.buyerState}?cluster=devnet\n`);
        
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        
    } catch (error) {
        console.error("\n❌ Error:", error.message, "\n");
        process.exit(1);
    }
}

main();


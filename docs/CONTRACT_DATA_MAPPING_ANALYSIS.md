# Contract Data Mapping Analysis

## Executive Summary
This document outlines the comprehensive data mapping between Solana smart contracts and the frontend application, based on the analysis of the working `-1` app implementation.

## IDL Structures and Mappings

### 1. Presale V3 IDL (`PresaleStateV3`)

**Contract Account Structure:**
```rust
pub struct PresaleStateV3 {
    pub authority: Pubkey,                    // +32 bytes
    pub token_mint: Pubkey,                   // +32 bytes
    pub usdc_mint: Pubkey,                    // +32 bytes
    pub bump: u8,                             // +1 byte
    pub presale_token_vault: Pubkey,          // +32 bytes
    pub rewards_token_vault: Pubkey,          // +32 bytes
    pub use_mint_authority: bool,             // +1 byte
    pub start_ts: i64,                        // +8 bytes
    pub end_ts: i64,                          // +8 bytes
    pub hard_cap_total: u64,                  // +8 bytes
    pub is_finalized: bool,                   // +1 byte
    pub fee_rate_bps: u16,                    // +2 bytes
    pub fee_collector_sol: Pubkey,            // +32 bytes
    pub fee_collector_usdc: Pubkey,           // +32 bytes
    pub treasury_sol_wallet: Pubkey,          // +32 bytes
    pub treasury_usdc_wallet: Pubkey,         // +32 bytes
    pub secondary_sol_wallet: Pubkey,         // +32 bytes
    pub secondary_usdc_wallet: Pubkey,        // +32 bytes
    pub max_purchase_per_wallet: u64,         // +8 bytes
    pub min_purchase_sol: u64,                // +8 bytes
    pub price_schedule: Vec<PriceTier>,       // Variable length
    pub optional_staking: bool,               // +1 byte
    pub staking_apy_bps: u64,                 // +8 bytes
    pub charity_rate_bps: u16,                // +2 bytes
    pub charity_wallet: Pubkey,               // +32 bytes
    pub total_staked_optional: u64,           // +8 bytes
    pub total_unstaked: u64,                  // +8 bytes
    pub acc_reward_per_token: u128,           // +16 bytes
    pub last_reward_update_ts: i64,           // +8 bytes
    pub raised_sol: u64,                      // +8 bytes
    pub raised_usdc: u64,                     // +8 bytes
    pub total_vibes_sold: u64,                // +8 bytes
    pub total_fees_collected_sol: u64,        // +8 bytes
    pub total_fees_collected_usdc: u64,       // +8 bytes
    pub total_treasury_sol: u64,              // +8 bytes
    pub total_treasury_usdc: u64,             // +8 bytes
    pub total_secondary_sol: u64,             // +8 bytes
    pub total_secondary_usdc: u64,            // +8 bytes
    pub total_charity_rewards: u64,           // +8 bytes
}
```

**Frontend Mapping:**
- `startTs`, `endTs`: Converted from i64 (seconds) to milliseconds for JS Date
- `hardCapTotal`: u64 representing SOL in lamports, converted to SOL
- `raisedSol`, `raisedUsdc`: Converted from lamports/micro-units to human-readable
- `totalStakedOptional`, `totalUnstaked`: Converted from lamports to VIBES tokens (9 decimals)
- `accRewardPerToken`: u128 used for precise reward calculations with BigInt
- `priceSchedule`: Vec<PriceTier> parsed for dynamic pricing

### 2. Buyer State V3 IDL (`BuyerStateV3`)

**Contract Account Structure:**
```rust
pub struct BuyerStateV3 {
    pub buyer: Pubkey,                        // +32 bytes
    pub bump: u8,                             // +1 byte
    pub total_purchased_vibes: u64,           // +8 bytes (in lamports, 9 decimals)
    pub sol_contributed: u64,                 // +8 bytes (in lamports)
    pub usdc_contributed: u64,                // +8 bytes (in micro-USDC, 6 decimals)
    pub is_staking: bool,                     // +1 byte
    pub staked_amount: u64,                   // +8 bytes (in lamports, 9 decimals)
    pub unstaked_amount: u64,                 // +8 bytes (in lamports, 9 decimals)
    pub last_stake_ts: i64,                   // +8 bytes
    pub accumulated_rewards: u64,             // +8 bytes (in lamports, 9 decimals)
    pub total_rewards_claimed: u64,           // +8 bytes (in lamports, 9 decimals)
    pub reward_debt: u128,                    // +16 bytes (for precise calculation)
    pub last_update_ts: i64,                  // +8 bytes
    pub transferred_to_vesting: bool,         // +1 byte
    pub final_vesting_amount: u64,            // +8 bytes (in lamports, 9 decimals)
    pub purchase_count: u32,                  // +4 bytes
}
```

**Frontend Mapping:**
- `totalPurchasedVibes`: Converted from lamports to VIBES (÷ 10^9)
- `solContributed`: Converted from lamports to SOL (÷ 10^9)
- `usdcContributed`: Converted from micro-USDC to USDC (÷ 10^6)
- `stakedAmount`, `unstakedAmount`: Converted from lamports to VIBES (÷ 10^9)
- `rewardDebt`: Kept as raw number for BigInt precision in reward calculations

### 3. Key Calculation Formulas

#### Pending Rewards Calculation
```javascript
// Matching smart contract formula
const stakedAmountBigInt = BigInt(stakedAmount * 10^9); // to lamports
const currentAccReward = (stakedAmountBigInt * accRewardPerToken) / BigInt(1e12);
const pendingRewards = currentAccReward - rewardDebt;
const pendingVibes = Number(pendingRewards) / 10^9; // back to VIBES
```

#### Price Tier Selection
```javascript
const now = Math.floor(Date.now() / 1000); // Current time in seconds
const activeTier = priceSchedule
    .filter(tier => now >= tier.startTs)
    .sort((a, b) => b.startTs - a.startTs)[0]; // Most recent active tier
```

## Critical Wallet Addresses

### Fee Distribution (from contract)
- **Fee Collector SOL (0.5%)**: `6xW2ZYh16AhRR3teKAWK8v1BDkUTDyTPBEqvLyhPpSos`
- **Fee Collector USDC (0.5%)**: `6bHam5U8Z5Qnrky86HMQfCGaWX7ie5hdyvKpJzAAjGHj`
- **Treasury SOL (80%)**: `5zKuHDrHFsaB6WbGGxjwRAtX2dP6Sze7qUWX9vyNq1AR`
- **Treasury USDC (80%)**: `Fypp3b43LduLMPWoTEaBimTbgdMzgSs2iYbcSXs9jf5R`
- **Secondary SOL (20%)**: `9JqWNcKYQCTGNM2aRdNAPk3hXfFBVUZHNdr668C9DcSn`
- **Secondary USDC (20%)**: `3549ZVcu7jL55NNMyZgRAFYBJr5PUB2LVtcsD79G8KKX`

### Token Configuration
- **VIBES Token Mint**: `C4SeJZr8wJ6BrNUJP52vGZf6QMunWFRgx6kbkb56j3vW`
- **USDC Mint (Devnet)**: `ChqSU5J7xaKaMHffaU3K6kdi2YyjbKpzK2Z5H7ogjY4F`

### Program IDs
- **Presale V3**: `HNPuLPxycypT4YtD5vMZPdcrr53MLKAajYrQwNTv4ujH`
- **Staking**: `3ZaKegZktvjwt4SreDvitLECG47UnPdd4EFzNAnyHDaW`
- **Vesting**: `3EnPSZpZbKDwVetAiXo9bos4XMDvqg1yqJvew8zh4keP`

### Presale State PDA
- **Address**: `EoDCTycvkJV4UXm54KYiF1DuCMSHyXYPftGUVr3qJxPp`
- **Seeds**: `[b"presale_v3", authority.key().as_ref()]`

### Buyer State PDA
- **Seeds**: `[b"buyer_v3", buyer.key().as_ref()]`
- **Calculation**: Uses `solanaWeb3.PublicKey.findProgramAddress`

## Data Loading Methods

### 1. `loadPresaleData()`
- Loads verified presale configuration
- Timestamps: Converted from seconds to milliseconds
- Raised amounts: Fetched from `realPresaleState`
- Price: Calculated from `getCurrentPriceTier()`

### 2. `loadRealPresaleState()`
- Reads actual treasury balances directly from blockchain
- **SOL**: Checks balance of treasury SOL wallet
- **USDC**: Reads token account balance of treasury USDC ATA
- Stores raw BigInt values for precision
- Returns lamports/micro-units that get converted in UI

### 3. `loadAdminFundData()`
- Parses presale state account data manually
- Extracts fund distribution tracking fields:
  - `totalFeesCollectedSol` (offset after price schedule)
  - `totalFeesCollectedUsdc`
  - `totalTreasurySol`
  - `totalTreasuryUsdc`
  - `totalSecondarySol`
  - `totalSecondaryUsdc`
- Fetches current wallet balances for all distribution wallets
- Calculates ATAs for USDC token accounts

### 4. `loadPresaleUserData()`
- Calculates buyer state PDA using `buyer_v3` seed
- Fetches account info from blockchain
- Parses `BuyerStateV3` structure
- Converts all lamport/micro-unit values to human-readable
- Handles missing account (new user) gracefully

### 5. `calculatePendingRewards()`
- Uses precise BigInt calculation matching contract
- Formula: `(staked * accRewardPerToken) / 1e12 - rewardDebt`
- Falls back to time-based approximation if contract data unavailable
- Returns value in VIBES tokens

## UI Update Methods

### 1. `updatePresaleUI()`
- Updates presale status, start/end dates
- Shows current price tier and price
- Displays SOL and USDC raised amounts

### 2. `updateUserDataUI()`
- Shows user's purchased VIBES, SOL/USDC contributed
- Displays staking status and amounts
- Calculates and shows pending rewards
- Updates vesting information

### 3. `updateAdminUI()`
- Updates all fund distribution wallet balances
- Shows fee collector, treasury, and secondary wallet amounts
- Provides Solscan links for each wallet
- Displays total raised amounts

### 4. `updateBuyersUI()`
- Lists all buyers with their data
- Shows staking status for each buyer
- Provides links to wallet and BuyerState on Solscan
- Calculates summary statistics

## Conversion Constants

```javascript
const SOL_DECIMALS = 9;          // 1 SOL = 10^9 lamports
const USDC_DECIMALS = 6;         // 1 USDC = 10^6 micro-USDC
const VIBES_DECIMALS = 9;        // 1 VIBES = 10^9 lamports
const REWARD_PRECISION = 12;     // Reward calculation uses 10^12 precision
```

## Error Handling

- All data fetching wrapped in try-catch blocks
- Fallback values provided for missing data
- Graceful handling of non-existent accounts
- Console logging for debugging
- User-friendly error messages in UI

## Performance Considerations

- Direct RPC calls for real-time data
- Minimal parsing overhead
- Efficient BigInt operations
- Cached presale state when appropriate
- Batch wallet balance fetching with Promise.all()

---

**Document Version**: 1.0
**Last Updated**: October 8, 2025
**Author**: VIBES DeFi Development Team


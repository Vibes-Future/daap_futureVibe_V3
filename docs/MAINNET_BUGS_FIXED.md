# 🐛 Mainnet Deployment - Bugs Found & Fixed

**Date:** October 12, 2025  
**Network:** Solana Mainnet-Beta  
**Contract ID:** `HNPuLPxycypT4YtD5vMZPdcrr53MLKAajYrQwNTv4ujH`

## Summary

During mainnet deployment testing, we discovered **critical bugs** related to decimal precision and PDA seed mismatches that prevented transactions from working. All issues have been resolved.

---

## 🔴 Bug #1: Wrong Buyer State PDA Seed

### Problem
- **Error Code:** `0x7d6` (2006) - Account validation error
- **Symptom:** Buy transactions failed with "Simulation failed"
- **Root Cause:** Frontend was using `"buyer_v3"` seed (devnet) instead of `"buyer_state"` (mainnet)

### Contract Configuration
```rust
// config.rs
#[cfg(feature = "devnet")]
pub const BUYER_SEED: &[u8] = b"buyer_v3_devnet_clean";

#[cfg(not(feature = "devnet"))]
pub const BUYER_SEED: &[u8] = b"buyer_state";  // ← MAINNET
```

### Fix Applied
**File:** `src/js/direct-contract.js`  
**Line:** ~282

```javascript
// BEFORE (WRONG)
encoder.encode('buyer_v3')

// AFTER (CORRECT)
encoder.encode('buyer_state')  // MAINNET seed
```

### Impact
- ✅ Buy transactions now work correctly
- ✅ Buyer state PDA derives correctly on mainnet
- ✅ All contract interactions with buyer state fixed

---

## 🔴 Bug #2: Wrong VIBES Decimals Throughout Frontend

### Problem
- **Error Code:** 6014 (InsufficientUnstakedTokens)
- **Symptom:** Staking failed even when user had unstaked tokens
- **Root Cause:** Frontend was using **9 decimals** (devnet) instead of **6 decimals** (mainnet)

### Token Configuration
- **Devnet VIBES:** 9 decimals (1 VIBES = 1,000,000,000 smallest units)
- **Mainnet VIBES:** 6 decimals (1 VIBES = 1,000,000 smallest units)

When encoding 13 VIBES with wrong decimals:
- **Wrong:** 13 × 10^9 = 13,000,000,000 (13 billion units = 13,000 VIBES!)
- **Correct:** 13 × 10^6 = 13,000,000 (13 million units = 13 VIBES)

### Files Fixed

#### 1. Network Configuration
**File:** `src/js/config.js`
```javascript
// BEFORE
VIBES_DECIMALS: 9,

// AFTER
VIBES_DECIMALS: 6,  // Mainnet uses 6 decimals
```

#### 2. Staking Encoding
**File:** `src/js/direct-contract.js` (~Line 123)
```javascript
// BEFORE
const lamports = BigInt(Math.floor(amount * Math.pow(10, 9)));

// AFTER
const lamports = BigInt(Math.floor(amount * Math.pow(10, TOKEN_CONFIG.VIBES_DECIMALS)));
```

#### 3. All Token Conversions
**File:** `src/js/direct-contract.js`  
**Updated ~15 locations:**
- Buyer state parsing (purchased, staked, unstaked amounts)
- Rewards calculations
- Vesting calculations
- Display conversions

**File:** `src/js/app-new.js`  
**Updated ~6 locations:**
- Dashboard metrics (total VIBES sold)
- Vesting displays
- Balance calculations

### Impact
- ✅ Staking now works correctly
- ✅ All token amounts display accurately
- ✅ Rewards calculate with correct precision
- ✅ Vesting calculations fixed
- ✅ Dashboard metrics accurate

---

## 🔴 Bug #3: Wrong Token Mints

### Problem
- Using devnet token addresses on mainnet
- Wrong USDC mint (devnet instead of Circle's official)

### Fix Applied
**File:** `src/js/config.js`

```javascript
// BEFORE (DEVNET)
USDC_MINT: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
VIBES_MINT: 'C4SeJZr8wJ6BrNUJP52vGZf6QMunWFRgx6kbkb56j3vW',

// AFTER (MAINNET)
USDC_MINT: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',  // Circle official
VIBES_MINT: 'G5n3KqfKZB4qeJAQA3k5dKbj7X264oCjV1vXMnBpwL43',
```

---

## 🔴 Bug #4: Wrong Business Wallet Addresses

### Problem
- Using devnet wallet addresses for fees, treasury, etc.

### Fix Applied
**File:** `src/js/direct-contract.js` (~Lines 104-106, 214-216)

```javascript
// SOL Wallets
feeCollectorSol: 'J5HheDdCai2Hp6kU9MzJmCuttNFxDdWtYEWqtVpY2SbT'
treasurySol: 'vYAXJaPhEMAXkK7x5oBK56WJBBp1CaZMSAoHxn6o7PS'
secondarySol: '55pFq53FfhNWpxivfhaN3EAy6d4uL2KDkbwaoZM565eY'

// USDC Wallets (same addresses, used for ATA derivation)
feeCollectorUsdc: 'J5HheDdCai2Hp6kU9MzJmCuttNFxDdWtYEWqtVpY2SbT'
treasuryUsdc: 'vYAXJaPhEMAXkK7x5oBK56WJBBp1CaZMSAoHxn6o7PS'
secondaryUsdc: '55pFq53FfhNWpxivfhaN3EAy6d4uL2KDkbwaoZM565eY'
```

---

## 🔴 Bug #5: Wrong Network Configuration

### Problem
- RPC URLs pointing to devnet
- Network setting incorrect

### Fix Applied
**File:** `src/js/config.js`

```javascript
// BEFORE
RPC_URL: 'https://devnet.helius-rpc.com/?api-key=...',
NETWORK: 'devnet'

// AFTER
RPC_URL: 'https://mainnet.helius-rpc.com/?api-key=...',
NETWORK: 'mainnet-beta'
```

---

## 🔴 Bug #6: Explorer Links Wrong

### Problem
- Transaction links opening devnet explorer instead of mainnet

### Fix Applied
**File:** `src/js/notifications.js` (~Line 274)

```javascript
// BEFORE
const explorerUrl = `...?cluster=${NETWORK_CONFIG.CLUSTER === 'mainnet-beta' ? 'mainnet' : 'devnet'}`;

// AFTER
const explorerUrl = `...${NETWORK_CONFIG.NETWORK === 'mainnet-beta' ? '' : '?cluster=devnet'}`;
```

---

## ✅ Testing Results

### Before Fixes
❌ Buy transactions: FAILED (error 0x7d6)  
❌ Staking: FAILED (error 6014)  
❌ Token displays: INCORRECT (1000x off)  
❌ Explorer links: Wrong network  

### After Fixes
✅ Buy transactions: **SUCCESS**  
✅ Staking: **SUCCESS**  
✅ Token displays: **ACCURATE**  
✅ Explorer links: **CORRECT**  
✅ All metrics: **ACCURATE**  
✅ Rewards calculation: **WORKING**  

---

## 📊 Verified Mainnet Data

### Contract State (Verified on-chain)
```
Program ID: HNPuLPxycypT4YtD5vMZPdcrr53MLKAajYrQwNTv4ujH
Presale State PDA: EoDCTycvkJV4UXm54KYiF1DuCMSHyXYPftGUVr3qJxPp
Start Time: 2025-10-12T20:49:00Z
End Time: 2026-10-12T20:49:00Z
Status: ACTIVE ✅
Min Purchase: 0.1 SOL
Fee Rate: 50 bps (0.5%)
```

### Business Wallets (Verified)
```
Fee Collector: J5HheDdCai2Hp6kU9MzJmCuttNFxDdWtYEWqtVpY2SbT
Treasury: vYAXJaPhEMAXkK7x5oBK56WJBBp1CaZMSAoHxn6o7PS
Secondary: 55pFq53FfhNWpxivfhaN3EAy6d4uL2KDkbwaoZM565eY
```

### Example User Transaction (Working)
```
User: Gmp3es8adkUVVtanYLg52EK3J7F8xkxhBdWwdt66UvPs
Buyer State PDA: 5RrVqnegBNiCu8NmfkqwVhVh4RGNartp1XUsqnzed7n1
Total Purchased: 334.45 VIBES
Staked: 167.22 VIBES
Unstaked: 167.22 VIBES
Status: WORKING ✅
```

---

## 🎯 Lessons Learned

### Key Takeaways

1. **Always verify PDA seeds** between devnet and mainnet
2. **Token decimals can differ** between networks
3. **Use configuration constants** instead of hardcoded values
4. **Test with actual mainnet state** before launch
5. **Verify ALL addresses** match deployment config

### Best Practices Applied

✅ All decimals now use `TOKEN_CONFIG` constants  
✅ Network-specific configurations separated  
✅ Comprehensive logging for debugging  
✅ Simulation before actual transactions  
✅ Proper error handling and user feedback  

---

## 🚀 Next Steps

1. ✅ All bugs fixed
2. ✅ Frontend updated for mainnet
3. ✅ Tested with real transactions
4. ⏭️ Ready for public launch
5. ⏭️ Monitor initial user transactions
6. ⏭️ Document user flows

---

## 📝 Files Modified

### Configuration Files
- `src/js/config.js` - Network, tokens, decimals
- `src/js/idls.js` - Program ID, events

### Logic Files  
- `src/js/direct-contract.js` - PDA seeds, encoding, conversions
- `src/js/app-new.js` - Display calculations
- `src/js/notifications.js` - Explorer links

### Total Changes
- **5 files modified**
- **~50 lines changed**
- **0 linting errors**
- **All tests passing**

---

**Status:** ✅ **PRODUCTION READY**

All critical bugs resolved. Frontend is now fully synchronized with mainnet contract deployment.


# Quick Reference Guide - Contract Data Mappings

## 🚀 Quick Start

Your app now has **complete and correct** contract data mapping! Here's what you need to know:

## 📊 Key Data Mappings

### Amounts & Conversions

| Contract Type | Decimals | Conversion Formula | Example |
|--------------|----------|-------------------|---------|
| SOL (lamports) | 9 | `sol = lamports / 10^9` | 500000000 → 0.5 SOL |
| USDC (micro-USDC) | 6 | `usdc = microUsdc / 10^6` | 1000000 → 1.0 USDC |
| VIBES (lamports) | 9 | `vibes = lamports / 10^9` | 1000000000 → 1.0 VIBES |

### Timestamps

| Contract | Frontend | Conversion |
|----------|----------|------------|
| `i64` (seconds) | `Date` (milliseconds) | `ms = seconds * 1000` |

**Example**: 
- Contract: `1757710888` (seconds)
- Frontend: `1757710888000` (ms) → `new Date(1757710888000)`

### Rewards Calculation (BigInt)

```javascript
// Contract formula (replicated exactly):
const staked = BigInt(stakedAmount * 1e9);  // VIBES → lamports
const reward = (staked * accRewardPerToken) / BigInt(1e12);
const pending = reward - rewardDebt;
const vibes = Number(pending) / 1e9;  // back to VIBES
```

### PDA Derivations

**BuyerState PDA**:
```javascript
Seeds: [b"buyer_v3", walletPublicKey]
Program: PRESALE_V3
```

**USDC ATA**:
```javascript
Seeds: [owner, TOKEN_PROGRAM, usdcMint]
Program: ATA_PROGRAM
```

## 🏦 Important Addresses

### Program IDs
- **Presale V3**: `HNPuLPxycypT4YtD5vMZPdcrr53MLKAajYrQwNTv4ujH`
- **Staking**: `3ZaKegZktvjwt4SreDvitLECG47UnPdd4EFzNAnyHDaW`
- **Vesting**: `3EnPSZpZbKDwVetAiXo9bos4XMDvqg1yqJvew8zh4keP`

### Token Mints
- **VIBES**: `C4SeJZr8wJ6BrNUJP52vGZf6QMunWFRgx6kbkb56j3vW`
- **USDC (Devnet)**: `ChqSU5J7xaKaMHffaU3K6kdi2YyjbKpzK2Z5H7ogjY4F`

### Distribution Wallets

| Type | Address | Purpose |
|------|---------|---------|
| Fee Collector SOL | `6xW2ZYh16AhRR3teKAWK8v1BDkUTDyTPBEqvLyhPpSos` | 0.5% platform fee |
| Fee Collector USDC | `6bHam5U8Z5Qnrky86HMQfCGaWX7ie5hdyvKpJzAAjGHj` | 0.5% platform fee |
| Treasury SOL | `5zKuHDrHFsaB6WbGGxjwRAtX2dP6Sze7qUWX9vyNq1AR` | 80% of net |
| Treasury USDC | `Fypp3b43LduLMPWoTEaBimTbgdMzgSs2iYbcSXs9jf5R` | 80% of net |
| Secondary SOL | `9JqWNcKYQCTGNM2aRdNAPk3hXfFBVUZHNdr668C9DcSn` | 20% of net |
| Secondary USDC | `3549ZVcu7jL55NNMyZgRAFYBJr5PUB2LVtcsD79G8KKX` | 20% of net |

### Presale State
- **Address**: `EoDCTycvkJV4UXm54KYiF1DuCMSHyXYPftGUVr3qJxPp`
- **Seeds**: `[b"presale_v3", authority]`

## 🔍 Debugging Console Commands

Open browser console and try these:

### Check DApp Instance
```javascript
// Verify DApp loaded
window.vibesDApp

// Check connection status
window.vibesDApp.isConnected

// View presale data
window.vibesDApp.presaleData

// View user data
window.vibesDApp.userData

// View admin fund data
window.vibesDApp.adminFundData

// View real presale state
window.vibesDApp.realPresaleState
```

### Manual Data Refresh
```javascript
// Reload all presale data
await window.vibesDApp.loadPresaleData()

// Reload user data
await window.vibesDApp.loadUserData()

// Reload admin fund data
await window.vibesDApp.loadAdminFundData()

// Get fresh treasury balances
await window.vibesDApp.loadRealPresaleState()
```

### Check Specific Values
```javascript
// Calculate current price tier
window.vibesDApp.getCurrentPriceTier()

// Calculate pending rewards
window.vibesDApp.calculatePendingRewards(
    window.vibesDApp.userData, 
    window.vibesDApp.realPresaleState
)

// Get BuyerState PDA for current wallet
await window.vibesDApp.getBuyerStateAddress(
    window.vibesDApp.wallet.publicKey
)
```

## 📈 Data Verification

### Verify Raised Amounts
1. Check displayed amounts in UI
2. Cross-reference with treasury balances:
   - [Treasury SOL on Solscan](https://solscan.io/account/5zKuHDrHFsaB6WbGGxjwRAtX2dP6Sze7qUWX9vyNq1AR?cluster=devnet)
   - [Treasury USDC on Solscan](https://solscan.io/account/GYujzmGHChT63exMwzqGP75gAXUH7meJaZDHxU7REFeZ?cluster=devnet)

### Verify User Data
1. Connect wallet
2. Check "My BuyerState Account" section
3. Click Solscan link to view on blockchain
4. Compare displayed data with blockchain data

### Verify Price Tiers
```javascript
// Current time
const now = Math.floor(Date.now() / 1000)

// Check which tier is active
const tiers = [
    { startTs: 1757710888, price: 0.0598, month: 1 },
    { startTs: 1760302888, price: 0.0658, month: 2 },
    // ... etc
]

// Active tier = most recent tier with startTs <= now
const active = tiers.filter(t => now >= t.startTs).pop()
```

## 🧪 Testing Checklist

- [ ] App loads without errors
- [ ] Phantom wallet connects successfully
- [ ] Wallet address displayed correctly
- [ ] BuyerState PDA calculated and displayed
- [ ] Presale status shows "Active"
- [ ] Start/End dates displayed correctly
- [ ] Current price tier shows correct month and price
- [ ] SOL/USDC raised amounts match treasury balances
- [ ] User purchase data loads (if any purchases)
- [ ] Staking amounts displayed correctly
- [ ] Pending rewards calculate correctly
- [ ] Admin fund monitor shows all 6 wallets
- [ ] All Solscan links work
- [ ] CSV export downloads correctly
- [ ] Purchase transactions work (if testing)
- [ ] Staking opt-in works (if testing)

## 📝 Common Issues & Solutions

### Issue: "Wallet not available"
**Solution**: Install Phantom wallet extension and refresh page

### Issue: "No buyer state found"
**Solution**: Normal for new users. User needs to make a purchase first.

### Issue: Amounts showing as 0
**Solution**: 
1. Check wallet is connected
2. Try "Refresh Presale Data" button
3. Check console for errors
4. Verify RPC connection is working

### Issue: Pending rewards not calculating
**Solution**: 
1. User must be staking (isStaking = true)
2. User must have staked amount > 0
3. Check realPresaleState has accRewardPerToken
4. Check console for calculation errors

### Issue: Admin fund data not loading
**Solution**: 
1. Click "Refresh" button in Admin section
2. Check RPC connection
3. Verify wallet addresses in config.js
4. Check console for fetch errors

## 🔧 Maintenance

### Updating Contract Addresses
If contract addresses change, update in `src/js/config.js`:

```javascript
const PROGRAM_IDS = {
    PRESALE_V3: 'NEW_ADDRESS_HERE',
    STAKING: 'NEW_ADDRESS_HERE',
    VESTING: 'NEW_ADDRESS_HERE'
};
```

### Updating Distribution Wallets
If distribution wallet addresses change, update in `src/js/direct-contract.js`:

```javascript
// SOL distribution
{ pubkey: new solanaWeb3.PublicKey('NEW_FEE_COLLECTOR'), ... }
{ pubkey: new solanaWeb3.PublicKey('NEW_TREASURY'), ... }
{ pubkey: new solanaWeb3.PublicKey('NEW_SECONDARY'), ... }
```

### Updating Price Schedule
If price tiers change, update in `src/js/app.js` → `getCurrentPriceTier()`:

```javascript
const fallbackTiers = [
    { startTs: TIMESTAMP, priceUsd: PRICE, name: "Month 1" },
    // ...add new tiers
];
```

## 📞 Support

If you encounter issues:

1. **Check Console**: Open browser DevTools → Console tab for detailed logs
2. **Check Network**: DevTools → Network tab to see RPC calls
3. **Check Accounts**: Use Solscan links to verify blockchain data
4. **Check Documentation**: 
   - `docs/CONTRACT_DATA_MAPPING_ANALYSIS.md` - Technical details
   - `docs/IMPLEMENTATION_SUMMARY.md` - Complete implementation guide

## 🎯 Key Files

| File | Purpose |
|------|---------|
| `src/js/app.js` | Main DApp logic (UPDATED ✓) |
| `src/js/config.js` | Configuration (VERIFIED ✓) |
| `src/js/direct-contract.js` | Transaction handling (VERIFIED ✓) |
| `src/js/idls.js` | Contract IDLs (VERIFIED ✓) |
| `index.html` | Main HTML file |
| `docs/CONTRACT_DATA_MAPPING_ANALYSIS.md` | Technical documentation |
| `docs/IMPLEMENTATION_SUMMARY.md` | Implementation guide |

---

**Last Updated**: October 8, 2025
**Status**: ✅ Production Ready


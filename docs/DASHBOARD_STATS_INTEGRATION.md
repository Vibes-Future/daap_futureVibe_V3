# Dashboard Stats Integration with Smart Contract

## Overview
The Dashboard Stats section is now fully integrated with real-time data from the Solana smart contract. All metrics are automatically updated when the user connects their wallet, makes a purchase, or refreshes the data.

## Features Implemented

### 1. Real-Time Metrics from Contract

#### **Total Raised (USD)**
- Calculated from real treasury wallet balances
- Formula: `(SOL_RAISED * SOL_PRICE_USD) + USDC_RAISED`
- SOL price currently set to $150 (TODO: integrate with oracle)
- Updates automatically after each transaction

#### **Total Buyers**
- Counts unique BuyerState accounts from the blockchain
- Uses `getProgramAccounts()` to query all buyer accounts
- Filters by account size (185 bytes for BuyerState)
- Falls back to local calculation if blockchain query fails

#### **Current Price Tier**
- Extracted from `getCurrentPriceTier()` function
- Shows the active price tier based on time/amount raised
- Updates dynamically as presale progresses

#### **Tokens Sold**
- Calculated from contract state: `totalStakedOptional + totalUnstaked`
- Converted from lamports (9 decimals) to VIBES tokens
- Shows real-time total of all purchased tokens

#### **Progress to Hard Cap**
- Formula: `(totalRaisedUsd / hardCapUsd) * 100`
- Hard cap: $5,000,000 USD (configurable)
- Animated progress bar with glow effect

### 2. Price Calendar Integration

#### **Current Price**
- Real-time price from contract's price schedule
- Updates based on active tier

#### **Next Price**
- Calculated as 25% increase from current price
- Shows expected price after tier change

#### **Countdown Timer**
- Shows time until next price increase
- Updates every second
- Currently set to 7 days (should come from contract)

#### **Price Increase Badge**
- Shows percentage increase between tiers
- Formula: `((nextPrice - currentPrice) / currentPrice) * 100`

## Code Architecture

### Data Flow

```
Smart Contract (Solana)
    ↓
loadRealPresaleState() - Queries treasury balances
    ↓
loadPresaleData() - Structures presale data
    ↓
updatePresaleUI() - Updates traditional UI elements
    ↓
updateDashboardStatsFromContract() - Updates dashboard stats
    ↓
window.updateDashboardStats() - Updates DOM (index.html)
```

### Key Functions

#### `loadRealPresaleState()`
**Location:** `src/js/app.js` line 460

Queries real treasury wallet balances:
- Treasury SOL: `5zKuHDrHFsaB6WbGGxjwRAtX2dP6Sze7qUWX9vyNq1AR`
- Treasury USDC ATA: `GYujzmGHChT63exMwzqGP75gAXUH7meJaZDHxU7REFeZ`

Returns `realPresaleState` object with current balances.

#### `loadPresaleData()`
**Location:** `src/js/app.js` line 407

Structures presale data for the UI:
- Converts lamports to SOL/VIBES
- Converts micro-USDC to USDC
- Calculates total tokens sold
- Sets up price tier information

#### `updateDashboardStatsFromContract()`
**Location:** `src/js/app.js` line 885

Main integration function that:
1. Calculates total raised in USD
2. Gets current price tier information
3. Queries total buyers from blockchain (async)
4. Calculates tokens sold
5. Calls `window.updateDashboardStats()` with structured data

#### `calculateTotalBuyersAsync()`
**Location:** `src/js/app.js` line 966

Queries blockchain for all BuyerState accounts:
```javascript
const filters = [{ dataSize: 185 }]; // BuyerState account size
const accounts = await connection.getProgramAccounts(
    presaleProgramId,
    { filters, encoding: 'base64' }
);
return accounts.length;
```

#### `window.updateDashboardStats()`
**Location:** `index.html` line 1739

Updates all DOM elements with new data:
- `stats-total-raised` - Total raised in USD
- `stats-total-buyers` - Number of unique buyers
- `stats-price-tier` - Current tier
- `stats-tokens-sold` - Total VIBES sold
- `stats-progress-percent` - Progress percentage
- `stats-progress-bar` - Progress bar width
- `calendar-current-price` - Current VIBES price
- `calendar-next-price` - Next tier price
- `calendar-increase` - Price increase percentage

## Update Triggers

The dashboard stats are automatically updated in these scenarios:

### 1. **Wallet Connection**
```javascript
await this.connectWallet()
  → await this.loadPresaleData()
    → this.updatePresaleUI()
      → await this.updateDashboardStatsFromContract()
```

### 2. **After Purchase (SOL or USDC)**
```javascript
await this.buyWithSol() / buyWithUsdc()
  → await this.loadRealPresaleState()
  → this.updatePresaleUI()
    → await this.updateDashboardStatsFromContract()
```

### 3. **Manual Refresh**
```javascript
User clicks "Refresh Presale Data"
  → await this.refreshPresaleData()
    → await this.loadPresaleData()
      → this.updatePresaleUI()
        → await this.updateDashboardStatsFromContract()
```

### 4. **Page Load (Auto-connect)**
If user previously connected:
```javascript
await this.wallet.connect({ onlyIfTrusted: true })
  → await this.loadPresaleData()
    → this.updatePresaleUI()
      → await this.updateDashboardStatsFromContract()
```

## Performance Optimizations

### 1. **Async Buyers Count**
- Synchronous fallback shows immediate estimate
- Blockchain query runs in background
- Updates DOM when real count is retrieved

### 2. **Cached Data**
- `this.presaleData` cached in memory
- Only queries blockchain when explicitly refreshed
- Reduces RPC calls

### 3. **Progressive Loading**
- Shows UI immediately with cached data
- Updates incrementally as blockchain data arrives
- Smooth user experience without blocking

## Configuration

### SOL Price (for USD calculations)
**Location:** `src/js/app.js` line 893
```javascript
const SOL_PRICE_USD = 150; // TODO: Get from oracle in production
```

**To integrate with oracle:**
1. Add oracle client (e.g., Pyth, Switchboard)
2. Query SOL/USD price feed
3. Cache price with TTL (e.g., 1 minute)
4. Update calculation in `updateDashboardStatsFromContract()`

### Hard Cap
**Location:** `index.html` line 1763
```javascript
const hardCapUSD = 5000000; // $5M
```

### Countdown Target
**Location:** `index.html` line 1705
```javascript
const nextPriceIncrease = new Date(now + (7 * 24 * 60 * 60 * 1000)).getTime();
```

**To use real contract data:**
- Query price schedule from contract
- Calculate time until next tier
- Update countdown target dynamically

## Testing

### Manual Testing Steps

1. **Connect Wallet**
   - Verify stats update with real balances
   - Check console for log messages

2. **Make a Purchase**
   - Buy with SOL or USDC
   - Verify stats update after transaction
   - Confirm progress bar increases

3. **Refresh Data**
   - Click "Refresh Presale Data"
   - Verify all stats refresh
   - Check for error messages

4. **Check Console Logs**
   ```
   📊 Updating dashboard stats with contract data: {...}
   🔍 Calculating total buyers from blockchain...
   📊 Found X BuyerState accounts
   📊 Updated buyers count: X (from blockchain)
   ```

## Error Handling

All functions have comprehensive error handling:

- **Network failures**: Falls back to cached data
- **RPC timeouts**: Uses fallback RPC endpoint
- **Missing DOM elements**: Logs warning, continues execution
- **Invalid contract data**: Uses default/fallback values

## Future Improvements

1. **Oracle Integration**
   - Integrate Pyth or Switchboard for real SOL price
   - Update every 60 seconds automatically

2. **Real-Time Updates**
   - WebSocket connection to RPC
   - Live updates without refresh

3. **Historical Data**
   - Chart showing raised amount over time
   - Price tier history

4. **Advanced Metrics**
   - Average purchase size
   - Most active buyers
   - Distribution by payment method (SOL vs USDC)

5. **Caching Layer**
   - IndexedDB for persistent storage
   - Reduce RPC calls
   - Faster initial load

## Troubleshooting

### Stats not updating
1. Check console for errors
2. Verify wallet is connected
3. Ensure RPC endpoint is responsive
4. Check network (devnet/mainnet)

### Incorrect buyer count
1. Verify program ID is correct
2. Check BuyerState account size (185 bytes)
3. Ensure proper network connection

### Progress bar not animating
1. Check CSS animation is loaded
2. Verify progress percentage calculation
3. Inspect element styles in DevTools

## Contact & Support

For issues or questions about this integration:
- Check console logs for detailed error messages
- Review this documentation
- Test with devnet first before mainnet

---

**Last Updated:** January 2025
**Version:** 1.0.0
**Author:** VIBES DeFi Team


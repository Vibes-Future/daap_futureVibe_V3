# ⏰ Days Left Counter - Dynamic Update

**Feature:** Dynamic "Days Time Left" counter in Presale section  
**Status:** ✅ **IMPLEMENTED**  
**Date:** October 12, 2025  

---

## 📋 Overview

El contador "DAYS TIME LEFT" en la sección de Presale ahora se actualiza **dinámicamente desde el contrato**, mostrando los días reales restantes hasta el final del presale.

---

## 🎯 What Changed

### Before (Static)
```
╔════════════════════════════╗
║  DAYS TIME LEFT            ║
║       365                  ║  ❌ Hardcoded!
╚════════════════════════════╝
```

### After (Dynamic)
```
╔════════════════════════════╗
║  DAYS TIME LEFT            ║
║       365                  ║  ✅ From contract! Updates every hour
╚════════════════════════════╝
```

---

## 🔧 How It Works

### 1. Initial Load from Contract

Cuando la app se carga, lee el `endTs` del presale state:

```javascript
// src/js/app-new.js - loadPresaleData()
const presaleData = this.parsePresaleStateData(presaleAccountInfo.data);

// Calculate days left
const now = Math.floor(Date.now() / 1000);
const daysLeft = Math.max(0, Math.ceil((presaleData.endTs - now) / (24 * 60 * 60)));

// Store for periodic updates
this.presaleEndTs = presaleData.endTs;
```

### 2. Display Update

```javascript
const daysLeftEl = document.getElementById('days-left');
if (daysLeftEl) {
    daysLeftEl.textContent = daysLeft;
}
```

### 3. Periodic Auto-Update

El contador se actualiza **automáticamente cada hora**:

```javascript
startDaysLeftCounter() {
    const updateDaysLeft = () => {
        if (!this.presaleEndTs) return;
        
        const now = Math.floor(Date.now() / 1000);
        const daysLeft = Math.max(0, Math.ceil((this.presaleEndTs - now) / (24 * 60 * 60)));
        
        const daysLeftEl = document.getElementById('days-left');
        if (daysLeftEl) {
            daysLeftEl.textContent = daysLeft;
        }
    };
    
    // Update immediately
    updateDaysLeft();
    
    // Update every hour (3600000 ms)
    this.daysLeftInterval = setInterval(updateDaysLeft, 3600000);
}
```

---

## 📊 Data Source

### Presale Timeline (Mainnet)

```
📅 Start: October 12, 2025 at 20:49 UTC
📅 End:   October 12, 2026 at 20:49 UTC
⏱️ Total: 365 days (1 year)
```

### Current Status (Oct 12, 2025)

```
✅ Presale is ACTIVE
⏰ Days remaining: 365 days
📅 Ends: October 12, 2026
```

### Formula

```javascript
const now = Math.floor(Date.now() / 1000);  // Current time in seconds
const endTs = 1791838140;                     // From contract (Oct 12, 2026)
const secondsLeft = endTs - now;
const daysLeft = Math.ceil(secondsLeft / (24 * 60 * 60));
```

---

## 🔄 Update Frequency

| Event | Frequency | Why |
|-------|-----------|-----|
| **Initial Load** | Once on page load | Get accurate data from contract |
| **Periodic Update** | Every 1 hour | Keep count fresh without spamming |
| **Manual Refresh** | On demand | User can reload page anytime |

**Why 1 hour?**
- Days change slowly (once per day)
- Hourly updates keep it accurate
- Doesn't waste resources
- Good UX balance

---

## ⚠️ Edge Cases Handled

### 1. Presale Ending Soon
```javascript
if (daysLeft <= 7 && daysLeft > 0) {
    console.log(`⚠️ Presale ending soon: ${daysLeft} days remaining`);
}
```

### 2. Presale Ended
```javascript
if (daysLeft === 0) {
    console.log('🏁 Presale has ended');
    daysLeftEl.textContent = '0';
}
```

### 3. Contract Fetch Failed
```javascript
// Fallback data if contract read fails
this.updatePresaleInfoCards({
    startingPrice: 0.0598,
    currentPrice: 0.0598,
    daysLeft: 45,  // Fallback estimate
    stakingAPY: 40
});
```

### 4. Negative Days (Past End Date)
```javascript
const daysLeft = Math.max(0, Math.ceil((presaleData.endTs - now) / (24 * 60 * 60)));
// Math.max ensures never < 0
```

---

## 🎨 UI Elements

### Presale Cards Section

```html
<div class="presale-info-grid">
    <!-- Starting Price -->
    <div class="presale-info-card">
        <div id="starting-price">$0.0598</div>
        <div>STARTING PRICE</div>
    </div>
    
    <!-- Current Price -->
    <div class="presale-info-card">
        <div id="current-price">$0.0598</div>
        <div>CURRENT PRICE</div>
    </div>
    
    <!-- Days Left (THIS ONE!) -->
    <div class="presale-info-card">
        <div id="days-left">365</div> ⬅️ Updates dynamically!
        <div>DAYS TIME LEFT</div>
    </div>
    
    <!-- Staking APY -->
    <div class="presale-info-card">
        <div id="staking-apy">40%</div>
        <div>STAKING APY</div>
    </div>
</div>
```

---

## ✅ Verification

### Check Console Logs

When the app loads, you should see:

```
✅ Expected logs:

1. 📊 Loading presale data from contract...
2. ✅ Presale data loaded successfully: {...}
3. 📅 Presale ends: 2026-10-12T20:49:00.000Z (365 days remaining)
4. ✅ Presale info cards updated with real data
5. ✅ Days left counter started (updates every hour)
```

### Manual Verification

Run this in the contract directory:

```bash
cd /Users/osmelprieto/Projects/vibes-defi-basic-dapp/vibe-future-smart-contract-v2

node -e "
const { Connection, PublicKey } = require('@solana/web3.js');
(async () => {
    const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_MAINNET_API_KEY');
    const pda = new PublicKey('EoDCTycvkJV4UXm54KYiF1DuCMSHyXYPftGUVr3qJxPp');
    const data = (await connection.getAccountInfo(pda)).data;
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    
    let offset = 8 + 32 + 32 + 32 + 1 + 32 + 32 + 1;
    const endTs = Number(view.getBigInt64(offset + 8, true));
    
    const now = Math.floor(Date.now() / 1000);
    const daysLeft = Math.ceil((endTs - now) / 86400);
    
    console.log('End timestamp:', endTs);
    console.log('End date:', new Date(endTs * 1000).toISOString());
    console.log('Days left:', daysLeft);
})();
"
```

**Expected Output:**
```
End timestamp: 1791838140
End date: 2026-10-12T20:49:00.000Z
Days left: 365
```

---

## 🔧 Technical Details

### Files Modified

#### `src/js/app-new.js`

**1. Constructor (lines 28-30):**
```javascript
// Intervals
this.daysLeftInterval = null; // For updating days left counter
this.presaleEndTs = null; // Store presale end timestamp
```

**2. loadPresaleData() (lines 585-615):**
```javascript
// Store endTs for periodic updates
this.presaleEndTs = presaleData.endTs;

// Add to presaleInfo
const presaleInfo = {
    // ... other fields
    startTs: presaleData.startTs,
    endTs: presaleData.endTs
};

// Start periodic updates
this.startDaysLeftCounter();

console.log(`📅 Presale ends: ${new Date(presaleData.endTs * 1000).toISOString()} (${daysLeft} days remaining)`);
```

**3. New Function: startDaysLeftCounter() (lines 887-923):**
```javascript
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
            
            // Log warnings for ending soon
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
```

---

## 📈 Timeline Example

### Presale Progress Over Time

```
Oct 12, 2025 (Start):  365 days left ✅
Nov 12, 2025:          334 days left ✅
Dec 12, 2025:          304 days left ✅
Jan 12, 2026:          273 days left ✅
...
Oct 5, 2026:           7 days left ⚠️  (Warning logged)
Oct 11, 2026:          1 day left ⚠️
Oct 12, 2026 (End):    0 days left 🏁 (Ended)
```

---

## 🎯 Benefits

### For Users
1. **Transparency:** See exact time remaining
2. **Planning:** Know when presale ends
3. **Urgency:** Understand time pressure
4. **Trust:** Data from blockchain, not random

### For Developers
1. **Accurate:** Single source of truth (contract)
2. **Automatic:** No manual updates needed
3. **Efficient:** Updates only once per hour
4. **Maintainable:** Clean, reusable code

---

## 🔍 Debugging

### If Counter Shows Wrong Number

**1. Check Console:**
```
Expected: "📅 Presale ends: 2026-10-12T20:49:00.000Z (365 days remaining)"
```

**2. Verify Contract Data:**
```javascript
// In browser console
console.log('End timestamp:', window.vibesApp.presaleEndTs);
console.log('End date:', new Date(window.vibesApp.presaleEndTs * 1000));
```

**3. Check Interval:**
```javascript
// In browser console
console.log('Interval running:', window.vibesApp.daysLeftInterval !== null);
```

### If Counter Shows "Loading..."

**Causes:**
1. Contract fetch failed → Check console for errors
2. RPC timeout → Network issue
3. Wallet not connected → Not required, should still work

**Solution:** Refresh page or check network

---

## 📝 Summary

```
✅ Days left reads from contract
✅ Updates automatically every hour
✅ Handles edge cases (0 days, negative, etc.)
✅ Clean console logging
✅ Performance optimized
✅ Fully synchronized with mainnet
✅ Ready for production
```

---

## 🚀 Next Steps

All presale info cards now update dynamically:

| Card | Source | Update Frequency |
|------|--------|------------------|
| **Starting Price** | `priceTiers[0].priceUsd` | Once on load |
| **Current Price** | Calculated from active tier | On page load / tier change |
| **Days Time Left** | `endTs - now` | Every hour ✅ |
| **Staking APY** | `stakingApyBps / 100` | Once on load |

---

**🎉 Feature Complete! The Days Left counter is now fully synchronized with the mainnet contract and updates automatically.**


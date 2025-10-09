# 📊 Purchase Token Calculator - Real-time Conversion

## Overview
Implementation of a real-time token calculator that shows users exactly how many $VIBES tokens they will receive when purchasing with SOL or USDC.

## 🎯 Features

### Visual Display
- **Real-time Calculation**: Updates instantly as user types in the input fields
- **Price Information**: Shows current SOL price and VIBES price
- **Formatted Output**: Clean number formatting with commas and decimals
- **Responsive Design**: Matches VIBES global design system

### Calculation Logic

#### For SOL Purchases:
```javascript
// Formula: (SOL Amount × SOL Price in USD) ÷ VIBES Price in USD
const usdValue = solAmount * solPrice;
const vibesAmount = usdValue / vibesPrice;
```

#### For USDC Purchases:
```javascript
// Formula: USDC Amount ÷ VIBES Price in USD (USDC = 1:1 with USD)
const vibesAmount = usdcAmount / vibesPrice;
```

## 🔧 Technical Implementation

### HTML Structure

#### SOL Purchase Display:
```html
<div id="sol-vibes-display">
    <div>
        <span>You will receive:</span>
        <span id="sol-vibes-amount">0 $VIBES</span>
    </div>
    <div>
        <span>SOL Price: $<span id="sol-price-display">0</span></span>
        <span>VIBES Price: $<span id="sol-vibes-price-display">0</span></span>
    </div>
</div>
```

#### USDC Purchase Display:
```html
<div id="usdc-vibes-display">
    <div>
        <span>You will receive:</span>
        <span id="usdc-vibes-amount">0 $VIBES</span>
    </div>
    <div>
        <span>VIBES Price: $<span id="usdc-vibes-price-display">0</span></span>
    </div>
</div>
```

### JavaScript Functions

#### Price Fetching:
- `getSolPrice()`: Fetches current SOL price from CoinGecko API with caching
- `getVibesPrice()`: Retrieves VIBES price from contract or displayed value

#### Calculation:
- `calculateVibesFromSol(solAmount)`: Calculates VIBES from SOL input
- `calculateVibesFromUsdc(usdcAmount)`: Calculates VIBES from USDC input

#### Display Updates:
- `updateSolVibesDisplay()`: Updates SOL purchase display
- `updateUsdcVibesDisplay()`: Updates USDC purchase display

#### Initialization:
- `setupPurchaseCalculators()`: Sets up event listeners on inputs
- `startPriceUpdates()`: Starts periodic price cache refresh (60s interval)

## 🎨 Styling

### Color Scheme:
- Background: `rgba(199, 248, 1, 0.08)` - Light green glow
- Border: `rgba(199, 248, 1, 0.2)` - Green accent
- VIBES Amount: `#c7f801` - Bright green (brand color)
- Labels: `rgba(255, 255, 255, 0.7)` - White with transparency
- Price Info: `rgba(255, 255, 255, 0.5)` - Subtle white

### Responsive Behavior:
- Display only shows when user enters a value > 0
- Automatically hides when input is empty or zero

## 🔄 Price Caching & Updates

### Cache Strategy:
```javascript
let cachedSolPrice = null;
let cachedVibesPrice = null;
```

- Prices are cached in memory to reduce API calls
- Cache refreshes every 60 seconds automatically
- Fallback prices used if API fails:
  - SOL: $150
  - VIBES: $0.0598

### Update Frequency:
- **User Input**: Instant calculation on every keystroke
- **Price Cache**: Refreshed every 60 seconds
- **Display**: Updates immediately when prices refresh

## 📱 User Experience

### Visual Feedback:
1. User types amount in SOL/USDC input
2. Display box fades in with calculated VIBES amount
3. Price information shows below for transparency
4. Numbers formatted with proper decimals and commas

### Example Flow:

**User Input: 1 SOL**
```
You will receive: 2,508.36 $VIBES
SOL Price: $150.00 • VIBES Price: $0.0598
```

**User Input: 100 USDC**
```
You will receive: 1,672.24 $VIBES
VIBES Price: $0.0598
```

## 🛠️ Integration Points

### Data Sources:
1. **SOL Price**: CoinGecko API (`https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd`)
2. **VIBES Price**: 
   - Primary: Contract presale state via `window.vibesApp.contractClient.getPresaleStateFromContract()`
   - Fallback: DOM element `#current-price`
   - Final fallback: Hardcoded $0.0598

### Event Listeners:
```javascript
solInput.addEventListener('input', updateSolVibesDisplay);
solInput.addEventListener('change', updateSolVibesDisplay);
usdcInput.addEventListener('input', updateUsdcVibesDisplay);
usdcInput.addEventListener('change', updateUsdcVibesDisplay);
```

## ⚡ Performance Optimizations

1. **Caching**: Prices cached to minimize API calls
2. **Debouncing**: Natural debouncing via async operations
3. **Lazy Loading**: Display only renders when needed
4. **Efficient Updates**: Only refreshes if input exists

## 🐛 Error Handling

### API Failures:
- Graceful fallback to default prices
- Console warnings for debugging
- User experience not disrupted

### Invalid Input:
- Display hides for empty or zero values
- Negative numbers handled by input `min="0"`
- Non-numeric input handled by `parseFloat()` returning NaN

## 📝 Code Location

- **HTML**: `index.html` lines 2608-2619 (SOL), 2641-2649 (USDC)
- **JavaScript**: `index.html` lines 4037-4241
- **Initialization**: Automatic on DOM ready

## 🚀 Future Enhancements

Potential improvements:
- Add loading indicator while fetching prices
- Show price change percentage
- Display gas fees estimate
- Add bonus/discount calculations
- Show transaction breakdown
- Historical price charts
- Multi-currency support

## ✅ Testing

### Test Cases:
1. ✅ Enter SOL amount → Display shows correct VIBES
2. ✅ Enter USDC amount → Display shows correct VIBES
3. ✅ Clear input → Display hides automatically
4. ✅ API fails → Fallback prices used
5. ✅ Price refresh → Values update if input exists
6. ✅ Multiple rapid inputs → Smooth updates

---

**Status**: ✅ Fully Implemented  
**Version**: 1.0  
**Date**: October 9, 2025


# 🖼️ Assets Organization Guide

## Overview
This document describes the organization of image assets in the project for better maintainability and structure.

## Directory Structure

```
daap_futureVibe_V3/
├── src/
│   ├── images/              # All project images and logos
│   │   ├── Logo Solana.png  # Solana logo for SOL purchases
│   │   ├── Logo USDC.png    # USDC logo for USDC purchases
│   │   └── FUTURE _VIBES_512x512.png  # Main VIBES project logo
│   └── js/                  # JavaScript files
├── pic/                     # Screenshots and documentation images
└── index.html               # Main application file
```

## Image Assets

### Main Logo
- **File**: `src/images/FUTURE _VIBES_512x512.png`
- **Usage**: Main navigation logo
- **Location in HTML**: Header navigation (line ~2554)

### Payment Method Logos

#### Solana Logo
- **File**: `src/images/Logo Solana.png`
- **Usage**: 
  - Purchase card header icon (32x32px)
  - "Buy with SOL" button icon (20x20px)
- **Location in HTML**: Purchase section SOL card (lines ~2838, ~2864)

#### USDC Logo
- **File**: `src/images/Logo USDC.png`
- **Usage**: 
  - Purchase card header icon (32x32px)
  - "Buy with USDC" button icon (20x20px)
- **Location in HTML**: Purchase section USDC card (lines ~2872, ~2897)

## Implementation Details

### Purchase Card Icons
The logos are displayed in the purchase card headers with the following specifications:
- **Size**: 32x32 pixels
- **Styling**: `object-fit: contain` to maintain aspect ratio
- **Container**: `.purchase-icon` div with gradient background

```html
<div class="purchase-icon">
    <img src="src/images/Logo Solana.png" alt="Solana Logo" style="width: 32px; height: 32px; object-fit: contain;">
</div>
```

### Button Icons
The logos are also displayed in the purchase buttons:
- **Size**: 20x20 pixels
- **Layout**: Flexbox with 8px gap between icon and text
- **Styling**: Centered alignment

```html
<button id="buy-sol" class="btn btn-success" style="width: 100%; margin: 10px 0 0 0; display: flex; align-items: center; justify-content: center; gap: 8px;">
    <img src="src/images/Logo Solana.png" alt="SOL" style="width: 20px; height: 20px; object-fit: contain;">
    Buy with SOL
</button>
```

## Benefits of This Organization

1. **✅ Clean Project Structure**: All images in a dedicated folder
2. **✅ Easy Maintenance**: Clear location for all visual assets
3. **✅ Better Performance**: Optimized loading with proper paths
4. **✅ Scalability**: Easy to add new logos or images in the future
5. **✅ Professional Appearance**: Consistent branding with PNG logos

## Adding New Images

To add new image assets to the project:

1. Place the image file in `src/images/`
2. Reference it in your HTML/CSS with the path: `src/images/filename.png`
3. Update this documentation with the new asset information

## Migration Summary

**Date**: October 10, 2025

**Changes Made**:
- ✅ Created `src/images/` directory
- ✅ Moved `Logo Solana.png` from root to `src/images/`
- ✅ Moved `Logo USDC.png` from root to `src/images/`
- ✅ Moved `FUTURE _VIBES_512x512.png` from root to `src/images/`
- ✅ Updated all HTML references to use new paths
- ✅ Replaced emoji icons (◎, 💵) with professional PNG logos

**Affected Files**:
- `index.html` - Updated 5 image references

**Benefits**:
- Professional appearance with branded logos
- Better organization and maintainability
- Consistent with web development best practices


# 🚀 Quick Start Guide - VIBES Admin DApp

## ⚡ 5-Minute Setup

### Prerequisites
- ✅ Node.js (v16 or higher)
- ✅ Solana wallet (Phantom, Solflare, or Trust Wallet)
- ✅ Modern web browser

---

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd vibe-dapp-admin

# Install dependencies
npm install

# Start development server
npm start
```

The app will be available at: **http://localhost:8080**

---

## 🔗 Connecting Your Wallet

### Step 1: Install a Wallet

**Recommended**: [Phantom Wallet](https://phantom.app/)

Or choose from:
- [Solflare](https://solflare.com/)
- [Trust Wallet](https://trustwallet.com/)
- [Coinbase Wallet](https://www.coinbase.com/wallet)
- [Backpack](https://backpack.app/)

### Step 2: Connect

1. Click the **"Connect Wallet"** button
2. Your wallet will prompt you to approve the connection
3. Click **"Approve"**
4. Your wallet address will appear on screen

### Step 3: Verify Connection

You should see:
- ✅ Your wallet address (shortened)
- ✅ Your SOL balance
- ✅ A "Disconnect" button

---

## 🎯 Key Features

### 1. Wallet Management
- Connect/disconnect wallet
- View balances
- Automatic reconnection

### 2. Admin Dashboard
- View presale statistics
- Monitor total raised funds
- Track buyer information

### 3. Real-Time Updates
- Automatic balance updates
- Live presale data
- Event notifications

---

## 🛠️ Common Tasks

### View Wallet Balance
```javascript
// In browser console:
app.getPublicKey()?.toString()
console.log('Balance:', app.balances.sol, 'SOL')
```

### Detect Available Wallets
```javascript
// In browser console:
app.getWalletManager().getAvailableWallets()
```

### Refresh Data
Click the **"Refresh"** button or:
```javascript
// In browser console:
app.refreshData()
```

### Check Connection Status
```javascript
// In browser console:
app.isConnected()
```

---

## 🐛 Debugging

### Open Browser Console
- **Chrome/Edge**: Press `F12` or `Ctrl+Shift+J`
- **Firefox**: Press `F12` or `Ctrl+Shift+K`
- **Safari**: Press `Cmd+Option+C`

### Debug Commands

```javascript
// Get app instance
window.app

// Get wallet manager
app.getWalletManager()

// Get available wallets
app.getWalletManager().getAvailableWallets()

// Check connection
app.isConnected()

// Get public key
app.getPublicKey()?.toString()

// Manual connection
app.connectWallet('Phantom')

// Disconnect
app.disconnectWallet()
```

---

## ❓ Troubleshooting

### "No wallet detected"
1. Install a Solana wallet extension
2. Refresh the page
3. Ensure wallet is unlocked

### "Connection failed"
1. Check wallet is unlocked
2. Try a different wallet
3. Clear browser cache
4. Restart browser

### "Transaction failed"
1. Ensure sufficient SOL for gas fees
2. Check network connectivity
3. Verify wallet permissions

---

## 📝 Configuration

### Environment Variables

Create a `.env` file:

```env
# Network Configuration
RPC_URL=https://api.devnet.solana.com

# Contract Addresses
PRESALE_PROGRAM_ID=YourPresaleProgramID
USDC_MINT_ADDRESS=YourUSDCMintAddress
```

### Network Selection

Edit `src/js/config.js`:

```javascript
const NETWORK_CONFIG = {
    NETWORK: 'devnet', // or 'mainnet-beta'
    RPC_URL: 'https://api.devnet.solana.com',
    // ... other config
};
```

---

## 🎨 UI Customization

### Theme Colors

Edit CSS variables in `index.html`:

```css
:root {
    --primary-0: #798F1D;
    --primary-1: #BCE70C;
    --primary-2: #BCFFA4;
    /* ... more colors */
}
```

---

## 📊 Monitoring

### View Logs

All actions are logged to the console. Look for:
- 🟢 Success messages (green)
- 🟡 Warnings (yellow)
- 🔴 Errors (red)
- 🔵 Info messages (blue)

---

## 🔐 Security Tips

1. **Never share your private key or seed phrase**
2. **Always verify transaction details before signing**
3. **Use hardware wallets for large amounts**
4. **Keep your wallet software updated**
5. **Be cautious of phishing attempts**

---

## 📱 Mobile Support

The app is mobile-responsive. For mobile wallets:
1. Use the wallet's built-in browser
2. Or use WalletConnect (coming soon)

---

## 🆘 Getting Help

### Resources
- 📖 [Full Documentation](./WALLET_CONNECTION_SOLUTION.md)
- 🐛 [Report Issues](https://github.com/vibes-defi/admin-dapp/issues)
- 💬 [Community Discord](https://discord.gg/vibes-defi)

### Support Channels
- Email: support@vibes-defi.com
- Discord: Join our community server
- Twitter: @VIBESDeFi

---

## 🎓 Next Steps

1. ✅ Connect your wallet
2. ✅ Explore the admin dashboard
3. ✅ View presale statistics
4. ✅ Monitor buyer information
5. ✅ Customize the UI (optional)

---

## 🔄 Updates

To get the latest version:

```bash
git pull origin main
npm install
npm start
```

---

**Happy building! 🚀**

*For detailed documentation, see [WALLET_CONNECTION_SOLUTION.md](./WALLET_CONNECTION_SOLUTION.md)*


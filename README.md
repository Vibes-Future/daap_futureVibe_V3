# 💎 VIBES DeFi - Admin Dashboard

> **Professional Admin DApp for VIBES Token Presale**  
> Built with Vanilla JavaScript + Solana Wallet Standard

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/vibes-defi/admin-dapp)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Solana](https://img.shields.io/badge/Solana-Devnet-purple.svg)](https://solana.com)

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Open browser
http://localhost:8080
```

**That's it!** The app will be running and ready to connect your wallet.

---

## ✨ Features

### 🔐 Wallet Management
- **Multi-Wallet Support**: Phantom, Solflare, Trust Wallet, Coinbase, Backpack
- **Solana Wallet Standard**: Professional implementation following official protocol
- **Auto-Detection**: Automatically detects installed wallets
- **Auto-Reconnect**: Maintains connection after page refresh 🆕
- **Secure Connection**: User-controlled, non-custodial wallet integration

### 📊 Admin Dashboard
- **Presale Information**: Visual cards showing pricing, countdown, and staking APY
- **Real-Time Stats**: User balances and wallet information
- **Live Updates**: Automatic balance refresh and data sync
- **Clean Interface**: Streamlined UI focused on core functionality
- **Fund Distribution**: Monitor treasury allocation
- **Smart Notifications**: Professional toast notification system 🆕

### 🎯 Smart Contract Integration
- **Direct Contract Calls**: No intermediaries, maximum reliability
- **Transaction Signing**: Secure transaction approval flow
- **Error Handling**: Professional error messages and recovery

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  VIBES Admin DApp                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐        ┌─────────────────────────┐  │
│  │VibesAdminApp │  ◄────►│ SolanaWalletManager     │  │
│  │(app-new.js)  │        │(Wallet Standard v2.0)   │  │
│  └──────────────┘        └─────────────────────────┘  │
│         │                          │                   │
│         ▼                          ▼                   │
│  ┌──────────────┐        ┌─────────────────────────┐  │
│  │Solana RPC    │        │Wallet Providers         │  │
│  │Connection    │        │- Phantom                │  │
│  └──────────────┘        │- Solflare               │  │
│                          │- Trust Wallet           │  │
│                          │- Coinbase & more        │  │
│                          └─────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Technology Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | Vanilla JavaScript (ES6+) |
| **Blockchain** | Solana (Devnet/Mainnet) |
| **Wallet Integration** | Solana Wallet Standard v2.0 |
| **Smart Contracts** | Anchor Framework (Rust) |
| **Network** | Solana Web3.js |
| **Styling** | CSS3 with VIBES Design System |

---

## 🔧 Configuration

### Environment Setup

1. **Copy environment template**:
```bash
   cp env.example .env
   ```

2. **Edit `.env` file**:
   ```env
# Network Configuration
RPC_URL=https://api.devnet.solana.com
NETWORK=devnet

   # Contract Addresses (Devnet)
PRESALE_PROGRAM_ID=HNPuLPxycypT4YtD5vMZPdcrr53MLKAajYrQwNTv4ujH
USDC_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
VIBES_MINT=C4SeJZr8wJ6BrNUJP52vGZf6QMunWFRgx6kbkb56j3vW
```

### Smart Contract Addresses (Devnet)

| Contract | Address |
|----------|---------|
| **Presale V3** | `HNPuLPxycypT4YtD5vMZPdcrr53MLKAajYrQwNTv4ujH` |
| **Staking** | `3ZaKegZktvjwt4SreDvitLECG47UnPdd4EFzNAnyHDaW` |
| **Vesting** | `3EnPSZpZbKDwVetAiXo9bos4XMDvqg1yqJvew8zh4keP` |

---

## 🎯 Usage

### Connecting Your Wallet

1. **Install a Solana Wallet**:
   - [Phantom](https://phantom.app/) (Recommended)
   - [Solflare](https://solflare.com/)
   - [Trust Wallet](https://trustwallet.com/)
   - [Coinbase Wallet](https://www.coinbase.com/wallet)

2. **Click "Connect Wallet"** in the app

3. **Approve the connection** in your wallet

4. **Start using the admin features**

### Using the Admin Dashboard

```javascript
// Access the app instance in browser console
window.app

// Check connection status
app.isConnected()

// Get wallet address
app.getPublicKey()?.toString()

// Get available wallets
app.getWalletManager().getAvailableWallets()

// Refresh data manually
app.refreshData()
```

---

## 📁 Project Structure

```
vibe-dapp-admin/
├── src/
│   └── js/
│       ├── config.js                    # Configuration & constants
│       ├── notifications.js             # Notification system (NEW ✨)
│       ├── solana-wallet-standard.js    # Wallet manager
│       ├── app-new.js                   # Main app logic
│       ├── idls.js                      # Smart contract IDLs
│       └── direct-contract.js           # Contract interactions
├── docs/
│   ├── NOTIFICATION_SYSTEM.md           # Notification docs (NEW ✨)
│   ├── README_NOTIFICATIONS_IMPLEMENTATION.md  # Implementation (NEW ✨)
│   ├── WALLET_CONNECTION_SOLUTION.md    # Detailed technical docs
│   ├── QUICK_START_GUIDE.md            # Quick start guide
│   └── [other docs]
├── index.html                           # Main HTML file
├── test-notifications.html              # Notification test page (NEW ✨)
├── test-notifications.bat               # Test launcher (NEW ✨)
├── package.json                         # Dependencies
├── env.example                          # Environment template
└── README.md                           # This file
```

---

## 🔐 Security Features

- ✅ **Non-Custodial**: Your keys never leave your wallet
- ✅ **User Approval**: All transactions require explicit approval
- ✅ **No Private Keys**: Application never handles private keys
- ✅ **Secure Communication**: Standard Solana wallet protocols
- ✅ **Input Validation**: All inputs validated before processing
- ✅ **Error Isolation**: Errors don't expose sensitive information

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **"No wallet detected"** | Install a Solana wallet and refresh the page |
| **"Connection failed"** | Unlock your wallet and try again |
| **"NETWORK_CONFIG not available"** | Check that `config.js` loaded correctly |
| **"Transaction failed"** | Ensure sufficient SOL for gas fees |

### Debug Commands

Open browser console (F12) and try:

```javascript
// Test wallet detection
app.getWalletManager().detectWallets()

// Check app status
app.isConnected()

// View configuration
console.log(NETWORK_CONFIG)

// Connect manually
app.connectWallet('Phantom')
```

---

## 📚 Documentation

### Development Guides

| Document | Description |
|----------|-------------|
| [Quick Start Guide](docs/QUICK_START_GUIDE.md) | Get started in 5 minutes |
| [Notification System](docs/NOTIFICATION_SYSTEM.md) | Complete notification system guide 🆕 |
| [Notification Implementation](docs/README_NOTIFICATIONS_IMPLEMENTATION.md) | Implementation details 🆕 |
| [Wallet Connection Solution](docs/WALLET_CONNECTION_SOLUTION.md) | Technical implementation details |
| [Auto-Reconnect Feature](docs/AUTO_RECONNECT_FEATURE.md) | How auto-reconnect works |
| [Implementation Progress](docs/IMPLEMENTATION_PROGRESS.md) | Development history |

### Server & Deployment

| Document | Description |
|----------|-------------|
| [Server Deployment Guide](docs/SERVER_DEPLOYMENT_GUIDE.md) | Complete production deployment guide |
| [⚡ Quick Fix: 503 Error](docs/SERVICE_503_QUICKFIX.md) | 30-second fix for service down 🆕 |
| [Emergency Service Recovery](docs/EMERGENCY_SERVICE_RECOVERY.md) | Full emergency recovery procedure 🆕 |

---

## 🚀 Deployment

### Quick Deployment to Production Server

**One-command deployment:**

```bash
./scripts/deploy-to-server.sh deploy
```

This script will:
1. ✅ Verify you're on `main` branch
2. ✅ Push latest changes to GitHub
3. ✅ Connect to production server
4. ✅ Clone updated repository
5. ✅ Copy files to production
6. ✅ Restart HTTP service
7. ✅ Verify deployment success

**Other useful commands:**

```bash
# View server status
./scripts/deploy-to-server.sh status

# View real-time logs
./scripts/deploy-to-server.sh logs

# Rollback to previous commit
./scripts/deploy-to-server.sh rollback <commit-hash>

# View help
./scripts/deploy-to-server.sh help
```

### Manual Deployment

For detailed manual deployment instructions, see:

📖 **[docs/SERVER_DEPLOYMENT_GUIDE.md](docs/SERVER_DEPLOYMENT_GUIDE.md)**

This guide includes:
- Complete step-by-step process
- Server architecture
- Troubleshooting tips
- Rollback procedures
- Checklist for each deployment

### Production Environment

- **Server:** server17225.za-internet.net
- **URL:** https://app.futurevibes.io
- **Port:** 3001 (http-server)
- **Directory:** `/var/www/clients/client0/web8/web/`
- **Web Server:** Apache (proxy to localhost:3001)

### Pre-Deployment Checklist

- [ ] Test all features locally
- [ ] Verify wallet connections work
- [ ] Check no console errors (F12)
- [ ] Run security audit: `./scripts/verify_security.sh`
- [ ] Commit and push all changes to GitHub
- [ ] Review last commit: `git log --oneline -5`
- [ ] Deploy during off-peak hours if possible

### Post-Deployment Verification

After deployment, verify:

- [ ] Visit https://app.futurevibes.io
- [ ] Clear browser cache (Ctrl+F5)
- [ ] Connect wallet successfully
- [ ] Verify rewards display correctly (not 0)
- [ ] Check Lucide icons load
- [ ] No errors in console (F12)
- [ ] Test buy functionality
- [ ] Check staking section displays correctly

---

## 🧪 Testing

### Manual Testing

1. **Wallet Connection**:
   - Test with multiple wallets (Phantom, Solflare, etc.)
   - Verify connection/disconnection
   - Check account switching

2. **Admin Features**:
   - Verify stats display correctly
   - Test data refresh functionality
   - Check balance updates

3. **Error Handling**:
   - Test with wallet locked
   - Test with insufficient balance
   - Test network errors

### Automated Testing

```bash
# Run validation tests
npm run test

# Validate configuration
npm run validate
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- ✅ Use ES6+ JavaScript syntax
- ✅ Comment all functions in English
- ✅ Follow the existing code structure
- ✅ Handle errors professionally
- ✅ Use `.env` for secrets (never hardcode)

---

## 📞 Support

### Need Help?

- 📖 [Read the Documentation](docs/)
- 🐛 [Report Issues](https://github.com/vibes-defi/admin-dapp/issues)
- 💬 Join our [Discord Community](https://discord.gg/vibes-defi)
- 📧 Email: support@vibes-defi.com

### Resources

- [Solana Documentation](https://docs.solana.com/)
- [Solana Wallet Standard](https://github.com/solana-labs/wallet-standard)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Anchor Framework](https://www.anchor-lang.com/)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎯 What's New in v2.0.2

### ✨ Latest Features (v2.0.2)

- 🔔 **Professional Notification System**: Beautiful toast notifications for all user actions 🆕
  - ✅ Multiple types: Success, Error, Warning, Info, Transaction
  - 🔗 Transaction links to Solana Explorer
  - 📱 Fully responsive design
  - ⏱️ Auto-dismiss with configurable duration
  - 🎨 Integrated with VIBES Design System
  - 🎯 Smart stacking (max 5 notifications)
  - [📚 Documentation](docs/NOTIFICATION_SYSTEM.md) | [🧪 Test Page](test-notifications.html)

### ✨ Features (v2.0.1)

- 🔄 **Auto-Reconnect**: Wallet stays connected after page refresh
- 💾 **Connection Persistence**: Saves wallet preference in localStorage
- 🔒 **Smart Cleanup**: Respects manual disconnections
- 🧹 **UI Cleanup**: Removed BuyerState Account, Your Purchase, Admin Fund Monitor, and Transaction Log sections for cleaner interface
- 📊 **Presale Info Cards**: Added visual presale information cards with pricing and countdown
- 🏦 **Enhanced Staking**: Complete staking management with visual cards, stake functionality (unstake/claim coming soon)
- ⏰ **Vesting Management**: Visual vesting cards with claim functionality (disabled until presale ends)
- 📱 **Mobile Responsive**: Complete mobile optimization with hamburger menu and touch-friendly interface
- 🎨 **Enhanced UI**: Improved navbar layout, wallet dropdown styling, and mobile menu functionality
- 💎 **Professional Mobile UX**: Side-by-side wallet and menu buttons, modal wallet dropdown with backdrop
- ⚡ **Simplified Dropdown**: Clean, simple wallet dropdown implementation that just works

### ✨ Major Improvements (v2.0.0)

- 🔐 **Professional Wallet Integration**: Complete rewrite using Solana Wallet Standard
- 🏗️ **Better Architecture**: Clean separation of concerns, modular design
- 🐛 **Bug Fixes**: Resolved all wallet connection issues
- 📚 **Comprehensive Documentation**: Detailed guides and technical docs
- 🧪 **Better Testing**: Debug commands and troubleshooting tools

### 🔄 Migration from v1.x

If you're upgrading from v1.x:

1. Remove old wallet files (`wallet-adapter.js`, `wallet-config.js`)
2. Update your imports to use new files (`app-new.js`, `solana-wallet-standard.js`)
3. Update HTML to load new scripts
4. Test wallet connection with your preferred wallet

See [WALLET_CONNECTION_SOLUTION.md](docs/WALLET_CONNECTION_SOLUTION.md) for complete migration guide.

---

## 🌟 Credits

Built with ❤️ by the **VIBES DeFi Team**

Special thanks to:
- Solana Foundation for the blockchain infrastructure
- Wallet providers for their excellent integrations
- The DeFi community for continuous support

---

## 📊 Stats

![Lines of Code](https://img.shields.io/badge/lines%20of%20code-2000%2B-blue)
![Wallets Supported](https://img.shields.io/badge/wallets-5%2B-green)
![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)

---

<div align="center">

**[Get Started](#-quick-start)** • **[Documentation](docs/)** • **[Report Bug](https://github.com/vibes-defi/admin-dapp/issues)**

Made with 💎 for the Solana ecosystem

</div>

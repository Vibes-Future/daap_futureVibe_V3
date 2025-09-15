# VIBES DeFi Basic DApp

A production-ready decentralized application for the VIBES token presale with staking and vesting functionality.

## 🚀 Features

- **Token Purchase**: Buy VIBES tokens with SOL or USDC
- **Purchase Limits**: 250,000 VIBES maximum per wallet (business policy)
- **Staking System**: Optional staking during purchase with 40% APY
- **Vesting**: 12-month vesting for unstaked tokens
- **Admin Dashboard**: Fund distribution monitoring and CSV reports
- **Real-time Data**: Live price tiers, raised amounts, and user balances

## 🔧 Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Blockchain**: Solana (Devnet)
- **Wallet Integration**: Phantom Wallet
- **Smart Contracts**: Anchor Framework (Rust)

## 📁 Project Structure

```
basic-dapp/
├── src/
│   ├── js/
│   │   ├── app.js           # Main application logic
│   │   ├── config.js        # Configuration constants
│   │   ├── direct-contract.js # Direct contract interaction
│   │   └── idls.js          # Smart contract IDLs
│   └── css/                 # Stylesheets
├── index.html               # Main HTML file
├── package.json             # Dependencies
└── README.md               # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Phantom Wallet browser extension
- SOL/USDC on Solana Devnet

### Installation

1. **Clone and install dependencies**:
   ```bash
   cd basic-dapp
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server**:
   ```bash
   # Simple HTTP server
   npx http-server . -p 8080
   
   # Or use Python
   python -m http.server 8080
   ```

4. **Open in browser**:
   ```
   http://localhost:8080
   ```

## 🔧 Configuration

### Environment Variables

```bash
# Network Configuration
RPC_URL=https://api.devnet.solana.com
NETWORK=devnet

# Contract Addresses
PRESALE_PROGRAM_ID=HNPuLPxycypT4YtD5vMZPdcrr53MLKAajYrQwNTv4ujH
USDC_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
VIBES_MINT=C4SeJZr8wJ6BrNUJP52vGZf6QMunWFRgx6kbkb56j3vW
```

### Business Rules

- **Max Purchase**: 250,000 VIBES per wallet (DApp policy)
- **Min Purchase**: 0.1 SOL or 1 USDC
- **Staking APY**: 40% annual percentage yield
- **Vesting Period**: 12 months for unstaked tokens
- **Fee Structure**: 0.5% platform fee, 80/20 treasury distribution

## 📊 Smart Contract Integration

### Contract Addresses (Devnet)

- **Presale V3**: `HNPuLPxycypT4YtD5vMZPdcrr53MLKAajYrQwNTv4ujH`
- **Staking**: `3ZaKegZktvjwt4SreDvitLECG47UnPdd4EFzNAnyHDaW`
- **Vesting**: `3EnPSZpZbKDwVetAiXo9bos4XMDvqg1yqJvew8zh4keP`

### Key Functions

- `buy_with_sol_v3`: Purchase tokens with SOL
- `buy_with_usdc_v3`: Purchase tokens with USDC
- `opt_into_staking`: Enable staking for purchased tokens
- `claim_staking_rewards`: Claim accumulated staking rewards

## 🛡️ Security Features

- **Purchase Validation**: Client-side and contract-level limits
- **Wallet Verification**: Phantom wallet integration with signature verification
- **Transaction Simulation**: Pre-flight checks before real transactions
- **Error Handling**: Comprehensive error messages and fallbacks

## 📈 Monitoring & Analytics

### Admin Dashboard Features

- **Fund Distribution**: Real-time treasury, secondary, and fee tracking
- **Transaction History**: Detailed purchase and staking analytics
- **CSV Reports**: Exportable financial summaries
- **Contract Limits**: Verification of business rules compliance

### User Interface

- **Real-time Balances**: SOL, USDC, and VIBES token balances
- **Purchase Progress**: Track personal purchase limits
- **Staking Rewards**: Live calculation of pending rewards
- **Vesting Schedule**: Timeline for token release

## 🚀 Deployment

### Production Checklist

- [ ] Update contract addresses for mainnet
- [ ] Configure production RPC endpoints
- [ ] Set up SSL/TLS certificates
- [ ] Enable content compression
- [ ] Configure CDN for static assets
- [ ] Set up monitoring and alerting

### Build for Production

```bash
# Minify and optimize assets
npm run build

# Deploy to hosting platform
npm run deploy
```

## 🔧 Development

### Code Style

- **ES6+ JavaScript**: Modern syntax and features
- **Modular Architecture**: Separation of concerns
- **Error-First Callbacks**: Consistent error handling
- **Descriptive Naming**: Self-documenting code

### Testing

```bash
# Run validation tests
npm run test

# Check contract integration
npm run test:contracts
```

## 📞 Support

### Troubleshooting

1. **Wallet Connection Issues**: Ensure Phantom wallet is installed and unlocked
2. **Transaction Failures**: Check SOL balance for gas fees
3. **Purchase Limits**: Verify 250K VIBES wallet limit not exceeded
4. **Network Issues**: Confirm devnet connectivity

### Common Errors

- `INSUFFICIENT_BALANCE`: Add SOL/USDC to wallet
- `WALLET_LIMIT_EXCEEDED`: Reduce purchase amount
- `PRESALE_NOT_ACTIVE`: Check presale timing
- `NETWORK_ERROR`: Switch to devnet in wallet

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

**Built with ❤️ for the VIBES DeFi ecosystem**
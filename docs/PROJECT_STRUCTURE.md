# 📁 Project Structure

Complete overview of the VIBES DeFi DApp project organization.

**Last Updated**: October 10, 2025

---

## 🏗️ Directory Structure

```
daap_futureVibe_V3/
├── docs/                    # 📚 Documentation
│   ├── screenshots/        # UI screenshots for documentation
│   └── *.md               # Various documentation files
│
├── src/                    # 💻 Source Code
│   ├── images/            # 🖼️ Image assets (logos, icons)
│   └── js/                # JavaScript modules
│
├── tests/                  # 🧪 Testing & Development
│   ├── html/              # Test HTML files
│   └── scripts/           # Test batch scripts (Windows)
│
├── tools/                  # 🛠️ Utility Scripts
│   ├── calculate-buyerstate.js
│   └── check-presale-stakers.js
│
├── index.html             # 🌐 Main application entry point
├── package.json           # 📦 Node.js dependencies
├── env.example            # 🔐 Environment variables template
└── README.md              # 📖 Project readme
```

---

## 📂 Detailed Structure

### `/docs/` - Documentation
Complete project documentation including:
- **Implementation guides**: How features were implemented
- **API documentation**: Contract interfaces and methods
- **UI/UX docs**: Design decisions and user flows
- **Troubleshooting**: Common issues and solutions
- **Screenshots**: Visual documentation in `screenshots/`

**Key Files**:
- `QUICK_START_GUIDE.md` - Get started quickly
- `NOTIFICATION_SYSTEM_OPTIMIZATION.md` - Notification system
- `ASSETS_ORGANIZATION.md` - Asset management
- `VESTING_TABLE_UPDATE.md` - Tokenomics table

### `/src/` - Source Code

#### `/src/js/` - JavaScript Modules
Core application logic:

| File | Purpose |
|------|---------|
| `app-new.js` | Main application logic and UI management |
| `wallet-adapter.js` | Wallet connection and management |
| `direct-contract.js` | Smart contract interaction layer |
| `notifications.js` | Toast notification system |
| `idls.js` | Contract IDLs (Interface Definition Language) |
| `config.js` | Application configuration |
| `solana-wallet-standard.js` | Wallet standard implementation |

#### `/src/images/` - Image Assets
Visual assets organized by purpose:

| File | Usage |
|------|-------|
| `Logo Solana.png` | SOL payment method icon |
| `Logo USDC.png` | USDC payment method icon |
| `FUTURE _VIBES_512x512.png` | Main project logo |

### `/tests/` - Testing Files

#### `/tests/html/` - Test Pages
Isolated test files for specific features:
- `test-notifications.html` - Notification system testing
- `test-wallet-connection.html` - Wallet integration testing
- `test-mobile-navbar.html` - Responsive navigation testing
- `test-total-raised.html` - Dashboard statistics testing
- `test-wallet-dropdown-simple.html` - Wallet selector testing

#### `/tests/scripts/` - Test Scripts
Windows batch scripts for quick testing:
- `open-test.bat` - General test launcher
- `test-notifications.bat` - Launch notification tests
- `test-dropdown.bat` - Launch dropdown tests

### `/tools/` - Utility Scripts
Development and debugging tools:
- `calculate-buyerstate.js` - Verify buyer calculations
- `check-presale-stakers.js` - Query staking participants

### Root Files

| File | Purpose |
|------|---------|
| `index.html` | Main application entry point |
| `package.json` | npm dependencies and scripts |
| `package-lock.json` | Locked dependency versions |
| `env.example` | Environment variables template |
| `README.md` | Project overview and setup |

---

## 🎯 File Naming Conventions

### Documentation
- Format: `UPPERCASE_WITH_UNDERSCORES.md`
- Example: `NOTIFICATION_SYSTEM_OPTIMIZATION.md`

### Source Code
- Format: `lowercase-with-hyphens.js`
- Example: `wallet-adapter.js`

### Test Files
- Format: `test-[feature-name].html`
- Example: `test-notifications.html`

### Tools
- Format: `action-description.js`
- Example: `calculate-buyerstate.js`

---

## 🔄 Data Flow

```
User Browser
    ↓
index.html (UI)
    ↓
app-new.js (Main Logic)
    ↓
├─→ wallet-adapter.js (Wallet Connection)
├─→ direct-contract.js (Contract Calls)
├─→ notifications.js (User Feedback)
└─→ config.js (Configuration)
    ↓
Solana Blockchain
```

---

## 📦 Dependencies

### Main Dependencies
- `@solana/web3.js` - Solana blockchain interaction
- `@solana/wallet-adapter-*` - Wallet integration
- `@project-serum/anchor` - Contract interaction framework

### Development Tools
- Node.js - Runtime environment
- npm - Package management

---

## 🚀 Quick Navigation

### For Users
- **Start Here**: `README.md`
- **How to Use**: `docs/QUICK_START_GUIDE.md`

### For Developers
- **Architecture**: `docs/IMPLEMENTATION_COMPLETE.md`
- **API Reference**: `docs/CONTRACT_DATA_MAPPING_ANALYSIS.md`
- **Testing**: `tests/README.md`

### For Contributors
- **Code Style**: Follow existing patterns in `src/js/`
- **Documentation**: Add docs to `docs/` directory
- **Testing**: Add tests to `tests/html/`

---

## 🛠️ Development Workflow

1. **Edit Source**: Modify files in `src/`
2. **Test Changes**: Use test files in `tests/`
3. **Run Tools**: Use utilities in `tools/` for debugging
4. **Update Docs**: Document changes in `docs/`
5. **Review**: Check `index.html` for integration

---

## 📊 Project Statistics

- **Total Files**: ~50+ files
- **Lines of Code**: ~10,000+ lines
- **Documentation**: 40+ markdown files
- **Test Files**: 5 test pages
- **Utility Scripts**: 2 tools

---

## 🎨 Best Practices

### Code Organization
- ✅ Keep related files together
- ✅ Use descriptive names
- ✅ Comment complex logic
- ✅ Follow established patterns

### File Management
- ✅ Source code in `src/`
- ✅ Tests in `tests/`
- ✅ Documentation in `docs/`
- ✅ Assets in appropriate subdirectories

### Version Control
- ✅ Commit logical changes
- ✅ Write clear commit messages
- ✅ Update documentation with code changes
- ✅ Don't commit sensitive data

---

## 🔒 Security

### Protected Files
- `.env` - Never commit (use `.env.example`)
- Private keys - Keep in secure wallet
- API keys - Store in environment variables

### Public Files
- Source code - Safe to share
- Documentation - Public
- Test files - Development only
- Tools - No sensitive data

---

## 🔗 Related Resources

- **Main README**: `README.md`
- **Tests Guide**: `tests/README.md`
- **Tools Guide**: `tools/README.md`
- **Assets Guide**: `docs/ASSETS_ORGANIZATION.md`

---

## 📝 Maintenance

This structure is maintained and updated as the project evolves. Last major reorganization: **October 10, 2025**.

### Recent Changes
- ✅ Moved test files to `tests/` directory
- ✅ Created `tools/` for utility scripts
- ✅ Organized images in `src/images/`
- ✅ Moved screenshots to `docs/screenshots/`

---

**Maintained by**: VIBES DeFi Development Team  
**Contact**: See README.md for contact information


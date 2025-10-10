# 🛠️ Tools Directory

Utility scripts and helper tools for development, debugging, and data analysis.

## Available Tools

### 1. calculate-buyerstate.js
**Purpose**: Calculate and verify buyer state from presale contract

**Description**:
Analyzes buyer data from the presale smart contract to calculate:
- Total VIBES tokens purchased
- Amount paid (SOL/USDC)
- Staking status
- Vesting schedule
- Claimable amounts

**Usage**:
```bash
node tools/calculate-buyerstate.js
```

**Requirements**:
- Node.js installed
- Solana connection configured
- Valid buyer wallet address

**Configuration**:
Edit the script to set:
- `BUYER_ADDRESS`: Wallet address to analyze
- `RPC_URL`: Solana RPC endpoint
- `PRESALE_PROGRAM_ID`: Presale contract address

**Output**:
- Buyer state summary
- Token calculations
- Vesting timeline
- Console logs with detailed breakdown

**Use Cases**:
- Verify buyer purchases
- Debug calculation issues
- Audit presale data
- Generate reports

---

### 2. check-presale-stakers.js
**Purpose**: Query and list all stakers in the presale contract

**Description**:
Scans the presale contract to find:
- All buyers who opted into staking
- Staking amounts per user
- Total staked tokens
- Staking wallet addresses

**Usage**:
```bash
node tools/check-presale-stakers.js
```

**Requirements**:
- Node.js installed
- Solana Web3.js library
- Anchor framework
- RPC access to Solana

**Configuration**:
Edit the script to set:
- `RPC_URL`: Solana RPC endpoint
- `PRESALE_PROGRAM_ID`: Presale contract address
- `STAKING_PROGRAM_ID`: Staking contract address

**Output**:
- List of all stakers
- Individual staking amounts
- Total staked in contract
- Summary statistics

**Use Cases**:
- Monitor staking participation
- Generate staker reports
- Verify staking data
- Debug staking issues

---

## Running Tools

### Prerequisites
```bash
# Install dependencies (from project root)
npm install

# Or if using these tools standalone
npm install @solana/web3.js @project-serum/anchor
```

### Execution
```bash
# From project root
node tools/calculate-buyerstate.js
node tools/check-presale-stakers.js

# Or with specific node version
npx node tools/calculate-buyerstate.js
```

## Environment Variables

Some tools may require environment variables. Create a `.env` file in project root:

```env
SOLANA_RPC_URL=https://api.devnet.solana.com
PRESALE_PROGRAM_ID=6sLUN...ta2bs
STAKING_PROGRAM_ID=HbYXF...JPnY
```

## Adding New Tools

To add a new utility tool:

1. Create a `.js` file in `tools/` directory
2. Follow naming convention: descriptive lowercase with hyphens
3. Include comments explaining purpose and usage
4. Update this README with tool description

## Best Practices

- ✅ **Always comment your code** - Explain what the tool does
- ✅ **Handle errors gracefully** - Tools should fail safely
- ✅ **Log progress** - Show what the tool is doing
- ✅ **Validate inputs** - Check for required parameters
- ✅ **Document configuration** - List all required variables

## Security Notes

⚠️ **Important**:
- Never commit private keys or secrets
- Don't hardcode sensitive data
- Use environment variables for configuration
- These tools have read-only access by default
- Be careful when running on mainnet

## Maintenance

These tools are for **development and debugging only**. They are not part of the main application and can be:
- Modified as needed
- Deleted if no longer useful
- Replaced with better alternatives
- Archived when obsolete

## Related Documentation

- **Presale Contract**: See `docs/RESUMEN_STAKING_COMPLETO.md`
- **Staking System**: See `docs/STAKING_DATA_FIX.md`
- **Vesting**: See `docs/VESTING_DATA_INTEGRATION.md`

---

**Last Updated**: October 10, 2025  
**Maintained by**: VIBES Development Team


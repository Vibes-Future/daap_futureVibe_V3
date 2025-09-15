// VIBES DeFi Smart Contract IDLs
// Real IDLs from deployed contracts

const PRESALE_V3_IDL = {
  "version": "0.1.0",
  "name": "presale_v3",
  "instructions": [
    {
      "name": "initializePresaleV3",
      "docs": ["Initialize V3 Hybrid Presale with complete business features"],
      "accounts": [
        { "name": "presaleState", "isMut": true, "isSigner": false },
        { "name": "tokenMint", "isMut": false, "isSigner": false, "docs": ["VIBES token mint"] },
        { "name": "usdcMint", "isMut": false, "isSigner": false, "docs": ["USDC token mint"] },
        { "name": "authority", "isMut": true, "isSigner": true, "docs": ["Authority that controls the presale"] },
        { "name": "feeCollectorSol", "isMut": false, "isSigner": false, "docs": ["Fee collector for SOL transactions (Gebure)"] },
        { "name": "feeCollectorUsdc", "isMut": false, "isSigner": false, "docs": ["Fee collector for USDC transactions (Gebure)"] },
        { "name": "treasurySol", "isMut": false, "isSigner": false, "docs": ["Treasury SOL wallet (80% of net purchases)"] },
        { "name": "treasuryUsdc", "isMut": false, "isSigner": false, "docs": ["Treasury USDC wallet (80% of net purchases)"] },
        { "name": "secondarySol", "isMut": false, "isSigner": false, "docs": ["Secondary SOL wallet (20% of net purchases)"] },
        { "name": "secondaryUsdc", "isMut": false, "isSigner": false, "docs": ["Secondary USDC wallet (20% of net purchases)"] },
        { "name": "charityWallet", "isMut": false, "isSigner": false, "docs": ["Charity wallet for staking reward donations (3%)"] },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "startTs", "type": "i64" },
        { "name": "endTs", "type": "i64" },
        { "name": "hardCapTotal", "type": "u64" },
        { "name": "priceSchedule", "type": { "vec": { "defined": "PriceTier" } } },
        { "name": "feeRateBps", "type": "u16" },
        { "name": "maxPurchasePerWallet", "type": "u64" },
        { "name": "minPurchaseSol", "type": "u64" },
        { "name": "stakingApyBps", "type": "u64" },
        { "name": "charityRateBps", "type": "u16" },
        { "name": "optionalStaking", "type": "bool" },
        { "name": "useMintAuthority", "type": "bool" },
        { "name": "presaleTokenVault", "type": { "option": "publicKey" } },
        { "name": "rewardsTokenVault", "type": { "option": "publicKey" } }
      ]
    },
    {
      "name": "buyWithSolV3",
      "docs": ["Buy VIBES tokens with SOL - V3 with fee collection and optional staking"],
      "accounts": [
        { "name": "presaleState", "isMut": true, "isSigner": false },
        { "name": "buyerState", "isMut": true, "isSigner": false },
        { "name": "buyer", "isMut": true, "isSigner": true },
        { "name": "feeCollectorSol", "isMut": true, "isSigner": false, "docs": ["Fee collector for Gebure (0.5%)"] },
        { "name": "treasurySol", "isMut": true, "isSigner": false, "docs": ["Treasury SOL wallet (80% of net amount)"] },
        { "name": "secondarySol", "isMut": true, "isSigner": false, "docs": ["Secondary SOL wallet (20% of net amount)"] },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "solAmount", "type": "u64" },
        { "name": "optIntoStaking", "type": "bool" }
      ]
    },
    {
      "name": "buyWithUsdcV3",
      "docs": ["Buy VIBES tokens with USDC - V3 with fee collection and optional staking"],
      "accounts": [
        { "name": "presaleState", "isMut": true, "isSigner": false },
        { "name": "buyerState", "isMut": true, "isSigner": false },
        { "name": "buyer", "isMut": true, "isSigner": true },
        { "name": "buyerUsdcAccount", "isMut": true, "isSigner": false },
        { "name": "feeCollectorUsdcAccount", "isMut": true, "isSigner": false },
        { "name": "treasuryUsdcAccount", "isMut": true, "isSigner": false },
        { "name": "secondaryUsdcAccount", "isMut": true, "isSigner": false },
        { "name": "tokenProgram", "isMut": false, "isSigner": false },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "usdcAmount", "type": "u64" },
        { "name": "optIntoStaking", "type": "bool" }
      ]
    },
    {
      "name": "optIntoStaking",
      "docs": ["Opt into staking for already purchased tokens"],
      "accounts": [
        { "name": "presaleState", "isMut": true, "isSigner": false },
        { "name": "buyerState", "isMut": true, "isSigner": false },
        { "name": "buyer", "isMut": false, "isSigner": true }
      ],
      "args": [
        { "name": "amount", "type": "u64" }
      ]
    },
    {
      "name": "optOutOfStaking",
      "docs": ["Opt out of staking (loses future rewards)"],
      "accounts": [
        { "name": "presaleState", "isMut": true, "isSigner": false },
        { "name": "buyerState", "isMut": true, "isSigner": false },
        { "name": "buyer", "isMut": false, "isSigner": true }
      ],
      "args": [
        { "name": "amount", "type": "u64" }
      ]
    },
    {
      "name": "claimStakingRewards",
      "docs": ["Claim accumulated staking rewards with charity deduction"],
      "accounts": [
        { "name": "presaleState", "isMut": true, "isSigner": false },
        { "name": "buyerState", "isMut": true, "isSigner": false },
        { "name": "buyer", "isMut": false, "isSigner": true },
        { "name": "tokenMint", "isMut": true, "isSigner": false },
        { "name": "buyerRewardAccount", "isMut": true, "isSigner": false, "docs": ["User's token account to receive rewards (97%)"] },
        { "name": "charityRewardAccount", "isMut": true, "isSigner": false, "docs": ["Charity token account to receive donation (3%)"] },
        { "name": "tokenProgram", "isMut": false, "isSigner": false }
      ],
      "args": []
    },
    {
      "name": "finalizePresaleV3",
      "docs": ["Finalize presale and prepare for vesting"],
      "accounts": [
        { "name": "presaleState", "isMut": true, "isSigner": false },
        { "name": "authority", "isMut": false, "isSigner": true }
      ],
      "args": []
    },
    {
      "name": "transferToVestingV3",
      "docs": ["Transfer tokens to vesting (principal + optional rewards)"],
      "accounts": [
        { "name": "presaleState", "isMut": false, "isSigner": false },
        { "name": "buyerState", "isMut": true, "isSigner": false },
        { "name": "buyer", "isMut": false, "isSigner": true },
        { "name": "tokenMint", "isMut": true, "isSigner": false },
        { "name": "vestingVault", "isMut": true, "isSigner": false },
        { "name": "presaleTokenVault", "isMut": true, "isSigner": false, "isOptional": true },
        { "name": "rewardsTokenVault", "isMut": true, "isSigner": false, "isOptional": true },
        { "name": "presaleVaultAuthority", "isMut": false, "isSigner": false, "isOptional": true },
        { "name": "rewardsVaultAuthority", "isMut": false, "isSigner": false, "isOptional": true },
        { "name": "tokenProgram", "isMut": false, "isSigner": false }
      ],
      "args": []
    },
    {
      "name": "claimTokensV3",
      "docs": ["Claim tokens directly after presale (alternative to vesting)"],
      "accounts": [
        { "name": "presaleState", "isMut": true, "isSigner": false },
        { "name": "buyerState", "isMut": true, "isSigner": false },
        { "name": "buyer", "isMut": true, "isSigner": true },
        { "name": "buyerTokenAccount", "isMut": true, "isSigner": false, "docs": ["User's VIBES token account (where tokens will be sent)"] },
        { "name": "tokenMint", "isMut": true, "isSigner": false, "docs": ["VIBES token mint"] },
        { "name": "presaleTokenVault", "isMut": true, "isSigner": false, "isOptional": true, "docs": ["Client's presale token vault (40M VIBES)"] },
        { "name": "rewardsTokenVault", "isMut": true, "isSigner": false, "isOptional": true, "docs": ["Client's rewards token vault (15M VIBES)"] },
        { "name": "presaleVaultAuthority", "isMut": false, "isSigner": false, "isOptional": true },
        { "name": "rewardsVaultAuthority", "isMut": false, "isSigner": false, "isOptional": true },
        { "name": "tokenProgram", "isMut": false, "isSigner": false }
      ],
      "args": []
    },
    {
      "name": "updatePriceSchedule",
      "docs": ["Update price schedule (admin only)"],
      "accounts": [
        { "name": "presaleState", "isMut": true, "isSigner": false },
        { "name": "authority", "isMut": false, "isSigner": true }
      ],
      "args": [
        { "name": "newPriceSchedule", "type": { "vec": { "defined": "PriceTier" } } }
      ]
    }
  ],
  "accounts": [
    {
      "name": "PresaleStateV3",
      "docs": ["Main presale state - V3 Hybrid with all business features"],
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "authority", "type": "publicKey" },
          { "name": "tokenMint", "type": "publicKey" },
          { "name": "usdcMint", "type": "publicKey" },
          { "name": "bump", "type": "u8" },
          { "name": "presaleTokenVault", "type": "publicKey" },
          { "name": "rewardsTokenVault", "type": "publicKey" },
          { "name": "useMintAuthority", "type": "bool" },
          { "name": "startTs", "type": "i64" },
          { "name": "endTs", "type": "i64" },
          { "name": "hardCapTotal", "type": "u64" },
          { "name": "isFinalized", "type": "bool" },
          { "name": "feeRateBps", "type": "u16" },
          { "name": "feeCollectorSol", "type": "publicKey" },
          { "name": "feeCollectorUsdc", "type": "publicKey" },
          { "name": "treasurySolWallet", "type": "publicKey" },
          { "name": "treasuryUsdcWallet", "type": "publicKey" },
          { "name": "secondarySolWallet", "type": "publicKey" },
          { "name": "secondaryUsdcWallet", "type": "publicKey" },
          { "name": "maxPurchasePerWallet", "type": "u64" },
          { "name": "minPurchaseSol", "type": "u64" },
          { "name": "priceSchedule", "type": { "vec": { "defined": "PriceTier" } } },
          { "name": "optionalStaking", "type": "bool" },
          { "name": "stakingApyBps", "type": "u64" },
          { "name": "charityRateBps", "type": "u16" },
          { "name": "charityWallet", "type": "publicKey" },
          { "name": "totalStakedOptional", "type": "u64" },
          { "name": "totalUnstaked", "type": "u64" },
          { "name": "accRewardPerToken", "type": "u128" },
          { "name": "lastRewardUpdateTs", "type": "i64" },
          { "name": "raisedSol", "type": "u64" },
          { "name": "raisedUsdc", "type": "u64" },
          { "name": "totalVibesSold", "type": "u64" },
          { "name": "totalFeesCollectedSol", "type": "u64" },
          { "name": "totalFeesCollectedUsdc", "type": "u64" },
          { "name": "totalTreasurySol", "type": "u64" },
          { "name": "totalTreasuryUsdc", "type": "u64" },
          { "name": "totalSecondarySol", "type": "u64" },
          { "name": "totalSecondaryUsdc", "type": "u64" },
          { "name": "totalCharityRewards", "type": "u64" }
        ]
      }
    },
    {
      "name": "BuyerStateV3",
      "docs": ["Buyer state - V3 with optional staking choice"],
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "buyer", "type": "publicKey" },
          { "name": "bump", "type": "u8" },
          { "name": "totalPurchasedVibes", "type": "u64" },
          { "name": "solContributed", "type": "u64" },
          { "name": "usdcContributed", "type": "u64" },
          { "name": "isStaking", "type": "bool" },
          { "name": "stakedAmount", "type": "u64" },
          { "name": "unstakedAmount", "type": "u64" },
          { "name": "lastStakeTs", "type": "i64" },
          { "name": "accumulatedRewards", "type": "u64" },
          { "name": "totalRewardsClaimed", "type": "u64" },
          { "name": "rewardDebt", "type": "u128" },
          { "name": "lastUpdateTs", "type": "i64" },
          { "name": "transferredToVesting", "type": "bool" },
          { "name": "finalVestingAmount", "type": "u64" },
          { "name": "purchaseCount", "type": "u32" }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "PriceTier",
      "docs": ["Price tier for dynamic pricing schedule"],
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "startTs", "type": "i64" },
          { "name": "priceUsd", "type": "f64" }
        ]
      }
    }
  ],
  "errors": [
    { "code": 6000, "name": "PresaleNotActive", "msg": "Presale is not currently active" },
    { "code": 6001, "name": "PresaleNotStarted", "msg": "Presale has not started yet" },
    { "code": 6002, "name": "PresaleEnded", "msg": "Presale has already ended" },
    { "code": 6003, "name": "InvalidPriceTier", "msg": "Invalid price tier for current time" },
    { "code": 6004, "name": "HardCapExceeded", "msg": "Hard cap would be exceeded" },
    { "code": 6005, "name": "PresaleStillActive", "msg": "Presale is still active, cannot finalize" },
    { "code": 6006, "name": "Unauthorized", "msg": "Unauthorized access" },
    { "code": 6007, "name": "PresaleNotFinalized", "msg": "Presale not finalized yet" },
    { "code": 6008, "name": "AlreadyTransferred", "msg": "Already transferred to vesting" },
    { "code": 6009, "name": "NothingToTransfer", "msg": "Nothing to transfer" },
    { "code": 6010, "name": "InvalidClaimTime", "msg": "Invalid claim time" },
    { "code": 6011, "name": "NoRewardsToClaim", "msg": "No rewards to claim" },
    { "code": 6012, "name": "NotStaking", "msg": "User is not currently staking" },
    { "code": 6013, "name": "AlreadyStaking", "msg": "User is already staking" },
    { "code": 6014, "name": "InsufficientUnstakedTokens", "msg": "Insufficient unstaked tokens" },
    { "code": 6015, "name": "InsufficientStakedTokens", "msg": "Insufficient staked tokens" },
    { "code": 6016, "name": "ZeroStakeAmount", "msg": "Cannot stake zero amount" },
    { "code": 6017, "name": "OptionalStakingDisabled", "msg": "Optional staking is disabled" },
    { "code": 6018, "name": "PurchaseTooSmall", "msg": "Purchase amount too small" },
    { "code": 6019, "name": "WalletLimitExceeded", "msg": "Purchase would exceed wallet limit" },
    { "code": 6020, "name": "MaxPurchasesReached", "msg": "Maximum purchases per wallet reached" },
    { "code": 6021, "name": "FeeCollectionFailed", "msg": "Fee collection failed" },
    { "code": 6022, "name": "FundDistributionFailed", "msg": "Fund distribution failed" },
    { "code": 6023, "name": "MathOverflow", "msg": "Math overflow" },
    { "code": 6024, "name": "DivisionByZero", "msg": "Division by zero" },
    { "code": 6025, "name": "TokenMintMismatch", "msg": "Token mint mismatch" },
    { "code": 6026, "name": "InvalidTokenAccount", "msg": "Invalid token account" },
    { "code": 6027, "name": "CharityDistributionFailed", "msg": "Charity distribution failed" },
    { "code": 6028, "name": "InvalidCharityRate", "msg": "Invalid charity rate" },
    { "code": 6029, "name": "InvalidFeeRate", "msg": "Invalid fee rate" },
    { "code": 6030, "name": "InvalidApyRate", "msg": "Invalid APY rate" },
    { "code": 6031, "name": "InvalidPriceSchedule", "msg": "Invalid price schedule" },
    { "code": 6032, "name": "PriceScheduleTooLong", "msg": "Price schedule too long" },
    { "code": 6033, "name": "InvalidTimeRange", "msg": "Invalid time range" },
    { "code": 6034, "name": "StartTimeInPast", "msg": "Start time in the past" },
    { "code": 6035, "name": "EndTimeBeforeStart", "msg": "End time before start time" }
  ],
  "metadata": {
    "address": "62kSXjshfq3FF4Ny4qvmkhaYjSagYR18njWwDh6sFi9N"
  }
};

const STAKING_IDL = {
  "version": "0.1.0",
  "name": "staking_program",
  "instructions": [
    {
      "name": "initPool",
      "docs": ["Initialize the staking pool"],
      "accounts": [
        { "name": "stakePool", "isMut": true, "isSigner": false },
        { "name": "stakeMint", "isMut": false, "isSigner": false, "docs": ["VIBES token mint for staking"] },
        { "name": "rewardMint", "isMut": false, "isSigner": false, "docs": ["VIBES token mint for rewards"] },
        { "name": "authority", "isMut": true, "isSigner": true, "docs": ["Authority that can update pool settings"] },
        { "name": "stakeVaultTokenAccountPda", "isMut": false, "isSigner": false, "docs": ["Stake vault token account PDA"] },
        { "name": "rewardVaultTokenAccountPda", "isMut": false, "isSigner": false, "docs": ["Reward vault token account PDA"] },
        { "name": "charityWallet", "isMut": false, "isSigner": false, "docs": ["Charity wallet address (3% of rewards)"] },
        { "name": "rewardWallet", "isMut": false, "isSigner": false, "docs": ["Reward funding wallet"] },
        { "name": "systemProgram", "isMut": false, "isSigner": false },
        { "name": "tokenProgram", "isMut": false, "isSigner": false },
        { "name": "rent", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "apyBps", "type": "u64" },
        { "name": "slotsPerYear", "type": "u64" },
        { "name": "globalCap", "type": "u64" }
      ]
    },
    {
      "name": "stake",
      "docs": ["Stake VIBES tokens"],
      "accounts": [
        { "name": "stakePool", "isMut": true, "isSigner": false },
        { "name": "userStake", "isMut": true, "isSigner": false },
        { "name": "user", "isMut": true, "isSigner": true, "docs": ["User staking tokens"] },
        { "name": "userVibesAccount", "isMut": true, "isSigner": false, "docs": ["User's VIBES token account"] },
        { "name": "stakeVaultTokenAccountPda", "isMut": true, "isSigner": false, "docs": ["Stake vault token account PDA"] },
        { "name": "systemProgram", "isMut": false, "isSigner": false },
        { "name": "tokenProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "amount", "type": "u64" }
      ]
    },
    {
      "name": "unstake",
      "docs": ["Unstake VIBES tokens"],
      "accounts": [
        { "name": "stakePool", "isMut": true, "isSigner": false },
        { "name": "userStake", "isMut": true, "isSigner": false },
        { "name": "user", "isMut": true, "isSigner": true, "docs": ["User unstaking tokens"] },
        { "name": "userVibesAccount", "isMut": true, "isSigner": false, "docs": ["User's VIBES token account"] },
        { "name": "stakeVaultTokenAccountPda", "isMut": true, "isSigner": false, "docs": ["Stake vault token account PDA"] },
        { "name": "tokenProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "amount", "type": "u64" }
      ]
    },
    {
      "name": "claimReward",
      "docs": ["Claim rewards (97% to user, 3% to charity)"],
      "accounts": [
        { "name": "stakePool", "isMut": true, "isSigner": false },
        { "name": "userStake", "isMut": true, "isSigner": false },
        { "name": "user", "isMut": true, "isSigner": true, "docs": ["User claiming rewards"] },
        { "name": "userVibesAccount", "isMut": true, "isSigner": false, "docs": ["User's VIBES token account for rewards"] },
        { "name": "charityWallet", "isMut": true, "isSigner": false, "docs": ["Charity wallet for 3% of rewards"] },
        { "name": "rewardVaultTokenAccountPda", "isMut": true, "isSigner": false, "docs": ["Reward vault token account PDA"] },
        { "name": "tokenProgram", "isMut": false, "isSigner": false }
      ],
      "args": []
    },
    {
      "name": "updatePool",
      "docs": ["Update pool rewards (called before stake/unstake/claim)"],
      "accounts": [
        { "name": "stakePool", "isMut": true, "isSigner": false }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "StakePool",
      "docs": ["Main staking pool account"],
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "stakeMint", "docs": ["VIBES token mint for staking"], "type": "publicKey" },
          { "name": "rewardMint", "docs": ["VIBES token mint for rewards"], "type": "publicKey" },
          { "name": "globalCap", "docs": ["Global cap for total staked tokens (15,000,000 VIBES)"], "type": "u64" },
          { "name": "apyBps", "docs": ["APY in basis points (4000 = 40%)"], "type": "u64" },
          { "name": "slotsPerYear", "docs": ["Slots per year for reward calculation"], "type": "u64" },
          { "name": "accRewardPerToken", "docs": ["Accumulated reward per token (fixed-point 1e12)"], "type": "u128" },
          { "name": "lastSlot", "docs": ["Last slot when rewards were updated"], "type": "u64" },
          { "name": "totalStaked", "docs": ["Total tokens currently staked"], "type": "u64" },
          { "name": "stakeVaultTokenAccountPda", "docs": ["Stake vault token account PDA"], "type": "publicKey" },
          { "name": "rewardVaultTokenAccountPda", "docs": ["Reward vault token account PDA"], "type": "publicKey" },
          { "name": "charityWallet", "docs": ["Charity wallet address (3% of rewards)"], "type": "publicKey" },
          { "name": "rewardWallet", "docs": ["Reward funding wallet"], "type": "publicKey" },
          { "name": "bump", "docs": ["Bump seed for PDA derivation"], "type": "u8" }
        ]
      }
    },
    {
      "name": "UserStake",
      "docs": ["User stake account"],
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "owner", "docs": ["Owner of the stake"], "type": "publicKey" },
          { "name": "amount", "docs": ["Amount of tokens staked"], "type": "u64" },
          { "name": "rewardDebt", "docs": ["Reward debt for accounting"], "type": "u128" },
          { "name": "lastSlot", "docs": ["Last slot when rewards were updated"], "type": "u64" },
          { "name": "bump", "docs": ["Bump seed for PDA derivation"], "type": "u8" }
        ]
      }
    }
  ],
  "errors": [
    { "code": 6000, "name": "InvalidApy", "msg": "Invalid APY" },
    { "code": 6001, "name": "InvalidSlotsPerYear", "msg": "Invalid slots per year" },
    { "code": 6002, "name": "InvalidGlobalCap", "msg": "Invalid global cap" },
    { "code": 6003, "name": "InvalidAmount", "msg": "Invalid amount" },
    { "code": 6004, "name": "GlobalCapExceeded", "msg": "Global cap exceeded" },
    { "code": 6005, "name": "InsufficientStake", "msg": "Insufficient stake" },
    { "code": 6006, "name": "NoRewardsToClaim", "msg": "No rewards to claim" },
    { "code": 6007, "name": "Overflow", "msg": "Overflow occurred" },
    { "code": 6008, "name": "InvalidSlotCalculation", "msg": "Invalid slot calculation" },
    { "code": 6009, "name": "Unauthorized", "msg": "Unauthorized access" },
    { "code": 6010, "name": "InvalidMint", "msg": "Invalid mint" },
    { "code": 6011, "name": "InvalidTokenAccount", "msg": "Invalid token account" },
    { "code": 6012, "name": "PoolNotInitialized", "msg": "Pool not initialized" }
  ]
};

const VESTING_IDL = {
  "version": "0.1.0",
  "name": "vesting_program",
  "instructions": [
    {
      "name": "createSchedule",
      "docs": ["Create a vesting schedule for a beneficiary"],
      "accounts": [
        { "name": "vestingSchedule", "isMut": true, "isSigner": false },
        { "name": "tokenMint", "isMut": false, "isSigner": false, "docs": ["VIBES token mint"] },
        { "name": "authority", "isMut": true, "isSigner": true, "docs": ["Authority that can create vesting schedules"] },
        { "name": "beneficiary", "isMut": false, "isSigner": false, "docs": ["Beneficiary of the vesting schedule"] },
        { "name": "vaultTokenAccountPda", "isMut": false, "isSigner": false, "docs": ["Vault token account PDA for storing vested tokens"] },
        { "name": "systemProgram", "isMut": false, "isSigner": false },
        { "name": "tokenProgram", "isMut": false, "isSigner": false },
        { "name": "rent", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "total", "type": "u64" },
        { "name": "listingTs", "type": "i64" }
      ]
    },
    {
      "name": "claim",
      "docs": ["Claim vested tokens"],
      "accounts": [
        { "name": "vestingSchedule", "isMut": true, "isSigner": false },
        { "name": "beneficiary", "isMut": true, "isSigner": true, "docs": ["Beneficiary claiming tokens"] },
        { "name": "vaultTokenAccountPda", "isMut": true, "isSigner": false, "docs": ["Vault token account PDA"] },
        { "name": "beneficiaryVibesAccount", "isMut": true, "isSigner": false, "docs": ["Beneficiary's VIBES token account"] },
        { "name": "tokenMint", "isMut": false, "isSigner": false, "docs": ["VIBES token mint"] },
        { "name": "tokenProgram", "isMut": false, "isSigner": false }
      ],
      "args": []
    },
    {
      "name": "cancel",
      "docs": ["Cancel vesting schedule (optional, disabled by default)"],
      "accounts": [
        { "name": "vestingSchedule", "isMut": true, "isSigner": false },
        { "name": "beneficiary", "isMut": false, "isSigner": true, "docs": ["Beneficiary cancelling the vesting"] },
        { "name": "vaultTokenAccountPda", "isMut": true, "isSigner": false, "docs": ["Vault token account PDA"] },
        { "name": "beneficiaryVibesAccount", "isMut": true, "isSigner": false, "docs": ["Beneficiary's VIBES token account"] },
        { "name": "tokenMint", "isMut": false, "isSigner": false, "docs": ["VIBES token mint"] },
        { "name": "tokenProgram", "isMut": false, "isSigner": false }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "VestingSchedule",
      "docs": ["Vesting schedule for a beneficiary"],
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "beneficiary", "docs": ["Beneficiary of the vesting schedule"], "type": "publicKey" },
          { "name": "tokenMint", "docs": ["VIBES token mint"], "type": "publicKey" },
          { "name": "total", "docs": ["Total tokens to be vested"], "type": "u64" },
          { "name": "released", "docs": ["Tokens already released"], "type": "u64" },
          { "name": "listingTs", "docs": ["Listing timestamp (40% vested)"], "type": "i64" },
          { "name": "cliff1", "docs": ["First cliff (+30 days, 20% vested)"], "type": "i64" },
          { "name": "cliff2", "docs": ["Second cliff (+60 days, 20% vested)"], "type": "i64" },
          { "name": "cliff3", "docs": ["Third cliff (+90 days, 20% vested)"], "type": "i64" },
          { "name": "vaultTokenAccountPda", "docs": ["Vault token account PDA"], "type": "publicKey" },
          { "name": "bump", "docs": ["Bump seed for PDA derivation"], "type": "u8" },
          { "name": "isCancelled", "docs": ["Whether vesting is cancelled"], "type": "bool" }
        ]
      }
    }
  ],
  "errors": [
    { "code": 6000, "name": "InvalidTotal", "msg": "Invalid total amount" },
    { "code": 6001, "name": "InvalidListingTime", "msg": "Invalid listing time" },
    { "code": 6002, "name": "NoTokensToClaim", "msg": "No tokens to claim" },
    { "code": 6003, "name": "Overflow", "msg": "Overflow occurred" },
    { "code": 6004, "name": "AlreadyCancelled", "msg": "Vesting already cancelled" },
    { "code": 6005, "name": "Unauthorized", "msg": "Unauthorized access" },
    { "code": 6006, "name": "InvalidMint", "msg": "Invalid mint" },
    { "code": 6007, "name": "InvalidTokenAccount", "msg": "Invalid token account" },
    { "code": 6008, "name": "VestingNotActive", "msg": "Vesting not active" },
    { "code": 6009, "name": "NoPendingUpgrade", "msg": "No pending upgrade" },
    { "code": 6010, "name": "UpgradeDelayNotPassed", "msg": "Upgrade delay not passed" },
    { "code": 6011, "name": "InvalidUpgradeAuthority", "msg": "Invalid upgrade authority" },
    { "code": 6012, "name": "UpgradeAlreadyPending", "msg": "Upgrade already pending" }
  ]
};

// Export IDLs for use in the DApp
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PRESALE_V3_IDL,
        STAKING_IDL,
        VESTING_IDL
    };
}

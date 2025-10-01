# 🔍 Guía: Cómo Ver Stakers en Solscan/Explorer

## ⚠️ CONFUSIÓN COMÚN:

**"Stake" en Solscan ≠ "VIBES Staked" en tu presale**

```
┌──────────────────────────────────────────────────┐
│ "Stake" en Solscan = SOL Staking (Validadores)  │
│ 👎 NO es lo que buscas                           │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ "VIBES Staked" = Datos en cuenta BuyerState     │
│ ✅ Esto es lo que necesitas ver                  │
└──────────────────────────────────────────────────┘
```

---

## 📊 EJEMPLO REAL: Staker #1

### 👤 Wallet del Usuario:
```
3nxKNKD3DxPYkwDYFN96gkqpqUJRFppqfenJrnZUbAvU
```

**Si buscas esta dirección en Solscan verás:**
- ✅ SOL Balance: 31.15 SOL
- ✅ Token Balance: 3 Tokens
- ❌ Stake: 0 SOL ← Esto NO son tus VIBES stakeados

**Link:** https://solscan.io/account/3nxKNKD3DxPYkwDYFN96gkqpqUJRFppqfenJrnZUbAvU?cluster=devnet

---

### 📦 Cuenta BuyerState (donde ESTÁN los datos):
```
4WhnUAgTWbu4yPZiu2b8G4aKvEM3qGkMaC2BcoXfJbJ7
```

**Esta cuenta contiene los datos reales:**
- ✅ Total Purchased: 8,461.873 VIBES
- ✅ Staked Amount: 7,261.08 VIBES ← ¡Aquí están!
- ✅ Unstaked Amount: 1,200.793 VIBES
- ✅ isStaking: true

**Link:** https://solscan.io/account/4WhnUAgTWbu4yPZiu2b8G4aKvEM3qGkMaC2BcoXfJbJ7?cluster=devnet

---

## 🔎 CÓMO VER LOS DATOS EN SOLSCAN:

### Paso 1: Busca la cuenta BuyerState

```
https://solscan.io/account/4WhnUAgTWbu4yPZiu2b8G4aKvEM3qGkMaC2BcoXfJbJ7?cluster=devnet
```

### Paso 2: Mira la sección "Account Data"

Verás algo como:
```
Owner: HNPuLPxycypT4YtD5vMZPdcrr53MLKAajYrQwNTv4ujH
Data Length: 185 bytes
Executable: No
```

### Paso 3: Ver los datos (si está disponible)

Solscan podría mostrar:
- "Anchor Account" (si reconoce el IDL)
- "Raw Data" (datos en hexadecimal)

**IMPORTANTE:** Solscan puede NO decodificar automáticamente los datos Anchor en devnet.

---

## 🛠️ CÓMO VER LOS DATOS DECODIFICADOS:

### Opción 1: Usar el script que creamos

```bash
cd /Users/osmelprieto/Projects/basic-dapp
node check-presale-stakers.js
```

**Resultado:**
```
━━━━ Cuenta #2 (BuyerState) ━━━━
  📍 Address: 4WhnUAgTWbu4yPZiu2b8G4aKvEM3qGkMaC2BcoXfJbJ7
  👤 Buyer: 3nxKNKD3DxPYkwDYFN96gkqpqUJRFppqfenJrnZUbAvU
  💰 Total Purchased: 8,461.873 VIBES
  ✅ Staking: YES
  🔒 Staked: 7,261.08 VIBES ← AQUÍ ESTÁ!
  🔓 Unstaked: 1,200.793 VIBES
```

### Opción 2: Usar Solana Explorer con Anchor

**Link directo:**
```
https://explorer.solana.com/address/4WhnUAgTWbu4yPZiu2b8G4aKvEM3qGkMaC2BcoXfJbJ7?cluster=devnet
```

1. Haz click en "Anchor Data" (si está disponible)
2. Si no está, verás "Account Data" en bytes

---

## 📋 MAPA COMPLETO DE CUENTAS:

### Para cada usuario hay 2 direcciones:

```
┌─────────────────────────────────────────────────────────┐
│ 1. WALLET del Usuario                                   │
│    3nxKNKD3DxPYkwDYFN96gkqpqUJRFppqfenJrnZUbAvU        │
│                                                          │
│    Contiene:                                            │
│    ✅ SOL balance                                       │
│    ✅ Token balances (VIBES, USDC, etc.)               │
│    ❌ NO contiene datos de staking del presale         │
└─────────────────────────────────────────────────────────┘
                          ↓
                   (derivada con PDA)
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. BUYERSTATE (Cuenta PDA del Presale)                 │
│    4WhnUAgTWbu4yPZiu2b8G4aKvEM3qGkMaC2BcoXfJbJ7        │
│                                                          │
│    Contiene:                                            │
│    ✅ buyer: (wallet del usuario)                       │
│    ✅ total_purchased_vibes: 8461.873                  │
│    ✅ is_staking: true                                  │
│    ✅ staked_amount: 7261.08 ← DATO QUE BUSCAS         │
│    ✅ unstaked_amount: 1200.793                        │
│    ✅ accumulated_rewards: X                            │
│    ✅ reward_debt: Y                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 RESUMEN DE LOS 3 STAKERS:

### 🟢 STAKER #1:

```
👤 Wallet:      3nxKNKD3DxPYkwDYFN96gkqpqUJRFppqfenJrnZUbAvU
📦 BuyerState:  4WhnUAgTWbu4yPZiu2b8G4aKvEM3qGkMaC2BcoXfJbJ7

💰 Total Purchased: 8,461.873 VIBES
🔒 STAKED: 7,261.08 VIBES
🔓 Unstaked: 1,200.793 VIBES
✅ Staking: YES

Links para ver:
• Wallet: https://solscan.io/account/3nxKNKD3DxPYkwDYFN96gkqpqUJRFppqfenJrnZUbAvU?cluster=devnet
• BuyerState (DATOS REALES): https://solscan.io/account/4WhnUAgTWbu4yPZiu2b8G4aKvEM3qGkMaC2BcoXfJbJ7?cluster=devnet
```

### 🟢 STAKER #2:

```
👤 Wallet:      6a6MNWoy8UsJfksy8KEZ8cXUNsfGtgp3yjKVwuu8Exak
📦 BuyerState:  3JpEwVUTTmvmiXWfbvoMpzm8P4bMKMEWr8CEbyKt2WA3

💰 Total Purchased: 2,357.86 VIBES
🔒 STAKED: 1,672.241 VIBES
🔓 Unstaked: 685.619 VIBES
✅ Staking: YES

Links para ver:
• Wallet: https://solscan.io/account/6a6MNWoy8UsJfksy8KEZ8cXUNsfGtgp3yjKVwuu8Exak?cluster=devnet
• BuyerState (DATOS REALES): https://solscan.io/account/3JpEwVUTTmvmiXWfbvoMpzm8P4bMKMEWr8CEbyKt2WA3?cluster=devnet
```

### 🔴 COMPRADOR #3 (Sin staking):

```
👤 Wallet:      824Fqqt99SJbyd2mLERNPuoxXSXUAyN8Sefbwn3Vsatu
📦 BuyerState:  EoDCTycvkJV4UXm54KYiF1DuCMSHyXYPftGUVr3qJxPp

💰 Total Purchased: 15,473,000,414 VIBES
🔒 Staked: 4,916,742,480 VIBES (parece sistema)
🔓 Unstaked: 10,609,057,228 VIBES
❌ Staking: NO

Links para ver:
• Wallet: https://solscan.io/account/824Fqqt99SJbyd2mLERNPuoxXSXUAyN8Sefbwn3Vsatu?cluster=devnet
• BuyerState: https://solscan.io/account/EoDCTycvkJV4UXm54KYiF1DuCMSHyXYPftGUVr3qJxPp?cluster=devnet
```

---

## 🧪 VERIFICACIÓN MANUAL CON SOLANA CLI:

Si quieres ver los datos raw de una BuyerState:

```bash
# Ver cuenta BuyerState del Staker #1
solana account 4WhnUAgTWbu4yPZiu2b8G4aKvEM3qGkMaC2BcoXfJbJ7 --url devnet --output json
```

Esto te mostrará los bytes raw. Nuestro script los decodifica automáticamente.

---

## 💡 POR QUÉ LA CONFUSIÓN:

```
❌ INCORRECTO:
"Buscar la wallet del usuario en Solscan y esperar ver 'Staked: X VIBES'"

✅ CORRECTO:
"Buscar la cuenta BuyerState (PDA) derivada de esa wallet"
```

**La wallet solo tiene:**
- SOL balance
- Token balances
- "Stake" de validador (si participa en staking de red Solana)

**La cuenta BuyerState tiene:**
- Datos del presale
- VIBES comprados
- VIBES stakeados ← Lo que buscas
- Recompensas
- Estado de staking

---

## 🎓 ANALOGÍA:

```
┌──────────────────────────────┐
│ Wallet = Tu Billetera física │
│ (guarda dinero)              │
└──────────────────────────────┘
              ↓
        (asociada a)
              ↓
┌──────────────────────────────┐
│ BuyerState = Tu cuenta       │
│ bancaria en el presale       │
│ (guarda historial, staking)  │
└──────────────────────────────┘
```

Si quieres saber cuánto tienes "invertido con intereses", 
NO miras tu billetera física, miras tu **cuenta bancaria**.

---

## ✅ SOLUCIÓN RÁPIDA:

**Para ver VIBES stakeados, NO busques la wallet, busca la BuyerState:**

1. Ejecuta: `node check-presale-stakers.js`
2. Copia la dirección `BuyerState` (no la wallet)
3. Busca esa dirección en Solscan/Explorer
4. Ahí están los datos reales

**O simplemente usa el script**, que decodifica todo automáticamente.

---

**Última actualización:** 2025-10-01


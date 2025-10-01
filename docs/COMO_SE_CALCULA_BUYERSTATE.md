# 🧮 Cómo se Calcula la BuyerState de cada Comprador

## 📍 **¿Qué es una BuyerState?**

La `BuyerState` es una **cuenta PDA (Program Derived Address)** que almacena los datos de cada comprador en el programa de Presale.

```
┌─────────────────────────────────────────────────┐
│ WALLET del Usuario                              │
│ 3nxKNKD3DxPYkwDYFN96gkqpqUJRFppqfenJrnZUbAvU   │
└─────────────────────────────────────────────────┘
                    ↓
            (deriva usando PDA)
                    ↓
┌─────────────────────────────────────────────────┐
│ BUYERSTATE (Cuenta PDA)                         │
│ 4WhnUAgTWbu4yPZiu2b8G4aKvEM3qGkMaC2BcoXfJbJ7   │
│                                                  │
│ Contiene:                                       │
│ • Total comprado                                │
│ • Cantidad stakeada                             │
│ • Cantidad sin stakear                          │
│ • Recompensas acumuladas                        │
│ • etc.                                          │
└─────────────────────────────────────────────────┘
```

---

## 🔑 **Cómo se Calcula (Derivación PDA)**

### Fórmula:

```javascript
const [buyerState, bump] = await PublicKey.findProgramAddressSync(
    [
        Buffer.from("buyer_v3"),  // Seed 1: String fijo
        buyer.toBuffer()          // Seed 2: Dirección del comprador
    ],
    presaleProgramId              // Program ID del Presale
);
```

### Componentes:

| Componente | Descripción | Ejemplo |
|------------|-------------|---------|
| **Seed 1** | String "buyer_v3" | `Buffer.from("buyer_v3")` |
| **Seed 2** | Wallet del comprador | `3nxKNKD3DxPYkwDYFN96gkqpqUJRFppqfenJrnZUbAvU` |
| **Program ID** | ID del programa de Presale | `HNPuLPxycypT4YtD5vMZPdcrr53MLKAajYrQwNTv4ujH` |

---

## 📋 **Ejemplo Real:**

### Staker #1:

```javascript
// Inputs:
const presaleProgramId = "HNPuLPxycypT4YtD5vMZPdcrr53MLKAajYrQwNTv4ujH";
const buyer = "3nxKNKD3DxPYkwDYFN96gkqpqUJRFppqfenJrnZUbAvU";

// Cálculo:
const [buyerState, bump] = await PublicKey.findProgramAddressSync(
    [
        Buffer.from("buyer_v3"),
        new PublicKey(buyer).toBuffer()
    ],
    new PublicKey(presaleProgramId)
);

// Resultado:
buyerState = "4WhnUAgTWbu4yPZiu2b8G4aKvEM3qGkMaC2BcoXfJbJ7"
bump = 254 (número usado para asegurar que la dirección no está en la curva elíptica)
```

---

## 🧪 **Verificación Manual con Script:**

Puedes calcular la BuyerState de cualquier wallet con este código:

```javascript
const { PublicKey } = require('@solana/web3.js');

async function calculateBuyerState(buyerWallet) {
    const PRESALE_PROGRAM_ID = "HNPuLPxycypT4YtD5vMZPdcrr53MLKAajYrQwNTv4ujH";
    
    const [buyerState, bump] = await PublicKey.findProgramAddressSync(
        [
            Buffer.from("buyer_v3"),
            new PublicKey(buyerWallet).toBuffer()
        ],
        new PublicKey(PRESALE_PROGRAM_ID)
    );
    
    console.log(`👤 Buyer Wallet: ${buyerWallet}`);
    console.log(`📦 BuyerState: ${buyerState.toString()}`);
    console.log(`🔢 Bump: ${bump}`);
    console.log(`🔗 Explorer: https://solscan.io/account/${buyerState.toString()}?cluster=devnet`);
    
    return buyerState;
}

// Ejemplo de uso:
calculateBuyerState("3nxKNKD3DxPYkwDYFN96gkqpqUJRFppqfenJrnZUbAvU");
```

---

## 📊 **Lista de Todos los Stakers con sus BuyerStates:**

### 🟢 Staker #1:

```
👤 Wallet:      3nxKNKD3DxPYkwDYFN96gkqpqUJRFppqfenJrnZUbAvU
📦 BuyerState:  4WhnUAgTWbu4yPZiu2b8G4aKvEM3qGkMaC2BcoXfJbJ7
🔢 Bump:        254

🔗 Wallet: https://solscan.io/account/3nxKNKD3DxPYkwDYFN96gkqpqUJRFppqfenJrnZUbAvU?cluster=devnet
🔗 BuyerState: https://solscan.io/account/4WhnUAgTWbu4yPZiu2b8G4aKvEM3qGkMaC2BcoXfJbJ7?cluster=devnet
```

### 🟢 Staker #2:

```
👤 Wallet:      6a6MNWoy8UsJfksy8KEZ8cXUNsfGtgp3yjKVwuu8Exak
📦 BuyerState:  3JpEwVUTTmvmiXWfbvoMpzm8P4bMKMEWr8CEbyKt2WA3
🔢 Bump:        253

🔗 Wallet: https://solscan.io/account/6a6MNWoy8UsJfksy8KEZ8cXUNsfGtgp3yjKVwuu8Exak?cluster=devnet
🔗 BuyerState: https://solscan.io/account/3JpEwVUTTmvmiXWfbvoMpzm8P4bMKMEWr8CEbyKt2WA3?cluster=devnet
```

### 🔴 Comprador #3 (Admin/Sistema):

```
👤 Wallet:      824Fqqt99SJbyd2mLERNPuoxXSXUAyN8Sefbwn3Vsatu
📦 BuyerState:  EoDCTycvkJV4UXm54KYiF1DuCMSHyXYPftGUVr3qJxPp
🔢 Bump:        (usado como Presale State)

⚠️ NOTA: Este parece ser el admin/sistema, no un staker regular.

🔗 Wallet: https://solscan.io/account/824Fqqt99SJbyd2mLERNPuoxXSXUAyN8Sefbwn3Vsatu?cluster=devnet
🔗 BuyerState: https://solscan.io/account/EoDCTycvkJV4UXm54KYiF1DuCMSHyXYPftGUVr3qJxPp?cluster=devnet
```

---

## 🎯 **Por Qué se Usa PDA:**

### Ventajas:

1. **Determinístico**: Siempre genera la misma dirección para el mismo comprador
2. **Sin firma necesaria**: El programa puede escribir en ella sin necesidad de firma
3. **Única por comprador**: Cada wallet tiene su propia BuyerState única
4. **Segura**: Solo el programa puede modificar los datos

### Comparación:

```
❌ Cuenta Normal:
- Requiere firma del propietario
- El usuario debe pagarla
- Puede perderse la private key

✅ Cuenta PDA:
- El programa la controla
- Se crea automáticamente
- Siempre accesible mediante derivación
- No se puede perder (se puede recalcular)
```

---

## 🛠️ **Cómo el Smart Contract lo Usa:**

### En el código Rust (Presale Program):

```rust
#[derive(Accounts)]
pub struct BuyWithSolV3<'info> {
    #[account(mut)]
    pub presale_state: Account<'info, PresaleStateV3>,
    
    #[account(
        init_if_needed,
        payer = buyer,
        space = 8 + std::mem::size_of::<BuyerStateV3>(),
        seeds = [
            b"buyer_v3",          // Seed 1
            buyer.key().as_ref()  // Seed 2
        ],
        bump
    )]
    pub buyer_state: Account<'info, BuyerStateV3>,
    
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    // ... más cuentas
}
```

### Explicación:

- `seeds`: Define los componentes para derivar la dirección
- `bump`: Número que asegura que la dirección está fuera de la curva elíptica
- `init_if_needed`: Crea la cuenta si no existe
- `payer = buyer`: El comprador paga por crear la cuenta

---

## 📝 **Script para Calcular BuyerState de TU Wallet:**

Guarda este código como `calculate-my-buyerstate.js`:

```javascript
const { PublicKey } = require('@solana/web3.js');

// Configuración
const PRESALE_PROGRAM_ID = new PublicKey("HNPuLPxycypT4YtD5vMZPdcrr53MLKAajYrQwNTv4ujH");
const PRESALE_STATE = new PublicKey("EoDCTycvkJV4UXm54KYiF1DuCMSHyXYPftGUVr3qJxPp");

async function main() {
    // ⬇️ CAMBIA ESTA DIRECCIÓN POR TU WALLET ⬇️
    const myWallet = process.argv[2] || "TU_WALLET_AQUI";
    
    if (myWallet === "TU_WALLET_AQUI") {
        console.log("❌ Error: Proporciona tu wallet como argumento");
        console.log("Uso: node calculate-my-buyerstate.js <TU_WALLET>");
        process.exit(1);
    }
    
    try {
        const buyer = new PublicKey(myWallet);
        
        const [buyerState, bump] = await PublicKey.findProgramAddressSync(
            [
                Buffer.from("buyer_state_v3"),
                PRESALE_STATE.toBuffer(),
                buyer.toBuffer()
            ],
            PRESALE_PROGRAM_ID
        );
        
        console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🔍 BuyerState Calculation Result");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        
        console.log(`👤 Your Wallet:     ${buyer.toString()}`);
        console.log(`📦 Your BuyerState: ${buyerState.toString()}`);
        console.log(`🔢 Bump:            ${bump}\n`);
        
        console.log("🔗 Links:");
        console.log(`   Wallet:      https://solscan.io/account/${buyer.toString()}?cluster=devnet`);
        console.log(`   BuyerState:  https://solscan.io/account/${buyerState.toString()}?cluster=devnet\n`);
        
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

main();
```

**Uso:**

```bash
node calculate-my-buyerstate.js 3nxKNKD3DxPYkwDYFN96gkqpqUJRFppqfenJrnZUbAvU
```

---

## 🎓 **Resumen:**

| Concepto | Descripción |
|----------|-------------|
| **BuyerState** | Cuenta que guarda los datos de compra y staking de un usuario |
| **PDA** | Program Derived Address - dirección derivada matemáticamente |
| **Seeds** | Componentes para calcular la dirección: `["buyer_v3", buyer]` |
| **Bump** | Número para asegurar que la dirección no está en la curva elíptica |
| **Determinístico** | Siempre genera la misma dirección para el mismo comprador |
| **Único** | Cada wallet tiene su propia BuyerState única |

---

**Última actualización:** 2025-10-01


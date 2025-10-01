# 👥 Buyers & Stakers Registry - Documentación Completa

## 🎯 Resumen

Se agregó una nueva sección en el **Admin Fund Monitor** que muestra todos los compradores/stakers del presale, con sus direcciones de wallet y BuyerState PDA, información de staking, y links directos a Solscan.

---

## ✨ Características Implementadas

### 1. **Nueva Sección en el Frontend**

**Ubicación:** Admin Fund Monitor → Buyers & Stakers Registry

**Características:**
- ✅ Lista de todos los compradores
- ✅ Distingue entre stakers activos y no-stakers
- ✅ Muestra dirección de wallet Y dirección de BuyerState
- ✅ Links directos a Solscan para ambas cuentas
- ✅ Información de VIBES comprados, stakeados y sin stakear
- ✅ Resumen estadístico (total compradores, stakers activos, etc.)
- ✅ Carga bajo demanda (botón "🔄 Refresh Buyers")

### 2. **Script Standalone: calculate-buyerstate.js**

**Propósito:** Calcular la dirección BuyerState PDA de cualquier wallet

**Uso:**
```bash
node calculate-buyerstate.js <WALLET_ADDRESS>
```

**Ejemplo:**
```bash
node calculate-buyerstate.js 3nxKNKD3DxPYkwDYFN96gkqpqUJRFppqfenJrnZUbAvU
```

**Salida:**
```
👤 Buyer Wallet:    3nxKNKD3DxPYkwDYFN96gkqpqUJRFppqfenJrnZUbAvU
📦 BuyerState PDA:  4WhnUAgTWbu4yPZiu2b8G4aKvEM3qGkMaC2BcoXfJbJ7
🔢 Bump:            254
🔗 Links a Solscan
```

### 3. **Documentación Educativa**

**Archivo:** `COMO_SE_CALCULA_BUYERSTATE.md`

**Contenido:**
- ✅ Explicación de qué es una BuyerState
- ✅ Cómo se calcula usando PDAs
- ✅ Ejemplos reales con código
- ✅ Lista completa de stakers actuales
- ✅ Comparación entre cuenta normal vs PDA
- ✅ Scripts de ejemplo

---

## 📁 Archivos Modificados/Creados

### Creados:

| Archivo | Descripción |
|---------|-------------|
| `calculate-buyerstate.js` | Script para calcular BuyerState de cualquier wallet |
| `COMO_SE_CALCULA_BUYERSTATE.md` | Guía completa sobre derivación de PDAs |
| `COMO_VER_STAKERS_EN_EXPLORER.md` | Explicación de dónde ver datos en Solscan |
| `README_BUYERS_FEATURE.md` | Esta documentación |

### Modificados:

| Archivo | Cambios |
|---------|---------|
| `index.html` | Agregada sección "👥 Buyers & Stakers Registry" |
| `src/js/app.js` | 3 nuevas funciones: `refreshBuyersList()`, `loadBuyersData()`, `updateBuyersUI()` |

---

## 🔧 Implementación Técnica

### Cálculo de BuyerState PDA

```javascript
const [buyerState, bump] = await PublicKey.findProgramAddressSync(
    [
        Buffer.from("buyer_v3"),  // Seed 1
        buyer.toBuffer()          // Seed 2
    ],
    presaleProgramId              // HNPuLPxycypT4YtD5vMZPdcrr53MLKAajYrQwNTv4ujH
);
```

**Seeds:**
- `"buyer_v3"` - String fijo del programa
- `buyer` - PublicKey de la wallet del comprador

**NO incluye:**
- ❌ Presale State (esto fue un error corregido)
- ❌ `"buyer_state_v3"` (seed incorrecto)

### Estructura de Datos Parseada

```javascript
{
    buyerStateAddress: "4WhnUA...",  // Dirección de la cuenta BuyerState
    buyerWallet: "3nxKNK...",        // Wallet del comprador
    totalPurchased: 8461.873,        // VIBES comprados
    isStaking: true,                 // Estado de staking
    stakedAmount: 7261.08,           // VIBES stakeados
    unstakedAmount: 1200.793         // VIBES sin stakear
}
```

---

## 🎨 UI/UX

### Resumen Estadístico

```
┌──────────────────────────────────────────────────┐
│ Total Buyers │ Active Stakers │ Total Staked    │
│      3       │       2        │  4,916,749 VIBES │
└──────────────────────────────────────────────────┘
```

### Tarjeta de Comprador

```
┌───────────────────────────────────────────────┐
│ 👤 Buyer #1              ✅ STAKING           │
│                                                │
│ Wallet Address:                                │
│ 3nxKNKD3DxPYkwDYFN96gkqpqUJRFppqfenJrnZUbAvU│
│ 🔗 View Wallet on Solscan                     │
│                                                │
│ 📦 BuyerState PDA:                            │
│ 4WhnUAgTWbu4yPZiu2b8G4aKvEM3qGkMaC2BcoXfJbJ7│
│ 🔗 View BuyerState on Solscan                 │
│                                                │
│ 💰 Total Purchased: 8,461.873 VIBES           │
│ 🔒 Staked: 7,261.08 VIBES                     │
│ 🔓 Unstaked: 1,200.793 VIBES                  │
└───────────────────────────────────────────────┘
```

---

## 🔍 Uso en el Frontend

### 1. Acceder a la Sección

1. Abrir el DApp (`index.html`)
2. Scroll hasta "📊 Admin Fund Monitor"
3. Scroll hasta "👥 Buyers & Stakers Registry"
4. Click en "🔄 Refresh Buyers"

### 2. Ver Datos de un Comprador

Cada tarjeta muestra:
- ✅ Número de comprador
- ✅ Badge de staking (STAKING / NO STAKING)
- ✅ Wallet address con link a Solscan
- ✅ BuyerState address con link a Solscan (resaltada)
- ✅ Estadísticas de compra y staking

### 3. Verificar en Blockchain

**Opción 1: Click en los links**
- Links directos a Solscan incluidos

**Opción 2: Script**
```bash
node check-presale-stakers.js
```

**Opción 3: Calcular manualmente**
```bash
node calculate-buyerstate.js <WALLET_ADDRESS>
```

---

## 📊 Datos Actuales (Ejemplo)

### Staker #1:

```
👤 Wallet:      3nxKNKD3DxPYkwDYFN96gkqpqUJRFppqfenJrnZUbAvU
📦 BuyerState:  4WhnUAgTWbu4yPZiu2b8G4aKvEM3qGkMaC2BcoXfJbJ7
💰 Purchased:   8,461.873 VIBES
🔒 Staked:      7,261.08 VIBES (85.8%)
✅ Status:      STAKING ACTIVE
```

### Staker #2:

```
👤 Wallet:      6a6MNWoy8UsJfksy8KEZ8cXUNsfGtgp3yjKVwuu8Exak
📦 BuyerState:  3JpEwVUTTmvmiXWfbvoMpzm8P4bMKMEWr8CEbyKt2WA3
💰 Purchased:   2,357.86 VIBES
🔒 Staked:      1,672.241 VIBES (70.9%)
✅ Status:      STAKING ACTIVE
```

---

## 🎓 Conceptos Clave

### ¿Qué es una BuyerState?

Una **BuyerState** es una cuenta PDA (Program Derived Address) que almacena:
- Total de VIBES comprados
- Cantidad stakeada
- Cantidad sin stakear
- Recompensas acumuladas
- Estado de staking
- Timestamps de última actualización

### ¿Por qué PDA?

Las PDAs (Program Derived Addresses) tienen ventajas especiales:

| Ventaja | Descripción |
|---------|-------------|
| **Determinístico** | Siempre genera la misma dirección para el mismo usuario |
| **Sin private key** | El programa controla la cuenta, no el usuario |
| **Seguro** | Solo el programa puede modificar los datos |
| **Recalculable** | Se puede derivar nuevamente en cualquier momento |

### Diferencia: Wallet vs BuyerState

```
┌─────────────────────────────────────────────┐
│ WALLET (3nxKNK...)                          │
│ - Guarda SOL, USDC, VIBES (tokens)         │
│ - El usuario tiene la private key           │
│ - Visible en Solscan: SOL balance, tokens  │
│ ❌ NO contiene datos de staking del presale │
└─────────────────────────────────────────────┘
                  ↓ deriva
┌─────────────────────────────────────────────┐
│ BUYERSTATE (4WhnUA...)                      │
│ - Guarda datos del presale                  │
│ - El programa tiene control                 │
│ - Visible en Solscan: datos raw            │
│ ✅ CONTIENE todos los datos de staking      │
└─────────────────────────────────────────────┘
```

---

## 🔗 Links Útiles

### Solscan:
- **Presale Program:** https://solscan.io/account/HNPuLPxycypT4YtD5vMZPdcrr53MLKAajYrQwNTv4ujH?cluster=devnet
- **Staker #1 Wallet:** https://solscan.io/account/3nxKNKD3DxPYkwDYFN96gkqpqUJRFppqfenJrnZUbAvU?cluster=devnet
- **Staker #1 BuyerState:** https://solscan.io/account/4WhnUAgTWbu4yPZiu2b8G4aKvEM3qGkMaC2BcoXfJbJ7?cluster=devnet

### Explorer:
- **Presale Program:** https://explorer.solana.com/address/HNPuLPxycypT4YtD5vMZPdcrr53MLKAajYrQwNTv4ujH?cluster=devnet

---

## 🐛 Troubleshooting

### Problema: No veo ningún comprador

**Solución:**
1. Click en "🔄 Refresh Buyers"
2. Verificar que estás en devnet
3. Verificar conexión a internet
4. Check console para errores

### Problema: Los datos no coinciden con Solscan

**Recordar:** Solscan muestra "Stake: 0 SOL" que se refiere a **SOL staking** (validadores), NO a **VIBES staking**.

**Para ver VIBES staking:**
1. Busca la dirección **BuyerState** (no la wallet)
2. Los datos están en formato raw en Solscan
3. Usa nuestro script para decodificarlos

### Problema: BuyerState no existe para una wallet

**Posibles razones:**
1. El usuario nunca compró VIBES
2. La wallet es incorrecta
3. Estás buscando en el network incorrecto (mainnet vs devnet)

---

## 📝 Próximos Pasos (Opcional)

- [ ] Agregar filtros (solo stakers, solo no-stakers)
- [ ] Agregar ordenamiento (por cantidad comprada, por fecha, etc.)
- [ ] Agregar paginación para muchos compradores
- [ ] Exportar lista de compradores a CSV
- [ ] Mostrar gráficos de distribución de staking
- [ ] Agregar búsqueda por wallet address

---

## ✅ Conclusión

Ahora tienes una vista completa de todos los compradores/stakers en el Admin Fund Monitor, con acceso directo a sus BuyerState PDAs y toda la información relevante de compra y staking.

**Archivos clave:**
- `calculate-buyerstate.js` - Calcular BuyerState de cualquier wallet
- `COMO_SE_CALCULA_BUYERSTATE.md` - Documentación completa de PDAs
- `index.html` + `app.js` - UI implementada

**Última actualización:** 2025-10-01


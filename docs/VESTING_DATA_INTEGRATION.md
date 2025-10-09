# Integración de Datos de Vesting desde el Contrato

## 📋 Resumen

Se ha implementado la funcionalidad completa para obtener y mostrar datos reales de vesting desde el contrato inteligente de Solana según la cartera conectada. El sistema ahora lee correctamente el estado de vesting del usuario y calcula automáticamente los tokens disponibles para reclamar.

## 🎯 Objetivos Cumplidos

1. ✅ Lectura de datos de vesting desde el contrato `VestingSchedule`
2. ✅ Parsing correcto de la estructura de datos del contrato
3. ✅ Cálculo automático de tokens claimables basado en el calendario de vesting
4. ✅ Actualización de la UI con datos reales
5. ✅ Manejo de diferentes estados de vesting (no existe, pendiente, activo, completado)
6. ✅ Integración con el estado de presale y buyer state

## 🔧 Cambios Implementados

### 1. Nuevas Funciones en `direct-contract.js`

#### `getVestingScheduleAddress(beneficiaryPublicKey)`
Calcula la dirección PDA del VestingSchedule para un usuario específico.

```javascript
// Usa los seeds: ['vesting_schedule', beneficiaryPublicKey]
const [pda] = await solanaWeb3.PublicKey.findProgramAddress(
    [
        encoder.encode('vesting_schedule'),
        beneficiaryPublicKey.toBytes()
    ],
    new solanaWeb3.PublicKey(this.programIds.vesting)
);
```

#### `getVestingScheduleData(walletPublicKey)`
Lee y parsea los datos completos del VestingSchedule desde el contrato.

**Estructura de datos que lee:**
- `discriminator`: [u8; 8] - Identificador de Anchor
- `beneficiary`: PublicKey (32 bytes)
- `tokenMint`: PublicKey (32 bytes)
- `total`: u64 (8 bytes) - Total de tokens en vesting
- `released`: u64 (8 bytes) - Tokens ya liberados
- `listingTs`: i64 (8 bytes) - Timestamp del listing (40% vested)
- `cliff1`: i64 (8 bytes) - Primer cliff +30 días (20% vested)
- `cliff2`: i64 (8 bytes) - Segundo cliff +60 días (20% vested)
- `cliff3`: i64 (8 bytes) - Tercer cliff +90 días (20% vested)
- `vaultTokenAccountPda`: PublicKey (32 bytes)
- `bump`: u8 (1 byte)
- `isCancelled`: bool (1 byte)

**Retorna:**
```javascript
{
    exists: boolean,
    total: number,          // En lamports
    released: number,       // En lamports
    remaining: number,      // En lamports
    claimable: number,      // En lamports (calculado)
    listingTs: number,      // Unix timestamp
    cliff1: number,         // Unix timestamp
    cliff2: number,         // Unix timestamp
    cliff3: number,         // Unix timestamp
    isCancelled: boolean,
    tokenMint: PublicKey,
    vaultTokenAccountPda: PublicKey,
    bump: number
}
```

#### `calculateVestingClaimable(total, released, listingTs, cliff1, cliff2, cliff3, isCancelled)`
Calcula cuántos tokens son reclamables en el momento actual basándose en el calendario de vesting.

**Calendario de Vesting:**
- **40%** disponible en `listingTs` (cuando se lista el token)
- **20%** disponible en `cliff1` (listingTs + 30 días)
- **20%** disponible en `cliff2` (listingTs + 60 días)
- **20%** disponible en `cliff3` (listingTs + 90 días)

**Fórmula:**
```javascript
claimable = vestedAmount - released
```

Donde `vestedAmount` se calcula verificando qué cliffs han pasado según la fecha actual.

### 2. Función Actualizada en `app-new.js`

#### `loadVestingData()` - Versión Real con Contrato

Ahora obtiene datos reales del contrato en lugar de usar datos mock.

**Flujo de trabajo:**
1. Verifica si hay conexión y wallet conectada
2. Obtiene el estado de presale para saber si está activo
3. Lee el `BuyerState` para verificar si el usuario ha comprado tokens
4. Verifica el campo `transferredToVesting` del BuyerState
5. Si no se ha transferido a vesting, muestra el estado "Pending Transfer"
6. Si se ha transferido, lee el `VestingSchedule` desde el contrato
7. Calcula y formatea todos los datos para mostrar en la UI

**Estados posibles:**
- **Not Connected**: Sin wallet conectada
- **No Purchases**: Usuario no ha comprado tokens
- **Pending Transfer**: Tokens comprados pero no transferidos a vesting
- **Not Created**: Transferido pero vesting schedule no creado
- **Active**: Vesting activo con tokens disponibles
- **Completed**: Todos los tokens liberados
- **Cancelled**: Vesting cancelado
- **Error Loading**: Error al cargar datos

#### `updateVestingDisplay(vestingData)`
Actualiza todos los elementos de la UI con los datos de vesting.

**Elementos actualizados:**
- `vesting-total-display`: Total de tokens en vesting
- `vesting-released-display`: Tokens ya liberados
- `vesting-remaining-display`: Tokens restantes por liberar
- `vesting-status`: Estado del vesting
- `presale-status`: Estado de la presale (Active/Ended)
- `vesting-start-date`: Fecha de inicio del vesting
- `last-claim-date`: Última fecha de reclamo
- `claimable-amount`: Tokens disponibles para reclamar ahora

#### `updateVestingClaimStatus(presaleActive, claimableAmount)`
Actualiza el estado del botón de reclamo basándose en:
1. Si la presale está activa (no se puede reclamar durante presale)
2. Si hay tokens disponibles para reclamar

**Estados del botón:**
- **Presale Active**: Disabled - "Claim VIBES (Presale Active)"
- **No Claimable Tokens**: Disabled - "No Claimable Tokens"
- **Tokens Available**: Enabled - "Claim VIBES"

## 📊 Datos Mostrados en la UI

### Tarjetas de Resumen (Overview Cards)
```
┌─────────────────┬─────────────────┬─────────────────┐
│  Total Vesting  │    Released     │    Remaining    │
│    5,000.00     │    1,250.00     │    3,750.00     │
│      VIBES      │      VIBES      │      VIBES      │
└─────────────────┴─────────────────┴─────────────────┘
```

### Información de Vesting
```
📊 Vesting Information
├─ Vesting Status: Active (verde) / Not Available (rojo)
├─ Presale Status: Active (verde) / Ended (rojo)
├─ Vesting Start: 01/15/2024
└─ Last Claim: 01/20/2024
```

### Tarjeta de Reclamo
```
🎁 Claim Vested Tokens
├─ Claimable VIBES: 500.00
├─ [Claim VIBES] (button)
└─ Claim your vested VIBES tokens after presale ends
```

## 🔍 Validación y Debugging

El sistema incluye logging extensivo para debugging:

```javascript
console.log('🔍 Reading vesting schedule for wallet:', wallet);
console.log('📍 Vesting schedule PDA:', pda);
console.log('📊 Total Vesting (UI):', totalUI);
console.log('✅ Released (UI):', releasedUI);
console.log('💰 Claimable now (UI):', claimableUI);
```

## 🧪 Casos de Prueba

### 1. Usuario sin compras
```javascript
// BuyerState no existe
// Resultado: "No Purchases", todos los valores en 0
```

### 2. Usuario con compras pero sin transferir a vesting
```javascript
// BuyerState existe, transferredToVesting = false
// Resultado: "Pending Transfer", totalVesting = totalPurchasedVibes
```

### 3. Usuario con vesting activo
```javascript
// VestingSchedule existe, tokens parcialmente liberados
// Resultado: "Active", muestra todos los datos correctamente
```

### 4. Presale activa
```javascript
// presaleActive = true
// Resultado: Botón de claim deshabilitado
```

### 5. Presale terminada + tokens claimables
```javascript
// presaleActive = false, claimable > 0
// Resultado: Botón de claim habilitado
```

## ⚠️ Consideraciones Importantes

1. **Conversión de Unidades**: Todos los tokens se almacenan en lamports (1 VIBES = 1e9 lamports)
2. **Timestamps**: Todos los timestamps son Unix timestamps en segundos
3. **PDA Seeds**: El vesting usa el seed `'vesting_schedule'` + beneficiary pubkey
4. **Anchor Discriminator**: Los 8 primeros bytes de cada cuenta son el discriminador de Anchor
5. **Calendario Fijo**: El calendario de vesting es fijo (40%-20%-20%-20%) y se calcula automáticamente

## 🔐 Seguridad

- Todos los datos se leen directamente del contrato (no hay datos mock)
- Se verifica la existencia de cuentas antes de leer datos
- Se validan los campos transferredToVesting en BuyerState
- Se calcula claimable basándose en timestamps reales del contrato
- No se permite reclamar tokens mientras la presale esté activa

## 📝 Comentarios en el Código

Todos los comentarios están en inglés según las reglas del usuario:
```javascript
// Read discriminator (first 8 bytes) - for debugging
// Calculate remaining and claimable amounts
// Enable/disable claim functionality based on presale status
```

## 🚀 Próximos Pasos

Para completar la funcionalidad de vesting, se necesitaría:
1. Implementar la función real de `claimVestedTokens()` que llame al contrato
2. Agregar transacciones para crear VestingSchedule si no existe
3. Implementar la función de transferToVesting desde BuyerState
4. Agregar un botón para transferir tokens a vesting después de que termine la presale

## 📚 Documentación Relacionada

- [IDLs del Contrato](../src/js/idls.js) - Definiciones completas de las estructuras
- [Direct Contract Client](../src/js/direct-contract.js) - Cliente directo del contrato
- [App Principal](../src/js/app-new.js) - Lógica principal de la aplicación

---

**Fecha de Implementación**: {{ current_date }}
**Versión**: 1.0.0
**Estado**: ✅ Completado y Probado


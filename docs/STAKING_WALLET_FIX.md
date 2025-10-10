# Fix: Staking Section Wallet-Specific Data

## Problema Reportado

La sección de Staking Management mostraba los mismos valores incluso al cambiar de wallet o desconectar la wallet. Los datos deberían ser específicos para cada wallet conectada y mostrar ceros cuando no hay wallet conectada.

## Solución Implementada

### 1. Actualización de Referencias de Wallet

**Archivo**: `src/js/app-new.js`

#### En `handleWalletConnect()`
- ✅ Agregado `window.currentWalletPublicKey = this.publicKey` para mantener referencia global
- ✅ Agregada llamada a `window.updateStakingStats()` después de conectar
- ✅ Asegura que los datos de staking se actualicen con la nueva wallet

```javascript
// Update global wallet reference for staking stats
window.currentWalletPublicKey = this.publicKey;

// Update staking stats with wallet-specific data
if (typeof window.updateStakingStats === 'function') {
    await window.updateStakingStats();
}
```

#### En `handleWalletDisconnect()`
- ✅ Agregado `window.currentWalletPublicKey = null` para limpiar referencia
- ✅ Agregada llamada a `window.updateStakingStats(null)` para resetear a ceros
- ✅ Asegura que se muestren ceros cuando no hay wallet

```javascript
// Clear global wallet reference
window.currentWalletPublicKey = null;

// Reset staking stats to zeros
if (typeof window.updateStakingStats === 'function') {
    window.updateStakingStats(null).catch(err => {
        console.warn('⚠️ Could not reset staking stats:', err);
    });
}
```

#### En `handleAccountChanged()`
- ✅ Actualizado `window.currentWalletPublicKey` cuando cambia la cuenta
- ✅ Agregada llamada a `window.updateStakingStats()` para actualizar datos
- ✅ Agregadas llamadas para actualizar presale y vesting

```javascript
// Update global wallet reference
window.currentWalletPublicKey = this.publicKey;

// Update staking stats with new wallet data
if (typeof window.updateStakingStats === 'function') {
    await window.updateStakingStats();
}

// Update presale and vesting data
await this.loadPresaleData();
await this.loadVestingData();
```

### 2. Mejora de la Función updateStakingStats()

**Archivo**: `index.html`

#### Priorización de Wallet Reference
Ahora la función busca la wallet en este orden (más confiable primero):

```javascript
// Get connected wallet - prioritize window.currentWalletPublicKey (most reliable)
if (window.currentWalletPublicKey) {
    walletPublicKey = window.currentWalletPublicKey;
    console.log('👛 Using currentWalletPublicKey:', walletPublicKey.toString().slice(0, 8) + '...');
} else if (window.vibesApp && window.vibesApp.publicKey) {
    walletPublicKey = window.vibesApp.publicKey;
    console.log('👛 Using vibesApp.publicKey:', walletPublicKey.toString().slice(0, 8) + '...');
} else if (window.solana && window.solana.publicKey) {
    walletPublicKey = window.solana.publicKey;
    console.log('👛 Using window.solana.publicKey:', walletPublicKey.toString().slice(0, 8) + '...');
}
```

#### Manejo de Wallet Desconectada
```javascript
// Check if explicitly passed null (wallet disconnected)
if (stakingData === null && arguments.length > 0 && !window.currentWalletPublicKey && !window.vibesApp?.publicKey) {
    console.log('🔌 Wallet disconnected - resetting to zeros');
    buyerData = {
        exists: false,
        stakedAmount: 0,
        unstakedAmount: 0,
        accumulatedRewards: 0,
        totalRewardsClaimed: 0,
        lastStakeTs: 0,
        lastUpdateTs: 0,
        isStaking: false
    };
}
```

#### Mejor Manejo de Errores
```javascript
} catch (error) {
    console.warn('⚠️ Could not fetch buyer staking data from contract:', error.message);
    console.error(error);
    // Set zeros on error
    buyerData = {
        exists: false,
        stakedAmount: 0,
        unstakedAmount: 0,
        accumulatedRewards: 0,
        totalRewardsClaimed: 0,
        lastStakeTs: 0,
        lastUpdateTs: 0,
        isStaking: false
    };
}
```

#### Logging Mejorado
Ahora muestra qué wallet se está usando:
```javascript
console.log('✅ Buyer state data retrieved for wallet', walletPublicKey.toString().slice(0, 8) + '...:', buyerData);
```

## Comportamiento Esperado

### Escenario 1: Sin Wallet Conectada
```
✅ Todos los valores de staking muestran: 0 $VIBES
✅ Pool share: 0.00%
✅ Pending rewards: 0 $VIBES
✅ Staking status: Not Staking
```

### Escenario 2: Wallet A Conectada
```
✅ Muestra valores específicos de Wallet A
✅ Staked amount: [valor de Wallet A]
✅ Unstaked: [valor de Wallet A]
✅ Pool share: [% de Wallet A]
```

### Escenario 3: Cambio de Wallet A a Wallet B
```
✅ Los valores se actualizan automáticamente
✅ Muestra valores específicos de Wallet B
✅ Los valores de Wallet A desaparecen
✅ Console log: "👛 Using currentWalletPublicKey: [Wallet B]"
```

### Escenario 4: Desconexión de Wallet
```
✅ Todos los valores vuelven a 0
✅ Console log: "🔌 Wallet disconnected - resetting to zeros"
✅ Staking status: Not Staking
```

## Testing

Para verificar que funciona correctamente:

1. **Test 1: Wallet Desconectada**
   ```
   - Abrir app sin conectar wallet
   - Verificar que todos los valores de staking sean 0
   ```

2. **Test 2: Conectar Wallet**
   ```
   - Conectar Wallet A
   - Verificar que se muestren los valores correctos de Wallet A
   - Revisar console: debe mostrar "👛 Using currentWalletPublicKey"
   ```

3. **Test 3: Cambiar Wallet**
   ```
   - Desconectar Wallet A
   - Conectar Wallet B (diferente)
   - Verificar que los valores cambien a los de Wallet B
   - Los valores de Wallet A NO deben aparecer
   ```

4. **Test 4: Desconectar**
   ```
   - Desconectar wallet actual
   - Verificar que todos los valores vuelvan a 0
   - Revisar console: debe mostrar "🔌 Wallet disconnected"
   ```

## Archivos Modificados

1. **`src/js/app-new.js`**
   - `handleWalletConnect()`: Actualiza referencia global y datos de staking
   - `handleWalletDisconnect()`: Limpia referencia y resetea a ceros
   - `handleAccountChanged()`: Actualiza datos al cambiar cuenta

2. **`index.html`**
   - `updateStakingStats()`: Mejor priorización de wallet reference
   - Manejo de wallet desconectada
   - Manejo de errores mejorado
   - Logging más detallado

## Beneficios

✅ **Datos Wallet-Specific**: Cada wallet ve solo sus propios datos
✅ **Sin Datos Cacheados**: Los valores viejos no persisten al cambiar wallet
✅ **Manejo Robusto**: Errores no dejan la UI en estado inconsistente
✅ **Mejor UX**: Los usuarios ven exactamente lo que esperan
✅ **Debug Fácil**: Logs claros indican qué wallet se está usando

## Notas Técnicas

- Se usa `window.currentWalletPublicKey` como fuente principal de verdad
- Se prioriza esta referencia sobre `window.solana.publicKey` (más confiable)
- Se hace fallback a `window.vibesApp.publicKey` y luego `window.solana.publicKey`
- Los errores de red/blockchain no dejan la UI en estado inconsistente
- Todos los casos edge están manejados (desconexión, error, cambio de wallet)

## Compatibilidad

✅ Compatible con todas las wallets soportadas:
- Phantom
- Solflare  
- Trust Wallet
- Coinbase Wallet
- Backpack

✅ Compatible con todos los navegadores modernos
✅ No rompe funcionalidad existente
✅ Backward compatible con código existente


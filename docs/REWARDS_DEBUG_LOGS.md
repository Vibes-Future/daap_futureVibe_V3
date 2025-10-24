# Rewards Debugging - Enhanced Logging

## 🎯 Objetivo

Identificar por qué los pending rewards están mostrando **0** cuando deberían mostrar un valor positivo basado en:
- Staked Amount: **207.31 VIBES**
- Last Stake Timestamp: **12 Oct 2025, 23:06:01**
- APY: **40%**
- Tiempo transcurrido: **~12 días** (hasta 24 Oct 2025)

**Rewards esperados:** ~2-3 VIBES

## 🔍 Cambios Implementados

### 1. Logs en `index.html` (updateStakingStats)

Añadidos logs detallados en el proceso de actualización de rewards:

```javascript
console.log('🔍 [REWARDS] Starting pending rewards calculation...');
console.log('🔍 [REWARDS] Wallet:', walletPublicKey.toString());
console.log('🔍 [REWARDS] Connection:', connection ? 'Connected' : 'Not connected');
console.log('🔍 [REWARDS] DirectContractClient created successfully');
console.log('🔍 [REWARDS] Raw pending rewards (lamports):', pendingRewardsLamports);
console.log('🔍 [REWARDS] Using decimals:', vibesDecimals);
console.log('🔍 [REWARDS] Converted pending rewards (VIBES):', pendingRewards);
```

**Errores capturados:**
```javascript
console.error('❌ [REWARDS] Failed to calculate pending rewards:', error);
console.error('❌ [REWARDS] Error stack:', error.stack);
```

### 2. Logs en `direct-contract.js` (calculatePendingRewards)

#### A. Logs de entrada y validación:
```javascript
console.log('💰 [CALC-REWARDS] Calculating pending rewards for wallet:', buyerPubkey.toString());
console.log('🔍 [CALC-REWARDS] Fetching buyer state data...');
console.log('🔍 [CALC-REWARDS] Buyer data received:', buyerData);
console.log('✅ [CALC-REWARDS] Buyer has', buyerData.stakedAmount, 'lamports staked');
console.log('🔍 [CALC-REWARDS] Fetching presale state...');
console.log('🔍 [CALC-REWARDS] Presale state received:', presaleState);
```

#### B. Logs del cálculo basado en tiempo:
```javascript
console.log('🔍 [CALC-REWARDS] Checking if time-based calculation needed...');
console.log('🔍 [CALC-REWARDS] accRewardPerToken:', accRewardPerToken.toString());
console.log('🔍 [CALC-REWARDS] lastStakeTs:', buyerData.lastStakeTs);

// Si se usa cálculo basado en tiempo:
console.log('⏰ [CALC-REWARDS] AccRewardPerToken is 0, calculating time-based rewards...');
console.log('  📅 Last update:', new Date(lastUpdateTs * 1000).toISOString());
console.log('  📅 Now:', new Date(nowSeconds * 1000).toISOString());
console.log('  ⏱️  Time elapsed:', timeElapsedSeconds, 'seconds', '(' + (timeElapsedSeconds / 86400).toFixed(2) + ' days)');
console.log('  📊 APY (BPS):', apyBps);
console.log('  📊 APY (decimal):', apyDecimal);
console.log('  📊 Seconds per year:', secondsPerYear);
console.log('  💰 Time-based rewards (lamports):', timeBasedRewards.toFixed(0));
console.log('  💰 Time-based rewards (VIBES):', (timeBasedRewards / Math.pow(10, TOKEN_CONFIG.VIBES_DECIMALS)).toFixed(9));
console.log('  ✅ Final pending rewards after time-based calc:', pendingRewards.toString(), 'lamports');
```

## 📋 Qué Buscar en la Consola

### Escenario 1: Función no se ejecuta
**Logs esperados pero AUSENTES:**
```
🔍 [REWARDS] Starting pending rewards calculation...
💰 [CALC-REWARDS] Calculating pending rewards for wallet...
```

**Causa probable:** Error antes de llamar a la función

### Escenario 2: Error en la función
**Logs esperados:**
```
❌ [REWARDS] Failed to calculate pending rewards: [error message]
❌ [REWARDS] Error stack: [stack trace]
```

**Causa probable:** Problema en `DirectContractClient` o en `getBuyerStateData`

### Escenario 3: Buyer state no válido
**Logs esperados:**
```
💰 [CALC-REWARDS] Calculating pending rewards for wallet...
🔍 [CALC-REWARDS] Buyer data received: { exists: false, ... }
📭 [CALC-REWARDS] Buyer state does not exist, returning 0
```

**Causa probable:** PDA incorrecta o cuenta no existe

### Escenario 4: Cálculo basado en tiempo NO se ejecuta
**Logs esperados:**
```
🔍 [CALC-REWARDS] Checking if time-based calculation needed...
🔍 [CALC-REWARDS] accRewardPerToken: 0
🔍 [CALC-REWARDS] lastStakeTs: 1760310361
⚠️ [CALC-REWARDS] Not using time-based calculation...
```

**Causa probable:** Condición `if (accRewardPerToken === 0n && buyerData.lastStakeTs > 0)` no se cumple

### Escenario 5: ✅ Cálculo correcto
**Logs esperados:**
```
🔍 [CALC-REWARDS] Checking if time-based calculation needed...
⏰ [CALC-REWARDS] AccRewardPerToken is 0, calculating time-based rewards...
  📅 Last update: 2025-10-12T23:06:01.000Z
  📅 Now: 2025-10-24T...
  ⏱️  Time elapsed: 1036800 seconds (12.00 days)
  📊 APY (BPS): 4000
  📊 APY (decimal): 0.4
  📊 Seconds per year: 31557600
  💰 Time-based rewards (lamports): 2721827
  💰 Time-based rewards (VIBES): 2.721827000
  ✅ Final pending rewards after time-based calc: 2721827 lamports
✅ Total pending rewards: 2.721827000 VIBES
🎁 Updated pending rewards (calculated) to: 2.721827 VIBES
```

## 🧪 Pasos para Debugging

1. **Refresca la página** (Cmd/Ctrl + R) para limpiar la caché del JS
2. **Abre la consola** del navegador (F12 o Cmd/Opt + I)
3. **Conecta tu wallet**
4. **Busca los logs** que empiezan con:
   - `🔍 [REWARDS]`
   - `💰 [CALC-REWARDS]`
   - `⏰ [CALC-REWARDS]`
   - `❌ [REWARDS]`

5. **Copia todos los logs relacionados** y compártelos

## 🎯 Hipótesis Principales

### Hipótesis 1: `accRewardPerToken` no es BigInt 0n
Si `presaleState.accRewardPerToken` devuelve `undefined` o `null` en lugar de `0n`, la condición `accRewardPerToken === 0n` fallará.

**Solución potencial:** Verificar la conversión a BigInt

### Hipótesis 2: `lastStakeTs` es 0
Si por alguna razón `buyerData.lastStakeTs` es `0` o `undefined`, la condición `buyerData.lastStakeTs > 0` fallará.

**Solución potencial:** Verificar el parsing de `lastStakeTs` en `getBuyerStateData`

### Hipótesis 3: Error en `getPresaleStateFromContract`
Si esta función falla, el try-catch capturará el error y devolverá 0.

**Solución potencial:** Verificar logs de error

### Hipótesis 4: `VIBES_DECIMALS` incorrecto
Si los decimales son incorrectos, el cálculo dará resultados erróneos.

**Solución potencial:** Verificar que `TOKEN_CONFIG.VIBES_DECIMALS = 9` en mainnet

## 📊 Valores Esperados (para verificación)

Con los datos actuales:
- **Staked Amount:** 207,307,692 lamports = 207.307692 VIBES
- **Tiempo transcurrido:** ~12 días = 1,036,800 segundos
- **APY:** 40% = 0.40
- **Segundos por año:** 31,557,600

**Cálculo:**
```
rewards = (207,307,692 * 0.40 * 1,036,800) / 31,557,600
        = 2,721,827 lamports
        = 2.72 VIBES
```

Si ves **2-3 VIBES** en los logs, ¡el cálculo está correcto! ✅

---

**Status:** 🔍 Debugging en progreso  
**Fecha:** October 24, 2025  
**Próximo paso:** Analizar logs de consola para identificar el problema específico


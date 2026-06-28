# 🔒 SECURITY BEST PRACTICES - VIBES DApp

**Para:** Equipo de Desarrollo  
**Última Actualización:** 12 de Octubre, 2025

---

## ⚠️ REGLAS DE ORO

### 1. NUNCA expongas en logs del navegador:
- ❌ API keys
- ❌ Private keys / Secret keys
- ❌ Seed phrases
- ❌ URLs completas con query parameters sensibles
- ❌ Tokens de autenticación
- ❌ Contraseñas (obviamente)

### 2. SIEMPRE usa SecureLogger:
```javascript
// ❌ NUNCA hagas esto:
console.log('RPC URL:', NETWORK_CONFIG.RPC_URL);

// ✅ SIEMPRE haz esto:
SecureLogger.logRpcUrl(NETWORK_CONFIG.RPC_URL);
// o
console.log('RPC Endpoint:', NETWORK_CONFIG.RPC_URL.split('?')[0] + '?api-key=[REDACTED]');
```

### 3. Antes de CADA commit:
```bash
# Busca información sensible:
grep -r "console.log.*api-key" src/
grep -r "console.log.*secret" src/
grep -r "console.log.*private" src/
```

---

## 🛡️ GUÍA RÁPIDA DE SEGURIDAD

### Logging Seguro:

```javascript
// ✅ CORRECTO:
console.log('✅ Connection initialized to', NETWORK_CONFIG.NETWORK);
SecureLogger.info('Processing transaction...');
SecureLogger.logRpcUrl(rpcUrl);

// ❌ INCORRECTO:
console.log('✅ Connection initialized:', NETWORK_CONFIG.RPC_URL);
console.log('API Key:', apiKey);
console.log('Private Key:', wallet.secretKey);
```

### Manejo de Errores:

```javascript
// ✅ CORRECTO:
catch (error) {
    console.error('Transaction failed:', error.message);
    // NO loguear error.stack en producción si contiene datos sensibles
}

// ❌ INCORRECTO:
catch (error) {
    console.error('Transaction failed:', error); // Puede contener data sensible
}
```

### URLs y Endpoints:

```javascript
// ✅ CORRECTO:
const endpoint = url.split('?')[0]; // Solo el host
console.log('Using endpoint:', endpoint);

// ❌ INCORRECTO:
console.log('Using endpoint:', fullUrlWithApiKey);
```

---

## 📋 CHECKLIST PRE-DEPLOYMENT

Antes de hacer deployment a producción:

- [ ] Revisar todos los `console.log()` nuevos
- [ ] Verificar que no hay API keys expuestas
- [ ] Confirmar que SecureLogger está cargado primero
- [ ] Probar en DevTools que no se ve información sensible
- [ ] Revisar variables hardcodeadas
- [ ] Verificar `.env.example` está actualizado (si aplica)
- [ ] Confirmar que `.env` está en `.gitignore`

---

## 🎯 USANDO SecureLogger

### Importar (ya está disponible globalmente):

```javascript
// No necesitas importar, está en window.SecureLogger
SecureLogger.info('Hello world');
```

### Funciones Disponibles:

```javascript
// Debug (solo en desarrollo)
SecureLogger.debug('Detalle técnico', variable);

// Info (siempre, con redacción)
SecureLogger.info('✅ Operación completada');

// Warning (siempre, con redacción)
SecureLogger.warn('⚠️ Advertencia');

// Error (siempre, con redacción)
SecureLogger.error('❌ Error:', error.message);

// RPC URL (oculta API key)
SecureLogger.logRpcUrl(NETWORK_CONFIG.RPC_URL);

// Connection (info básica sin secrets)
SecureLogger.logConnection(connection);

// Detectar entorno
if (SecureLogger.isProduction()) {
    // Comportamiento de producción
}
```

---

## 🚨 QUÉ HACER SI EXPONES INFORMACIÓN SENSIBLE

Si accidentalmente haces commit de información sensible:

### 1. API Key Expuesta:

```bash
# Inmediatamente:
1. Rota la API key en el dashboard del proveedor (Helius, etc.)
2. Actualiza config.js con la nueva key
3. NO hagas "git revert" (la key seguirá en el historial)
4. Si es público, considera que la key está comprometida
```

### 2. Private Key Expuesta:

```bash
# URGENTE:
1. Transfiere TODOS los fondos a una nueva wallet
2. Nunca uses esa wallet nuevamente
3. Rota todas las credenciales relacionadas
4. Documenta el incidente
```

### 3. En Git History:

```bash
# Si está en git history público:
1. Considera el secret comprometido
2. Rótalo inmediatamente
3. No intentes "limpiar" el historial (es inútil si ya es público)

# Si es repo privado:
1. Rota el secret igual (por precaución)
2. Opcionalmente usa git-filter-branch o BFG Repo-Cleaner
```

---

## 🔐 MEJORES PRÁCTICAS ADICIONALES

### Variables de Entorno:

```javascript
// Si usas un backend:
// .env (NUNCA en git)
HELIUS_API_KEY=xxx
SOLANA_RPC_URL=xxx

// .env.example (SÍ en git)
HELIUS_API_KEY=your_key_here
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```

### Comentarios en Código:

```javascript
// ✅ CORRECTO:
// SECURITY: API key is loaded from config, never logged
const connection = new Connection(NETWORK_CONFIG.RPC_URL);

// ✅ CORRECTO:
// IMPORTANT: This wallet address is public, safe to log
console.log('Public wallet:', publicKey.toBase58());

// ❌ INCORRECTO:
// Using API key: [REDACTED_OLD_MAINNET_KEY]
```

### Testing:

```javascript
// Para testing, usa valores mock:
const TEST_RPC = 'https://api.devnet.solana.com'; // Público, OK
const TEST_KEY = 'mock_key_for_testing'; // No es real, OK

// NO uses keys reales en tests
```

---

## 📚 RECURSOS

- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [Solana Security Best Practices](https://docs.solana.com/developing/programming-model/security)
- Documento interno: `SECURITY_AUDIT_LOG.md`

---

## ✅ RESUMEN

1. **No loguees secrets** - Usa SecureLogger
2. **Revisa antes de commit** - Grep por patterns sensibles
3. **Si expones algo** - Rota inmediatamente
4. **En duda, pregunta** - Mejor prevenir que lamentar

---

**Seguridad es responsabilidad de TODOS en el equipo.** 🔒


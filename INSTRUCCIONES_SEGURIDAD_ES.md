# 🔒 INSTRUCCIONES DE SEGURIDAD - DApp FRONTEND
**Fecha:** 18 de Octubre, 2025

---

## ⚠️ IMPORTANTE: LEE ESTO ANTES DE HACER COMMIT

Se han encontrado **API keys expuestas** en múltiples archivos del frontend. Este proyecto NO debe ser subido al repositorio remoto hasta que completes TODOS los pasos descritos abajo.

---

## 🚨 PROBLEMAS ENCONTRADOS

### 1. API Keys de Helius Hardcodeadas
- **Mainnet:** `[REDACTED_OLD_MAINNET_KEY]` (4 veces en index.html)
- **Devnet:** `[REDACTED_OLD_DEVNET_KEY]` (3 veces en index.html)
- **Total:** 17+ instancias en archivos de aplicación y documentación

### 2. Archivos Críticos Afectados
- `index.html` (4 líneas con API keys)
- `src/js/config.js` (2 líneas con API keys)
- `debug-usdc-error.html` (1 línea)
- `tools/verify-price-sync.js` (1 línea)
- Múltiples archivos en `docs/`

---

## ✅ LO QUE YA SE HA HECHO

1. ✅ El archivo `.gitignore` ha sido actualizado
2. ✅ Protección agregada para wallets y archivos sensibles
3. ✅ Script de verificación de seguridad creado
4. ✅ Reporte detallado de seguridad generado

---

## 🔧 PASOS A SEGUIR (URGENTE)

### PASO 1: Revocar API Keys 🔴 CRÍTICO

```bash
# 1. Ve a: https://dashboard.helius.xyz
# 2. Inicia sesión
# 3. Revoca estas API keys INMEDIATAMENTE:
#    - [REDACTED_OLD_MAINNET_KEY] (Mainnet)
#    - [REDACTED_OLD_DEVNET_KEY] (Devnet)
# 4. Genera nuevas API keys
# 5. Guarda las nuevas keys en un lugar seguro
```

### PASO 2: Crear Archivo .env

```bash
# En el directorio del proyecto:
cd /Users/osmelprieto/Projects/daap_futureVibe_V3

# Crear archivo .env:
cat > .env << 'EOF'
# Helius API Configuration
# ⚠️ NEVER commit this file!
HELIUS_MAINNET_API_KEY=TU_NUEVA_KEY_MAINNET_AQUI
HELIUS_DEVNET_API_KEY=TU_NUEVA_KEY_DEVNET_AQUI

# Network Configuration
NETWORK=mainnet-beta
RPC_URL=https://mainnet.helius-rpc.com/?api-key=${HELIUS_MAINNET_API_KEY}
FALLBACK_RPC=https://api.mainnet-beta.solana.com
EOF

# Verifica que está protegido:
git check-ignore .env
# Debe mostrar: .env ✅
```

### PASO 3: Actualizar src/js/config.js

**Archivo:** `src/js/config.js`

```javascript
// ❌ ANTES (ELIMINAR ESTO):
const CONFIG = {
    RPC_URL: 'https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_MAINNET_API_KEY',
    FALLBACK_RPC: 'https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_MAINNET_API_KEY',
    // ...
};

// ✅ DESPUÉS (USAR ESTO):
const CONFIG = {
    // For production, use public RPC or serve config from backend
    RPC_URL: window.RPC_CONFIG?.mainnet || 'https://api.mainnet-beta.solana.com',
    FALLBACK_RPC: 'https://api.mainnet-beta.solana.com',
    
    PRESALE_V3_PROGRAM_ID: 'HNPuLPxycypT4YtD5vMZPdcrr53MLKAajYrQwNTv4ujH',
    USDC_MINT: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    VIBES_MINT: 'FdK2dRn4fH7reFjmSbDW3cZDZcQ7FX9HWMsE7nNhJVnf',
    
    NETWORK: 'mainnet-beta',
    
    // UI Settings
    AUTO_CONNECT: false,
    BALANCE_REFRESH_INTERVAL: 30000,
    PRESALE_REFRESH_INTERVAL: 60000,
    TX_TIMEOUT: 60000,
    MAX_RETRIES: 3,
};

// Optional: Load configuration from backend endpoint
async function loadSecureConfig() {
    try {
        const response = await fetch('/api/config');
        if (response.ok) {
            const config = await response.json();
            window.RPC_CONFIG = config;
        }
    } catch (error) {
        console.warn('Using default RPC configuration');
    }
}

// Initialize
if (typeof window !== 'undefined') {
    loadSecureConfig();
}
```

### PASO 4: Actualizar index.html

**Archivo:** `index.html`

Buscar y reemplazar las siguientes líneas:

**Línea ~3709:**
```javascript
// ANTES:
const rpcUrl = window.CONFIG?.RPC_URL 
    || 'https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_MAINNET_API_KEY';

// DESPUÉS:
const rpcUrl = window.CONFIG?.RPC_URL 
    || 'https://api.mainnet-beta.solana.com';
```

**Línea ~3818:**
```javascript
// ANTES:
|| 'https://devnet.helius-rpc.com/?api-key=YOUR_HELIUS_DEVNET_API_KEY';

// DESPUÉS:
|| 'https://api.devnet.solana.com';
```

**Línea ~4039:**
```javascript
// ANTES:
|| 'https://devnet.helius-rpc.com/?api-key=YOUR_HELIUS_DEVNET_API_KEY';

// DESPUÉS:
|| 'https://api.devnet.solana.com';
```

**Línea ~4102:**
```javascript
// ANTES:
|| 'https://devnet.helius-rpc.com/?api-key=YOUR_HELIUS_DEVNET_API_KEY';

// DESPUÉS:
|| 'https://api.devnet.solana.com';
```

### PASO 5: Actualizar tools/verify-price-sync.js

**Archivo:** `tools/verify-price-sync.js` (línea 11)

```javascript
// ANTES:
const MAINNET_RPC = process.env.RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_MAINNET_API_KEY';

// DESPUÉS:
const MAINNET_RPC = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
```

### PASO 6: Limpiar debug-usdc-error.html

**Opción A: Actualizar el archivo**
```javascript
// Línea 17 - ANTES:
const RPC = 'https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_MAINNET_API_KEY';

// DESPUÉS:
const RPC = 'https://api.mainnet-beta.solana.com';
```

**Opción B: Eliminar el archivo (recomendado si es solo para debug)**
```bash
rm debug-usdc-error.html
```

### PASO 7: Limpiar Archivos de Documentación

**Archivos a limpiar:**
- `docs/SECURITY_BEST_PRACTICES.md`
- `docs/SECURITY_AUDIT_LOG.md`
- `docs/COUNTDOWN_FIX.md`
- `docs/PRICE_SYNC_EXPLAINED.md`
- `docs/DAYS_LEFT_COUNTER.md`
- `docs/HELIUS_OPTIMIZATION.md`

**En cada archivo, reemplazar:**
```
[REDACTED_OLD_MAINNET_KEY]
↓
YOUR_API_KEY_HERE

[REDACTED_OLD_DEVNET_KEY]
↓
YOUR_API_KEY_HERE
```

### PASO 8: Verificar con el Script de Seguridad

```bash
# Ejecutar el script:
./scripts/verify_security.sh

# Si pasa todas las verificaciones:
# ✅ All critical checks passed!
# Safe to commit to repository.

# Si hay errores, corrígelos y vuelve a ejecutar el script
```

### PASO 9: Verificación Manual

```bash
# Verificar que NO hay API keys:
grep -r "e4246c12" . --exclude-dir=node_modules --exclude-dir=.git --exclude="SECURITY*.md" --exclude="INSTRUCCIONES*.md"
grep -r "10bdc822" . --exclude-dir=node_modules --exclude-dir=.git --exclude="SECURITY*.md" --exclude="INSTRUCCIONES*.md"

# Resultado esperado: NO debe encontrar nada ✅

# Verificar archivos que se van a commitear:
git status

# Verificar que .env NO está en la lista ✅
```

### PASO 10: Hacer Commit Seguro

```bash
# 1. Ver los cambios:
git diff

# 2. Agregar archivos seguros:
git add .gitignore
git add src/js/config.js
git add index.html
git add tools/verify-price-sync.js
git add scripts/verify_security.sh
git add docs/  # Solo si limpiaste las API keys

# 3. NO agregar:
# ❌ .env
# ❌ debug-usdc-error.html (si tiene API keys)
# ❌ Cualquier archivo con API keys

# 4. Verificar qué está staged:
git status

# 5. Hacer commit:
git commit -m "security: remove hardcoded API keys and update configuration"

# 6. Revisar el commit:
git log -1 -p

# 7. Solo si todo está correcto, hacer push:
git push origin main
```

---

## 📋 CHECKLIST OBLIGATORIO

**COMPLETA TODO ANTES DE COMMIT:**

```
[ ] 1. API keys revocadas en Helius dashboard
[ ] 2. Nuevas API keys generadas
[ ] 3. Archivo .env creado con nuevas keys
[ ] 4. src/js/config.js actualizado
[ ] 5. index.html limpiado (4 instancias)
[ ] 6. tools/verify-price-sync.js actualizado
[ ] 7. debug-usdc-error.html limpiado o eliminado
[ ] 8. Archivos en docs/ limpiados
[ ] 9. Script verify_security.sh ejecutado sin errores
[ ] 10. Verificación manual con grep (sin resultados)
[ ] 11. .env NO aparece en git status
[ ] 12. git diff revisado manualmente
[ ] 13. Solo archivos seguros staged
[ ] 14. Commit message descriptivo
[ ] 15. Listo para push
```

---

## 🎯 RESUMEN DE ARCHIVOS

### ✅ Archivos MODIFICADOS (commitear):
- `src/js/config.js` - Removidas API keys
- `index.html` - Removidas 4 instancias de API keys
- `tools/verify-price-sync.js` - Removida API key
- `.gitignore` - Actualizado con protecciones
- `scripts/verify_security.sh` - Script nuevo
- `docs/**/*.md` - API keys reemplazadas con placeholders

### ✅ Archivos NUEVOS (commitear):
- `.gitignore` (actualizado)
- `scripts/verify_security.sh`
- `INSTRUCCIONES_SEGURIDAD_ES.md`

### ❌ Archivos que NUNCA deben commitearse:
- `.env` (contiene tus API keys reales)
- `wallets/*.json` (si existen)
- Cualquier archivo con `.key`, `.seed`, `.private`

---

## 🚀 PARA EL FUTURO

### Mejores Prácticas:

1. **Siempre ejecuta** `./scripts/verify_security.sh` antes de commit
2. **Nunca hardcodees** API keys en el código
3. **Usa variables de entorno** o un backend API
4. **Rota las API keys** cada 90 días
5. **Monitorea** el uso en Helius dashboard

### Solución Recomendada para Producción:

Crear un backend simple que sirva la configuración:

```javascript
// backend/server.js
const express = require('express');
const app = express();

app.get('/api/config', (req, res) => {
    res.json({
        mainnet: `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`,
        network: 'mainnet-beta'
    });
});

app.listen(3000);
```

Esto mantiene las API keys en el servidor y nunca las expone al cliente.

---

## 📞 AYUDA

- **Reporte Detallado:** `SECURITY_AUDIT_REPORT.md`
- **Script de Verificación:** `scripts/verify_security.sh`
- **Helius Dashboard:** https://dashboard.helius.xyz

---

## ⚠️ SI ALGO SALE MAL

```bash
# Si ya hiciste commit pero NO push:
git reset --soft HEAD~1  # Deshace el último commit

# Si ya hiciste push:
# 1. Revoca INMEDIATAMENTE las API keys
# 2. Genera nuevas keys
# 3. Actualiza el código
# 4. Haz un nuevo commit
```

---

**IMPORTANTE:** Una vez que algo está en el historial de git, es difícil eliminarlo. Es mejor prevenir ahora que tener que limpiar después.

---

**Última actualización:** 18 de Octubre, 2025  
**Estado:** ⚠️ COMPLETAR TODOS LOS PASOS ANTES DE COMMIT  
**Prioridad:** 🔴 CRÍTICA


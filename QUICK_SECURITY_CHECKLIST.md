# ⚡ CHECKLIST RÁPIDO - DApp FRONTEND

## 🚨 ANTES DE HACER COMMIT - PASOS OBLIGATORIOS

### 1️⃣ REVOCAR API KEYS (5 minutos)
```
□ Ir a https://dashboard.helius.xyz
□ Revocar: [OLD_MAINNET_KEY]
□ Revocar: [OLD_DEVNET_KEY]
□ Generar nuevas API keys
```

### 2️⃣ CREAR .env (2 minutos)
```bash
# Crear archivo .env con nuevas keys
# Ver INSTRUCCIONES_SEGURIDAD_ES.md paso 2
```

### 3️⃣ LIMPIAR ARCHIVOS CRÍTICOS (15 minutos)
```
□ src/js/config.js - Reemplazar API keys
□ index.html - Limpiar 4 instancias (líneas ~3709, 3818, 4039, 4102)
□ tools/verify-price-sync.js - Reemplazar API key
□ debug-usdc-error.html - Limpiar o eliminar
□ docs/*.md - Reemplazar con placeholders
```

### 4️⃣ VERIFICAR (2 minutos)
```bash
./scripts/verify_security.sh
# Debe mostrar: ✅ All critical checks passed!
```

### 5️⃣ VERIFICACIÓN MANUAL (3 minutos)
```bash
# NO debe encontrar nada:
grep -r "e4246c12" . --exclude-dir=node_modules --exclude="*.md"
grep -r "10bdc822" . --exclude-dir=node_modules --exclude="*.md"

# .env NO debe aparecer:
git status | grep .env
```

### 6️⃣ COMMIT SEGURO (3 minutos)
```bash
git diff                    # Revisar cambios
git status                  # Verificar archivos
git add .gitignore src/js/config.js index.html
git commit -m "security: remove hardcoded API keys"
git push
```

---

## ❌ NUNCA COMMITEAR
- `.env` (contiene tus API keys)
- `wallets/*.json` (si existen)
- Archivos con API keys

## ✅ SÍ COMMITEAR
- `src/js/config.js` (limpio)
- `index.html` (limpio)
- `.gitignore` (actualizado)
- Scripts y documentación

---

## 🔍 VERIFICACIÓN RÁPIDA

```bash
# Todo debe estar limpio:
./scripts/verify_security.sh

# Si pasa: ✅ Listo para commit
# Si falla: ❌ Revisar y corregir errores
```

---

**Tiempo total: ~30 minutos**

**Archivos de ayuda:**
- 📖 `INSTRUCCIONES_SEGURIDAD_ES.md` - Guía paso a paso completa
- 📊 `SECURITY_AUDIT_REPORT.md` - Reporte técnico detallado
- 🔧 `scripts/verify_security.sh` - Verificación automática

---

**NOTA:** Es mejor invertir 30 minutos ahora que tener un problema de seguridad después.


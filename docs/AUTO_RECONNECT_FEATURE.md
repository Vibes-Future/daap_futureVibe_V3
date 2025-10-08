# 🔄 Auto-Reconnect Feature

## ✨ ¿Qué es Auto-Reconnect?

El Auto-Reconnect permite que tu wallet permanezca conectada incluso después de refrescar la página. Es una característica estándar en DApps profesionales que mejora significativamente la experiencia del usuario.

---

## 🎯 Comportamiento

### ✅ Lo que HACE:
1. **Guarda tu preferencia** cuando conectas una wallet
2. **Reconecta automáticamente** al refrescar la página
3. **Funciona silenciosamente** en segundo plano
4. **Solo reconecta si la wallet está disponible**

### ❌ Lo que NO HACE:
1. **No guarda claves privadas** (nunca tenemos acceso a ellas)
2. **No conecta sin tu wallet instalada**
3. **No sobrescribe desconexiones manuales**

---

## 🔧 Cómo Funciona

### 1. Al Conectar la Wallet

```javascript
// Cuando conectas tu wallet:
1. Usuario hace clic en "Connect Wallet"
2. Selecciona una wallet (ej: Phantom)
3. Aprueba en la wallet
4. ✅ Conexión exitosa

// En background:
localStorage.setItem('vibes_connected_wallet', 'Phantom')
console.log('💾 Saved connection preference: Phantom')
```

### 2. Al Refrescar la Página

```javascript
// Cuando refrescas la página:
1. DApp se carga
2. WalletManager inicializa
3. Detecta wallets disponibles
4. Encuentra 'Phantom' guardado en localStorage
5. Reconecta automáticamente
6. ✅ Ya estás conectado!

// En consola verás:
🔄 Attempting to auto-reconnect to: Phantom
🔗 Auto-connecting to Phantom
✅ Wallet connected successfully: 3nxK...bAvU
```

### 3. Al Desconectar Manualmente

```javascript
// Cuando desconectas:
1. Usuario hace clic en "Disconnect"
2. Wallet se desconecta
3. localStorage se limpia
4. ✅ Preferencia eliminada

// En background:
localStorage.removeItem('vibes_connected_wallet')
console.log('🗑️ Cleared connection preference')
```

---

## 🔍 Debugging

### Ver Preferencia Guardada

Abre la consola del navegador y ejecuta:

```javascript
// Ver wallet guardada
localStorage.getItem('vibes_connected_wallet')
// Returns: "Phantom" o null

// Limpiar manualmente (para testing)
localStorage.removeItem('vibes_connected_wallet')
```

### Logs en Consola

Cuando auto-reconnect funciona, verás:

```
🔧 SolanaWalletManager initialized
📍 Detected wallets: ["Phantom", "Trust Wallet"]
🔄 Attempting to auto-reconnect to: Phantom
✅ Phantom wallet detected
🔗 Auto-connecting to Phantom
🔌 Connecting to Phantom...
✅ Wallet connected successfully: 3nxKNKD...bAvU
💾 Saved connection preference: Phantom
```

Si no hay conexión guardada:

```
🔧 SolanaWalletManager initialized
📍 No saved wallet connection found
```

Si la wallet guardada no está disponible:

```
🔧 SolanaWalletManager initialized
🔄 Attempting to auto-reconnect to: Phantom
⚠️ Saved wallet not available: Phantom
🗑️ Cleared connection preference
```

---

## 🧪 Cómo Probar

### Caso 1: Conexión Normal + Refresh

1. **Conecta tu wallet**:
   ```
   - Abre la app
   - Clic en "Connect Wallet"
   - Selecciona Phantom
   - Aprueba la conexión
   - ✅ Estás conectado
   ```

2. **Refresca la página** (`F5` o `Ctrl+R`)
   ```
   - ✅ Wallet sigue conectada automáticamente
   - ✅ Balance visible
   - ✅ Dirección mostrada en header
   ```

3. **Verifica en consola**:
   ```javascript
   app.isConnected()
   // Returns: true
   
   localStorage.getItem('vibes_connected_wallet')
   // Returns: "Phantom"
   ```

### Caso 2: Desconexión Manual

1. **Desconecta manualmente**:
   ```
   - Clic en el botón de wallet conectada
   - Clic en "Disconnect"
   - ✅ Wallet desconectada
   ```

2. **Refresca la página**:
   ```
   - ✅ Wallet NO se reconecta
   - ✅ Muestra "Connect Wallet"
   - ✅ Estado limpio
   ```

3. **Verifica en consola**:
   ```javascript
   app.isConnected()
   // Returns: false
   
   localStorage.getItem('vibes_connected_wallet')
   // Returns: null
   ```

### Caso 3: Desconexión desde la Wallet

1. **Desconecta desde Phantom**:
   ```
   - Abre extensión de Phantom
   - Busca vibes-dapp en "Connected Sites"
   - Clic en "Disconnect"
   - ✅ Wallet desconectada desde el origen
   ```

2. **En la app**:
   ```
   - ✅ Detecta desconexión automáticamente
   - ✅ UI se actualiza a estado desconectado
   - ✅ Preferencia se limpia
   ```

3. **Refresca la página**:
   ```
   - ✅ NO intenta reconectar
   - ✅ Estado limpio
   ```

---

## 🔐 Seguridad

### ✅ Seguro

- **Solo guarda el nombre** de la wallet (ej: "Phantom")
- **NO guarda claves privadas**
- **NO guarda direcciones**
- **NO guarda transacciones**
- **Usa localStorage** (aislado por dominio)

### 🛡️ Protecciones

1. **Timeout de 1.5s**: Da tiempo a las wallets para cargar
2. **Limpieza automática**: Si falla, limpia la preferencia
3. **Validación**: Solo reconecta si wallet está disponible
4. **Usuario en control**: Desconexión manual respetada

---

## ⚙️ Configuración Avanzada

### Deshabilitar Auto-Reconnect

Si por alguna razón quieres deshabilitar el auto-reconnect:

```javascript
// En consola del navegador:
app.getWalletManager().autoConnectEnabled = false
console.log('🔒 Auto-reconnect disabled')

// O limpia la preferencia:
localStorage.removeItem('vibes_connected_wallet')
```

### Cambiar Timeout

El timeout por defecto es 1.5 segundos. Si tus usuarios tienen conexiones lentas, puedes ajustarlo en `solana-wallet-standard.js`:

```javascript
// Línea 98 en checkAutoConnect()
}, 1500); // Cambiar a 2000 o 3000 si es necesario
```

---

## 🐛 Troubleshooting

### Problema: Wallet no reconecta después de refresh

**Solución**:
```javascript
// 1. Verifica que hay una preferencia guardada
localStorage.getItem('vibes_connected_wallet')

// 2. Verifica que la wallet está detectada
app.getWalletManager().getAvailableWallets()

// 3. Verifica logs en consola
// Busca: "🔄 Attempting to auto-reconnect"
```

### Problema: Reconecta pero no muestra UI

**Solución**:
```javascript
// Fuerza actualización de UI
app.updateWalletUI()
window.updateProductionWalletButton(
    true, 
    app.getPublicKey().toString(), 
    app.getWalletManager().getWalletName()
)
```

### Problema: Wallet "rota" después de muchos refreshes

**Solución**:
```javascript
// Limpia completamente y reconecta
localStorage.removeItem('vibes_connected_wallet')
// Refresca la página
location.reload()
// Conecta manualmente
```

---

## 📊 Comparación: Antes vs Después

| Situación | Antes | Después |
|-----------|-------|---------|
| **Refresh página** | ❌ Desconecta | ✅ Mantiene conexión |
| **Cerrar/abrir tab** | ❌ Desconecta | ✅ Mantiene conexión |
| **Desconectar manual** | ✅ Desconecta | ✅ Desconecta y no reconecta |
| **Experiencia usuario** | ⚠️ Frustrante | ✅ Fluida |
| **Profesionalidad** | ⚠️ Amateur | ✅ Profesional |

---

## 🎓 Mejores Prácticas

### Para Usuarios

1. **Conecta una vez**: Tu wallet permanecerá conectada
2. **Desconecta al terminar**: Por seguridad, en computadoras públicas
3. **Usa siempre la misma wallet**: Para mejor experiencia

### Para Desarrolladores

1. **No confíes solo en localStorage**: Siempre valida con la wallet
2. **Maneja errores silenciosamente**: No molestes al usuario con fallos de auto-connect
3. **Respeta desconexiones**: Si el usuario desconectó, no insistas
4. **Timeout generoso**: Las wallets pueden tardar en cargar
5. **Logs claros**: Para debugging en producción

---

## 📱 Compatibilidad

| Wallet | Auto-Reconnect | Notas |
|--------|----------------|-------|
| **Phantom** | ✅ Sí | Totalmente compatible |
| **Solflare** | ✅ Sí | Totalmente compatible |
| **Trust Wallet** | ✅ Sí | Totalmente compatible |
| **Coinbase** | ✅ Sí | Totalmente compatible |
| **Backpack** | ✅ Sí | Totalmente compatible |

---

## 🔮 Futuro

Mejoras planeadas:

- [ ] Auto-reconnect con timeout configurable en UI
- [ ] Preferencia de usuario para habilitar/deshabilitar
- [ ] Notificación cuando auto-reconnect falla
- [ ] Múltiples conexiones guardadas
- [ ] Migración automática entre wallets

---

## 📝 Código de Referencia

### Implementación Completa

Ver archivos:
- `src/js/solana-wallet-standard.js` - Líneas 11-127
- Métodos: `checkAutoConnect()`, `saveConnection()`, `clearConnection()`

### Uso en Otras DApps

Si quieres usar esto en otro proyecto:

```javascript
class YourWalletManager {
    // ... tu código ...
    
    // Copia estos métodos:
    checkAutoConnect() { /* ... */ }
    saveConnection(name) { /* ... */ }
    clearConnection() { /* ... */ }
    
    // Y modifica connect() y disconnect()
    // para llamar saveConnection() y clearConnection()
}
```

---

**Versión**: 2.0.1  
**Fecha**: October 8, 2025  
**Feature**: Auto-Reconnect  
**Estado**: ✅ Production Ready

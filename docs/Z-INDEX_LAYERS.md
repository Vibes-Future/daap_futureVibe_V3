# 🎨 Z-Index Layer System - Wallet Dropdown Fix

## 🐛 El Problema

El dropdown del wallet aparecía **detrás del header** y no se podía navegar porque tenía un z-index incorrecto.

## ✅ La Solución: Sistema de Capas

He implementado un sistema de z-index jerárquico para asegurar que cada elemento aparezca en la capa correcta:

### 📊 Jerarquía de Z-Index (de menor a mayor):

```
Z-Index: 899  ← Mobile Navigation Menu (debajo del header)
Z-Index: 900  ← Production Header (base del header)
Z-Index: 1001 ← Production Wallet Container (botón wallet)
Z-Index: 9999 ← Wallet Dropdown Backdrop (fondo oscuro móvil)
Z-Index: 10000 ← Wallet Dropdown (modal/menú desplegable)
```

### 🎯 Elementos y Sus Z-Index:

#### 1. **Mobile Navigation Menu** (`z-index: 899`)
```css
.mobile-nav {
    z-index: 899;
}
```
- **Razón**: El menú de navegación móvil debe estar debajo del header
- **Comportamiento**: Se desliza desde arriba cuando se abre

#### 2. **Production Header** (`z-index: 900`)
```css
.production-header {
    z-index: 900;
}
```
- **Razón**: El header es la base, pero debe permitir que el wallet dropdown aparezca encima
- **Comportamiento**: Siempre visible en la parte superior

#### 3. **Production Wallet Container** (`z-index: 1001`)
```css
#production-wallet-container {
    z-index: 1001;
}
```
- **Razón**: El botón del wallet debe estar sobre el header para que su dropdown funcione
- **Comportamiento**: Contiene el botón de conexión y el dropdown

#### 4. **Wallet Dropdown Backdrop** (`z-index: 9999`)
```css
.wallet-dropdown-backdrop {
    z-index: 9999;
}
```
- **Razón**: En móviles, el fondo oscuro debe cubrir todo excepto el dropdown
- **Comportamiento**: Cubre toda la pantalla cuando el dropdown está abierto

#### 5. **Wallet Dropdown** (`z-index: 10000`)
```css
.wallet-dropdown {
    z-index: 10000;
}
```
- **Razón**: El dropdown debe estar **por encima de todo** para ser interactivo
- **Comportamiento**: Modal en móviles, menú desplegable en desktop

## 🖥️ Comportamiento por Plataforma

### Desktop (>768px):
```
┌─────────────────────────────────────────┐
│ Header (z-index: 900)                   │
│                        [Wallet (1001)]  │
│                              ↓          │
│                        ┌─────────────┐  │ ← Dropdown (z-index: 10000)
│                        │ Copy Address│  │
│                        │ Disconnect  │  │
│                        └─────────────┘  │
└─────────────────────────────────────────┘
```

### Mobile (≤768px):
```
┌─────────────────────────────────────────┐
│ Header (z-index: 900)                   │
│ [Logo]              [Wallet] [☰]        │
└─────────────────────────────────────────┘
        ↓ (Click en Wallet)
┌─────────────────────────────────────────┐
│ Backdrop (z-index: 9999)                │ ← Fondo oscuro
│                                         │
│    ┌────────────────────────────────┐   │
│    │ Dropdown (z-index: 10000)     │   │ ← Modal
│    │ ────                          │   │
│    │ [Icon] Phantom                │   │
│    │ 4b3x...7k9p                   │   │
│    │                               │   │
│    │ Copy Address                  │   │
│    │ Disconnect                    │   │
│    └────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## 🔧 Características Adicionales

### Overflow y Scroll:
```css
.wallet-dropdown {
    overflow: visible;        /* Desktop: permite sombras */
    overflow-y: auto;         /* Permite scroll si es necesario */
    max-height: 80vh;         /* Desktop: máximo 80% de altura */
}

/* Mobile */
@media (max-width: 768px) {
    .wallet-dropdown {
        max-height: 70vh;     /* Móvil: máximo 70% de altura */
        overflow-y: auto;     /* Scroll si el contenido es largo */
    }
}
```

### Position:
```css
/* Desktop */
.wallet-dropdown {
    position: absolute;       /* Relativo al contenedor padre */
    top: calc(100% + 8px);   /* Debajo del botón */
    right: 0;                /* Alineado a la derecha */
}

/* Mobile */
@media (max-width: 768px) {
    .wallet-dropdown {
        position: fixed;      /* Relativo a la ventana */
        bottom: 0;           /* Pegado al fondo */
        left: 0;
        right: 0;
    }
}
```

## ✅ Resultado

### Desktop:
- ✅ El dropdown aparece **debajo del botón wallet**
- ✅ Está **por encima del header** (z-index 10000 > 900)
- ✅ Es **completamente navegable** y clickeable
- ✅ Las sombras y efectos se ven correctamente

### Mobile:
- ✅ El dropdown aparece como **modal desde abajo**
- ✅ El **backdrop oscuro** cubre el contenido (z-index 9999)
- ✅ El **modal está encima del backdrop** (z-index 10000)
- ✅ Es **scrolleable** si el contenido es largo (max-height: 70vh)
- ✅ Se puede **cerrar clickeando el backdrop** o el botón X

## 🎯 Verificación

Para verificar que funciona correctamente:

1. **Desktop**: 
   - Click en el botón wallet conectado
   - El dropdown debe aparecer debajo del botón
   - No debe quedar oculto detrás del header
   
2. **Mobile**:
   - Click en el botón wallet conectado
   - Debe aparecer un fondo oscuro
   - El modal debe subir desde abajo
   - Debe poder scrollear si es necesario
   - Click en el fondo oscuro debe cerrar el modal

---

## 📝 Resumen de Cambios

| Elemento | Z-Index Anterior | Z-Index Nuevo | Razón |
|----------|-----------------|---------------|-------|
| `.production-header` | 1000 | 900 | Permitir que el dropdown aparezca encima |
| `.mobile-nav` | 999 | 899 | Debe estar debajo del header |
| `#production-wallet-container` | - | 1001 | Contenedor del botón wallet |
| `.wallet-dropdown` | 1000 | 10000 | Debe estar encima de todo |
| `.wallet-dropdown-backdrop` | 1000 | 9999 | Debe estar debajo del dropdown |

**¡Ahora el dropdown funciona perfectamente en desktop y móvil! 🎉**


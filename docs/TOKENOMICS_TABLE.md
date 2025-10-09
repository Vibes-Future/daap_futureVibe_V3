# 📊 Tabla de Tokenomics - Sección Presale

## ✅ Implementación Completada

Se ha agregado una tabla de distribución de tokenomics en la sección de presale, completamente ajustada al estilo global de VIBES DeFi.

## 🎨 Características de Diseño

### Estilo Visual
- **Background**: Gradiente verde oscuro coherente con el tema VIBES
- **Bordes**: Color verde neón `#c7f801` con transparencia
- **Sombras**: Glow effect sutil para profundidad
- **Border Radius**: 12px para esquinas redondeadas modernas

### Colores Utilizados

| Elemento | Color | Uso |
|----------|-------|-----|
| **Headers** | `#c7f801` | Encabezados de columnas |
| **Background Header** | `rgba(199, 248, 1, 0.2)` | Fondo del header con transparencia |
| **Background Table** | Gradiente verde | `rgba(40, 61, 31, 0.8)` → `rgba(56, 73, 37, 0.6)` |
| **Text Principal** | `#ffffff` | Nombres de categorías (Presale, Staking, etc.) |
| **Text Secundario** | `rgba(255, 255, 255, 0.8)` | Datos de las celdas |
| **Border** | `rgba(199, 248, 1, 0.3)` | Bordes de la tabla |
| **Hover Effect** | `rgba(199, 248, 1, 0.05)` | Efecto al pasar el mouse |

## 📋 Estructura de la Tabla

### Columnas
1. **Tokenomics** - Categoría de distribución
2. **Wallet** - Dirección de la wallet (por completar)
3. **Unlock Date** - Fecha de desbloqueo (por completar)
4. **% Unlock** - Porcentaje inicial desbloqueado (por completar)
5. **% Unlock per Month** - Porcentaje mensual de desbloqueo (por completar)

### Filas
1. **Presale** - Tokens de la preventa
2. **Staking** - Tokens para staking rewards
3. **Marketing** - Tokens para marketing
4. **Project** - Tokens del proyecto
5. **Development** - Tokens para desarrollo
6. **Donation** - Tokens para donaciones/caridad
7. **Liquidity** - Tokens para liquidez

## 🎯 Ubicación

La tabla está ubicada en:
```
Sección Vesting
├─ Tarjetas de resumen (Total Vesting, Released, Remaining)
├─ Vesting Information (Estado, fechas, etc.)
├─ Claim Vested Tokens (Formulario de claim)
└─ 📊 Tokenomics Distribution Table ← AQUÍ (al final de la sección)
```

## ✨ Características Interactivas

### Hover Effect
Cada fila tiene un efecto de hover suave:
```javascript
onmouseover="this.style.background='rgba(199, 248, 1, 0.05)'"
onmouseout="this.style.background='transparent'"
```

### Responsive Design
- **overflow-x: auto** - Scroll horizontal en móviles
- **Padding adaptativo** - 16px 20px para buena legibilidad
- **Font-size escalable** - 0.95rem para headers, 0.9rem para contenido

## 📱 Responsive

La tabla incluye:
- `overflow-x: auto` para scroll horizontal en pantallas pequeñas
- Padding y font-size optimizados para móvil
- Mantiene la legibilidad en todos los tamaños de pantalla

## 🔧 Código HTML

```html
<div style="margin: 40px 0;">
    <h3>📊 Tokenomics Distribution</h3>
    <div style="overflow-x: auto; border-radius: 12px;">
        <table>
            <thead>
                <tr>
                    <th>Tokenomics</th>
                    <th>Wallet</th>
                    <th>Unlock Date</th>
                    <th>% Unlock</th>
                    <th>% Unlock per Month</th>
                </tr>
            </thead>
            <tbody>
                <!-- 7 filas con datos -->
            </tbody>
        </table>
    </div>
</div>
```

## 📊 Vista Previa Visual

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  📊 Tokenomics Distribution                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ Tokenomics    │ Wallet │ Unlock Date │ % Unlock │ % Unlock per Month       │
├───────────────┼────────┼─────────────┼──────────┼──────────────────────────┤
│ Presale       │   -    │      -      │    -     │            -             │
│ Staking       │   -    │      -      │    -     │            -             │
│ Marketing     │   -    │      -      │    -     │            -             │
│ Project       │   -    │      -      │    -     │            -             │
│ Development   │   -    │      -      │    -     │            -             │
│ Donation      │   -    │      -      │    -     │            -             │
│ Liquidity     │   -    │      -      │    -     │            -             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🚀 Próximos Pasos (Opcional)

Para completar la tabla con datos reales, se puede:

1. **Agregar direcciones de wallet** de cada categoría
2. **Especificar fechas de unlock** según el tokenomics real
3. **Definir porcentajes** de desbloqueo inicial y mensual
4. **Agregar tooltips** con información adicional
5. **Implementar links** a exploradores de blockchain para las wallets

## 💡 Ejemplo de Datos Completados

```javascript
// Ejemplo de cómo se vería con datos reales:
{
    category: "Presale",
    wallet: "EoDC...JxPp",
    unlockDate: "At Listing",
    percentUnlock: "40%",
    percentPerMonth: "20% every 30 days"
}
```

## 🎨 Consistencia con el Sistema de Diseño

La tabla utiliza:
- ✅ Colores del sistema VIBES (`#c7f801`, green gradients)
- ✅ Border radius consistente (12px)
- ✅ Spacing uniforme (16px-20px padding)
- ✅ Typography coherente (Roboto/Lexend fonts)
- ✅ Efectos de hover sutiles
- ✅ Sombras y glows según diseño global

## 📁 Archivo Modificado

- **index.html** - Líneas 2747-2827
  - Ubicación: Sección Vesting
  - Después de: Tarjetas de información y formulario de claim
  - Al final de la sección de Vesting

---

**Estado**: ✅ Implementado y Listo
**Versión**: 1.1.0 (Movido a Vesting)
**Fecha**: 2024
**Estilo**: 100% Coherente con VIBES DeFi Design System


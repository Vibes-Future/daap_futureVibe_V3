#!/bin/bash

# Validate Decimals Configuration
# Este script verifica que no haya conversiones hardcodeadas incorrectas

echo "🔍 Validando configuración de decimales en toda la aplicación..."
echo ""

ERRORS=0

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para reportar errores
report_error() {
    echo -e "${RED}❌ ERROR:${NC} $1"
    ERRORS=$((ERRORS + 1))
}

report_warning() {
    echo -e "${YELLOW}⚠️  WARNING:${NC} $1"
}

report_success() {
    echo -e "${GREEN}✅${NC} $1"
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Verificando archivos principales..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar que TOKEN_CONFIG existe y tiene los decimales correctos
echo "1️⃣  Verificando TOKEN_CONFIG en config.js..."
if grep -q "VIBES_DECIMALS: 6" src/js/config.js; then
    report_success "VIBES_DECIMALS configurado correctamente (6 para mainnet)"
else
    report_error "VIBES_DECIMALS no está configurado a 6 en src/js/config.js"
fi

if grep -q "USDC_DECIMALS: 6" src/js/config.js; then
    report_success "USDC_DECIMALS configurado correctamente (6)"
else
    report_error "USDC_DECIMALS no está configurado a 6 en src/js/config.js"
fi

if grep -q "SOL_DECIMALS: 9" src/js/config.js; then
    report_success "SOL_DECIMALS configurado correctamente (9)"
else
    report_error "SOL_DECIMALS no está configurado a 9 en src/js/config.js"
fi

echo ""
echo "2️⃣  Buscando conversiones hardcodeadas en archivos JS..."

# Buscar conversiones hardcodeadas en src/js (excluyendo las que usan TOKEN_CONFIG)
HARDCODED_JS=$(grep -rn "/ 1e9\|/ 1e6\|* 1e9\|* 1e6" src/js/ 2>/dev/null | grep -v "TOKEN_CONFIG" | wc -l | tr -d ' ')

if [ "$HARDCODED_JS" -eq "0" ]; then
    report_success "No se encontraron conversiones hardcodeadas en src/js/"
else
    report_error "Se encontraron $HARDCODED_JS conversiones hardcodeadas en src/js/"
    echo "   Ejecuta: grep -rn '/ 1e9\|/ 1e6' src/js/ | grep -v TOKEN_CONFIG"
fi

echo ""
echo "3️⃣  Verificando uso correcto de TOKEN_CONFIG..."

# Contar usos correctos de TOKEN_CONFIG
CORRECT_USAGE=$(grep -r "TOKEN_CONFIG.VIBES_DECIMALS\|TOKEN_CONFIG.USDC_DECIMALS\|TOKEN_CONFIG.SOL_DECIMALS" src/js/ | wc -l | tr -d ' ')

if [ "$CORRECT_USAGE" -gt "20" ]; then
    report_success "TOKEN_CONFIG usado correctamente en $CORRECT_USAGE lugares"
else
    report_warning "TOKEN_CONFIG usado solo en $CORRECT_USAGE lugares (esperado >20)"
fi

echo ""
echo "4️⃣  Verificando conversiones en index.html..."

# Verificar que index.html también use los decimales correctos
HARDCODED_HTML=$(grep -n "/ 1e9\|/ 1e6\|* 1e9\|* 1e6" index.html 2>/dev/null | grep -v "vibesDecimals\|solDecimals\|usdcDecimals\|TOKEN_CONFIG" | wc -l | tr -d ' ')

if [ "$HARDCODED_HTML" -eq "0" ]; then
    report_success "No se encontraron conversiones hardcodeadas en index.html"
else
    report_error "Se encontraron $HARDCODED_HTML conversiones hardcodeadas en index.html"
    echo "   Ejecuta: grep -n '/ 1e9\|/ 1e6' index.html | grep -v 'Decimals'"
fi

echo ""
echo "5️⃣  Verificando configuración de red..."

if grep -q "NETWORK: 'mainnet-beta'" src/js/config.js; then
    report_success "Red configurada correctamente (mainnet-beta)"
else
    report_error "Red NO configurada a mainnet-beta en src/js/config.js"
fi

if grep -q "mainnet.helius-rpc.com" src/js/config.js; then
    report_success "RPC URL apunta a mainnet"
else
    report_error "RPC URL no apunta a mainnet en src/js/config.js"
fi

echo ""
echo "6️⃣  Verificando token mints..."

if grep -q "G5n3KqfKZB4qeJAQA3k5dKbj7X264oCjV1vXMnBpwL43" src/js/config.js; then
    report_success "VIBES mint correcto (mainnet)"
else
    report_error "VIBES mint incorrecto en src/js/config.js"
fi

if grep -q "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" src/js/config.js; then
    report_success "USDC mint correcto (mainnet oficial)"
else
    report_error "USDC mint incorrecto en src/js/config.js"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMEN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ ¡PERFECTO! Todos los decimales están configurados correctamente${NC}"
    echo ""
    echo "✓ TOKEN_CONFIG usando decimales correctos"
    echo "✓ No hay conversiones hardcodeadas"
    echo "✓ Red configurada a mainnet"
    echo "✓ Token mints correctos"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Se encontraron $ERRORS errores${NC}"
    echo ""
    echo "Por favor, corrige los errores antes de deployar a producción."
    echo ""
    exit 1
fi


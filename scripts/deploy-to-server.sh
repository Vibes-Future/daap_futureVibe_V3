#!/bin/bash

#############################################
# 🚀 Script de Deployment Automatizado
# Para: app.futurevibes.io
# Servidor: server17225.za-internet.net
#############################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/Vibes-Future/daap_futureVibe_V3.git"
SERVER_USER="ftadmin"
SERVER_HOST="server17225.za-internet.net"
SERVER_PATH="/var/www/clients/client0/web8/web"
TEMP_DIR="daap_temp"
HTTP_PORT="3001"

#############################################
# Helper Functions
#############################################

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

#############################################
# Main Deployment Function
#############################################

deploy() {
    print_header "🚀 INICIANDO DEPLOYMENT A PRODUCCIÓN"
    
    # Check if we're on the correct branch
    print_info "Verificando branch actual..."
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$CURRENT_BRANCH" != "main" ]; then
        print_warning "No estás en la rama 'main'. Rama actual: $CURRENT_BRANCH"
        read -p "¿Continuar de todos modos? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Deployment cancelado"
            exit 1
        fi
    fi
    
    # Show last commit
    print_info "Último commit local:"
    git log --oneline -1
    echo
    
    # Confirm deployment
    print_warning "Esto hará deployment a: https://app.futurevibes.io"
    read -p "¿Continuar? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Deployment cancelado"
        exit 1
    fi
    
    print_header "📦 SUBIENDO CAMBIOS A GITHUB"
    
    # Make sure latest changes are pushed
    print_info "Verificando que cambios estén en GitHub..."
    git fetch origin main
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u})
    
    if [ $LOCAL != $REMOTE ]; then
        print_warning "Tu rama local está desactualizada o tiene commits sin push"
        print_info "Ejecutando git push..."
        git push origin main
        print_success "Cambios subidos a GitHub"
    else
        print_success "GitHub está actualizado"
    fi
    
    print_header "🔗 CONECTANDO AL SERVIDOR"
    
    # Create deployment command
    DEPLOY_CMD="cd ~ && \
    echo '📥 Clonando repositorio...' && \
    git clone $REPO_URL $TEMP_DIR 2>/dev/null || (cd $TEMP_DIR && git pull origin main) && \
    echo '✅ Repositorio clonado' && \
    echo '📋 Último commit:' && \
    cd $TEMP_DIR && git log --oneline -1 && \
    echo '📂 Copiando archivos a producción...' && \
    sudo rsync -av --delete --exclude='.git' --exclude='node_modules' --exclude='.env' ~/$TEMP_DIR/ $SERVER_PATH/ && \
    echo '✅ Archivos copiados' && \
    echo '🔄 Reiniciando servicio HTTP...' && \
    sudo pkill -f 'http-server.*$HTTP_PORT' || true && \
    sleep 2 && \
    cd $SERVER_PATH && \
    sudo nohup npx http-server . -p $HTTP_PORT -c-1 --cors > /tmp/http-server-$HTTP_PORT.log 2>&1 & \
    sleep 3 && \
    echo '🔍 Verificando servicio...' && \
    ps aux | grep http-server | grep $HTTP_PORT | grep -v grep && \
    curl -I http://localhost:$HTTP_PORT/ | head -5 && \
    echo '🧹 Limpiando archivos temporales...' && \
    rm -rf ~/$TEMP_DIR && \
    echo '🎉 Deployment completado!'"
    
    # Execute deployment on server
    print_info "Ejecutando deployment en servidor..."
    ssh -t $SERVER_USER@$SERVER_HOST "$DEPLOY_CMD"
    
    if [ $? -eq 0 ]; then
        print_header "✨ DEPLOYMENT EXITOSO"
        print_success "La aplicación ha sido actualizada"
        print_info "Verificar en: https://app.futurevibes.io"
        echo
        print_info "Pasos de verificación recomendados:"
        echo "  1. Abrir https://app.futurevibes.io en el navegador"
        echo "  2. Limpiar caché (Ctrl+F5 o Cmd+Shift+R)"
        echo "  3. Verificar que la página carga correctamente"
        echo "  4. Probar conectar wallet"
        echo "  5. Verificar que rewards se muestran (no en 0)"
        echo "  6. Verificar que los iconos aparecen"
        echo "  7. Abrir consola del navegador (F12) y verificar sin errores"
    else
        print_error "Deployment falló"
        print_warning "Revisar logs en /tmp/http-server-$HTTP_PORT.log en el servidor"
        exit 1
    fi
}

#############################################
# Rollback Function
#############################################

rollback() {
    print_header "⏮️  ROLLBACK A COMMIT ANTERIOR"
    
    # Get commit hash
    if [ -z "$1" ]; then
        print_error "Debe proporcionar el hash del commit"
        print_info "Uso: $0 rollback <commit-hash>"
        print_info "Ejemplo: $0 rollback c8c5b76"
        exit 1
    fi
    
    COMMIT_HASH=$1
    
    print_warning "Esto hará rollback a commit: $COMMIT_HASH"
    read -p "¿Continuar? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Rollback cancelado"
        exit 1
    fi
    
    # Create rollback command
    ROLLBACK_CMD="cd ~ && \
    echo '📥 Clonando repositorio...' && \
    git clone $REPO_URL daap_rollback && \
    cd daap_rollback && \
    echo '⏮️  Haciendo checkout a commit $COMMIT_HASH...' && \
    git checkout $COMMIT_HASH && \
    echo '📂 Copiando archivos...' && \
    sudo rsync -av --delete --exclude='.git' --exclude='node_modules' --exclude='.env' ~/daap_rollback/ $SERVER_PATH/ && \
    echo '🔄 Reiniciando servicio...' && \
    sudo pkill -f 'http-server.*$HTTP_PORT' || true && \
    sleep 2 && \
    cd $SERVER_PATH && \
    sudo nohup npx http-server . -p $HTTP_PORT -c-1 --cors > /tmp/http-server-$HTTP_PORT.log 2>&1 & \
    sleep 3 && \
    ps aux | grep http-server | grep $HTTP_PORT | grep -v grep && \
    curl -I http://localhost:$HTTP_PORT/ && \
    rm -rf ~/daap_rollback && \
    echo '✅ Rollback completado!'"
    
    print_info "Ejecutando rollback en servidor..."
    ssh -t $SERVER_USER@$SERVER_HOST "$ROLLBACK_CMD"
    
    if [ $? -eq 0 ]; then
        print_success "Rollback exitoso a commit $COMMIT_HASH"
        print_info "Verificar en: https://app.futurevibes.io"
    else
        print_error "Rollback falló"
        exit 1
    fi
}

#############################################
# Status Function
#############################################

status() {
    print_header "📊 ESTADO DEL SERVIDOR"
    
    STATUS_CMD="echo '🔍 Proceso HTTP:' && \
    ps aux | grep http-server | grep $HTTP_PORT | grep -v grep && \
    echo && \
    echo '🌐 Test de conectividad:' && \
    curl -I http://localhost:$HTTP_PORT/ | head -5 && \
    echo && \
    echo '📂 Último archivo modificado:' && \
    sudo ls -lht $SERVER_PATH | head -5 && \
    echo && \
    echo '📝 Últimas líneas del log:' && \
    tail -10 /tmp/http-server-$HTTP_PORT.log"
    
    ssh -t $SERVER_USER@$SERVER_HOST "$STATUS_CMD"
}

#############################################
# Logs Function
#############################################

logs() {
    print_header "📝 LOGS DEL SERVIDOR"
    print_info "Mostrando logs en tiempo real (Ctrl+C para salir)..."
    echo
    
    ssh -t $SERVER_USER@$SERVER_HOST "tail -f /tmp/http-server-$HTTP_PORT.log"
}

#############################################
# Help Function
#############################################

show_help() {
    echo "🚀 Script de Deployment para app.futurevibes.io"
    echo
    echo "Uso:"
    echo "  $0 [comando]"
    echo
    echo "Comandos:"
    echo "  deploy              Hacer deployment a producción"
    echo "  rollback <commit>   Hacer rollback a un commit específico"
    echo "  status              Ver estado del servidor"
    echo "  logs                Ver logs en tiempo real"
    echo "  help                Mostrar esta ayuda"
    echo
    echo "Ejemplos:"
    echo "  $0 deploy"
    echo "  $0 rollback c8c5b76"
    echo "  $0 status"
    echo "  $0 logs"
    echo
}

#############################################
# Main Script Logic
#############################################

case "${1:-deploy}" in
    deploy)
        deploy
        ;;
    rollback)
        rollback "$2"
        ;;
    status)
        status
        ;;
    logs)
        logs
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Comando desconocido: $1"
        show_help
        exit 1
        ;;
esac


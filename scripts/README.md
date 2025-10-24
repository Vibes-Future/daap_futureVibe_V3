# 📁 Scripts de Utilidad

Colección de scripts útiles para el proyecto VIBES DeFi DApp.

---

## 🚀 deploy-to-server.sh

Script automatizado para deployment a producción en el servidor.

### Uso

```bash
# Deployment normal
./scripts/deploy-to-server.sh deploy

# Ver estado del servidor
./scripts/deploy-to-server.sh status

# Ver logs en tiempo real
./scripts/deploy-to-server.sh logs

# Rollback a commit anterior
./scripts/deploy-to-server.sh rollback <commit-hash>

# Ver ayuda
./scripts/deploy-to-server.sh help
```

### Ejemplos

```bash
# Deploy la versión actual
./scripts/deploy-to-server.sh deploy

# Hacer rollback
./scripts/deploy-to-server.sh rollback c8c5b76

# Ver qué está pasando en el servidor
./scripts/deploy-to-server.sh status
```

### Requisitos

- Acceso SSH al servidor (ftadmin@server17225.za-internet.net)
- Password de ftadmin configurado
- Git instalado localmente
- Conexión a internet

### ¿Qué hace?

1. ✅ Verifica que estás en la rama `main`
2. ✅ Muestra el último commit
3. ✅ Pide confirmación
4. ✅ Verifica que GitHub está actualizado
5. ✅ Se conecta al servidor vía SSH
6. ✅ Clona el repositorio actualizado
7. ✅ Copia archivos a producción (excluyendo .git, node_modules, .env)
8. ✅ Reinicia el servicio HTTP en puerto 3001
9. ✅ Verifica que todo funciona
10. ✅ Limpia archivos temporales

**Tiempo estimado:** ~1 minuto

---

## 🔒 verify_security.sh

Script para verificar seguridad del código antes de deployment.

### Uso

```bash
./scripts/verify_security.sh
```

### ¿Qué verifica?

- ✅ No hay API keys hardcodeadas
- ✅ No hay private keys en el código
- ✅ Archivo .env existe y está en .gitignore
- ✅ No hay console.log con información sensible
- ✅ Archivos de seguridad están presentes

---

## 📖 Documentación Completa

Para más detalles sobre el proceso de deployment, ver:

- **[SERVER_DEPLOYMENT_GUIDE.md](../docs/SERVER_DEPLOYMENT_GUIDE.md)** - Guía completa paso a paso
- **[SECURITY_BEST_PRACTICES.md](../docs/SECURITY_BEST_PRACTICES.md)** - Mejores prácticas de seguridad

---

## 🆘 Troubleshooting

### Error: "Permission denied (publickey)"

**Solución:** Verifica que tienes acceso SSH al servidor:
```bash
ssh ftadmin@server17225.za-internet.net
```

### Error: "Port 3001 already in use"

**Solución:** El script automáticamente mata procesos en puerto 3001. Si persiste:
```bash
ssh ftadmin@server17225.za-internet.net
sudo pkill -f "http-server.*3001"
```

### Script falla en "git push"

**Solución:** Haz push manualmente antes de ejecutar el script:
```bash
git push origin main
./scripts/deploy-to-server.sh deploy
```

---

## 💡 Tips

1. **Antes de hacer deployment:** Siempre prueba localmente primero
2. **Horario recomendado:** Fuera de horas pico (fines de semana, madrugada)
3. **Verificación post-deployment:** Siempre verificar en https://app.futurevibes.io
4. **Mantén logs:** El script muestra toda la información importante
5. **Rollback disponible:** Si algo sale mal, puedes hacer rollback rápidamente

---

**Última actualización:** 25 de Octubre, 2025


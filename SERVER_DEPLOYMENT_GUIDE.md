# 🚀 Guía de Deployment en Servidor de Producción

**Servidor:** server17225.za-internet.net  
**Dominio:** https://app.futurevibes.io  
**Usuario:** ftadmin  
**Última actualización:** 25 de Octubre, 2025

---

## 📋 Información del Servidor

### Arquitectura

```
┌─────────────────────────────────────────────────────┐
│  Apache (Puerto 80/443)                             │
│  ├─ app.futurevibes.io → Proxy → localhost:3001    │
│  └─ futurevibes.io     → Proxy → localhost:3000    │
└─────────────────────────────────────────────────────┘
         ↓                              ↓
    [DApp - Puerto 3001]      [Web - Puerto 3000]
    http-server                Next.js (NO TOCAR!)
```

### Detalles Técnicos

| Componente | Valor |
|------------|-------|
| **Servidor** | Debian 6.1.0-33-amd64 |
| **Web Server** | Apache 2.4 + Nginx |
| **DApp Directory** | `/var/www/clients/client0/web8/web/` |
| **DApp Port** | 3001 (http-server) |
| **Otra App Port** | 3000 (Next.js - NO TOCAR) |
| **Apache Config** | `/etc/apache2/sites-available/app.futurevibes.io.vhost` |
| **Owner** | web8:client0 (algunos archivos root) |

---

## 🔐 Acceso al Servidor

### SSH Login

```bash
ssh ftadmin@server17225.za-internet.net
# Password: [pedir al admin]
```

### Sudo Password

Para comandos con `sudo`, usar la misma password de ftadmin.

---

## ⚡ Deployment Rápido (Método Recomendado)

### Comando One-Liner usando Systemd Service

```bash
cd ~ && \
git clone https://github.com/Vibes-Future/daap_futureVibe_V3.git daap_temp && \
sudo rsync -av --delete --exclude='.git' --exclude='node_modules' --exclude='.env' ~/daap_temp/ /var/www/clients/client0/web8/web/ && \
sudo systemctl restart vibes-dapp && \
sleep 3 && \
sudo systemctl status vibes-dapp && \
curl -I http://localhost:3001/ && \
rm -rf ~/daap_temp && \
echo "🎉 Deployment completado! Visita: https://app.futurevibes.io"
```

**Tiempo estimado:** ~30 segundos

**Nota:** El DApp ahora corre como servicio systemd (`vibes-dapp.service`) que se reinicia automáticamente y arranca con el servidor.

---

## 📝 Deployment Paso a Paso (Método Detallado)

### Paso 1: Conectar al Servidor

```bash
ssh ftadmin@server17225.za-internet.net
```

### Paso 2: Clonar Repositorio Actualizado

```bash
# Ir al home
cd ~

# Clonar repo en carpeta temporal
git clone https://github.com/Vibes-Future/daap_futureVibe_V3.git daap_temp

# Verificar el último commit
cd daap_temp
git log --oneline -5
```

**Salida esperada:**
```
b1d187c Fix: Rewards calculation and UI improvements
c8c5b76 feat: disable stake tokens section
...
```

### Paso 3: Actualizar Archivos en Producción

```bash
# Copiar archivos actualizados (excluyendo .git, node_modules, .env)
sudo rsync -av --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.env' \
  ~/daap_temp/ \
  /var/www/clients/client0/web8/web/
```

**¿Qué hace rsync?**
- `-a`: modo archivo (preserva permisos, timestamps)
- `-v`: verbose (muestra progreso)
- `--delete`: elimina archivos que ya no existen en origen
- `--exclude`: excluye carpetas que no necesitamos

### Paso 4: Verificar Archivos Actualizados

```bash
# Ver fecha del index.html
sudo ls -lh /var/www/clients/client0/web8/web/index.html

# Verificar que tiene los cambios nuevos
sudo grep -i "rewards\|lucide" /var/www/clients/client0/web8/web/index.html | head -5
```

### Paso 5: Reiniciar Servicio HTTP

```bash
# Reiniciar el servicio systemd
sudo systemctl restart vibes-dapp
```

**El servicio `vibes-dapp` gestiona automáticamente:**
- ✅ Servir directorio `/var/www/clients/client0/web8/web/`
- ✅ Puerto 3001
- ✅ Sin caché (`-c-1`)
- ✅ CORS habilitado (`--cors`)
- ✅ Se reinicia automáticamente si falla
- ✅ Arranca al iniciar el servidor
- ✅ Logs centralizados en systemd journal

### Paso 6: Verificar que Funciona

```bash
# Esperar 3 segundos a que arranque
sleep 3

# Ver estado del servicio
sudo systemctl status vibes-dapp

# Ver procesos http-server en puerto 3001
ps aux | grep http-server | grep 3001

# Verificar que responde
curl -I http://localhost:3001/
```

**Salida esperada:**
```
● vibes-dapp.service - VIBES DApp HTTP Server (Port 3001)
   Active: active (running)
   
HTTP/1.1 200 OK
access-control-allow-origin: *
content-type: text/html; charset=UTF-8
```

### Paso 7: Limpiar

```bash
# Eliminar carpeta temporal
cd ~
rm -rf daap_temp

echo "✅ Deployment completado!"
```

### Paso 8: Verificar en el Navegador

Abrir en el navegador:
```
https://app.futurevibes.io
```

Verificar:
- ✅ Página carga correctamente
- ✅ Wallet connection funciona
- ✅ Los rewards se muestran correctamente (no en 0)
- ✅ Lucide icons aparecen
- ✅ No hay errores en consola (F12)

---

## 🔍 Comandos Útiles de Diagnóstico

### Gestión del Servicio Systemd

```bash
# Ver estado actual del servicio
sudo systemctl status vibes-dapp

# Iniciar servicio
sudo systemctl start vibes-dapp

# Detener servicio
sudo systemctl stop vibes-dapp

# Reiniciar servicio
sudo systemctl restart vibes-dapp

# Habilitar arranque automático (ya está habilitado)
sudo systemctl enable vibes-dapp

# Deshabilitar arranque automático
sudo systemctl disable vibes-dapp
```

### Ver Logs en Tiempo Real

```bash
# Logs del servicio systemd (RECOMENDADO)
sudo journalctl -u vibes-dapp -f

# Ver últimas 50 líneas de logs
sudo journalctl -u vibes-dapp -n 50

# Ver logs de todo el día
sudo journalctl -u vibes-dapp --since today
```

### Ver Procesos Activos

```bash
# Ver todos los http-server
ps aux | grep http-server

# Ver específicamente puerto 3001
ps aux | grep http-server | grep 3001

# Ver todos los puertos en uso
sudo netstat -tulpn | grep LISTEN

# Ver específicamente puerto 3001
sudo lsof -i :3001
```

### Ver Configuración de Apache

```bash
# Ver config de app.futurevibes.io
sudo cat /etc/apache2/sites-available/app.futurevibes.io.vhost

# Ver sitios habilitados
sudo ls -la /etc/apache2/sites-enabled/
```

### Reiniciar Apache (si necesario)

```bash
sudo systemctl restart apache2
sudo systemctl status apache2
```

### Ver Archivos en Producción

```bash
# Listar archivos
sudo ls -la /var/www/clients/client0/web8/web/

# Ver último commit (si es repo git)
cd /var/www/clients/client0/web8/web/
sudo git log --oneline -5
```

---

## 🆘 Troubleshooting

### Problema 1: Puerto 3001 ya está en uso

**Síntoma:** Error al reiniciar http-server

**Solución:**
```bash
# Ver qué proceso usa el puerto
sudo lsof -i :3001

# Matar proceso específico
sudo kill -9 <PID>

# O matar todos los http-server en 3001
sudo pkill -f "http-server.*3001"
```

### Problema 2: Sitio muestra versión vieja

**Síntoma:** Los cambios no se ven en el navegador

**Solución:**
```bash
# 1. Limpiar caché del navegador (Ctrl+F5)

# 2. Verificar que los archivos se actualizaron
sudo ls -lh /var/www/clients/client0/web8/web/index.html

# 3. Verificar última modificación en la respuesta HTTP
curl -I http://localhost:3001/ | grep -i "last-modified"

# 4. Reiniciar http-server
sudo pkill -f "http-server.*3001"
cd /var/www/clients/client0/web8/web/
sudo nohup npx http-server . -p 3001 -c-1 --cors > /tmp/http-server-3001.log 2>&1 &
```

### Problema 3: 502 Bad Gateway

**Síntoma:** Apache muestra error 502

**Solución:**
```bash
# 1. Verificar que http-server está corriendo
ps aux | grep http-server | grep 3001

# 2. Si no está corriendo, reiniciar
cd /var/www/clients/client0/web8/web/
sudo nohup npx http-server . -p 3001 -c-1 --cors > /tmp/http-server-3001.log 2>&1 &

# 3. Ver logs de Apache
sudo tail -f /var/log/ispconfig/httpd/app.futurevibes.io/error.log

# 4. Reiniciar Apache si es necesario
sudo systemctl restart apache2
```

### Problema 4: Permisos Denegados

**Síntoma:** Permission denied al copiar archivos

**Solución:**
```bash
# Usar sudo para operaciones en /var/www
sudo rsync -av ...

# Verificar permisos
sudo ls -la /var/www/clients/client0/web8/web/

# Cambiar owner si es necesario (generalmente NO requerido)
# sudo chown -R web8:client0 /var/www/clients/client0/web8/web/
```

### Problema 5: Otra App (futurevibes-web) se cayó

**⚠️ IMPORTANTE:** NO TOCAR el puerto 3000

**Verificar:**
```bash
# Ver si está corriendo
ps aux | grep next-server
sudo netstat -tulpn | grep 3000

# Si se cayó, contactar al responsable de futurevibes-web
# NO reiniciar sin conocer el comando correcto
```

---

## 📊 Checklist de Deployment

Usa este checklist para cada deployment:

- [ ] 1. Conectado al servidor via SSH
- [ ] 2. Clonar repo actualizado en ~/daap_temp
- [ ] 3. Verificar último commit con `git log`
- [ ] 4. Copiar archivos con rsync (excluir .git, node_modules, .env)
- [ ] 5. Verificar archivos actualizados
- [ ] 6. Matar proceso http-server en puerto 3001
- [ ] 7. Reiniciar http-server en background
- [ ] 8. Verificar proceso corriendo
- [ ] 9. Hacer curl a localhost:3001
- [ ] 10. Limpiar carpeta temporal
- [ ] 11. Verificar en navegador: https://app.futurevibes.io
- [ ] 12. Verificar que rewards se muestran correctamente
- [ ] 13. Verificar que iconos cargan
- [ ] 14. Verificar consola sin errores (F12)
- [ ] 15. Probar conectar wallet
- [ ] 16. Cerrar SSH

---

## 🚨 Notas Importantes

### ⚠️ NO TOCAR

- **Puerto 3000:** Usado por futurevibes-web (otra aplicación)
- **Directorio ~/futurevibes-web:** Otra aplicación en producción
- **Archivo .env:** Contiene claves API sensibles (nunca sobrescribir)

### ✅ Buenas Prácticas

1. **Siempre hacer deployment fuera de horas pico** (preferible fines de semana)
2. **Verificar en staging antes** (si existe ambiente de staging)
3. **Mantener logs de cada deployment** (fecha, commit, cambios)
4. **Probar todas las funciones críticas** después del deployment
5. **Tener plan de rollback** (en caso de problemas)

### 🔄 Rollback (si algo sale mal)

Si necesitas volver a la versión anterior:

```bash
# 1. Clonar commit anterior
cd ~
git clone https://github.com/Vibes-Future/daap_futureVibe_V3.git daap_rollback
cd daap_rollback
git checkout <COMMIT_ANTERIOR>

# 2. Copiar archivos
sudo rsync -av --delete --exclude='.git' --exclude='node_modules' --exclude='.env' ~/daap_rollback/ /var/www/clients/client0/web8/web/

# 3. Reiniciar
sudo pkill -f "http-server.*3001"
cd /var/www/clients/client0/web8/web/
sudo nohup npx http-server . -p 3001 -c-1 --cors > /tmp/http-server-3001.log 2>&1 &

# 4. Verificar
sleep 3
curl -I http://localhost:3001/

# 5. Limpiar
rm -rf ~/daap_rollback
```

---

## 📞 Contactos de Emergencia

Si hay problemas graves:

1. **Desarrollador Principal:** [Tu Email]
2. **Admin del Servidor:** ftadmin@server17225
3. **Proveedor Hosting:** za-internet.net

---

## 📚 Recursos Adicionales

- **Repositorio GitHub:** https://github.com/Vibes-Future/daap_futureVibe_V3
- **Documentación del Proyecto:** `/docs/` en el repo
- **Apache Docs:** https://httpd.apache.org/docs/2.4/
- **http-server Docs:** https://www.npmjs.com/package/http-server

---

## 📝 Historial de Deployments

| Fecha | Commit | Cambios Principales | Deployado Por |
|-------|--------|---------------------|---------------|
| 2025-10-25 | b1d187c | Fix rewards calculation, Lucide icons local | ftadmin |
| 2025-10-15 | c8c5b76 | Disable stake tokens section | ftadmin |
| 2025-10-13 | 8b0f8cb | Mainnet update & security fixes | ftadmin |

**Nota:** Actualizar esta tabla después de cada deployment.

---

**Versión de este documento:** 1.0  
**Última actualización:** 25 de Octubre, 2025  
**Mantenedor:** Equipo VIBES DeFi



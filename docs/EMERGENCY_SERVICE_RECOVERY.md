# 🚨 Emergency Service Recovery Guide

**Issue:** DApp returns 503 Service Unavailable  
**Root Cause:** http-server process stopped running on port 3001  
**Solution Time:** ~2 minutes

---

## Quick Diagnosis

### 1. Check if service is running:

```bash
sudo systemctl status vibes-dapp
```

**Expected:** `Active: active (running)`  
**Problem:** `Active: failed` or `inactive (dead)`

---

## Quick Fix (Restart Service)

### If service exists (most common):

```bash
# Restart the systemd service
sudo systemctl restart vibes-dapp

# Verify it's running
sudo systemctl status vibes-dapp

# Test connectivity
curl -I http://localhost:3001/
```

**Expected output:**
```
● vibes-dapp.service - VIBES DApp HTTP Server (Port 3001)
   Active: active (running)

HTTP/1.1 200 OK
```

✅ **Done!** Visit https://app.futurevibes.io to confirm.

---

## If Service Doesn't Exist

The systemd service needs to be created. Follow these steps:

### Step 1: Create startup script

```bash
nano ~/start-http-server.sh
```

Paste this content:

```bash
#!/bin/bash

# Load NVM (note: /hom/ not /home/ - specific to this server)
export NVM_DIR="/hom/ftadmin/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Change to app directory
cd /var/www/clients/client0/web8/web

# Start http-server
exec npx http-server . -p 3001 -c-1 --cors
```

Save: `Ctrl+X`, `Y`, `Enter`

Make executable:
```bash
chmod +x ~/start-http-server.sh
```

### Step 2: Test the script

```bash
~/start-http-server.sh
```

If it starts successfully, press `Ctrl+C` after 5 seconds.

### Step 3: Create systemd service

```bash
sudo nano /etc/systemd/system/vibes-dapp.service
```

Paste this content:

```ini
[Unit]
Description=VIBES DApp HTTP Server (Port 3001)
After=network.target

[Service]
Type=simple
User=ftadmin
Group=ftadmin
ExecStart=/hom/ftadmin/start-http-server.sh
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=vibes-dapp

[Install]
WantedBy=multi-user.target
```

Save: `Ctrl+X`, `Y`, `Enter`

### Step 4: Enable and start service

```bash
sudo systemctl daemon-reload
sudo systemctl enable vibes-dapp
sudo systemctl start vibes-dapp
```

### Step 5: Verify

```bash
sudo systemctl status vibes-dapp
ps aux | grep http-server | grep 3001
curl -I http://localhost:3001/
```

✅ **Done!** The service is now running and will auto-restart if it fails.

---

## Troubleshooting

### Port 3001 already in use

```bash
# Check what's using the port
sudo lsof -i :3001

# Kill zombie processes
sudo pkill -9 -f "http-server.*3001"

# Restart service
sudo systemctl restart vibes-dapp
```

### Service fails to start

```bash
# View detailed logs
sudo journalctl -u vibes-dapp -n 50

# Common issues:
# 1. Script not executable: chmod +x ~/start-http-server.sh
# 2. NVM path wrong: verify with "which npx" (should show /hom/ftadmin/.nvm/...)
# 3. Permissions: verify with "ls -la ~/start-http-server.sh"
```

### Apache still shows 503

```bash
# Check Apache logs
sudo tail -50 /var/log/ispconfig/httpd/app.futurevibes.io/error.log

# Restart Apache (rarely needed)
sudo systemctl restart apache2
```

---

## Useful Commands

```bash
# Service management
sudo systemctl status vibes-dapp      # Check status
sudo systemctl start vibes-dapp       # Start service
sudo systemctl stop vibes-dapp        # Stop service
sudo systemctl restart vibes-dapp     # Restart service

# View logs
sudo journalctl -u vibes-dapp -f      # Follow logs in real-time
sudo journalctl -u vibes-dapp -n 50   # Last 50 log lines

# Check processes and ports
ps aux | grep http-server | grep 3001
sudo lsof -i :3001
sudo netstat -tulpn | grep 3001
```

---

## Prevention

The systemd service is configured to:
- ✅ Auto-start on server boot
- ✅ Auto-restart if it crashes (every 10 seconds)
- ✅ Run independently of SSH sessions

**This issue should not happen again** unless:
1. The server is rebooted (service will auto-start)
2. The service is manually stopped
3. The script or service files are deleted/corrupted

---

## Contact

If the issue persists after following this guide:
1. Check server logs: `sudo journalctl -u vibes-dapp -n 100`
2. Contact server admin: ftadmin@server17225.za-internet.net
3. Review full deployment guide: `/docs/SERVER_DEPLOYMENT_GUIDE.md`

---

**Last Updated:** October 27, 2025  
**Maintainer:** VIBES DeFi Team


# ⚡ Quick Fix: 503 Service Unavailable

## Problem
Website shows: **503 Service Unavailable**

## Cause
HTTP server on port 3001 is not running

## Solution (30 seconds)

```bash
# Connect to server
ssh ftadmin@server17225.za-internet.net

# Restart service
sudo systemctl restart vibes-dapp

# Verify (should show "active (running)")
sudo systemctl status vibes-dapp

# Test
curl -I http://localhost:3001/
```

✅ **Fixed!** Visit https://app.futurevibes.io

---

## If service doesn't exist

See full guide: [EMERGENCY_SERVICE_RECOVERY.md](./EMERGENCY_SERVICE_RECOVERY.md)

---

## Key Commands

| Command | Purpose |
|---------|---------|
| `sudo systemctl status vibes-dapp` | Check status |
| `sudo systemctl restart vibes-dapp` | Restart service |
| `sudo journalctl -u vibes-dapp -f` | View logs |
| `ps aux \| grep http-server` | Check processes |
| `sudo lsof -i :3001` | Check port usage |

---

**The service auto-restarts every 10 seconds if it fails.**  
**This issue should be rare.**


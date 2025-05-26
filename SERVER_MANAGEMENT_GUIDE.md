# 🚀 Shula Equipment Rental - Server Management Guide

## 📋 Overview

Your Shula Equipment Rental app is deployed across three services:
- **🎨 Frontend**: Vercel (React App)
- **⚙️ Backend**: Railway (Node.js API)
- **🗄️ Database**: MongoDB Atlas (Always-on)

## 🔗 Current Deployment URLs

- **Frontend**: https://shula-webapp-dppi61gn7-tymoribrahims-projects.vercel.app
- **Backend**: https://shula-rent-project-production.up.railway.app
- **Database**: MongoDB Atlas (managed service)

---

## 🛑 How to SHUTDOWN/PAUSE Servers

### 1. Railway Backend (Node.js API)

#### ⚠️ Important Note: Railway CLI Limitations
Railway CLI doesn't support direct service pause/resume commands. Use the web dashboard for precise control.

#### Option A: Use Railway Dashboard (Recommended)
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click on your "Shula-Rent-Project" project
3. Click on your service (Shula-Rent-Project)
4. Go to **Settings** tab
5. Scroll down to **Sleep Mode**
6. Toggle **Enable Sleep Mode** to pause the service

#### Option B: Let Railway Auto-Sleep (Easiest)
Railway automatically puts services to sleep after **30 minutes** of inactivity. This means:
- ✅ No manual action needed
- ✅ Automatic cost savings
- ✅ Service wakes up on next request
- 💰 Zero execution hours used while sleeping

#### Option C: Helper Script
```bash
# Run the pause helper script for instructions
./scripts/pause-servers.sh
```

### 2. Vercel Frontend (React App)

**Note**: Vercel doesn't charge for hosting static sites, so you typically don't need to shut it down.

#### If you want to temporarily disable it:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your "shula-webapp" project
3. Go to **Settings** → **Domains**
4. Remove custom domains (if any) to make it inaccessible
5. Or delete the deployment entirely

### 3. MongoDB Atlas Database

**⚠️ WARNING**: Don't shutdown MongoDB Atlas unless you want to lose data!

#### To pause (for development only):
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to your cluster "ShulaCluster"
3. Click **...** → **Pause Cluster**
4. **⚠️ This will make your data temporarily inaccessible**

---

## ✅ How to START/RESUME Servers

### 1. Railway Backend

#### Option A: Auto-Wake (Easiest)
Simply visit your backend URL and Railway will automatically wake up the service:
- Visit: https://shula-rent-project-production.up.railway.app
- Service wakes up automatically in 30-60 seconds

#### Option B: Use Helper Script (Recommended)
```bash
# Automatically checks status and wakes up if needed
./scripts/resume-servers.sh
```

#### Option C: Manual Redeploy via CLI
```bash
cd /Users/tymoribrahim/Desktop/ShulaWebApp2/backend
railway redeploy
```

#### Option D: Resume via Dashboard
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click on "Shula-Rent-Project"
3. If sleeping, click **Deploy** or disable **Sleep Mode**
4. Wait 30-60 seconds for the service to start

### 2. Vercel Frontend

#### If you removed it:
```bash
# Navigate to frontend directory
cd /Users/tymoribrahim/Desktop/ShulaWebApp2/frontend

# Redeploy
npx vercel --prod --yes
```

#### If it's still deployed:
- It should be automatically available (Vercel is always-on for static sites)

### 3. MongoDB Atlas Database

#### To resume:
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to your cluster
3. Click **Resume** if paused
4. Wait 2-5 minutes for full startup

---

## 📊 How to CHECK STATUS

### Quick Status Check (Recommended)
```bash
# Comprehensive status check with cost information
./scripts/check-status.sh
```

### Manual Railway Backend Status
```bash
# Check service information
railway status

# View logs (to see if it's running)
railway logs

# Or check via dashboard at:
# https://railway.app/dashboard
```

### Vercel Frontend Status
```bash
# Check deployments
npx vercel ls

# Or visit: https://vercel.com/dashboard
```

### MongoDB Atlas Status
- Visit: https://cloud.mongodb.com/
- Check cluster status (Running/Paused)

### Quick Health Check
```bash
# Test backend API
curl https://shula-rent-project-production.up.railway.app/

# Test frontend (should return HTML)
curl -I https://shula-webapp-dppi61gn7-tymoribrahims-projects.vercel.app/
```

---

## 💰 Cost Management Tips

### Railway Backend
- **Free Tier**: 500 hours/month execution time
- **Auto-Sleep**: Automatically pauses after 30min inactivity ⭐
- **Manual Control**: Use dashboard for precise sleep control
- **Cost**: $0/month (within free tier limits)

### Vercel Frontend
- **Free Tier**: Unlimited static hosting
- **No need to shutdown** (it's free)
- **Cost**: $0/month forever

### MongoDB Atlas
- **Free Tier**: M0 cluster (512MB storage)
- **Always-on recommended** for data persistence
- **Cost**: $0/month forever

---

## 🔄 Complete Start/Stop Workflow

### 🛑 When Done Working (Easiest Approach)
```bash
# Just let Railway auto-sleep! No action needed.
# Service will sleep after 30min of inactivity.

# Or check status and get manual pause instructions:
./scripts/pause-servers.sh
```

### ✅ When Starting Work (Startup)
```bash
# Check current status
./scripts/check-status.sh

# Wake up services if needed
./scripts/resume-servers.sh

# Your app will be ready in 30-60 seconds!
```

---

## 🎯 Demo/Presentation Mode

### Before Showing Your Work:
```bash
# Ensure everything is running
./scripts/resume-servers.sh

# Wait for green checkmarks ✅
```

### URLs to share:
- **Frontend**: https://shula-webapp-dppi61gn7-tymoribrahims-projects.vercel.app
- **Backend API**: https://shula-rent-project-production.up.railway.app

### After Demo:
- **No action needed!** Railway will auto-sleep after 30min of inactivity

---

## 🚨 Troubleshooting

### Backend Won't Start
```bash
# Check logs for errors
cd backend && railway logs

# Force redeploy
railway redeploy

# Or use dashboard: https://railway.app/dashboard
```

### Frontend Not Loading
```bash
# Check Vercel deployments
npx vercel ls

# Redeploy if needed
cd frontend && npm run build && npx vercel --prod --yes
```

### Database Connection Issues
1. Check MongoDB Atlas cluster status
2. Verify connection string in Railway environment variables
3. Resume cluster if paused

### Scripts Not Working
```bash
# Make sure you're in the project root
cd /Users/tymoribrahim/Desktop/ShulaWebApp2

# Check Railway CLI is installed
npm install -g @railway/cli

# Check Railway login
railway whoami
```

---

## 📞 Quick Commands Reference

| Action | Command |
|--------|---------|
| Check all status | `./scripts/check-status.sh` |
| Wake up backend | `./scripts/resume-servers.sh` |
| Pause instructions | `./scripts/pause-servers.sh` |
| Railway status | `railway status` |
| Railway logs | `railway logs` |
| Force redeploy | `railway redeploy` |
| Test backend | `curl https://shula-rent-project-production.up.railway.app/` |

---

## 📱 Mobile Access

All URLs work on mobile devices:
- Share the frontend URL for demos
- Backend API works for mobile app integration
- Responsive design included

---

## 💡 Pro Tips

1. **Let Auto-Sleep Work**: Railway's 30-minute auto-sleep is perfect for development
2. **Use Scripts**: The helper scripts make management much easier
3. **Dashboard Control**: For precise control, use Railway web dashboard
4. **Cost Monitoring**: Check execution hours usage in Railway dashboard
5. **Always Test**: Run `./scripts/check-status.sh` to verify everything works

---

**💡 Remember**: Railway auto-sleeps after 30 minutes of inactivity, so manual pausing is often unnecessary! This saves you money automatically. 💰** 
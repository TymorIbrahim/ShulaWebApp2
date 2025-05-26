# 🚀 Shula Equipment Rental - Server Management Scripts

Quick scripts to manage your deployed Shula Equipment Rental application.

## 📁 Available Scripts

### 🛑 `pause-servers.sh`
**Purpose**: Provides instructions to pause the Railway backend and shows current status.

```bash
./scripts/pause-servers.sh
```

**What it does**:
- 🔍 Checks current backend status (online/sleeping)
- 📋 Provides step-by-step instructions for manual pausing via Railway dashboard
- ✅ Explains Railway's auto-sleep feature (30min inactivity)
- 💰 Shows current cost status (execution hours usage)

**Note**: Railway CLI doesn't support direct pausing, so manual dashboard control is needed.

---

### ✅ `resume-servers.sh`
**Purpose**: Wake up the Railway backend when it's sleeping or ensure it's running.

```bash
./scripts/resume-servers.sh
```

**What it does**:
- 🔍 Checks if backend is already running
- ⚡ Triggers redeploy to wake up sleeping service (if needed)
- ⏳ Waits for full startup with multiple retry attempts
- 🧪 Tests connectivity to all services
- 🎯 Provides app URLs for immediate use

---

### 📊 `check-status.sh`
**Purpose**: Check the current status of all your services without making changes.

```bash
./scripts/check-status.sh
```

**What it does**:
- ✅ Shows Railway service information
- 🧪 Tests backend API and frontend connectivity
- 💰 Shows cost status for each service
- 📋 Provides comprehensive status summary
- 🎯 Suggests appropriate next steps

---

## 🎯 Quick Workflow

### Starting Your Work Day:
```bash
# Check what's currently running
./scripts/check-status.sh

# If backend is sleeping, wake it up
./scripts/resume-servers.sh
```

### Ending Your Work Day:
```bash
# Check current status and get pause instructions
./scripts/pause-servers.sh

# Or just leave it - Railway auto-sleeps after 30min! 😴
```

### Before a Demo/Presentation:
```bash
# Make sure everything is running
./scripts/resume-servers.sh
```

---

## 🔗 Your App URLs

- **🎨 Frontend**: https://shula-webapp-dppi61gn7-tymoribrahims-projects.vercel.app
- **⚙️ Backend API**: https://shula-rent-project-production.up.railway.app

---

## 💡 Important Tips

1. **Auto-Sleep is Your Friend**: Railway automatically sleeps your service after 30 minutes of inactivity, saving you execution hours!

2. **Manual Control**: For precise control, use the Railway dashboard:
   - **Pause**: https://railway.app/dashboard → Settings → Sleep Mode
   - **Resume**: Click "Deploy" or disable Sleep Mode

3. **Frontend is Free**: Vercel static hosting costs nothing - no need to manage it

4. **Database Stays On**: MongoDB Atlas M0 cluster runs 24/7 for free

5. **Script Limitations**: Railway CLI has limited service control, so some operations require the web dashboard

---

## 🚨 Troubleshooting

If a script fails or service won't start:

1. **Check Railway Status Manually**:
   ```bash
   cd backend
   railway status
   railway logs
   ```

2. **Use Railway Dashboard**: https://railway.app/dashboard
   - View deployments and logs
   - Manual sleep mode control
   - Force redeploy if needed

3. **Network Issues**: Check if your internet connection can reach the services

4. **Service Stuck**: Sometimes a manual redeploy via dashboard works better than CLI

---

## 💰 Cost Management

### Current Setup (All FREE tiers):
- **Vercel Frontend**: $0/month (unlimited)
- **Railway Backend**: 500 hours/month free
- **MongoDB Atlas**: 512MB storage free

### Automatic Cost Savings:
- ✅ Railway auto-sleeps after 30min inactivity
- ✅ Frontend costs nothing (static hosting)
- ✅ Database is free tier (always-on)

### Manual Cost Control:
- 🎛️ Use Railway dashboard for precise control
- 📊 Monitor usage in Railway dashboard
- ⏱️ Scripts help track execution hour usage

---

**📖 For detailed instructions, see: `SERVER_MANAGEMENT_GUIDE.md`**

**🌐 Dashboard Links:**
- Railway: https://railway.app/dashboard
- Vercel: https://vercel.com/dashboard
- MongoDB: https://cloud.mongodb.com/ 
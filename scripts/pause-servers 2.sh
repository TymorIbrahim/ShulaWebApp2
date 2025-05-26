#!/bin/bash

# 🛑 Shula Equipment Rental - Pause Servers Script
# Run this when you're done working to save on Railway execution hours

echo "🛑 Pausing Shula Equipment Rental servers..."
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/../backend" || exit 1

# Check if Railway CLI is available
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "npm install -g @railway/cli"
    exit 1
fi

echo "⚠️  Railway CLI doesn't support direct service pausing."
echo "📋 To pause your Railway backend service:"
echo ""
echo "🌐 Option 1: Use Railway Dashboard (Recommended)"
echo "   1. Open: https://railway.app/dashboard"
echo "   2. Click on 'Shula-Rent-Project'"
echo "   3. Click on your service"
echo "   4. Go to 'Settings' tab"
echo "   5. Scroll to 'Sleep Mode' section"
echo "   6. Enable 'Sleep Mode'"
echo ""
echo "⏰ Option 2: Let Railway Auto-Sleep"
echo "   Railway automatically puts services to sleep after"
echo "   30 minutes of inactivity, so you can just leave it!"
echo ""

# Test current status
echo "🧪 Current Service Status:"
if curl -s --max-time 5 https://shula-rent-project-production.up.railway.app/ > /dev/null; then
    echo "✅ Backend API: ONLINE 🟢"
    echo "💰 Service is currently using execution hours"
else
    echo "❌ Backend API: OFFLINE/SLEEPING 🔴"
    echo "💰 Service is NOT using execution hours"
fi

echo ""
echo "📋 Status Summary:"
echo "⚙️  Backend (Railway): Use dashboard to manually pause"
echo "✅ Frontend (Vercel): RUNNING 🟢 (free hosting)"
echo "✅ Database (MongoDB): RUNNING 🟢 (recommended)"
echo ""
echo "🎯 To resume when ready: ./scripts/resume-servers.sh"
echo ""
echo "💡 Pro Tip: Railway auto-sleeps after 30 min of inactivity!"
echo "" 
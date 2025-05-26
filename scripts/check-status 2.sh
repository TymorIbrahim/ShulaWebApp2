#!/bin/bash

# 📊 Shula Equipment Rental - Status Check Script
# Run this to check the current status of all your services

echo "📊 Checking Shula Equipment Rental server status..."
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/../backend" || exit 1

# Check if Railway CLI is available
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "npm install -g @railway/cli"
    exit 1
fi

# Check Railway service status
echo "⏳ Checking Railway backend status..."
railway status

echo ""
echo "🧪 Testing connectivity..."

# Test backend API
echo "Testing backend API..."
if curl -s --max-time 10 https://shula-rent-project-production.up.railway.app/ > /dev/null; then
    echo "✅ Backend API: ONLINE 🟢"
    BACKEND_STATUS="ONLINE 🟢"
    BACKEND_COST_STATUS="💰 Currently using execution hours"
else
    echo "❌ Backend API: OFFLINE/SLEEPING 🔴"
    BACKEND_STATUS="OFFLINE/SLEEPING 🔴"
    BACKEND_COST_STATUS="💰 NOT using execution hours"
fi

# Test frontend
echo "Testing frontend..."
if curl -s --max-time 10 -I https://shula-webapp-dppi61gn7-tymoribrahims-projects.vercel.app/ > /dev/null; then
    echo "✅ Frontend: ONLINE 🟢"
    FRONTEND_STATUS="ONLINE 🟢"
else
    echo "❌ Frontend: OFFLINE 🔴"
    FRONTEND_STATUS="OFFLINE 🔴"
fi

echo ""
echo "📋 Current Status Summary:"
echo "=========================================="
echo "⚙️  Backend (Railway): $BACKEND_STATUS"
echo "    $BACKEND_COST_STATUS"
echo "🎨 Frontend (Vercel): $FRONTEND_STATUS"
echo "🗄️  Database (MongoDB): ALWAYS RUNNING 🟢"
echo "=========================================="
echo ""

# Provide next steps based on status
if [[ $BACKEND_STATUS == *"OFFLINE"* ]]; then
    echo "🎯 Next Steps:"
    echo "   To wake up backend: ./scripts/resume-servers.sh"
    echo "   To check logs: railway logs"
    echo "   Manual control: https://railway.app/dashboard"
    echo ""
    echo "💡 Railway auto-sleeps after 30min of inactivity (this saves you money!)"
elif [[ $BACKEND_STATUS == *"ONLINE"* ]]; then
    echo "🎯 Next Steps:"
    echo "   Your app is ready! Visit the frontend URL below"
    echo "   Backend will auto-sleep after 30min of inactivity"
    echo "   Manual control: https://railway.app/dashboard"
fi

echo ""
echo "🔗 Your App URLs:"
echo "🎨 Frontend: https://shula-webapp-dppi61gn7-tymoribrahims-projects.vercel.app"
echo "⚙️ Backend API: https://shula-rent-project-production.up.railway.app"
echo ""
echo "📊 Cost Status:"
echo "   Frontend (Vercel): 🆓 FREE"
echo "   Database (MongoDB): 🆓 FREE"
if [[ $BACKEND_STATUS == *"ONLINE"* ]]; then
    echo "   Backend (Railway): 💰 Using free execution hours"
else
    echo "   Backend (Railway): 💰 NOT using execution hours (sleeping)"
fi
echo "" 
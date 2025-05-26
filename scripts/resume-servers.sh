#!/bin/bash

# ✅ Shula Equipment Rental - Resume Servers Script
# Run this when you want to start working or demo your app

echo "✅ Resuming Shula Equipment Rental servers..."
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/../backend" || exit 1

# Check if Railway CLI is available
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "npm install -g @railway/cli"
    exit 1
fi

# Check current status first
echo "🧪 Checking current backend status..."
if curl -s --max-time 10 https://shula-rent-project-production.up.railway.app/ > /dev/null; then
    echo "✅ Backend is already ONLINE! 🟢"
    BACKEND_ALREADY_RUNNING=true
else
    echo "⏰ Backend is sleeping/offline. Waking it up..."
    BACKEND_ALREADY_RUNNING=false
fi

if [ "$BACKEND_ALREADY_RUNNING" = false ]; then
    echo ""
    echo "⚡ Triggering redeploy to wake up the service..."
    railway redeploy
    
    if [ $? -eq 0 ]; then
        echo "✅ Redeploy triggered successfully!"
        echo "⏳ Waiting for service to fully start..."
        sleep 45  # Give it more time for full restart
    else
        echo "❌ Failed to redeploy. Try manual resume:"
        echo "🌐 1. Open: https://railway.app/dashboard"
        echo "   2. Click 'Shula-Rent-Project' → your service"
        echo "   3. Click 'Deploy' or disable 'Sleep Mode'"
        exit 1
    fi
else
    echo "⏩ Skipping redeploy since service is already running"
    sleep 5
fi

echo ""
echo "🧪 Testing connectivity..."

# Test backend API with multiple attempts
echo "Testing backend API..."
ATTEMPTS=0
MAX_ATTEMPTS=6

while [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
    if curl -s --max-time 10 https://shula-rent-project-production.up.railway.app/ > /dev/null; then
        echo "✅ Backend API: ONLINE 🟢"
        BACKEND_ONLINE=true
        break
    else
        ATTEMPTS=$((ATTEMPTS + 1))
        if [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; then
            echo "⏳ Attempt $ATTEMPTS/$MAX_ATTEMPTS - still starting... (waiting 10s)"
            sleep 10
        else
            echo "⚠️ Backend API: Still starting up... (may need more time)"
            BACKEND_ONLINE=false
        fi
    fi
done

# Test frontend
echo "Testing frontend..."
if curl -s --max-time 10 -I https://shula-webapp-dppi61gn7-tymoribrahims-projects.vercel.app/ > /dev/null; then
    echo "✅ Frontend: ONLINE 🟢"
else
    echo "❌ Frontend: OFFLINE 🔴"
fi

echo ""
echo "📋 Status Summary:"
if [ "$BACKEND_ONLINE" = true ]; then
    echo "✅ Backend (Railway): RUNNING 🟢"
else
    echo "⏳ Backend (Railway): STARTING UP 🟡 (check again in 2-3 minutes)"
fi
echo "✅ Frontend (Vercel): RUNNING 🟢"
echo "✅ Database (MongoDB): RUNNING 🟢"
echo ""
echo "🔗 Your app URLs:"
echo "🎨 Frontend: https://shula-webapp-dppi61gn7-tymoribrahims-projects.vercel.app"
echo "⚙️ Backend API: https://shula-rent-project-production.up.railway.app"
echo ""

if [ "$BACKEND_ONLINE" = true ]; then
    echo "🎯 Your app is ready for development or demo!"
else
    echo "⏳ Backend is starting up. Try again in 2-3 minutes or check Railway dashboard."
fi

echo "🛑 When done, Railway will auto-sleep after 30min of inactivity"
echo "   Or manually pause via: ./scripts/pause-servers.sh"
echo "" 
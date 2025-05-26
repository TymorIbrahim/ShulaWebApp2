#!/bin/bash

# Complete Railway + Vercel Deployment for Shula Web App
# Usage: ./scripts/deploy-railway-full.sh

echo "🚀 Complete Deployment: Railway + Vercel"
echo "========================================"
echo ""
echo "This will deploy:"
echo "🚂 Backend → Railway"
echo "▲ Frontend → Vercel"
echo ""

read -p "Ready to deploy? (y/n): " CONFIRM

if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "=========================================="
echo "🚂 STEP 1: Deploy Backend to Railway"
echo "=========================================="
echo ""

# Run Railway deployment
./scripts/deploy-railway.sh

if [ $? -ne 0 ]; then
    echo "❌ Railway deployment failed. Stopping here."
    exit 1
fi

echo ""
echo "=========================================="
echo "▲ STEP 2: Deploy Frontend to Vercel"
echo "=========================================="
echo ""

# Small delay to ensure Railway is ready
echo "⏳ Waiting 10 seconds for Railway to be ready..."
sleep 10

# Run Vercel deployment
./scripts/deploy-vercel.sh

if [ $? -ne 0 ]; then
    echo "❌ Vercel deployment failed."
    echo "Your backend is still live on Railway."
    exit 1
fi

echo ""
echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "====================================="
echo ""
echo "Your Shula Web App is now live!"
echo ""
echo "📱 Frontend: Check Vercel output above"
echo "🔧 Backend: Check Railway output above"
echo ""
echo "🔗 Quick Links:"
echo "   • Railway Dashboard: https://railway.app/dashboard"
echo "   • Vercel Dashboard: https://vercel.com/dashboard"
echo ""
echo "🚀 Your app is ready for users!" 
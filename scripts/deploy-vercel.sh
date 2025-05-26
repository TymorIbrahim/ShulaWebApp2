#!/bin/bash

# Vercel Frontend Deployment Script for Shula Web App
# Usage: ./scripts/deploy-vercel.sh

echo "▲ Vercel Frontend Deployment for Shula Web App"
echo "==============================================="
echo ""

# Check if in frontend directory
if [ ! -f "package.json" ]; then
    if [ -d "frontend" ]; then
        cd frontend
    else
        echo "❌ Please run this script from the root directory or frontend directory"
        exit 1
    fi
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📥 Installing Vercel CLI..."
    npm install -g vercel
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Vercel CLI. Please install manually:"
        echo "npm install -g vercel"
        exit 1
    fi
fi

echo "✅ Vercel CLI is ready!"
echo ""

# Login to Vercel
echo "🔑 Please login to Vercel..."
echo "If you don't have an account, create one at: https://vercel.com"
echo ""

vercel login

if [ $? -ne 0 ]; then
    echo "❌ Vercel login failed. Please try again."
    exit 1
fi

echo "✅ Successfully logged in to Vercel!"
echo ""

# Build the React app
echo "📦 Building React app for production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build completed successfully!"
echo ""

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."

# Create vercel.json if it doesn't exist
if [ ! -f "vercel.json" ]; then
    cat > vercel.json << 'EOF'
{
  "version": 2,
  "name": "shula-webapp",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "s-maxage=31536000,immutable"
      },
      "dest": "/static/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_VERSION": "1.0.0",
    "GENERATE_SOURCEMAP": "false"
  }
}
EOF
    echo "✅ Created vercel.json configuration"
fi

# Deploy with production flag
vercel --prod --yes

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Frontend deployed successfully!"
    
    # Get the deployment URL
    FRONTEND_URL=$(vercel ls | grep "shula-webapp" | head -1 | awk '{print $2}')
    
    if [ ! -z "$FRONTEND_URL" ]; then
        echo "🔗 Frontend URL: https://$FRONTEND_URL"
        
        echo ""
        echo "🎉 Vercel deployment completed!"
        echo ""
        echo "📋 Important: Update Railway Backend CORS"
        echo "============================================"
        echo "Run this command to update your Railway backend:"
        echo ""
        echo "railway variables set FRONTEND_URL=\"https://$FRONTEND_URL\""
        echo ""
        echo "🔗 Your Shula app is live at: https://$FRONTEND_URL"
        echo "🔧 Vercel dashboard: https://vercel.com/dashboard"
        
    else
        echo "⚠️  Could not get frontend URL. Check Vercel dashboard."
        echo "🔗 Vercel dashboard: https://vercel.com/dashboard"
    fi
else
    echo "❌ Frontend deployment failed. Check the error messages above."
    exit 1
fi

# Go back to root if we started there
if [ "$(basename $(pwd))" = "frontend" ]; then
    cd ..
fi 
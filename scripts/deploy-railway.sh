#!/bin/bash

# Railway Deployment Script for Shula Web App
# Usage: ./scripts/deploy-railway.sh

echo "🚂 Railway Deployment for Shula Web App"
echo "========================================"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📥 Installing Railway CLI..."
    
    # Detect OS and install accordingly
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install railway
        else
            echo "Installing via curl..."
            curl -fsSL https://railway.app/install.sh | sh
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://railway.app/install.sh | sh
    else
        echo "Please install Railway CLI manually:"
        echo "https://docs.railway.app/develop/cli"
        exit 1
    fi
fi

echo "✅ Railway CLI is ready!"
echo ""

# Login to Railway
echo "🔑 Please login to Railway..."
echo "If you don't have an account, create one at: https://railway.app"
echo ""

railway login

if [ $? -ne 0 ]; then
    echo "❌ Railway login failed. Please try again."
    exit 1
fi

echo "✅ Successfully logged in to Railway!"
echo ""

# Create or link project
echo "🚀 Setting up Railway project..."

# Check if already in a Railway project
if railway status > /dev/null 2>&1; then
    echo "✅ Already linked to a Railway project"
else
    echo "Creating new Railway project..."
    railway init
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to create Railway project."
        exit 1
    fi
fi

echo ""
echo "🔧 Deploying backend to Railway..."

# Deploy backend
cd backend

# Create Procfile for Railway if it doesn't exist
if [ ! -f "Procfile" ]; then
    echo "web: npm start" > Procfile
    echo "✅ Created Procfile"
fi

# Set environment variables
echo "Setting up environment variables..."

railway variables set MONGO_URI="mongodb+srv://Tymor:Tymor123@shulacluster.ged8w.mongodb.net/ShulaDB?retryWrites=true&w=majority&appName=ShulaCluster"
railway variables set JWT_SECRET="yourRandomStrongSecretKeyHere123!@#$"
railway variables set NODE_ENV="production"
railway variables set PORT="$PORT"

echo "✅ Environment variables set!"

# Deploy backend
echo "🚀 Deploying backend..."
railway up

if [ $? -eq 0 ]; then
    echo "✅ Backend deployed successfully!"
    
    # Get the backend URL
    BACKEND_URL=$(railway status --json | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
    
    if [ ! -z "$BACKEND_URL" ]; then
        echo "🔗 Backend URL: $BACKEND_URL"
        
        # Update CORS settings
        railway variables set FRONTEND_URL="https://your-frontend-domain.vercel.app"
        
        cd ..
        
        # Update frontend environment
        echo "📝 Updating frontend configuration..."
        
        cat > frontend/.env.production << EOF
REACT_APP_API_URL=$BACKEND_URL
GENERATE_SOURCEMAP=false
REACT_APP_VERSION=1.0.0
EOF
        
        echo "✅ Frontend environment updated!"
        
        echo ""
        echo "🎉 Railway deployment completed!"
        echo ""
        echo "📋 Next Steps:"
        echo "=============="
        echo "1. Deploy frontend to Vercel:"
        echo "   cd frontend && npm run build"
        echo "   npx vercel --prod"
        echo ""
        echo "2. Or use our Vercel script:"
        echo "   npm run deploy:vercel"
        echo ""
        echo "🔗 Your backend is live at: $BACKEND_URL"
        echo "🔧 Railway dashboard: https://railway.app/dashboard"
        
    else
        echo "⚠️  Could not get backend URL. Check Railway dashboard."
    fi
else
    echo "❌ Backend deployment failed. Check the error messages above."
    exit 1
fi

cd .. 
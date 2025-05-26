#!/bin/bash

# Deployment Validation Script
# Usage: ./scripts/validate-deployment.sh

echo "🔍 Validating Shula Web App for AWS Deployment"
echo "=============================================="
echo ""

ERRORS=0
WARNINGS=0

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Please run this script from the root directory of your Shula project"
    exit 1
fi

echo "✅ Running from correct directory"

# Check frontend build
echo ""
echo "🎨 Checking Frontend..."
cd frontend

if [ ! -f "package.json" ]; then
    echo "❌ Frontend package.json not found"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ Frontend package.json found"
fi

# Check if build works
echo "📦 Testing frontend build..."
npm run build > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Frontend builds successfully"
    
    # Check for important files in build
    if [ -f "build/index.html" ]; then
        echo "✅ Build contains index.html"
    else
        echo "❌ Build missing index.html"
        ERRORS=$((ERRORS + 1))
    fi
    
    if [ -d "build/static" ]; then
        echo "✅ Build contains static assets"
    else
        echo "⚠️  Build missing static assets directory"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "❌ Frontend build failed"
    ERRORS=$((ERRORS + 1))
fi

cd ..

# Check backend
echo ""
echo "🖥️  Checking Backend..."
cd backend

if [ ! -f "package.json" ]; then
    echo "❌ Backend package.json not found"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ Backend package.json found"
fi

if [ ! -f "server.js" ]; then
    echo "❌ Backend server.js not found"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ Backend server.js found"
fi

# Check for essential backend files
REQUIRED_FILES=("config/db.js" "routes/auth.js" "routes/productRoutes.js")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ Found $file"
    else
        echo "❌ Missing $file"
        ERRORS=$((ERRORS + 1))
    fi
done

# Check environment variables
echo ""
echo "🔧 Checking Environment Configuration..."

if [ -f ".env" ]; then
    echo "✅ Backend .env file exists"
    
    # Check for required environment variables
    if grep -q "MONGO_URI" .env; then
        echo "✅ MONGO_URI found in .env"
    else
        echo "❌ MONGO_URI missing from .env"
        ERRORS=$((ERRORS + 1))
    fi
    
    if grep -q "JWT_SECRET" .env; then
        echo "✅ JWT_SECRET found in .env"
    else
        echo "❌ JWT_SECRET missing from .env"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "⚠️  Backend .env file not found (will need to create on server)"
    WARNINGS=$((WARNINGS + 1))
fi

cd ..

# Check deployment scripts
echo ""
echo "📜 Checking Deployment Scripts..."

SCRIPTS=("scripts/aws-setup.sh" "scripts/deploy-frontend.sh" "scripts/deploy-backend.sh")
for script in "${SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        echo "✅ Found $script"
        if [ -x "$script" ]; then
            echo "✅ $script is executable"
        else
            echo "⚠️  $script is not executable (run: chmod +x $script)"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo "❌ Missing $script"
        ERRORS=$((ERRORS + 1))
    fi
done

# Check Git repository
echo ""
echo "📝 Checking Git Repository..."

if [ -d ".git" ]; then
    echo "✅ Git repository initialized"
    
    # Check if there are uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        echo "⚠️  You have uncommitted changes"
        echo "   Consider committing before deployment"
        WARNINGS=$((WARNINGS + 1))
    else
        echo "✅ Working directory is clean"
    fi
    
    # Check if remote origin exists
    if git remote get-url origin > /dev/null 2>&1; then
        REMOTE_URL=$(git remote get-url origin)
        echo "✅ Git remote origin: $REMOTE_URL"
    else
        echo "⚠️  No git remote origin set"
        echo "   You may want to push to GitHub for easy server deployment"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "⚠️  Git repository not initialized"
    WARNINGS=$((WARNINGS + 1))
fi

# Check dependencies
echo ""
echo "📦 Checking Dependencies..."

# Check if Node.js is installed
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js installed: $NODE_VERSION"
else
    echo "❌ Node.js not installed"
    ERRORS=$((ERRORS + 1))
fi

# Check if npm is installed
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm installed: $NPM_VERSION"
else
    echo "❌ npm not installed"
    ERRORS=$((ERRORS + 1))
fi

# Summary
echo ""
echo "📊 Validation Summary"
echo "==================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "🎉 All checks passed! Your app is ready for AWS deployment."
    echo ""
    echo "🚀 Next steps:"
    echo "1. Run: npm run aws:setup (one-time setup)"
    echo "2. Launch EC2 instance manually in AWS console"
    echo "3. Run: npm run aws:deploy:frontend"
    echo "4. Run: npm run aws:deploy:backend"
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  Validation passed with $WARNINGS warning(s)."
    echo "Your app should deploy successfully, but consider addressing the warnings above."
    echo ""
    echo "🚀 You can proceed with deployment if you wish."
else
    echo "❌ Validation failed with $ERRORS error(s) and $WARNINGS warning(s)."
    echo "Please fix the errors above before attempting deployment."
    echo ""
    echo "🔧 Common fixes:"
    echo "- Ensure you're in the correct directory"
    echo "- Run 'npm install' in frontend and backend directories"
    echo "- Create missing configuration files"
    echo "- Check file permissions with 'chmod +x scripts/*.sh'"
    exit 1
fi

echo ""
echo "📖 For deployment instructions, see: README-AWS.md" 
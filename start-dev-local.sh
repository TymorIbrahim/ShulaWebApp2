#!/bin/bash

echo "🚀 Starting Shula Equipment Library - LOCAL Development Environment"
echo "==================================================================="

# Create .env.local for frontend to use local backend
echo "📝 Configuring frontend for local development..."
cat > frontend/.env.local << EOL
REACT_APP_API_URL=http://localhost:5002
GENERATE_SOURCEMAP=false
EOL

# Create .env for backend
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend/.env file..."
    cat > backend/.env << EOL
MONGO_URI=mongodb+srv://Tymor:Tymor123@shulacluster.ged8w.mongodb.net/ShulaDB?retryWrites=true&w=majority&appName=ShulaCluster
PORT=5002
JWT_SECRET=yourRandomStrongSecretKeyHere123!@#$
NODE_ENV=development
EOL
    echo "✅ Backend .env file created"
fi

echo ""
echo "🌐 Starting Frontend (React) on http://localhost:3000"
echo "⚙️  Starting Backend (Node.js) on http://localhost:5002"
echo ""
echo "📋 CONFIGURED FOR LOCAL TESTING:"
echo "   ✅ Frontend will use http://localhost:5002 (local backend)"
echo "   ✅ All new Unified Booking System features are active"
echo ""
echo "🎯 Test these features:"
echo "   → Homepage: Popular products section"
echo "   → /products: Enhanced filtering and popularity sorting"
echo "   → Individual product pages: Real-time availability"
echo ""

# Check if backend is running, if not start it
if ! curl -s http://localhost:5002 > /dev/null 2>&1; then
    echo "🔧 Starting backend server..."
    cd backend
    npm start &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to start
    echo "⏳ Waiting for backend to start..."
    for i in {1..10}; do
        if curl -s http://localhost:5002 > /dev/null 2>&1; then
            echo "✅ Backend is ready at http://localhost:5002"
            break
        fi
        echo "   ... waiting ($i/10)"
        sleep 2
    done
    
    if ! curl -s http://localhost:5002 > /dev/null 2>&1; then
        echo "⚠️  Backend may not be fully ready (MongoDB connection issue)"
        echo "   The frontend will still show UI improvements!"
    fi
else
    echo "✅ Backend already running at http://localhost:5002"
fi

# Start frontend
echo "🎨 Starting frontend..."
cd frontend
REACT_APP_API_URL=http://localhost:5002 npm start &
FRONTEND_PID=$!
cd ..

# Wait for user input to stop
echo ""
echo "🎯 DEVELOPMENT ENVIRONMENT READY!"
echo "   Frontend: http://localhost:3000 (configured for local backend)"
echo "   Backend:  http://localhost:5002"
echo ""
echo "Press Enter to stop all servers..."
read

# Clean up
echo "🛑 Stopping development servers..."
kill $BACKEND_PID 2>/dev/null
kill $FRONTEND_PID 2>/dev/null

# Clean up frontend config
rm -f frontend/.env.local

echo "✅ Development environment stopped and cleaned up" 
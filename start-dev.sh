#!/bin/bash

echo "🚀 Starting Shula Equipment Library - Development Environment"
echo "============================================================"

# Check if .env exists in backend
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
echo "📋 To test the Unified Booking System features:"
echo "   → Visit http://localhost:3000 to see the homepage with popular products"
echo "   → Browse to /products to see enhanced filtering and sorting"
echo "   → Try the new popularity-based sorting options"
echo "   → Check individual product pages for real-time availability"
echo ""
echo "⚠️  Note: If backend fails to connect, whitelist your IP in MongoDB Atlas:"
echo "   1. Go to https://cloud.mongodb.com/"
echo "   2. Navigate to Network Access"
echo "   3. Add your current IP or 0.0.0.0/0 for development"
echo ""

# Start backend in background
cd backend
echo "Starting backend..."
npm start &
BACKEND_PID=$!

# Start frontend in background
cd ../frontend
echo "Starting frontend..."
npm start &
FRONTEND_PID=$!

# Wait for user input to stop
echo ""
echo "🎯 Your development servers are running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5002"
echo ""
echo "Press Ctrl+C or Enter to stop all servers..."
read

# Clean up background processes
echo "🛑 Stopping development servers..."
kill $BACKEND_PID 2>/dev/null
kill $FRONTEND_PID 2>/dev/null
echo "✅ Development environment stopped" 
#!/bin/bash

echo "🚀 Starting Shula Equipment Library - LOCAL Development Environment"
echo "==================================================================="

# --- Configuration ---
ROOT_DIR=$(pwd)
FRONTEND_PORT=3000
BACKEND_PORT=5002
FRONTEND_LOG="$ROOT_DIR/frontend/logs/development.log"
BACKEND_LOG="$ROOT_DIR/backend/logs/development.log"
FRONTEND_DIR="frontend"
BACKEND_DIR="backend"

# --- Create Log Directories ---
mkdir -p "$ROOT_DIR/frontend/logs"
mkdir -p "$ROOT_DIR/backend/logs"

# --- Cleanup Function ---
cleanup() {
    echo ""
    echo "🛑 Stopping all development servers..."
    
    # Check if PIDs are set before trying to kill
    if [ -n "$FRONTEND_PID" ] && ps -p "$FRONTEND_PID" > /dev/null; then
        kill "$FRONTEND_PID"
        echo "   - Frontend server (PID: $FRONTEND_PID) stopped."
    fi
    if [ -n "$BACKEND_PID" ] && ps -p "$BACKEND_PID" > /dev/null; then
        kill "$BACKEND_PID"
        echo "   - Backend server (PID: $BACKEND_PID) stopped."
    fi
    
    # Remove .env.local
    rm -f "$ROOT_DIR/frontend/.env.local"
    
    echo "✅ Development environment stopped and cleaned up."
    exit 0
}

# Trap script exit to run cleanup
trap cleanup INT TERM EXIT

# --- Configure Frontend ---
echo "📝 Configuring frontend for local development..."
cat > "$ROOT_DIR/frontend/.env.local" << EOL
REACT_APP_API_URL=http://localhost:$BACKEND_PORT
GENERATE_SOURCEMAP=false
EOL

# --- Configure Backend ---
if [ ! -f "$ROOT_DIR/backend/.env" ]; then
    echo "📝 Creating backend/.env file..."
    cat > "$ROOT_DIR/backend/.env" << EOL
MONGO_URI=mongodb+srv://Tymor:Tymor123@shulacluster.ged8w.mongodb.net/ShulaDB?retryWrites=true&w=majority&appName=ShulaCluster
PORT=$BACKEND_PORT
JWT_SECRET=yourRandomStrongSecretKeyHere123!@#$
NODE_ENV=development
EOL
    echo "✅ Backend .env file created"
fi

# --- Start Backend Server ---
echo "⚙️  Starting Backend (Node.js) on http://localhost:$BACKEND_PORT..."
cd "$BACKEND_DIR" || exit
npm start > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!
cd "$ROOT_DIR" || exit
echo "   - Backend PID: $BACKEND_PID"
echo "   - Log file: $BACKEND_LOG"

# --- Wait for Backend ---
echo "⏳ Waiting for backend to be ready..."
for i in {1..20}; do
    if curl -s "http://localhost:$BACKEND_PORT" > /dev/null; then
        echo "✅ Backend is ready at http://localhost:$BACKEND_PORT"
        break
    fi
    sleep 1
done

if ! curl -s "http://localhost:$BACKEND_PORT" > /dev/null; then
    echo "⚠️  Backend failed to start. Check logs: tail -f $BACKEND_LOG"
    exit 1
fi

# --- Start Frontend Server ---
echo "🎨 Starting Frontend (React) on http://localhost:$FRONTEND_PORT..."
cd "$FRONTEND_DIR" || exit
npm start > "$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!
cd "$ROOT_DIR" || exit
echo "   - Frontend PID: $FRONTEND_PID"
echo "   - Log file: $FRONTEND_LOG"

# --- Wait for Frontend ---
echo "⏳ Waiting for frontend to be ready..."
for i in {1..20}; do
    if curl -s "http://localhost:$FRONTEND_PORT" 2>/dev/null | grep -q "div id=\"root\""; then
        echo "✅ Frontend is ready at http://localhost:$FRONTEND_PORT"
        break
    fi
    sleep 1
done

if ! curl -s "http://localhost:$FRONTEND_PORT" 2>/dev/null | grep -q "div id=\"root\""; then
    echo "⚠️  Frontend failed to start. Check logs: tail -f $FRONTEND_LOG"
    exit 1
fi

# --- Ready ---
echo ""
echo "🎯 DEVELOPMENT ENVIRONMENT READY!"
echo "   - Frontend: http://localhost:$FRONTEND_PORT"
echo "   - Backend:  http://localhost:$BACKEND_PORT"
echo ""
echo "   LOGS:"
echo "   - Frontend: tail -f $FRONTEND_LOG"
echo "   - Backend:  tail -f $BACKEND_LOG"
echo ""
echo "Press Ctrl+C to stop all servers..."

# Keep the script running
wait 
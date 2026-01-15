#!/bin/bash
# Quick setup script for WebSocket
# Run this in terminal: bash setup-websocket.sh

echo "🚀 Setting up WebSocket for Frontend..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if socket.io-client is installed
if ! npm list socket.io-client > /dev/null 2>&1; then
    echo "📥 Installing socket.io-client..."
    npm install socket.io-client
fi

echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Run: npm run dev"
echo "2. Login to the app"
echo "3. Open DevTools (F12)"
echo "4. Check console for connection logs"
echo ""
echo "🧪 To test connection, paste in console:"
echo "const token = localStorage.getItem('accessToken');"
echo "console.log('Token:', token ? 'OK' : 'Missing');"

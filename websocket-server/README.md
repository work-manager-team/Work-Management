# WebSocket Server - Work Management

Standalone WebSocket server for real-time notifications, designed to run on Render.com.

## Architecture

This server is part of a hybrid architecture:
- **REST API**: Deployed on Vercel (serverless)
- **WebSocket Server**: Deployed on Render (always-on) - THIS PROJECT

## Features

- Real-time WebSocket notifications using Socket.IO
- JWT authentication for WebSocket connections
- HTTP trigger endpoints for REST API integration
- Connection statistics and health check endpoints

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod
```

## Environment Variables

Create a `.env` file with:

```env
PORT=3001
JWT_SECRET=your-jwt-secret-key-same-as-main-backend
NODE_ENV=production
```

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /notifications/health` | GET | Health check |
| `GET /notifications/stats` | GET | Connection statistics |
| `POST /notifications/trigger` | POST | Trigger notification from REST API |
| `WSS /notifications` | WebSocket | WebSocket namespace for clients |

## Deploy to Render

Follow the deployment guide in `HYBRID_ARCHITECTURE_GUIDE.md` in the parent directory.

Quick steps:
1. Push this directory to GitHub
2. Create Web Service on Render.com
3. Connect GitHub repository
4. Set build command: `npm install && npm run build`
5. Set start command: `npm run start:prod`
6. Add environment variables
7. Deploy

## Testing

### Test locally:
```bash
npm run start:dev
```

Then in browser console:
```javascript
const socket = io('http://localhost:3001/notifications', {
  auth: { token: 'your-jwt-token' }
});

socket.on('connect', () => console.log('Connected'));
socket.on('notification', (data) => console.log('Notification:', data));
```

### Test trigger endpoint:
```bash
curl -X POST http://localhost:3001/notifications/trigger \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "notification": {"type": "test", "title": "Test", "message": "Hello"}}'
```

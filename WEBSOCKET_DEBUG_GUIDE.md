# 🔍 WebSocket Connection Debug Guide

## ⚠️ CURRENT ISSUE

Frontend **KHÔNG THỂ KẾT NỐI** được với WebSocket server mặc dù server đang chạy và gửi notifications thành công.

**Server Logs (Working):**
```
🚀 WebSocket Server is running on port 3001
📡 WebSocket endpoint: ws://localhost:3001/notifications
[Nest] 65  - 01/15/2026, 10:49:20 AM   DEBUG [NotificationsGateway] 📤 Sent notification to User 48: task_created
[Nest] 65  - 01/15/2026, 10:49:20 AM   DEBUG [NotificationsGateway] 📤 Sent notification to User 32: task_created
[Nest] 65  - 01/15/2026, 10:49:38 AM   DEBUG [NotificationsGateway] 📤 Sent notification to User 32: task_assigned
```

**Frontend Issue:** Cannot connect to WebSocket

---

## 🎯 ROOT CAUSES (SOLVED ✅)

### 1. MISSING IoAdapter - HTTP to WebSocket Upgrade Failed ⭐ MAIN ISSUE

**Problem:**
Khi deploy lên Render, quá trình upgrade từ HTTP → WebSocket bị kill giữa chừng vì:
- Chỉ enable CORS cho HTTP
- **Socket.IO adapter cho WebSocket CHƯA ĐƯỢC CẤU HÌNH**

**Error Message:**
```
webSocket is closed before the connection is established
```

**Root Cause:**
File `main.ts` thiếu `app.useWebSocketAdapter(new IoAdapter(app))`

**Solution:** ✅ FIXED
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io'; // ⭐ ADD THIS

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable Socket.IO adapter for WebSocket ⭐ ADD THIS
  app.useWebSocketAdapter(new IoAdapter(app));

  // Enable CORS for HTTP
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'https://work-management-chi.vercel.app',
      'https://jira-frontend-roan.vercel.app', // ⭐ ADD THIS
      /\.vercel\.app$/,
    ],
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
}
```

### 2. CORS Configuration - MISSING FRONTEND URL ✅ FIXED

**File:** `websocket-server/src/notifications/notifications.gateway.ts`

**Solution:** Thêm frontend URL:
```typescript
@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'https://work-management-chi.vercel.app',
      'https://jira-frontend-roan.vercel.app', // ⭐ ADDED
      /\.vercel\.app$/,
    ],
    credentials: true,
  },
  namespace: '/notifications',
})
```

---

### 2. Production WebSocket URL

**Frontend cần connect tới:**
```
https://work-management-websocket.onrender.com/notifications
```

**KHÔNG PHẢI:**
```
ws://localhost:3001/notifications
```

---

### 3. JWT Token Issue

WebSocket server yêu cầu JWT token để authenticate. Token phải:
- Valid (không expired)
- Được gửi trong `auth.token` hoặc `headers.authorization`
- Format: `Bearer <token>`

---

## 🔧 STEP-BY-STEP FIX

### Step 1: Update CORS (Backend)

**File 1:** `websocket-server/src/main.ts`
```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'https://work-management-chi.vercel.app',
    'https://jira-frontend-roan.vercel.app', // ⭐ ADD
    /\.vercel\.app$/,
  ],
  credentials: true,
});
```

**File 2:** `websocket-server/src/notifications/notifications.gateway.ts`
```typescript
@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'https://work-management-chi.vercel.app',
      'https://jira-frontend-roan.vercel.app', // ⭐ ADD
      /\.vercel\.app$/,
    ],
    credentials: true,
  },
  namespace: '/notifications',
})
```

**Sau đó:**
```bash
cd websocket-server
git add .
git commit -m "Fix CORS: Add frontend URL to WebSocket server"
git push origin ngocminh
```

Render sẽ tự động rebuild.

---

### Step 2: Frontend Connection Code (Production Ready)

**File:** `src/services/websocket.service.ts`

```typescript
import { io, Socket } from 'socket.io-client';

const WEBSOCKET_URL = 'https://work-management-websocket.onrender.com/notifications';

class WebSocketService {
  private socket: Socket | null = null;

  connect(token: string): void {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    console.log('🔌 Connecting to WebSocket:', WEBSOCKET_URL);
    console.log('🔑 Using token:', token.substring(0, 20) + '...');

    this.socket = io(WEBSOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
      console.log('Socket ID:', this.socket?.id);
    });

    this.socket.on('connected', (data) => {
      console.log('✅ Connection confirmed:', data);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from WebSocket:', reason);
    });

    this.socket.on('notification', (notification) => {
      console.log('🔔 New notification:', notification);
      // Handle notification
    });

    this.socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      console.error('Error details:', {
        message: error.message,
        type: error.type,
        description: error.description,
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const websocketService = new WebSocketService();
```

---

### Step 3: Test Connection

#### Test 1: Check WebSocket Server Health

**Browser Console hoặc curl:**
```bash
curl https://work-management-websocket.onrender.com/notifications/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "service": "WebSocket Notifications Server",
  "timestamp": "2026-01-15T10:49:20.000Z"
}
```

---

#### Test 2: Check Connection Stats

```bash
curl https://work-management-websocket.onrender.com/notifications/stats
```

**Expected Response:**
```json
{
  "totalUsers": 2,
  "totalSockets": 3,
  "users": [
    { "userId": 32, "socketCount": 2 },
    { "userId": 48, "socketCount": 1 }
  ]
}
```

---

#### Test 3: Test với Browser Console

**1. Get Access Token:**
```javascript
const token = localStorage.getItem('accessToken');
console.log('Token:', token);
```

**2. Test Connection:**
```javascript
import { io } from 'socket.io-client';

const socket = io('https://work-management-websocket.onrender.com/notifications', {
  auth: { token: 'YOUR_TOKEN_HERE' },
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log('✅ Connected! Socket ID:', socket.id);
});

socket.on('connected', (data) => {
  console.log('✅ Server confirmed:', data);
});

socket.on('notification', (notification) => {
  console.log('🔔 Notification:', notification);
});

socket.on('connect_error', (error) => {
  console.error('❌ Error:', error);
});
```

---

#### Test 4: Test Trigger Notification (Backend)

**Gọi API trigger từ Vercel:**
```bash
curl -X POST https://work-management-websocket.onrender.com/notifications/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 32,
    "notification": {
      "type": "test",
      "title": "Test Notification",
      "message": "This is a test notification",
      "createdAt": "2026-01-15T10:50:00Z"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Notification triggered successfully"
}
```

Nếu frontend đang connect, sẽ nhận được notification real-time.

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue 1: "Connection timeout"

**Cause:** Render WebSocket server chưa chạy hoặc đang cold start

**Solution:**
1. Check Render logs
2. Đợi 30-60s cho cold start
3. Ping health endpoint trước: `GET /notifications/health`

---

### Issue 2: "Authentication error" / "No token provided"

**Cause:** Token không được gửi đúng cách

**Solutions:**
```typescript
// ✅ CORRECT
socket = io(WS_URL, {
  auth: { token: token },  // Token không có "Bearer "
});

// ❌ WRONG
socket = io(WS_URL, {
  auth: { token: `Bearer ${token}` },  // Không cần "Bearer "
});
```

---

### Issue 3: "CORS error"

**Cause:** Frontend URL không có trong CORS whitelist

**Solution:**
- Check `main.ts` và `notifications.gateway.ts`
- Thêm frontend URL
- Rebuild Render

---

### Issue 4: "401 Unauthorized"

**Cause:** Token expired hoặc invalid

**Solutions:**
1. Check token expiry:
```javascript
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
}

const payload = parseJwt(token);
console.log('Token expires at:', new Date(payload.exp * 1000));
console.log('Token expired?', Date.now() > payload.exp * 1000);
```

2. Login lại để lấy token mới

---

### Issue 5: "Transport 'websocket' failed"

**Cause:** Firewall hoặc network blocking WebSocket

**Solution:**
- Socket.IO sẽ tự động fallback sang polling
- Check console logs
- Thử disable VPN/Proxy

---

## 🎯 COMPLETE FRONTEND INTEGRATION

### Complete React Hook Example

**File:** `src/hooks/useWebSocket.ts`

```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const WEBSOCKET_URL = 'https://work-management-websocket.onrender.com/notifications';

interface Notification {
  type: string;
  title: string;
  message: string;
  userId: number;
  relatedEntityType?: string;
  relatedEntityId?: number;
  createdAt: string;
}

export const useWebSocket = (token: string | null) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      console.log('No token - skipping WebSocket connection');
      return;
    }

    console.log('🔌 Initializing WebSocket connection...');

    const newSocket = io(WEBSOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
      console.log('Socket ID:', newSocket.id);
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('connected', (data) => {
      console.log('✅ Server confirmed connection:', data);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Disconnected:', reason);
      setIsConnected(false);
    });

    // Notification event
    newSocket.on('notification', (notification: Notification) => {
      console.log('🔔 New notification:', notification);
      setNotifications(prev => [notification, ...prev]);

      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo.png',
        });
      }
    });

    // Error events
    newSocket.on('error', (err) => {
      console.error('❌ WebSocket error:', err);
      setError(err.message || 'WebSocket error');
    });

    newSocket.on('connect_error', (err) => {
      console.error('❌ Connection error:', err);
      setError(err.message || 'Connection error');
    });

    setSocket(newSocket);

    // Cleanup
    return () => {
      console.log('🔌 Cleaning up WebSocket connection');
      newSocket.disconnect();
    };
  }, [token]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return {
    socket,
    isConnected,
    notifications,
    error,
  };
};
```

---

### Complete App Integration

**File:** `src/App.tsx`

```typescript
import React, { useEffect } from 'react';
import { useWebSocket } from './hooks/useWebSocket';

export const App: React.FC = () => {
  const token = localStorage.getItem('accessToken');
  const { isConnected, notifications, error } = useWebSocket(token);

  useEffect(() => {
    console.log('WebSocket Status:', {
      connected: isConnected,
      error: error,
      notificationCount: notifications.length,
    });
  }, [isConnected, error, notifications]);

  return (
    <div className="app">
      {/* Connection Status */}
      <div className="status-bar">
        {isConnected ? (
          <span className="connected">🟢 Connected to real-time server</span>
        ) : (
          <span className="disconnected">🔴 Disconnected</span>
        )}
        {error && <span className="error">{error}</span>}
      </div>

      {/* Your app content */}
      <div className="content">
        {/* ... */}
      </div>

      {/* Notification Toast */}
      {notifications.map((notification, index) => (
        <div key={index} className="toast">
          <h4>{notification.title}</h4>
          <p>{notification.message}</p>
        </div>
      ))}
    </div>
  );
};
```

---

## 📊 DEBUG CHECKLIST

### ✅ Backend Checks

- [ ] Render WebSocket server is running (check Render Dashboard)
- [ ] Health endpoint returns 200: `GET /notifications/health`
- [ ] CORS includes frontend URL in both `main.ts` and `notifications.gateway.ts`
- [ ] JWT_SECRET matches between Vercel and Render
- [ ] Logs show "📤 Sent notification to User X"

### ✅ Frontend Checks

- [ ] Token exists in localStorage
- [ ] Token is not expired (check payload.exp)
- [ ] WebSocket URL is production URL (not localhost)
- [ ] Socket.IO client library is installed: `npm list socket.io-client`
- [ ] Browser console shows connection attempts
- [ ] No CORS errors in browser console

### ✅ Network Checks

- [ ] Frontend can reach health endpoint
- [ ] No VPN/Proxy blocking WebSocket
- [ ] Firewall allows WebSocket connections
- [ ] Browser supports WebSocket (all modern browsers do)

---

## 🚀 DEPLOYMENT CHECKLIST

### After Code Changes:

1. **Commit & Push:**
```bash
git add .
git commit -m "Fix WebSocket connection issues"
git push origin ngocminh
```

2. **Wait for Render Deploy:**
- Check Render Dashboard
- Wait for "Live" status
- Check logs for "🚀 WebSocket Server is running"

3. **Test Connection:**
```bash
# Health check
curl https://work-management-websocket.onrender.com/notifications/health

# Stats check
curl https://work-management-websocket.onrender.com/notifications/stats
```

4. **Test from Frontend:**
- Open browser console
- Login to get token
- Check WebSocket connection logs
- Trigger a test notification

---

## 📞 FINAL VERIFICATION

### Test End-to-End:

1. **Login to Frontend**
2. **Open Browser Console** (F12)
3. **Check Logs:**
   - Should see: `✅ Connected to WebSocket server`
   - Should see: `Socket ID: xxx`
4. **Trigger Action** (assign task, comment, etc.)
5. **Check Notification:**
   - Console: `🔔 New notification:`
   - UI: Toast notification appears
6. **Check Render Logs:**
   - Should see: `📤 Sent notification to User X`

---

## 🎓 ARCHITECTURE SUMMARY

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (https://jira-frontend-roan.vercel.app)           │
│                                                              │
│  1. User Login → Get JWT Token                             │
│  2. Connect WebSocket with Token                            │
│  3. Listen for 'notification' events                        │
│  4. Perform actions (assign task, comment, etc.)            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ├─── REST API ──────────────────────┐
                  │                                     │
                  ↓                                     ↓
┌──────────────────────────────────────┐  ┌──────────────────────────────────┐
│  REST API (Vercel)                   │  │  WebSocket Server (Render)       │
│  https://work-management-chi.vercel  │  │  https://work-management-websoc  │
│                                      │  │  ket.onrender.com                │
│  1. Handle business logic           │  │                                  │
│  2. Save to database                │  │  1. Maintain WebSocket           │
│  3. HTTP POST to WebSocket server   │──→│     connections                  │
│     /notifications/trigger          │  │  2. Authenticate with JWT        │
│                                      │  │  3. Broadcast notifications      │
└──────────────────────────────────────┘  └─────────────┬────────────────────┘
                                                         │
                                                         │ Real-time Event
                                                         ↓
                                          ┌─────────────────────────────┐
                                          │  Frontend receives          │
                                          │  'notification' event       │
                                          │  Shows toast/updates UI     │
                                          └─────────────────────────────┘
```

---

**Created:** 2026-01-15
**Version:** 1.0.0
**Status:** DEBUGGING ACTIVE ISSUE

# 🔌 WebSocket Real-Time Notifications Guide

## 🎯 Tổng Quan

Work Management System hiện đã **tích hợp WebSocket** để gửi notifications **real-time** cho users ngay lập tức, không cần phải polling API.

**WebSocket Endpoint:** `wss://work-management-chi.vercel.app/notifications`
**Protocol:** Socket.IO
**Authentication:** JWT Bearer Token

---

## 🚀 Tính Năng

### ✅ Real-Time Notifications

Tất cả **8 loại notifications** được gửi tự động qua WebSocket:

1. ✅ `added_to_project` - Khi user được thêm vào project
2. ✅ `sprint_created` - Khi sprint mới được tạo
3. ✅ `sprint_status_changed` - Khi sprint đổi status
4. ✅ `task_created` - Khi task mới được tạo
5. ✅ `task_assigned` - Khi task được assign
6. ✅ `task_status_changed` - Khi task đổi status
7. ✅ `task_deleted` - Khi task bị xóa
8. ✅ `comment_added` - Khi có comment mới

### ✅ Multi-Device Support

- User có thể connect từ nhiều devices (mobile, web, desktop)
- Notifications được sync across all devices
- Marking notification as read sẽ sync cho tất cả devices

### ✅ Project Subscriptions

- Subscribe/unsubscribe to project-specific notifications
- Chỉ nhận notifications từ projects đang theo dõi

---

## 📦 Installation - Client Side

### JavaScript/TypeScript (Browser)

```bash
npm install socket.io-client
```

### React Native

```bash
npm install socket.io-client react-native-vector-icons
```

### Flutter

```yaml
dependencies:
  socket_io_client: ^2.0.3
```

---

## 🔧 Usage Examples

### 1. JavaScript/TypeScript (React, Vue, Angular)

```typescript
import { io, Socket } from 'socket.io-client';

class NotificationService {
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io('https://work-management-chi.vercel.app/notifications', {
      auth: {
        token: token, // JWT token from login
      },
      transports: ['websocket', 'polling'], // Try websocket first
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Connected to notifications');
    });

    this.socket.on('connected', (data) => {
      console.log('✅ Authenticated:', data);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from notifications');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
    });

    // Listen for notifications
    this.socket.on('notification', (notification) => {
      console.log('🔔 New notification:', notification);

      // Handle notification
      this.handleNotification(notification);
    });

    // Listen for read status updates
    this.socket.on('notification:marked_read', (data) => {
      console.log('✅ Notification marked as read:', data.notificationId);
      // Update UI
    });
  }

  handleNotification(notification: any) {
    // Show toast/snackbar
    showToast({
      title: notification.title,
      message: notification.message,
      type: notification.type,
    });

    // Update notification count
    updateNotificationCount();

    // Play sound
    playNotificationSound();

    // Show browser notification (if permission granted)
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/notification-icon.png',
      });
    }
  }

  // Subscribe to project notifications
  subscribeToProject(projectId: number) {
    this.socket?.emit('subscribe:project', { projectId }, (response) => {
      console.log('Subscribed to project:', response);
    });
  }

  // Unsubscribe from project
  unsubscribeFromProject(projectId: number) {
    this.socket?.emit('unsubscribe:project', { projectId }, (response) => {
      console.log('Unsubscribed from project:', response);
    });
  }

  // Mark notification as read
  markAsRead(notificationId: number) {
    this.socket?.emit('notification:read', { notificationId }, (response) => {
      console.log('Marked as read:', response);
    });
  }

  disconnect() {
    this.socket?.disconnect();
  }
}

// Usage
const notificationService = new NotificationService();

// After login
const token = 'your-jwt-token';
notificationService.connect(token);

// Subscribe to projects
notificationService.subscribeToProject(1);
notificationService.subscribeToProject(2);

// Clean up on logout
notificationService.disconnect();
```

---

### 2. React Hook

```typescript
// hooks/useNotifications.ts
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useNotifications = (token: string | null) => {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;

    // Connect to WebSocket
    socketRef.current = io('https://work-management-chi.vercel.app/notifications', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setConnected(true);
      console.log('✅ Connected to notifications');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('❌ Disconnected');
    });

    socket.on('notification', (notification) => {
      console.log('🔔 New notification:', notification);
      setNotifications((prev) => [notification, ...prev]);

      // Show toast
      toast.success(notification.title, {
        description: notification.message,
      });
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, [token]);

  const subscribeToProject = (projectId: number) => {
    socketRef.current?.emit('subscribe:project', { projectId });
  };

  const unsubscribeFromProject = (projectId: number) => {
    socketRef.current?.emit('unsubscribe:project', { projectId });
  };

  const markAsRead = (notificationId: number) => {
    socketRef.current?.emit('notification:read', { notificationId });
  };

  return {
    connected,
    notifications,
    subscribeToProject,
    unsubscribeFromProject,
    markAsRead,
  };
};

// Usage in component
function App() {
  const token = useAuthStore((state) => state.token);
  const { connected, notifications, subscribeToProject } = useNotifications(token);

  useEffect(() => {
    if (connected) {
      subscribeToProject(1); // Subscribe to project 1
    }
  }, [connected]);

  return (
    <div>
      <p>Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}</p>
      <NotificationList notifications={notifications} />
    </div>
  );
}
```

---

### 3. Vue 3 Composable

```typescript
// composables/useNotifications.ts
import { ref, onMounted, onUnmounted } from 'vue';
import { io, Socket } from 'socket.io-client';

export function useNotifications(token: string) {
  const socket = ref<Socket | null>(null);
  const connected = ref(false);
  const notifications = ref<any[]>([]);

  onMounted(() => {
    socket.value = io('https://work-management-chi.vercel.app/notifications', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.value.on('connect', () => {
      connected.value = true;
    });

    socket.value.on('disconnect', () => {
      connected.value = false;
    });

    socket.value.on('notification', (notification) => {
      notifications.value.unshift(notification);
    });
  });

  onUnmounted(() => {
    socket.value?.disconnect();
  });

  const subscribeToProject = (projectId: number) => {
    socket.value?.emit('subscribe:project', { projectId });
  };

  return {
    connected,
    notifications,
    subscribeToProject,
  };
}
```

---

### 4. Flutter (Dart)

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

class NotificationService {
  IO.Socket? socket;

  void connect(String token) {
    socket = IO.io('https://work-management-chi.vercel.app/notifications', {
      'transports': ['websocket', 'polling'],
      'auth': {'token': token},
    });

    socket!.on('connect', (_) {
      print('✅ Connected to notifications');
    });

    socket!.on('disconnect', (_) {
      print('❌ Disconnected');
    });

    socket!.on('notification', (data) {
      print('🔔 New notification: $data');
      _handleNotification(data);
    });

    socket!.connect();
  }

  void _handleNotification(dynamic data) {
    // Show local notification
    // Update notification count
    // Play sound
  }

  void subscribeToProject(int projectId) {
    socket!.emit('subscribe:project', {'projectId': projectId});
  }

  void disconnect() {
    socket?.disconnect();
  }
}
```

---

## 📡 WebSocket Events

### Client → Server (Emit)

| Event | Data | Description |
|-------|------|-------------|
| `subscribe:project` | `{ projectId: number }` | Subscribe to project notifications |
| `unsubscribe:project` | `{ projectId: number }` | Unsubscribe from project |
| `notification:read` | `{ notificationId: number }` | Mark notification as read |

### Server → Client (Listen)

| Event | Data | Description |
|-------|------|-------------|
| `connected` | `{ message: string, userId: number }` | Connection successful |
| `notification` | `Notification` object | New notification received |
| `notification:marked_read` | `{ notificationId: number }` | Notification marked as read (sync) |

---

## 📋 Notification Object Structure

```typescript
interface Notification {
  id: number;
  type: string; // 'task_created', 'task_assigned', etc.
  title: string;
  message: string;
  taskId: number | null;
  projectId: number | null;
  isRead: boolean;
  createdAt: string; // ISO 8601
}
```

---

## 🔒 Authentication

WebSocket connection requires JWT token:

**Option 1: Auth object** (Recommended)
```javascript
io(url, {
  auth: {
    token: 'your-jwt-token'
  }
})
```

**Option 2: Headers**
```javascript
io(url, {
  extraHeaders: {
    Authorization: 'Bearer your-jwt-token'
  }
})
```

---

## ⚠️ Error Handling

### Connection Errors

```typescript
socket.on('connect_error', (error) => {
  if (error.message === 'unauthorized') {
    console.error('❌ Invalid token - please login again');
    // Redirect to login
  } else {
    console.error('Connection error:', error.message);
    // Retry connection
  }
});
```

### Reconnection Strategy

```typescript
const socket = io(url, {
  reconnection: true,
  reconnectionDelay: 1000,      // Start with 1s delay
  reconnectionDelayMax: 5000,   // Max 5s delay
  reconnectionAttempts: 5,       // Try 5 times
  timeout: 20000,                // 20s timeout
});

socket.io.on('reconnect_attempt', (attempt) => {
  console.log(`Reconnection attempt ${attempt}`);
});

socket.io.on('reconnect', (attemptNumber) => {
  console.log(`✅ Reconnected after ${attemptNumber} attempts`);
});

socket.io.on('reconnect_failed', () => {
  console.error('❌ Reconnection failed');
  // Redirect to login or show error
});
```

---

## 🎨 UI Integration Examples

### Toast Notification (React + Sonner)

```typescript
import { toast } from 'sonner';

socket.on('notification', (notification) => {
  const icon = getNotificationIcon(notification.type);

  toast.success(notification.title, {
    description: notification.message,
    icon: icon,
    action: {
      label: 'View',
      onClick: () => navigateToTask(notification.taskId),
    },
    duration: 5000,
  });
});

function getNotificationIcon(type: string) {
  const icons = {
    task_assigned: '📋',
    task_created: '✨',
    task_status_changed: '🔄',
    sprint_created: '🏃',
    comment_added: '💬',
    added_to_project: '👥',
  };
  return icons[type] || '🔔';
}
```

### Browser Notification

```typescript
// Request permission
if (Notification.permission === 'default') {
  Notification.requestPermission();
}

// Show notification
socket.on('notification', (notification) => {
  if (Notification.permission === 'granted') {
    new Notification(notification.title, {
      body: notification.message,
      icon: '/logo.png',
      badge: '/badge.png',
      tag: `notification-${notification.id}`,
      renotify: true,
    });
  }
});
```

### Badge Count

```typescript
const [unreadCount, setUnreadCount] = useState(0);

socket.on('notification', (notification) => {
  setUnreadCount((count) => count + 1);

  // Update document title
  document.title = `(${unreadCount + 1}) Work Management`;

  // Update favicon badge (using library like `favico.js`)
  favicon.badge(unreadCount + 1);
});
```

---

## 🧪 Testing WebSocket

### Using Browser Console

```javascript
// Connect
const socket = io('https://work-management-chi.vercel.app/notifications', {
  auth: { token: 'your-jwt-token' }
});

// Listen for events
socket.on('connect', () => console.log('Connected'));
socket.on('notification', (data) => console.log('Notification:', data));

// Subscribe to project
socket.emit('subscribe:project', { projectId: 1 });

// Disconnect
socket.disconnect();
```

### Using Postman (WebSocket Client)

1. New Request → WebSocket
2. URL: `wss://work-management-chi.vercel.app/notifications`
3. Headers: `Authorization: Bearer your-token`
4. Connect
5. Send: `{"event": "subscribe:project", "data": {"projectId": 1}}`

---

## 📊 Performance & Best Practices

### ✅ DO

- ✅ Reuse socket connection across app
- ✅ Handle reconnection automatically
- ✅ Unsubscribe from projects when leaving
- ✅ Disconnect on logout
- ✅ Show connection status to user
- ✅ Queue notifications when offline
- ✅ Debounce rapid notifications

### ❌ DON'T

- ❌ Create multiple socket connections
- ❌ Keep connection open after logout
- ❌ Ignore connection errors
- ❌ Subscribe to all projects at once
- ❌ Poll API when WebSocket is connected

---

## 🔧 Troubleshooting

### Problem: Connection keeps dropping

**Solution:**
```typescript
const socket = io(url, {
  transports: ['websocket', 'polling'], // Fallback to polling
  upgrade: true,
});
```

### Problem: Not receiving notifications

**Checklist:**
1. ✅ Check token is valid (not expired)
2. ✅ Verify user is member of project
3. ✅ Check console for connection errors
4. ✅ Ensure subscribed to correct project
5. ✅ Test with browser console first

### Problem: Notifications appear on some devices but not others

**Solution:**
- Check that all devices are using same token
- Verify WebSocket connection on each device
- Test with `notification:marked_read` to sync state

---

## 🚀 Next Steps

1. **Integrate WebSocket** into your frontend
2. **Test real-time notifications** with Postman collection
3. **Add UI notifications** (toast, badges, sounds)
4. **Handle reconnection** gracefully
5. **Monitor connection** status in UI

---

## 📞 WebSocket Endpoint Summary

| Feature | Value |
|---------|-------|
| **URL** | `wss://work-management-chi.vercel.app/notifications` |
| **Protocol** | Socket.IO |
| **Auth** | JWT Bearer Token |
| **Transports** | WebSocket (primary), Polling (fallback) |
| **Namespace** | `/notifications` |
| **CORS** | Enabled for all origins |

---

## 📝 Example: Complete React App

```typescript
// App.tsx
import { useEffect } from 'react';
import { useNotifications } from './hooks/useNotifications';
import { useAuth } from './hooks/useAuth';

function App() {
  const { token, user } = useAuth();
  const { connected, notifications, subscribeToProject } = useNotifications(token);

  useEffect(() => {
    if (connected && user?.projects) {
      // Subscribe to all user's projects
      user.projects.forEach((project) => {
        subscribeToProject(project.id);
      });
    }
  }, [connected, user]);

  return (
    <div>
      <Header connected={connected} notificationCount={notifications.length} />
      <NotificationPanel notifications={notifications} />
      <MainContent />
    </div>
  );
}

export default App;
```

---

**🎉 You're ready to use real-time notifications!**

For API docs, see: `COMPLETE_API_COLLECTION_GUIDE.md`
For Postman testing, import: `Work-Management-COMPLETE-ALL-APIs.postman_collection.json`

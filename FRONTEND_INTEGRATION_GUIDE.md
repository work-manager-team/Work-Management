# 🎨 Frontend Integration Guide - Production Ready

## 🎯 Overview

Tài liệu này hướng dẫn frontend developer tích hợp hoàn chỉnh với Work Management System production APIs.

**Production URLs:**
- REST API: `https://work-management-chi.vercel.app`
- WebSocket: `https://work-management-websocket.onrender.com`
- Frontend: `https://jira-frontend-roan.vercel.app`

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Authentication Setup](#authentication-setup)
3. [REST API Integration](#rest-api-integration)
4. [WebSocket Integration](#websocket-integration)
5. [Notification System](#notification-system)
6. [Complete Examples](#complete-examples)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install axios socket.io-client
```

### 2. Environment Variables

Create `.env.production`:
```env
REACT_APP_API_URL=https://work-management-chi.vercel.app
REACT_APP_WS_URL=https://work-management-websocket.onrender.com
```

**QUAN TRỌNG:** Không hardcode URLs trong code, luôn sử dụng environment variables.

### 3. Config File

**src/config.ts:**
```typescript
export const API_URL = process.env.REACT_APP_API_URL;
export const WS_URL = process.env.REACT_APP_WS_URL;

if (!API_URL || !WS_URL) {
  throw new Error('Missing required environment variables: REACT_APP_API_URL, REACT_APP_WS_URL');
}
```

---

## 🔐 Authentication Setup

### Step 1: Create Auth Service

**src/services/auth.service.ts:**
```typescript
import axios from 'axios';
import { API_URL } from '../config';

interface LoginRequest {
  identifier: string; // email hoặc username
  password: string;
}

interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  fullName: string;
}

interface AuthResponse {
  statusCode: number;
  message: string;
  user: {
    id: number;
    email: string;
    username: string;
    fullName: string;
    avatar?: string;
    status: string;
    role: string;
  };
  accessToken: string;
}

class AuthService {
  /**
   * Login
   * Endpoint: POST /users/login
   * Public: Yes
   */
  async login(identifier: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/users/login`, {
        identifier,
        password
      });

      // Save token và user info
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  /**
   * Register
   * Endpoint: POST /users
   * Public: Yes
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/users`, data);

      // Save token và user info
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  /**
   * Logout
   * Endpoint: POST /auth/logout
   * Public: Yes
   */
  async logout(): Promise<void> {
    try {
      await axios.post(`${API_URL}/auth/logout`);
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Get current user
   */
  getCurrentUser(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
```

---

### Step 2: Create Axios Instance with Interceptor

**src/services/api.service.ts:**
```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_URL } from '../config';
import { authService } from './auth.service';

// Create axios instance
export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Auto add token
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 📡 REST API Integration

### Task Service Example

**src/services/task.service.ts:**
```typescript
import { api } from './api.service';

interface Task {
  id: number;
  projectId: number;
  sprintId?: number;
  title: string;
  description?: string;
  type: 'story' | 'task' | 'bug' | 'epic';
  priority: 'lowest' | 'low' | 'medium' | 'high' | 'highest';
  status: 'todo' | 'in_progress' | 'in_review' | 'done';
  assigneeId?: number;
  reporterId: number;
  estimatedTime?: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateTaskRequest {
  projectId: number;
  sprintId?: number;
  title: string;
  description?: string;
  type: 'story' | 'task' | 'bug' | 'epic';
  priority?: 'lowest' | 'low' | 'medium' | 'high' | 'highest';
  status?: 'todo' | 'in_progress' | 'in_review' | 'done';
  assigneeId?: number;
  parentTaskId?: number;
  estimatedTime?: number;
  dueDate?: string;
}

class TaskService {
  /**
   * Get all tasks
   * Endpoint: GET /tasks?projectId=1&sprintId=1&assigneeId=2
   * Auth Required: Yes
   */
  async getAllTasks(filters?: {
    projectId?: number;
    sprintId?: number;
    assigneeId?: number;
  }): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters?.projectId) params.append('projectId', filters.projectId.toString());
    if (filters?.sprintId) params.append('sprintId', filters.sprintId.toString());
    if (filters?.assigneeId) params.append('assigneeId', filters.assigneeId.toString());

    const response = await api.get(`/tasks?${params.toString()}`);
    return response.data;
  }

  /**
   * Get task by ID
   * Endpoint: GET /tasks/:id
   * Auth Required: Yes
   */
  async getTaskById(id: number): Promise<Task> {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  }

  /**
   * Create task
   * Endpoint: POST /tasks
   * Auth Required: Yes
   */
  async createTask(data: CreateTaskRequest): Promise<Task> {
    const response = await api.post('/tasks', data);
    return response.data;
  }

  /**
   * Update task
   * Endpoint: PUT /tasks/:id
   * Auth Required: Yes
   */
  async updateTask(id: number, data: Partial<CreateTaskRequest>): Promise<Task> {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  }

  /**
   * Update task status
   * Endpoint: PATCH /tasks/:id/status
   * Auth Required: Yes
   */
  async updateStatus(id: number, status: string): Promise<Task> {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return response.data;
  }

  /**
   * Assign task
   * Endpoint: PATCH /tasks/:id/assign
   * Auth Required: Yes
   */
  async assignTask(id: number, assigneeId: number): Promise<Task> {
    const response = await api.patch(`/tasks/${id}/assign`, { assigneeId });
    return response.data;
  }

  /**
   * Assign task by email
   * Endpoint: PATCH /tasks/:id/assign-by-email
   * Auth Required: Yes
   */
  async assignTaskByEmail(id: number, email: string): Promise<Task> {
    const response = await api.patch(`/tasks/${id}/assign-by-email`, { email });
    return response.data;
  }

  /**
   * Update priority
   * Endpoint: PATCH /tasks/:id/priority
   * Auth Required: Yes
   */
  async updatePriority(id: number, priority: string): Promise<Task> {
    const response = await api.patch(`/tasks/${id}/priority`, { priority });
    return response.data;
  }

  /**
   * Delete task
   * Endpoint: DELETE /tasks/:id
   * Auth Required: Yes
   */
  async deleteTask(id: number): Promise<void> {
    await api.delete(`/tasks/${id}`);
  }

  /**
   * Upload task attachment
   * Endpoint: POST /tasks/:id/attachments
   * Auth Required: Yes
   * Content-Type: multipart/form-data
   */
  async uploadAttachment(taskId: number, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/tasks/${taskId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Get task attachments
   * Endpoint: GET /tasks/:id/attachments
   * Auth Required: Yes
   */
  async getAttachments(taskId: number): Promise<any> {
    const response = await api.get(`/tasks/${taskId}/attachments`);
    return response.data;
  }

  /**
   * Delete attachment
   * Endpoint: DELETE /tasks/:taskId/attachments/:attachmentId
   * Auth Required: Yes
   */
  async deleteAttachment(taskId: number, attachmentId: number): Promise<void> {
    await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
  }
}

export const taskService = new TaskService();
```

---

### Project Service Example

**src/services/project.service.ts:**
```typescript
import { api } from './api.service';

interface Project {
  id: number;
  name: string;
  key: string;
  description?: string;
  ownerId: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

class ProjectService {
  /**
   * Get all projects
   * Endpoint: GET /projects?userId=1
   * Public: Yes
   */
  async getAllProjects(userId?: number): Promise<Project[]> {
    const params = userId ? `?userId=${userId}` : '';
    const response = await api.get(`/projects${params}`);
    return response.data;
  }

  /**
   * Get project by ID
   * Endpoint: GET /projects/:id
   * Public: Yes
   */
  async getProjectById(id: number): Promise<Project> {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  }

  /**
   * Get project details with stats
   * Endpoint: GET /projects/:id/details
   * Public: Yes
   */
  async getProjectDetails(id: number): Promise<any> {
    const response = await api.get(`/projects/${id}/details`);
    return response.data;
  }

  /**
   * Create project
   * Endpoint: POST /projects
   * Auth Required: Yes
   */
  async createProject(data: {
    name: string;
    key: string;
    description?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Project> {
    const response = await api.post('/projects', data);
    return response.data;
  }

  /**
   * Update project
   * Endpoint: PUT /projects/:id
   * Auth Required: Yes
   */
  async updateProject(id: number, data: Partial<Project>): Promise<Project> {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  }

  /**
   * Delete project
   * Endpoint: DELETE /projects/:id
   * Auth Required: Yes
   */
  async deleteProject(id: number): Promise<void> {
    await api.delete(`/projects/${id}`);
  }
}

export const projectService = new ProjectService();
```

---

### Notification Service Example

**src/services/notification.service.ts:**
```typescript
import { api } from './api.service';

interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  isRead: boolean;
  createdAt: string;
}

class NotificationService {
  /**
   * Get user notifications
   * Endpoint: GET /notifications/user/:userId
   * Auth Required: Yes
   */
  async getUserNotifications(userId: number): Promise<Notification[]> {
    const response = await api.get(`/notifications/user/${userId}`);
    return response.data;
  }

  /**
   * Get unread notifications
   * Endpoint: GET /notifications/user/:userId/unread
   * Auth Required: Yes
   */
  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    const response = await api.get(`/notifications/user/${userId}/unread`);
    return response.data;
  }

  /**
   * Get unread count
   * Endpoint: GET /notifications/user/:userId/count
   * Auth Required: Yes
   */
  async getUnreadCount(userId: number): Promise<number> {
    const response = await api.get(`/notifications/user/${userId}/count`);
    return response.data.count;
  }

  /**
   * Mark notification as read
   * Endpoint: PATCH /notifications/:id/read
   * Auth Required: Yes
   */
  async markAsRead(id: number): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  }

  /**
   * Mark all as read
   * Endpoint: PATCH /notifications/user/:userId/read-all
   * Auth Required: Yes
   */
  async markAllAsRead(userId: number): Promise<void> {
    await api.patch(`/notifications/user/${userId}/read-all`);
  }

  /**
   * Delete notification
   * Endpoint: DELETE /notifications/:id
   * Auth Required: Yes
   */
  async deleteNotification(id: number): Promise<void> {
    await api.delete(`/notifications/${id}`);
  }

  /**
   * Delete all notifications
   * Endpoint: DELETE /notifications/user/:userId/all
   * Auth Required: Yes
   */
  async deleteAllNotifications(userId: number): Promise<void> {
    await api.delete(`/notifications/user/${userId}/all`);
  }
}

export const notificationService = new NotificationService();
```

---

## 🔌 WebSocket Integration

### Step 1: Create WebSocket Service

**src/services/websocket.service.ts:**
```typescript
import { io, Socket } from 'socket.io-client';
import { WS_URL } from '../config';
import { authService } from './auth.service';

interface NotificationData {
  type: string;
  title: string;
  message: string;
  userId: number;
  relatedEntityType?: string;
  relatedEntityId?: number;
  createdAt: string;
}

type NotificationCallback = (notification: NotificationData) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private callbacks: Set<NotificationCallback> = new Set();

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    const token = authService.getToken();
    if (!token) {
      console.error('Cannot connect to WebSocket: No token');
      return;
    }

    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    this.socket = io(`${WS_URL}/notifications`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.setupEventHandlers();
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
      console.log('Socket ID:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from WebSocket:', reason);
    });

    this.socket.on('notification', (notification: NotificationData) => {
      console.log('🔔 New notification:', notification);
      // Notify all registered callbacks
      this.callbacks.forEach(callback => callback(notification));
    });

    this.socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.callbacks.clear();
    }
  }

  /**
   * Subscribe to notifications
   * Returns unsubscribe function
   */
  onNotification(callback: NotificationCallback): () => void {
    this.callbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const websocketService = new WebSocketService();
```

---

### Step 2: Create React Hook for WebSocket

**src/hooks/useWebSocket.ts:**
```typescript
import { useEffect, useState } from 'react';
import { websocketService } from '../services/websocket.service';

interface NotificationData {
  type: string;
  title: string;
  message: string;
  userId: number;
  relatedEntityType?: string;
  relatedEntityId?: number;
  createdAt: string;
}

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [latestNotification, setLatestNotification] = useState<NotificationData | null>(null);

  useEffect(() => {
    // Connect to WebSocket
    websocketService.connect();

    // Subscribe to notifications
    const unsubscribe = websocketService.onNotification((notification) => {
      setLatestNotification(notification);
    });

    // Check connection status
    const interval = setInterval(() => {
      setIsConnected(websocketService.isConnected());
    }, 1000);

    // Cleanup
    return () => {
      unsubscribe();
      clearInterval(interval);
      websocketService.disconnect();
    };
  }, []);

  return {
    isConnected,
    latestNotification,
  };
};
```

---

### Step 3: Create React Hook for Notifications

**src/hooks/useNotifications.ts:**
```typescript
import { useEffect, useState } from 'react';
import { notificationService } from '../services/notification.service';
import { websocketService } from '../services/websocket.service';
import { authService } from '../services/auth.service';

interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  isRead: boolean;
  createdAt: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    if (!currentUser) return;

    // Load initial notifications
    loadNotifications();

    // Connect WebSocket and listen for new notifications
    websocketService.connect();
    const unsubscribe = websocketService.onNotification((notification) => {
      // Add new notification to top of list
      setNotifications(prev => [{
        id: Date.now(), // Temporary ID
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        relatedEntityType: notification.relatedEntityType,
        relatedEntityId: notification.relatedEntityId,
        isRead: false,
        createdAt: notification.createdAt,
      }, ...prev]);

      // Increment unread count
      setUnreadCount(prev => prev + 1);

      // Show toast notification (optional)
      showToast(notification.title, notification.message);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  const loadNotifications = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const [allNotifications, count] = await Promise.all([
        notificationService.getUserNotifications(currentUser.id),
        notificationService.getUnreadCount(currentUser.id),
      ]);
      setNotifications(allNotifications);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;

    try {
      await notificationService.markAllAsRead(currentUser.id);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      // Update unread count if deleted notification was unread
      const wasUnread = notifications.find(n => n.id === id)?.isRead === false;
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const deleteAllNotifications = async () => {
    if (!currentUser) return;

    try {
      await notificationService.deleteAllNotifications(currentUser.id);
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
    }
  };

  const showToast = (title: string, message: string) => {
    // Implement your toast notification here
    // Example: toast.success(`${title}: ${message}`);
    console.log(`Toast: ${title} - ${message}`);
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refresh: loadNotifications,
  };
};
```

---

## 🔔 Notification System

### 10 Notification Scenarios

#### 1. Task Assigned
**When:** User được assign task
**API Trigger:** `PATCH /tasks/:id/assign` hoặc `PATCH /tasks/:id/assign-by-email`
**WebSocket Event:**
```json
{
  "type": "task_assigned",
  "title": "Task được gán cho bạn",
  "message": "Bạn được gán task: \"Implement login API\"",
  "relatedEntityType": "task",
  "relatedEntityId": 10
}
```

#### 2. Task Updated
**When:** Task bị update (title, description, etc.)
**API Trigger:** `PUT /tasks/:id`
**WebSocket Event:**
```json
{
  "type": "task_updated",
  "title": "Task được cập nhật",
  "message": "Task \"Implement login API\" đã được cập nhật bởi Nguyễn Văn A"
}
```

#### 3. Comment Added
**When:** Có comment mới trên task
**API Trigger:** `POST /comments`
**WebSocket Event:**
```json
{
  "type": "comment_added",
  "title": "Comment mới",
  "message": "Nguyễn Văn A đã comment trên task \"Implement login API\""
}
```

#### 4. Task Status Changed
**When:** Status của task thay đổi
**API Trigger:** `PATCH /tasks/:id/status`
**WebSocket Event:**
```json
{
  "type": "task_status_changed",
  "title": "Trạng thái task thay đổi",
  "message": "Task \"Implement login API\" đã chuyển sang In Progress"
}
```

#### 5. Task Priority Changed
**When:** Priority của task thay đổi
**API Trigger:** `PATCH /tasks/:id/priority`

#### 6. Sprint Started
**When:** Sprint được start
**API Trigger:** `PATCH /sprints/:id/start`

#### 7. Sprint Completed
**When:** Sprint hoàn thành
**API Trigger:** `PATCH /sprints/:id/complete`

#### 8. Project Member Added
**When:** User được thêm vào project
**API Trigger:** `POST /projects/:projectId/members`

#### 9. Project Updated
**When:** Project bị update
**API Trigger:** `PUT /projects/:id`

#### 10. Mention
**When:** User được @ mention trong comment
**API Trigger:** `POST /comments` (với @username trong content)

---

## 📦 Complete Examples

### Example 1: Login Page

**src/pages/Login.tsx:**
```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(identifier, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleLogin}>
        <h1>Login</h1>
        {error && <div className="error">{error}</div>}

        <input
          type="text"
          placeholder="Email or Username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};
```

---

### Example 2: Task Board Component

**src/components/TaskBoard.tsx:**
```typescript
import React, { useEffect, useState } from 'react';
import { taskService } from '../services/task.service';

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  assignee?: {
    id: number;
    fullName: string;
    avatar?: string;
  };
}

export const TaskBoard: React.FC<{ projectId: number }> = ({ projectId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getAllTasks({ projectId });
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await taskService.updateStatus(taskId, newStatus);
      // Update local state
      setTasks(prev =>
        prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
      );
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="task-board">
      {['todo', 'in_progress', 'in_review', 'done'].map(status => (
        <div key={status} className="task-column">
          <h3>{status.replace('_', ' ').toUpperCase()}</h3>
          {tasks
            .filter(t => t.status === status)
            .map(task => (
              <div key={task.id} className="task-card">
                <h4>{task.title}</h4>
                <p>Priority: {task.priority}</p>
                {task.assignee && (
                  <div className="assignee">
                    {task.assignee.avatar && <img src={task.assignee.avatar} alt="" />}
                    <span>{task.assignee.fullName}</span>
                  </div>
                )}
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_review">In Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
};
```

---

### Example 3: Notification Bell Component

**src/components/NotificationBell.tsx:**
```typescript
import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';

export const NotificationBell: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="notification-bell">
      <button onClick={() => setShowDropdown(!showDropdown)}>
        🔔
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      {showDropdown && (
        <div className="dropdown">
          <div className="header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead}>Mark all as read</button>
            )}
          </div>

          <div className="list">
            {notifications.length === 0 ? (
              <div className="empty">No notifications</div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`item ${notification.isRead ? 'read' : 'unread'}`}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <h4>{notification.title}</h4>
                  <p>{notification.message}</p>
                  <span className="time">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
```

---

### Example 4: Complete App Setup

**src/App.tsx:**
```typescript
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/auth.service';
import { websocketService } from './services/websocket.service';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { NotificationBell } from './components/NotificationBell';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return authService.isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
};

export const App: React.FC = () => {
  useEffect(() => {
    // Connect WebSocket when app loads (if authenticated)
    if (authService.isAuthenticated()) {
      websocketService.connect();
    }

    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="app">
        {authService.isAuthenticated() && (
          <nav>
            <NotificationBell />
            <button onClick={() => {
              authService.logout();
              window.location.href = '/login';
            }}>
              Logout
            </button>
          </nav>
        )}

        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};
```

---

## ⚠️ Error Handling

### Common Error Responses

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Email/Username hoặc password không đúng"
}
```

**Action:** Redirect to login page

#### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Bạn không có quyền thực hiện hành động này"
}
```

**Action:** Show error message, không cho phép action

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

**Action:** Show "Not found" page hoặc redirect

#### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

**Action:** Show generic error, retry hoặc contact support

---

## ✨ Best Practices

### 1. Token Management
- Luôn check token expiry trước khi gọi API
- Auto logout khi token expired
- Refresh token nếu có (chưa implement)

### 2. Error Handling
- Always wrap API calls trong try-catch
- Show user-friendly error messages
- Log errors cho debugging

### 3. Loading States
- Show loading indicator khi gọi API
- Disable buttons khi đang submit
- Handle loading state riêng cho từng action

### 4. WebSocket
- Connect WebSocket SAU KHI user login
- Disconnect khi user logout
- Handle reconnection automatically
- Check connection status trước khi rely on real-time data

### 5. Performance
- Use pagination nếu có nhiều data (sẽ được implement)
- Debounce search inputs
- Cache data khi có thể
- Lazy load components

### 6. Security
- NEVER log tokens trong production
- NEVER expose sensitive data trong console
- Always validate user input
- Use HTTPS only (production URLs đã là HTTPS)

---

## 📚 Additional Resources

- **API Documentation:** `API_DOCUMENTATION.md`
- **Postman Collection:** `Work-Management-Production.postman_environment.json`
- **Backend Repository:** (GitHub URL của bạn)

---

**Last Updated:** 2024-01-14
**Version:** 1.0.0

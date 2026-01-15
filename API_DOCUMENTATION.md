# 📚 API Documentation - Work Management System

**Base URL Production:** `https://work-management-chi.vercel.app`
**WebSocket Server Production:** `https://work-management-websocket.onrender.com`
**Frontend URL:** `https://jira-frontend-roan.vercel.app`

---

## 🔐 Authentication

Tất cả APIs (trừ Public) yêu cầu JWT token trong header:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Token có thời hạn 7 ngày, được lưu trong cookie `access_token` (httpOnly).

---

## 📋 Table of Contents

1. [Authentication & Authorization](#1-authentication--authorization)
2. [Users Management](#2-users-management)
3. [Projects Management](#3-projects-management)
4. [Project Members](#4-project-members)
5. [Sprints Management](#5-sprints-management)
6. [Tasks Management](#6-tasks-management)
7. [Comments](#7-comments)
8. [Labels](#8-labels)
9. [Task History](#9-task-history)
10. [Notifications](#10-notifications)
11. [WebSocket Integration](#11-websocket-integration)

---

## 1. Authentication & Authorization

### 1.1 Register (Đăng ký)

**Endpoint:** `POST /users`
**Public:** ✅ Yes
**Description:** Đăng ký tài khoản mới. Email verification sẽ được gửi tự động.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "fullName": "Nguyễn Văn A"
}
```

**Response (201):**
```json
{
  "statusCode": 201,
  "message": "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "fullName": "Nguyễn Văn A",
    "status": "pending",
    "emailVerifiedAt": null,
    "createdAt": "2024-01-14T10:00:00Z"
  },
  "accessToken": "eyJhbGc..."
}
```

**Cookie:** `access_token` được set tự động (httpOnly, 7 days)

---

### 1.2 Login (Đăng nhập)

**Endpoint:** `POST /users/login`
**Public:** ✅ Yes

**Request Body:**
```json
{
  "identifier": "user@example.com",
  "password": "password123"
}
```

**Note:** `identifier` có thể là email hoặc username

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "Đăng nhập thành công",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "fullName": "Nguyễn Văn A",
    "status": "active",
    "avatar": "https://res.cloudinary.com/...",
    "role": "user"
  },
  "accessToken": "eyJhbGc..."
}
```

---

### 1.3 Verify Email (Xác thực email)

#### Via POST (API call)
**Endpoint:** `POST /auth/verify-email`
**Public:** ✅ Yes

**Request Body:**
```json
{
  "token": "eyJhbGc..."
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "Email đã được xác thực thành công",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "status": "active",
    "emailVerifiedAt": "2024-01-14T10:05:00Z"
  }
}
```

#### Via GET (Email link)
**Endpoint:** `GET /auth/verify-email/:token`
**Public:** ✅ Yes
**Description:** User click vào link trong email để verify trực tiếp

---

### 1.4 Resend Verification Email

**Endpoint:** `POST /auth/resend-verification`
**Public:** ✅ Yes

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "Email xác thực đã được gửi lại",
  "token": "eyJhbGc...",
  "userId": 1,
  "email": "user@example.com"
}
```

---

### 1.5 Forgot Password (Quên mật khẩu)

**Endpoint:** `POST /auth/forgot-password`
**Public:** ✅ Yes

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "Link đặt lại mật khẩu đã được gửi đến email của bạn",
  "token": "eyJhbGc...",
  "userId": 1,
  "email": "user@example.com"
}
```

**Email:** Chứa link: `https://jira-frontend-roan.vercel.app/reset-password?token=xxx`

---

### 1.6 Reset Password (Đặt lại mật khẩu)

**Endpoint:** `POST /auth/reset-password`
**Public:** ✅ Yes

**Request Body:**
```json
{
  "token": "eyJhbGc...",
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "Mật khẩu đã được đặt lại thành công"
}
```

---

### 1.7 Request Change Email (Đổi email)

**Endpoint:** `POST /auth/request-change-email`
**Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "newEmail": "newemail@example.com"
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "Email xác thực đã được gửi đến email mới",
  "token": "eyJhbGc...",
  "userId": 1,
  "oldEmail": "user@example.com",
  "newEmail": "newemail@example.com"
}
```

---

### 1.8 Verify Email Change

**Endpoint:** `POST /auth/verify-email-change`
**Public:** ✅ Yes

**Request Body:**
```json
{
  "token": "eyJhbGc..."
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "Email đã được thay đổi thành công",
  "user": {
    "id": 1,
    "email": "newemail@example.com"
  }
}
```

---

### 1.9 Magic Link Login (Đăng nhập không mật khẩu)

#### Request Magic Link
**Endpoint:** `POST /auth/magic-link/request`
**Public:** ✅ Yes

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "Magic link đã được gửi đến email của bạn",
  "token": "eyJhbGc...",
  "userId": 1,
  "email": "user@example.com"
}
```

#### Verify Magic Link (POST)
**Endpoint:** `POST /auth/magic-link/verify`
**Public:** ✅ Yes

**Request Body:**
```json
{
  "token": "eyJhbGc..."
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "Đăng nhập thành công",
  "user": { ... },
  "accessToken": "eyJhbGc..."
}
```

#### Verify Magic Link (GET - Email link)
**Endpoint:** `GET /auth/magic-link/:token`
**Public:** ✅ Yes

---

### 1.10 OTP Login (Đăng nhập với OTP)

#### Request OTP
**Endpoint:** `POST /auth/otp/request`
**Public:** ✅ Yes

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "OTP đã được gửi đến email của bạn",
  "otp": "123456",
  "userId": 1,
  "email": "user@example.com"
}
```

**Note:** Field `otp` chỉ trả về trong testing, production sẽ bỏ

#### Verify OTP
**Endpoint:** `POST /auth/otp/verify`
**Public:** ✅ Yes

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "Đăng nhập thành công với OTP",
  "user": { ... },
  "accessToken": "eyJhbGc..."
}
```

---

### 1.11 Google OAuth Login

#### Initiate Google Auth
**Endpoint:** `GET /auth/google`
**Public:** ✅ Yes
**Description:** Redirect user đến Google login page

**Usage:**
```html
<a href="https://work-management-chi.vercel.app/auth/google">
  Sign in with Google
</a>
```

#### Google Callback
**Endpoint:** `GET /auth/google/callback`
**Public:** ✅ Yes
**Description:** Google redirect về đây sau khi user authorize

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "Đăng nhập Google thành công",
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "fullName": "Nguyễn Văn A",
    "avatar": "https://lh3.googleusercontent.com/..."
  },
  "accessToken": "eyJhbGc..."
}
```

---

### 1.12 Logout

**Endpoint:** `POST /auth/logout`
**Public:** ✅ Yes

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "Đăng xuất thành công"
}
```

**Cookie:** `access_token` được xóa

---

## 2. Users Management

### 2.1 Get All Users

**Endpoint:** `GET /users`
**Auth Required:** ✅ Yes

**Response (200):**
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "fullName": "Nguyễn Văn A",
    "avatar": "https://res.cloudinary.com/...",
    "status": "active",
    "role": "user",
    "createdAt": "2024-01-14T10:00:00Z"
  }
]
```

---

### 2.2 Get User by ID

**Endpoint:** `GET /users/:id`
**Auth Required:** ✅ Yes

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "fullName": "Nguyễn Văn A",
  "avatar": "https://res.cloudinary.com/...",
  "avatarPublicId": "avatars/xxx",
  "bio": "Software Engineer",
  "status": "active",
  "role": "user",
  "emailVerifiedAt": "2024-01-14T10:00:00Z",
  "createdAt": "2024-01-14T10:00:00Z",
  "updatedAt": "2024-01-14T11:00:00Z"
}
```

---

### 2.3 Update User

**Endpoint:** `PUT /users/:id`
**Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn B",
  "bio": "Senior Developer",
  "username": "newusername"
}
```

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "newusername",
  "fullName": "Nguyễn Văn B",
  "bio": "Senior Developer",
  "updatedAt": "2024-01-14T12:00:00Z"
}
```

---

### 2.4 Change Password

**Endpoint:** `PATCH /users/:id/change-password`
**Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "oldPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "Đổi mật khẩu thành công"
}
```

---

### 2.5 Delete User

**Endpoint:** `DELETE /users/:id`
**Auth Required:** ✅ Yes

**Response:** `204 No Content`

---

### 2.6 Upload Avatar

**Endpoint:** `POST /users/avatar`
**Auth Required:** ✅ Yes
**Content-Type:** `multipart/form-data`

**Request Body (Form Data):**
```
file: [Image File] (Max 5MB, jpeg/png/webp/gif)
```

**Response (200):**
```json
{
  "message": "Avatar uploaded successfully",
  "avatar": {
    "id": 10,
    "url": "https://res.cloudinary.com/.../image.jpg",
    "thumbnail": "https://res.cloudinary.com/.../w_150,h_150/image.jpg",
    "small": "https://res.cloudinary.com/.../w_50,h_50/image.jpg"
  }
}
```

---

### 2.7 Delete Avatar

**Endpoint:** `DELETE /users/avatar`
**Auth Required:** ✅ Yes

**Response:** `204 No Content`

---

### 2.8 Get User Avatar

**Endpoint:** `GET /users/:id/avatar`
**Public:** ✅ Yes

**Response (200):**
```json
{
  "avatar": {
    "id": 10,
    "url": "https://res.cloudinary.com/.../image.jpg",
    "thumbnail": "https://res.cloudinary.com/.../w_150,h_150/image.jpg",
    "small": "https://res.cloudinary.com/.../w_50,h_50/image.jpg"
  }
}
```

**Response (200 - No avatar):**
```json
{
  "message": "User has no avatar",
  "avatar": null
}
```

---

## 3. Projects Management

### 3.1 Create Project

**Endpoint:** `POST /projects`
**Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "name": "Project Alpha",
  "key": "PA",
  "description": "Project description",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

**Response (201):**
```json
{
  "id": 1,
  "name": "Project Alpha",
  "key": "PA",
  "description": "Project description",
  "ownerId": 1,
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T00:00:00Z",
  "createdAt": "2024-01-14T10:00:00Z"
}
```

---

### 3.2 Get All Projects

**Endpoint:** `GET /projects`
**Public:** ✅ Yes
**Query Params:** `?userId=1` (optional - filter by user)

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Project Alpha",
    "key": "PA",
    "description": "Project description",
    "ownerId": 1,
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-12-31T00:00:00Z",
    "createdAt": "2024-01-14T10:00:00Z"
  }
]
```

---

### 3.3 Get Project by ID

**Endpoint:** `GET /projects/:id`
**Public:** ✅ Yes

**Response (200):**
```json
{
  "id": 1,
  "name": "Project Alpha",
  "key": "PA",
  "description": "Project description",
  "ownerId": 1,
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T00:00:00Z",
  "createdAt": "2024-01-14T10:00:00Z",
  "updatedAt": "2024-01-14T11:00:00Z"
}
```

---

### 3.4 Search Projects by Name

**Endpoint:** `GET /projects/search`
**Public:** ✅ Yes
**Query Params:** `?name=alpha`

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Project Alpha",
    "key": "PA",
    "description": "Project description"
  }
]
```

---

### 3.5 Get Project Count

**Endpoint:** `GET /projects/count`
**Public:** ✅ Yes

**Response (200):**
```json
{
  "count": 15
}
```

---

### 3.6 Get Project Details (with stats)

**Endpoint:** `GET /projects/:id/details`
**Public:** ✅ Yes

**Response (200):**
```json
{
  "id": 1,
  "name": "Project Alpha",
  "key": "PA",
  "description": "Project description",
  "owner": {
    "id": 1,
    "fullName": "Nguyễn Văn A",
    "email": "user@example.com"
  },
  "stats": {
    "totalTasks": 50,
    "completedTasks": 20,
    "inProgressTasks": 15,
    "todoTasks": 15,
    "totalMembers": 5,
    "totalSprints": 3
  },
  "sprints": [...],
  "members": [...]
}
```

---

### 3.7 Get Project Activities

**Endpoint:** `GET /projects/:id/activities`
**Public:** ✅ Yes
**Query Params:** `?limit=50` (default: 50)

**Response (200):**
```json
[
  {
    "id": 100,
    "type": "task_created",
    "taskId": 10,
    "taskTitle": "Implement login",
    "userId": 1,
    "userName": "Nguyễn Văn A",
    "description": "Created task",
    "createdAt": "2024-01-14T10:00:00Z"
  }
]
```

---

### 3.8 Get User Role in Project

**Endpoint:** `GET /projects/:id/role`
**Auth Required:** ✅ Yes

**Response (200):**
```json
{
  "projectId": 1,
  "userId": 1,
  "role": "owner"
}
```

**Note:** `role` có thể là: `owner`, `admin`, `member`, hoặc `null` (nếu không phải member)

---

### 3.9 Get User Role by IDs

**Endpoint:** `GET /projects/:projectId/users/:userId/role`
**Public:** ✅ Yes

**Response (200):**
```json
{
  "statusCode": 200,
  "projectId": 1,
  "userId": 2,
  "role": "member"
}
```

**Response (404 - Not a member):**
```json
{
  "statusCode": 404,
  "message": "User không phải là thành viên của project này",
  "projectId": 1,
  "userId": 2,
  "role": null
}
```

---

### 3.10 Update Project

**Endpoint:** `PUT /projects/:id`
**Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "name": "Project Alpha Updated",
  "description": "New description",
  "endDate": "2025-12-31"
}
```

**Response (200):**
```json
{
  "id": 1,
  "name": "Project Alpha Updated",
  "description": "New description",
  "endDate": "2025-12-31T00:00:00Z",
  "updatedAt": "2024-01-14T12:00:00Z"
}
```

---

### 3.11 Delete Project

**Endpoint:** `DELETE /projects/:id`
**Auth Required:** ✅ Yes (Only owner)

**Response:** `204 No Content`

---

## 4. Project Members

**Base Path:** `/projects/:projectId/members`

### 4.1 Add Member to Project

**Endpoint:** `POST /projects/:projectId/members`
**Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "userId": 2,
  "role": "member"
}
```

**Note:** `role` có thể là: `admin`, `member`

**Response (201):**
```json
{
  "id": 1,
  "projectId": 1,
  "userId": 2,
  "role": "member",
  "status": "active",
  "invitedBy": 1,
  "joinedAt": "2024-01-14T10:00:00Z"
}
```

---

### 4.2 Get All Members of Project

**Endpoint:** `GET /projects/:projectId/members`
**Public:** ✅ Yes

**Response (200):**
```json
[
  {
    "id": 1,
    "projectId": 1,
    "userId": 1,
    "role": "owner",
    "status": "active",
    "user": {
      "id": 1,
      "fullName": "Nguyễn Văn A",
      "email": "user@example.com",
      "avatar": "https://..."
    },
    "joinedAt": "2024-01-01T00:00:00Z"
  }
]
```

---

### 4.3 Get Active Members

**Endpoint:** `GET /projects/:projectId/members/active`
**Public:** ✅ Yes

**Response (200):**
```json
[
  {
    "id": 1,
    "userId": 1,
    "role": "owner",
    "status": "active",
    "user": {...}
  }
]
```

---

### 4.4 Get Users in Project (Simplified)

**Endpoint:** `GET /projects/:projectId/members/users`
**Public:** ✅ Yes

**Response (200):**
```json
[
  {
    "id": 1,
    "fullName": "Nguyễn Văn A",
    "email": "user@example.com",
    "avatar": "https://..."
  }
]
```

---

### 4.5 Accept Invitation

**Endpoint:** `PATCH /projects/:projectId/members/:userId/accept`
**Auth Required:** ✅ Yes

**Response (200):**
```json
{
  "id": 1,
  "projectId": 1,
  "userId": 2,
  "role": "member",
  "status": "active",
  "joinedAt": "2024-01-14T10:00:00Z"
}
```

---

### 4.6 Update Member Role

**Endpoint:** `PATCH /projects/:projectId/members/:userId/role`
**Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "role": "admin"
}
```

**Response (200):**
```json
{
  "id": 1,
  "projectId": 1,
  "userId": 2,
  "role": "admin",
  "updatedAt": "2024-01-14T12:00:00Z"
}
```

---

### 4.7 Remove Member from Project

**Endpoint:** `DELETE /projects/:projectId/members/:userId`
**Auth Required:** ✅ Yes (Only owner or admin)

**Response:** `204 No Content`

---

## 5. Sprints Management

### 5.1 Create Sprint

**Endpoint:** `POST /sprints`
**Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "projectId": 1,
  "name": "Sprint 1",
  "goal": "Complete user authentication",
  "startDate": "2024-01-15",
  "endDate": "2024-01-29"
}
```

**Response (201):**
```json
{
  "id": 1,
  "projectId": 1,
  "name": "Sprint 1",
  "goal": "Complete user authentication",
  "status": "planned",
  "startDate": "2024-01-15T00:00:00Z",
  "endDate": "2024-01-29T00:00:00Z",
  "createdAt": "2024-01-14T10:00:00Z"
}
```

**Note:** `status` mặc định là `planned`

---

### 5.2 Get All Sprints by Project

**Endpoint:** `GET /sprints`
**Public:** ✅ Yes
**Query Params:** `?projectId=1` (required)

**Response (200):**
```json
[
  {
    "id": 1,
    "projectId": 1,
    "name": "Sprint 1",
    "goal": "Complete user authentication",
    "status": "active",
    "startDate": "2024-01-15T00:00:00Z",
    "endDate": "2024-01-29T00:00:00Z",
    "createdAt": "2024-01-14T10:00:00Z"
  }
]
```

---

### 5.3 Get Sprint by ID

**Endpoint:** `GET /sprints/:id`
**Public:** ✅ Yes

**Response (200):**
```json
{
  "id": 1,
  "projectId": 1,
  "name": "Sprint 1",
  "goal": "Complete user authentication",
  "status": "active",
  "startDate": "2024-01-15T00:00:00Z",
  "endDate": "2024-01-29T00:00:00Z",
  "tasks": [...],
  "createdAt": "2024-01-14T10:00:00Z",
  "updatedAt": "2024-01-14T11:00:00Z"
}
```

---

### 5.4 Update Sprint

**Endpoint:** `PUT /sprints/:id`
**Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "name": "Sprint 1 Updated",
  "goal": "New goal",
  "endDate": "2024-01-31"
}
```

**Response (200):**
```json
{
  "id": 1,
  "name": "Sprint 1 Updated",
  "goal": "New goal",
  "endDate": "2024-01-31T00:00:00Z",
  "updatedAt": "2024-01-14T12:00:00Z"
}
```

---

### 5.5 Delete Sprint

**Endpoint:** `DELETE /sprints/:id`
**Auth Required:** ✅ Yes

**Response:** `204 No Content`

---

### 5.6 Start Sprint

**Endpoint:** `PATCH /sprints/:id/start`
**Auth Required:** ✅ Yes

**Response (200):**
```json
{
  "id": 1,
  "status": "active",
  "startDate": "2024-01-14T10:00:00Z",
  "updatedAt": "2024-01-14T10:00:00Z"
}
```

---

### 5.7 Complete Sprint

**Endpoint:** `PATCH /sprints/:id/complete`
**Auth Required:** ✅ Yes

**Response (200):**
```json
{
  "id": 1,
  "status": "completed",
  "endDate": "2024-01-14T10:00:00Z",
  "updatedAt": "2024-01-14T10:00:00Z"
}
```

---

### 5.8 Cancel Sprint

**Endpoint:** `PATCH /sprints/:id/cancel`
**Auth Required:** ✅ Yes

**Response (200):**
```json
{
  "id": 1,
  "status": "cancelled",
  "updatedAt": "2024-01-14T10:00:00Z"
}
```

---

### 5.9 Update Sprint Status

**Endpoint:** `PATCH /sprints/:id/status`
**Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "status": "active"
}
```

**Note:** `status` có thể là: `planned`, `active`, `completed`, `cancelled`

**Response (200):**
```json
{
  "id": 1,
  "status": "active",
  "updatedAt": "2024-01-14T10:00:00Z"
}
```

---

### 5.10 Create Sprint Comment

**Endpoint:** `POST /sprints/:id/comments`
**Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "content": "This is a comment on the sprint",
  "parentCommentId": null
}
```

**Note:** `parentCommentId` dùng cho reply (nested comment)

**Response (201):**
```json
{
  "id": 10,
  "sprintId": 1,
  "userId": 1,
  "content": "This is a comment on the sprint",
  "parentCommentId": null,
  "createdAt": "2024-01-14T10:00:00Z"
}
```

---

### 5.11 Get Sprint Comments

**Endpoint:** `GET /sprints/:id/comments`
**Auth Required:** ✅ Yes

**Response (200):**
```json
[
  {
    "id": 10,
    "sprintId": 1,
    "userId": 1,
    "user": {
      "id": 1,
      "fullName": "Nguyễn Văn A",
      "avatar": "https://..."
    },
    "content": "This is a comment on the sprint",
    "parentCommentId": null,
    "createdAt": "2024-01-14T10:00:00Z"
  }
]
```

---

### 5.12 Get Comment Replies

**Endpoint:** `GET /sprints/comments/:commentId/replies`
**Auth Required:** ✅ Yes

**Response (200):**
```json
[
  {
    "id": 11,
    "parentCommentId": 10,
    "userId": 2,
    "user": {
      "id": 2,
      "fullName": "Nguyễn Văn B"
    },
    "content": "This is a reply",
    "createdAt": "2024-01-14T10:05:00Z"
  }
]
```

---

## 6. Tasks Management

### 6.1 Create Task

**Endpoint:** `POST /tasks`
**Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "projectId": 1,
  "sprintId": 1,
  "title": "Implement login API",
  "description": "Create login endpoint with JWT",
  "type": "story",
  "priority": "high",
  "status": "todo",
  "assigneeId": 2,
  "parentTaskId": null,
  "estimatedTime": 8,
  "dueDate": "2024-01-20"
}
```

**Field Descriptions:**
- `type`: `story`, `task`, `bug`, `epic`
- `priority`: `lowest`, `low`, `medium`, `high`, `highest`
- `status`: `todo`, `in_progress`, `in_review`, `done`
- `estimatedTime`: Số giờ ước tính (optional)
- `parentTaskId`: ID của parent task (optional, cho subtask)

**Response (201):**
```json
{
  "id": 10,
  "projectId": 1,
  "sprintId": 1,
  "title": "Implement login API",
  "description": "Create login endpoint with JWT",
  "type": "story",
  "priority": "high",
  "status": "todo",
  "reporterId": 1,
  "assigneeId": 2,
  "parentTaskId": null,
  "estimatedTime": 8,
  "dueDate": "2024-01-20T00:00:00Z",
  "createdAt": "2024-01-14T10:00:00Z"
}
```

---

### 6.2 Get All Tasks

**Endpoint:** `GET /tasks`
**Auth Required:** ✅ Yes
**Query Params:**
- `?projectId=1` - Filter by project
- `?sprintId=1` - Filter by sprint
- `?assigneeId=2` - Filter by assignee

**Response (200):**
```json
[
  {
    "id": 10,
    "projectId": 1,
    "sprintId": 1,
    "title": "Implement login API",
    "type": "story",
    "priority": "high",
    "status": "in_progress",
    "assignee": {
      "id": 2,
      "fullName": "Nguyễn Văn B",
      "avatar": "https://..."
    },
    "reporter": {
      "id": 1,
      "fullName": "Nguyễn Văn A"
    },
    "createdAt": "2024-01-14T10:00:00Z",
    "updatedAt": "2024-01-14T11:00:00Z"
  }
]
```

---

### 6.3 Get Task by ID

**Endpoint:** `GET /tasks/:id`
**Auth Required:** ✅ Yes

**Response (200):**
```json
{
  "id": 10,
  "projectId": 1,
  "sprintId": 1,
  "title": "Implement login API",
  "description": "Create login endpoint with JWT",
  "type": "story",
  "priority": "high",
  "status": "in_progress",
  "reporterId": 1,
  "assigneeId": 2,
  "parentTaskId": null,
  "estimatedTime": 8,
  "actualTime": 5,
  "dueDate": "2024-01-20T00:00:00Z",
  "assignee": {
    "id": 2,
    "fullName": "Nguyễn Văn B",
    "email": "userb@example.com",
    "avatar": "https://..."
  },
  "reporter": {
    "id": 1,
    "fullName": "Nguyễn Văn A"
  },
  "labels": [...],
  "attachments": [...],
  "comments": [...],
  "createdAt": "2024-01-14T10:00:00Z",
  "updatedAt": "2024-01-14T11:00:00Z"
}
```

---

### 6.4 Get Task Subtasks

**Endpoint:** `GET /tasks/:id/subtasks`
**Auth Required:** ✅ Yes

**Response (200):**
```json
[
  {
    "id": 11,
    "parentTaskId": 10,
    "title": "Create user model",
    "status": "done",
    "assignee": {...}
  }
]
```

---

### 6.5 Get Task Assignee

**Endpoint:** `GET /tasks/:id/assignee`
**Auth Required:** ✅ Yes

**Response (200):**
```json
{
  "id": 2,
  "fullName": "Nguyễn Văn B",
  "email": "userb@example.com",
  "avatar": "https://...",
  "username": "userb"
}
```

---

### 6.6 Update Task

**Endpoint:** `PUT /tasks/:id`
**Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "title": "Implement login API v2",
  "description": "Updated description",
  "priority": "highest",
  "status": "in_review",
  "estimatedTime": 10
}
```

**Response (200):**
```json
{
  "id": 10,
  "title": "Implement login API v2",
  "description": "Updated description",
  "priority": "highest",
  "status": "in_review",
  "estimatedTime": 10,
  "updatedAt": "2024-01-14T12:00:00Z"
}
```

---

### 6.7 Update Task Status

**Endpoint:** `PATCH /tasks/:id/status`
**Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "status": "done"
}
```

**Response (200):**
```json
{
  "id": 10,
  "status": "done",
  "updatedAt": "2024-01-14T12:00:00Z"
}
```

---

### 6.8 Assign Task by User ID

**Endpoint:** `PATCH /tasks/:id/assign`
**Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "assigneeId": 3
}
```

**Response (200):**
```json
{
  "id": 10,
  "assigneeId": 3,
  "assignee": {
    "id": 3,
    "fullName": "Nguyễn Văn C",
    "email": "userc@example.com"
  },
  "updatedAt": "2024-01-14T12:00:00Z"
}
```

---

### 6.9 Assign Task by Email

**Endpoint:** `PATCH /tasks/:id/assign-by-email`
**Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "email": "userc@example.com"
}
```

**Response (200):**
```json
{
  "id": 10,
  "assigneeId": 3,
  "assignee": {
    "id": 3,
    "fullName": "Nguyễn Văn C",
    "email": "userc@example.com"
  },
  "updatedAt": "2024-01-14T12:00:00Z"
}
```

---

### 6.10 Update Task Priority

**Endpoint:** `PATCH /tasks/:id/priority`
**Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "priority": "highest"
}
```

**Response (200):**
```json
{
  "id": 10,
  "priority": "highest",
  "updatedAt": "2024-01-14T12:00:00Z"
}
```

---

### 6.11 Delete Task

**Endpoint:** `DELETE /tasks/:id`
**Auth Required:** ✅ Yes

**Response:** `204 No Content`

---

### 6.12 Upload Task Attachment

**Endpoint:** `POST /tasks/:id/attachments`
**Auth Required:** ✅ Yes
**Content-Type:** `multipart/form-data`

**Request Body (Form Data):**
```
file: [File] (Max 10MB)
```

**Supported Types:** Images, PDFs, Documents, etc.

**Response (200):**
```json
{
  "message": "File uploaded successfully",
  "attachment": {
    "id": 20,
    "url": "https://res.cloudinary.com/.../document.pdf",
    "thumbnail": "https://res.cloudinary.com/.../thumb.jpg",
    "filename": "document.pdf",
    "size": 2048576,
    "type": "pdf",
    "uploadedAt": "2024-01-14T10:00:00Z"
  }
}
```

---

### 6.13 Get Task Attachments

**Endpoint:** `GET /tasks/:id/attachments`
**Auth Required:** ✅ Yes

**Response (200):**
```json
{
  "count": 2,
  "attachments": [
    {
      "id": 20,
      "url": "https://res.cloudinary.com/.../document.pdf",
      "thumbnail": null,
      "size": 2048576,
      "format": "pdf",
      "resourceType": "raw",
      "uploadedBy": 1,
      "uploadedAt": "2024-01-14T10:00:00Z"
    },
    {
      "id": 21,
      "url": "https://res.cloudinary.com/.../screenshot.png",
      "thumbnail": "https://res.cloudinary.com/.../thumb.jpg",
      "size": 512000,
      "format": "png",
      "resourceType": "image",
      "uploadedBy": 2,
      "uploadedAt": "2024-01-14T11:00:00Z"
    }
  ]
}
```

---

### 6.14 Delete Task Attachment

**Endpoint:** `DELETE /tasks/:taskId/attachments/:attachmentId`
**Auth Required:** ✅ Yes

**Response:** `204 No Content`

---

## 7. Comments

### 7.1 Create Comment

**Endpoint:** `POST /comments`
**Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "taskId": 10,
  "content": "This is a comment on the task",
  "parentCommentId": null
}
```

**Note:** `parentCommentId` dùng cho reply

**Response (201):**
```json
{
  "id": 30,
  "taskId": 10,
  "userId": 1,
  "content": "This is a comment on the task",
  "parentCommentId": null,
  "createdAt": "2024-01-14T10:00:00Z"
}
```

---

### 7.2 Get Comments by Task

**Endpoint:** `GET /comments`
**Auth Required:** ✅ Yes
**Query Params:** `?taskId=10` (required)

**Response (200):**
```json
[
  {
    "id": 30,
    "taskId": 10,
    "userId": 1,
    "user": {
      "id": 1,
      "fullName": "Nguyễn Văn A",
      "avatar": "https://..."
    },
    "content": "This is a comment on the task",
    "parentCommentId": null,
    "createdAt": "2024-01-14T10:00:00Z",
    "updatedAt": "2024-01-14T10:00:00Z"
  }
]
```

---

### 7.3 Get Comment by ID

**Endpoint:** `GET /comments/:id`
**Auth Required:** ✅ Yes

**Response (200):**
```json
{
  "id": 30,
  "taskId": 10,
  "userId": 1,
  "user": {
    "id": 1,
    "fullName": "Nguyễn Văn A",
    "avatar": "https://..."
  },
  "content": "This is a comment on the task",
  "parentCommentId": null,
  "createdAt": "2024-01-14T10:00:00Z"
}
```

---

### 7.4 Get Comment Replies

**Endpoint:** `GET /comments/:id/replies`
**Auth Required:** ✅ Yes

**Response (200):**
```json
[
  {
    "id": 31,
    "parentCommentId": 30,
    "userId": 2,
    "user": {
      "id": 2,
      "fullName": "Nguyễn Văn B"
    },
    "content": "This is a reply to the comment",
    "createdAt": "2024-01-14T10:05:00Z"
  }
]
```

---

### 7.5 Update Comment

**Endpoint:** `PUT /comments/:id`
**Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "content": "Updated comment content"
}
```

**Response (200):**
```json
{
  "id": 30,
  "content": "Updated comment content",
  "updatedAt": "2024-01-14T12:00:00Z"
}
```

---

### 7.6 Delete Comment

**Endpoint:** `DELETE /comments/:id`
**Auth Required:** ✅ Yes

**Response:** `204 No Content`

---

## 8. Labels

### 8.1 Create Label

**Endpoint:** `POST /labels`
**Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "projectId": 1,
  "name": "Frontend",
  "color": "#FF5733",
  "description": "Frontend related tasks"
}
```

**Response (201):**
```json
{
  "id": 5,
  "projectId": 1,
  "name": "Frontend",
  "color": "#FF5733",
  "description": "Frontend related tasks",
  "createdAt": "2024-01-14T10:00:00Z"
}
```

---

### 8.2 Get Labels by Project

**Endpoint:** `GET /labels`
**Auth Required:** ✅ Yes
**Query Params:** `?projectId=1` (required)

**Response (200):**
```json
[
  {
    "id": 5,
    "projectId": 1,
    "name": "Frontend",
    "color": "#FF5733",
    "description": "Frontend related tasks",
    "createdAt": "2024-01-14T10:00:00Z"
  }
]
```

---

### 8.3 Get Label by ID

**Endpoint:** `GET /labels/:id`
**Auth Required:** ✅ Yes

**Response (200):**
```json
{
  "id": 5,
  "projectId": 1,
  "name": "Frontend",
  "color": "#FF5733",
  "description": "Frontend related tasks",
  "createdAt": "2024-01-14T10:00:00Z"
}
```

---

### 8.4 Update Label

**Endpoint:** `PUT /labels/:id`
**Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "name": "Frontend - React",
  "color": "#FF6633"
}
```

**Response (200):**
```json
{
  "id": 5,
  "name": "Frontend - React",
  "color": "#FF6633",
  "updatedAt": "2024-01-14T12:00:00Z"
}
```

---

### 8.5 Delete Label

**Endpoint:** `DELETE /labels/:id`
**Auth Required:** ✅ Yes

**Response:** `204 No Content`

---

### 8.6 Assign Label to Task

**Endpoint:** `POST /tasks/:taskId/labels`
**Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "labelId": 5
}
```

**Response (201):**
```json
{
  "taskId": 10,
  "labelId": 5,
  "label": {
    "id": 5,
    "name": "Frontend",
    "color": "#FF5733"
  },
  "assignedAt": "2024-01-14T10:00:00Z"
}
```

---

### 8.7 Get Task Labels

**Endpoint:** `GET /tasks/:taskId/labels`
**Auth Required:** ✅ Yes

**Response (200):**
```json
[
  {
    "id": 5,
    "name": "Frontend",
    "color": "#FF5733",
    "description": "Frontend related tasks"
  }
]
```

---

### 8.8 Remove Label from Task

**Endpoint:** `DELETE /tasks/:taskId/labels/:labelId`
**Auth Required:** ✅ Yes

**Response:** `204 No Content`

---

## 9. Task History

### 9.1 Get Task History

**Endpoint:** `GET /task-history`
**Auth Required:** ✅ Yes
**Query Params:** `?taskId=10` (required)

**Response (200):**
```json
[
  {
    "id": 100,
    "taskId": 10,
    "userId": 1,
    "user": {
      "id": 1,
      "fullName": "Nguyễn Văn A",
      "avatar": "https://..."
    },
    "action": "status_changed",
    "field": "status",
    "oldValue": "todo",
    "newValue": "in_progress",
    "description": "Changed status from todo to in_progress",
    "createdAt": "2024-01-14T10:00:00Z"
  },
  {
    "id": 101,
    "taskId": 10,
    "userId": 2,
    "user": {
      "id": 2,
      "fullName": "Nguyễn Văn B"
    },
    "action": "assigned",
    "field": "assigneeId",
    "oldValue": "1",
    "newValue": "2",
    "description": "Assigned to Nguyễn Văn B",
    "createdAt": "2024-01-14T11:00:00Z"
  }
]
```

---

### 9.2 Get User's Task History

**Endpoint:** `GET /task-history/user/:userId`
**Auth Required:** ✅ Yes

**Response (200):**
```json
[
  {
    "id": 100,
    "taskId": 10,
    "task": {
      "id": 10,
      "title": "Implement login API"
    },
    "userId": 1,
    "action": "status_changed",
    "field": "status",
    "oldValue": "todo",
    "newValue": "in_progress",
    "description": "Changed status from todo to in_progress",
    "createdAt": "2024-01-14T10:00:00Z"
  }
]
```

---

## 10. Notifications

### 10.1 Create Notification (Internal API)

**Endpoint:** `POST /notifications`
**Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "userId": 2,
  "type": "task_assigned",
  "title": "Task được gán cho bạn",
  "message": "Bạn được gán task: \"Implement login API\"",
  "relatedEntityType": "task",
  "relatedEntityId": 10
}
```

**Note:** API này thường được gọi bởi backend khi có sự kiện, không cần frontend gọi trực tiếp

**Response (201):**
```json
{
  "id": 50,
  "userId": 2,
  "type": "task_assigned",
  "title": "Task được gán cho bạn",
  "message": "Bạn được gán task: \"Implement login API\"",
  "relatedEntityType": "task",
  "relatedEntityId": 10,
  "isRead": false,
  "createdAt": "2024-01-14T10:00:00Z"
}
```

---

### 10.2 Get User Notifications

**Endpoint:** `GET /notifications/user/:userId`
**Auth Required:** ✅ Yes

**Response (200):**
```json
[
  {
    "id": 50,
    "userId": 2,
    "type": "task_assigned",
    "title": "Task được gán cho bạn",
    "message": "Bạn được gán task: \"Implement login API\"",
    "relatedEntityType": "task",
    "relatedEntityId": 10,
    "isRead": false,
    "createdAt": "2024-01-14T10:00:00Z"
  }
]
```

---

### 10.3 Get Unread Notifications

**Endpoint:** `GET /notifications/user/:userId/unread`
**Auth Required:** ✅ Yes

**Response (200):**
```json
[
  {
    "id": 50,
    "userId": 2,
    "type": "task_assigned",
    "title": "Task được gán cho bạn",
    "message": "Bạn được gán task: \"Implement login API\"",
    "isRead": false,
    "createdAt": "2024-01-14T10:00:00Z"
  }
]
```

---

### 10.4 Get Unread Count

**Endpoint:** `GET /notifications/user/:userId/count`
**Auth Required:** ✅ Yes

**Response (200):**
```json
{
  "count": 5
}
```

---

### 10.5 Get Notification by ID

**Endpoint:** `GET /notifications/:id`
**Auth Required:** ✅ Yes

**Response (200):**
```json
{
  "id": 50,
  "userId": 2,
  "type": "task_assigned",
  "title": "Task được gán cho bạn",
  "message": "Bạn được gán task: \"Implement login API\"",
  "relatedEntityType": "task",
  "relatedEntityId": 10,
  "isRead": false,
  "createdAt": "2024-01-14T10:00:00Z"
}
```

---

### 10.6 Mark Notification as Read

**Endpoint:** `PATCH /notifications/:id/read`
**Auth Required:** ✅ Yes

**Response (200):**
```json
{
  "id": 50,
  "isRead": true,
  "readAt": "2024-01-14T11:00:00Z"
}
```

---

### 10.7 Mark All as Read

**Endpoint:** `PATCH /notifications/user/:userId/read-all`
**Auth Required:** ✅ Yes

**Response (200):**
```json
{
  "message": "Đã đánh dấu 5 notifications là đã đọc",
  "count": 5
}
```

---

### 10.8 Delete Notification

**Endpoint:** `DELETE /notifications/:id`
**Auth Required:** ✅ Yes

**Response:** `204 No Content`

---

### 10.9 Delete All Notifications

**Endpoint:** `DELETE /notifications/user/:userId/all`
**Auth Required:** ✅ Yes

**Response (200):**
```json
{
  "message": "Đã xóa 10 notifications",
  "count": 10
}
```

---

## 11. WebSocket Integration

### 11.1 WebSocket Server Info

**WebSocket URL:** `https://work-management-websocket.onrender.com`
**Namespace:** `/notifications`
**Full URL:** `wss://work-management-websocket.onrender.com/notifications`

---

### 11.2 Connection Setup

**Frontend cần:**
1. Cài đặt Socket.IO client: `npm install socket.io-client`
2. Kết nối với authentication token

**Example Code:**
```typescript
import { io, Socket } from 'socket.io-client';

const WEBSOCKET_URL = 'https://work-management-websocket.onrender.com/notifications';

let socket: Socket | null = null;

export const connectWebSocket = (token: string) => {
  socket = io(WEBSOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('✅ Connected to WebSocket server');
    console.log('Socket ID:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Disconnected:', reason);
  });

  socket.on('notification', (notification) => {
    console.log('🔔 New notification:', notification);
    // Handle notification (show toast, update UI, etc.)
  });

  socket.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });

  return socket;
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
```

---

### 11.3 Events từ Server → Client

#### Event: `notification`

**Trigger:** Khi backend gọi API trigger notification cho user

**Data Structure:**
```typescript
{
  type: 'task_assigned' | 'task_updated' | 'comment_added' | 'task_status_changed' |
        'task_priority_changed' | 'sprint_started' | 'sprint_completed' |
        'project_member_added' | 'project_updated' | 'mention',
  title: string,
  message: string,
  userId: number,
  relatedEntityType?: 'task' | 'project' | 'sprint',
  relatedEntityId?: number,
  createdAt: string
}
```

**Example:**
```json
{
  "type": "task_assigned",
  "title": "Task được gán cho bạn",
  "message": "Bạn được gán task: \"Implement login API\"",
  "userId": 2,
  "relatedEntityType": "task",
  "relatedEntityId": 10,
  "createdAt": "2024-01-14T10:00:00Z"
}
```

---

### 11.4 Notification Scenarios

#### 1. Task Assigned
**Trigger:** Khi task được assign cho user
**Type:** `task_assigned`
**Backend API:** `PATCH /tasks/:id/assign` hoặc `PATCH /tasks/:id/assign-by-email`

**Notification:**
```json
{
  "type": "task_assigned",
  "title": "Task được gán cho bạn",
  "message": "Bạn được gán task: \"Implement login API\"",
  "relatedEntityType": "task",
  "relatedEntityId": 10
}
```

---

#### 2. Task Updated
**Trigger:** Khi task bị update (title, description, etc.)
**Type:** `task_updated`
**Backend API:** `PUT /tasks/:id`

**Notification:**
```json
{
  "type": "task_updated",
  "title": "Task được cập nhật",
  "message": "Task \"Implement login API\" đã được cập nhật bởi Nguyễn Văn A",
  "relatedEntityType": "task",
  "relatedEntityId": 10
}
```

---

#### 3. Comment Added
**Trigger:** Khi có comment mới trên task user đang theo dõi
**Type:** `comment_added`
**Backend API:** `POST /comments`

**Notification:**
```json
{
  "type": "comment_added",
  "title": "Comment mới",
  "message": "Nguyễn Văn A đã comment trên task \"Implement login API\"",
  "relatedEntityType": "task",
  "relatedEntityId": 10
}
```

---

#### 4. Task Status Changed
**Trigger:** Khi status của task thay đổi
**Type:** `task_status_changed`
**Backend API:** `PATCH /tasks/:id/status`

**Notification:**
```json
{
  "type": "task_status_changed",
  "title": "Trạng thái task thay đổi",
  "message": "Task \"Implement login API\" đã chuyển sang In Progress",
  "relatedEntityType": "task",
  "relatedEntityId": 10
}
```

---

#### 5. Task Priority Changed
**Trigger:** Khi priority của task thay đổi
**Type:** `task_priority_changed`
**Backend API:** `PATCH /tasks/:id/priority`

**Notification:**
```json
{
  "type": "task_priority_changed",
  "title": "Độ ưu tiên task thay đổi",
  "message": "Task \"Implement login API\" đã được đặt priority Highest",
  "relatedEntityType": "task",
  "relatedEntityId": 10
}
```

---

#### 6. Sprint Started
**Trigger:** Khi sprint được start
**Type:** `sprint_started`
**Backend API:** `PATCH /sprints/:id/start`

**Notification:**
```json
{
  "type": "sprint_started",
  "title": "Sprint đã bắt đầu",
  "message": "Sprint \"Sprint 1\" đã bắt đầu",
  "relatedEntityType": "sprint",
  "relatedEntityId": 1
}
```

---

#### 7. Sprint Completed
**Trigger:** Khi sprint hoàn thành
**Type:** `sprint_completed`
**Backend API:** `PATCH /sprints/:id/complete`

**Notification:**
```json
{
  "type": "sprint_completed",
  "title": "Sprint đã hoàn thành",
  "message": "Sprint \"Sprint 1\" đã hoàn thành",
  "relatedEntityType": "sprint",
  "relatedEntityId": 1
}
```

---

#### 8. Project Member Added
**Trigger:** Khi user được thêm vào project
**Type:** `project_member_added`
**Backend API:** `POST /projects/:projectId/members`

**Notification:**
```json
{
  "type": "project_member_added",
  "title": "Bạn được thêm vào project",
  "message": "Bạn được thêm vào project \"Project Alpha\" với role Member",
  "relatedEntityType": "project",
  "relatedEntityId": 1
}
```

---

#### 9. Project Updated
**Trigger:** Khi project bị update
**Type:** `project_updated`
**Backend API:** `PUT /projects/:id`

**Notification:**
```json
{
  "type": "project_updated",
  "title": "Project được cập nhật",
  "message": "Project \"Project Alpha\" đã được cập nhật",
  "relatedEntityType": "project",
  "relatedEntityId": 1
}
```

---

#### 10. Mention
**Trigger:** Khi user được @ mention trong comment
**Type:** `mention`
**Backend API:** `POST /comments` (với @username trong content)

**Notification:**
```json
{
  "type": "mention",
  "title": "Bạn được nhắc đến",
  "message": "Nguyễn Văn A đã nhắc đến bạn trong một comment",
  "relatedEntityType": "task",
  "relatedEntityId": 10
}
```

---

### 11.5 Complete Integration Flow

**Flow:**
```
1. User Login
   ↓
2. Frontend nhận accessToken
   ↓
3. Frontend connect WebSocket với token
   ↓
4. User thực hiện action (assign task, comment, etc.)
   ↓
5. Frontend gọi REST API (Vercel)
   ↓
6. Backend xử lý logic + lưu DB
   ↓
7. Backend gọi HTTP POST đến WebSocket server (Render)
   ↓
8. WebSocket server broadcast notification
   ↓
9. Frontend nhận event 'notification' real-time
   ↓
10. Frontend hiển thị toast/update UI
```

---

### 11.6 Example: Complete React Component

```typescript
import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const WEBSOCKET_URL = 'https://work-management-websocket.onrender.com/notifications';

interface Notification {
  type: string;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  createdAt: string;
}

export const NotificationProvider: React.FC = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const newSocket = io(WEBSOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to WebSocket');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket');
      setIsConnected(false);
    });

    newSocket.on('notification', (notification: Notification) => {
      console.log('🔔 New notification:', notification);
      setNotifications(prev => [notification, ...prev]);

      // Show toast notification
      showToast(notification.title, notification.message);
    });

    newSocket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const showToast = (title: string, message: string) => {
    // Implement toast notification
    alert(`${title}\n${message}`);
  };

  return (
    <div>
      {isConnected && <div className="status">🟢 Connected</div>}
      {!isConnected && <div className="status">🔴 Disconnected</div>}
      {children}
    </div>
  );
};
```

---

## 🔗 Postman Collection

Import file: `Work-Management-Production.postman_environment.json`

**Variables:**
- `base_url`: `https://work-management-chi.vercel.app`
- `websocket_url`: `https://work-management-websocket.onrender.com`
- `access_token`: (auto-set sau khi login)
- `user_id`: (auto-set sau khi login)

---

## ❗ Important Notes

1. **Authentication Token:** Tất cả APIs (trừ Public) yêu cầu Bearer token
2. **WebSocket vs REST API:**
   - REST API (Vercel): Tất cả CRUD operations
   - WebSocket (Render): CHỈ real-time notifications
3. **CORS:** Frontend production đã được whitelist
4. **Rate Limiting:** Không áp dụng trong free tier
5. **File Upload:** Max 5MB cho avatar, 10MB cho attachments
6. **Pagination:** Chưa implement, tất cả APIs trả về full list

---

**Last Updated:** 2024-01-14
**Version:** 1.0.0

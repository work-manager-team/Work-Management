# API Documentation - Work Management System

Base URL: `http://localhost:3000` (Development)

---

## 📌 Table of Contents
- [Users APIs](#users-apis)
- [Projects APIs](#projects-apis)
- [Sprints APIs](#sprints-apis)
- [Tasks APIs](#tasks-apis)
- [Comments APIs](#comments-apis)
- [Notifications APIs](#notifications-apis)
- [Project Members APIs](#project-members-apis)

---

## 🔐 Users APIs

### 1. Create User (Register)
```http
POST /users
```
**Body:**
```json
{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "password123",
  "fullName": "John Doe",
  "avatarUrl": "https://example.com/avatar.jpg" // optional
}
```

### 2. Login
```http
POST /users/login
```
**Body:**
```json
{
  "emailOrUsername": "john_doe",
  "password": "password123"
}
```
**Response:**
```json
{
  "statusCode": 200,
  "message": "Đăng nhập thành công",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "john_doe",
    "fullName": "John Doe"
  }
}
```

### 3. ✨ Change Password
```http
PATCH /users/:id/change-password
```
**Body:**
```json
{
  "oldPassword": "password123",
  "newPassword": "newPassword456"
}
```

### 4. Get All Users
```http
GET /users
```

### 5. Get User by ID
```http
GET /users/:id
```

### 6. Update User
```http
PUT /users/:id
```
**Body:**
```json
{
  "fullName": "John Updated",
  "avatarUrl": "https://example.com/new-avatar.jpg"
}
```

### 7. Delete User
```http
DELETE /users/:id
```

---

## 📁 Projects APIs

### 1. Create Project
```http
POST /projects
```
**Body:**
```json
{
  "name": "My Project",
  "description": "Project description",
  "key": "MP",
  "status": "active",
  "visibility": "team"
}
```

### 2. Get All Projects
```http
GET /projects
```

### 3. Get Projects by User ID
```http
GET /projects?userId=1
```

### 4. ✨ Search Projects by Name
```http
GET /projects/search?name=project
```
**Query Params:**
- `name`: Search term (case-insensitive)

### 5. ✨ Get Total Project Count
```http
GET /projects/count
```
**Response:**
```json
{
  "count": 15
}
```

### 6. Get Project by ID
```http
GET /projects/:id
```

### 7. ✨ Get Project Details (with statistics)
```http
GET /projects/:id/details
```
**Response:**
```json
{
  "id": 1,
  "name": "My Project",
  "description": "...",
  "memberCount": 5,
  "totalSprints": 10,
  "completedSprints": 7
}
```

### 8. ✨ Get Project Activities/History
```http
GET /projects/:id/activities?limit=50
```
**Query Params:**
- `limit`: Number of activities to return (default: 50)

**Response:**
```json
[
  {
    "id": 1,
    "type": "status_changed",
    "fieldName": "status",
    "oldValue": "todo",
    "newValue": "in_progress",
    "createdAt": "2024-01-01T10:00:00Z",
    "user": {
      "id": 1,
      "username": "john_doe",
      "fullName": "John Doe",
      "avatarUrl": "..."
    },
    "task": {
      "id": 5,
      "title": "Task title",
      "taskKey": "MP-5"
    }
  }
]
```

### 9. Get User Role in Project
```http
GET /projects/:id/role
```

### 10. Update Project
```http
PUT /projects/:id
```

### 11. Delete Project
```http
DELETE /projects/:id
```

---

## 🏃 Sprints APIs

### 1. Create Sprint
```http
POST /sprints
```
**Body:**
```json
{
  "projectId": 1,
  "name": "Sprint 1",
  "goal": "Complete user authentication",
  "startDate": "2024-01-01",
  "endDate": "2024-01-14"
}
```

### 2. Get Sprints by Project
```http
GET /sprints?projectId=1
```

### 3. Get Sprint by ID
```http
GET /sprints/:id
```

### 4. Update Sprint
```http
PUT /sprints/:id
```

### 5. Delete Sprint
```http
DELETE /sprints/:id
```

### 6. ✅ Start Sprint (Change Status)
```http
PATCH /sprints/:id/start
```
**Description:** Changes sprint status from `planned` to `active`

### 7. ✅ Complete Sprint (Change Status)
```http
PATCH /sprints/:id/complete
```
**Description:** Changes sprint status from `active` to `completed`

### 7b. ✨ Cancel Sprint (NEW)
```http
PATCH /sprints/:id/cancel
```
**Description:** Cancels a sprint. Can cancel sprints in `planned` or `active` status.

**Requirements:**
- Only Admin role can cancel sprints
- Cannot cancel already completed sprints
- Status will change to `cancelled`

**Error Responses:**
- `400 Bad Request` - Sprint already completed or cancelled
- `403 Forbidden` - User doesn't have admin permission

### 8. ✨ Create Sprint Comment
```http
POST /sprints/:id/comments
```
**Body:**
```json
{
  "content": "Sprint is progressing well",
  "parentCommentId": null  // optional, for replies
}
```

### 9. ✨ Get Sprint Comments
```http
GET /sprints/:id/comments
```

### 10. ✨ Get Sprint Comment Replies
```http
GET /sprints/comments/:commentId/replies
```

---

## ✅ Tasks APIs

### 1. Create Task
```http
POST /tasks
```
**Body:**
```json
{
  "projectId": 1,
  "sprintId": 1,
  "title": "Implement login feature",
  "description": "...",
  "type": "task",
  "priority": "high",
  "status": "todo",
  "reporterId": 1,
  "assigneeId": 2
}
```

### 2. Get Tasks by Sprint
```http
GET /tasks?sprintId=1
```

### 3. Get Task by ID
```http
GET /tasks/:id
```

### 4. Get Subtasks
```http
GET /tasks/:id/subtasks
```

### 5. Update Task
```http
PUT /tasks/:id
```

### 6. Update Task Status
```http
PATCH /tasks/:id/status
```
**Body:**
```json
{
  "status": "in_progress"
}
```

### 7. Assign Task
```http
PATCH /tasks/:id/assign
```
**Body:**
```json
{
  "assigneeId": 2
}
```

### 8. Delete Task
```http
DELETE /tasks/:id
```

---

## 💬 Comments APIs

### 1. Create Comment (for Tasks)
```http
POST /comments
```
**Body:**
```json
{
  "taskId": 1,
  "content": "This is a comment",
  "parentCommentId": null  // optional, for replies
}
```

### 2. Get Comments by Task
```http
GET /comments?taskId=1
```

### 3. Get Comment Replies
```http
GET /comments/:id/replies
```

### 4. Update Comment
```http
PUT /comments/:id
```

### 5. Delete Comment
```http
DELETE /comments/:id
```

---

## 🔔 Notifications APIs

### 1. Create Notification
```http
POST /notifications
```
**Body:**
```json
{
  "userId": 1,
  "taskId": 5,
  "projectId": 1,
  "type": "task_assigned",
  "title": "You were assigned a task",
  "message": "Task MP-5 has been assigned to you"
}
```

### 2. Get User Notifications
```http
GET /notifications/user/:userId
```

### 3. Get Unread Notifications
```http
GET /notifications/user/:userId/unread
```

### 4. Get Unread Count
```http
GET /notifications/user/:userId/count
```
**Response:**
```json
{
  "count": 3
}
```

### 5. Mark Notification as Read
```http
PATCH /notifications/:id/read
```

### 6. Mark All as Read
```http
PATCH /notifications/user/:userId/read-all
```

### 7. Delete Notification
```http
DELETE /notifications/:id
```

### 8. Delete All Notifications
```http
DELETE /notifications/user/:userId/all
```

---

## 👥 Project Members APIs

### 1. Add Member to Project
```http
POST /projects/:projectId/members
```
**Body:**
```json
{
  "userId": 2,
  "role": "member"
}
```

### 2. Get Project Members
```http
GET /projects/:projectId/members
```

### 3. Get Active Members Only
```http
GET /projects/:projectId/members/active
```

### 4. Accept Invitation
```http
PATCH /projects/:projectId/members/:userId/accept
```

### 5. Update Member Role
```http
PATCH /projects/:projectId/members/:userId/role
```
**Body:**
```json
{
  "role": "admin"
}
```

### 6. Remove Member
```http
DELETE /projects/:projectId/members/:userId
```

---

## 📊 Summary of New APIs

### ✨ Recently Added APIs:

1. **PATCH /users/:id/change-password** - Đổi mật khẩu
2. **GET /projects/search?name=...** - Tìm kiếm project theo tên
3. **GET /projects/count** - Đếm tổng số project
4. **GET /projects/:id/details** - Lấy thông tin chi tiết project (số member, sprint, etc.)
5. **GET /projects/:id/activities** - Lấy lịch sử hoạt động của project
6. **PATCH /sprints/:id/start** - Bắt đầu sprint
7. **PATCH /sprints/:id/complete** - Hoàn thành sprint
8. **PATCH /sprints/:id/cancel** - Hủy sprint (NEW) ✨
9. **POST /sprints/:id/comments** - Tạo comment cho sprint
10. **GET /sprints/:id/comments** - Lấy comments của sprint
11. **GET /sprints/comments/:commentId/replies** - Lấy replies của comment

---

## 🎯 Common Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` - Resource deleted successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate email)
- `500 Internal Server Error` - Server error

---

## 🔑 Authentication Note

Currently, the API uses hardcoded `userId = 1` for demonstration purposes. In production, implement JWT authentication and extract the user ID from the token.

Example implementation:
```typescript
// TODO: Replace hardcoded userId with JWT
const userId = req.user.id; // from JWT token
```

---

## 📝 Testing Examples

### Using cURL:

```bash
# Create a project
curl -X POST http://localhost:3000/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "key": "TP",
    "description": "A test project"
  }'

# Search projects
curl http://localhost:3000/projects/search?name=test

# Get project activities
curl http://localhost:3000/projects/1/activities?limit=20

# Change password
curl -X PATCH http://localhost:3000/users/1/change-password \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "old123",
    "newPassword": "new456"
  }'
```

---

## 🚀 Development Setup

1. Install dependencies:
```bash
npm install
```

2. Setup environment variables (`.env`):
```env
DATABASE_URL=your-database-url
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

3. Run migrations:
```bash
npx drizzle-kit push
```

4. Start development server:
```bash
npm run start:dev
```

Server will be available at `http://localhost:3000`

---

**Last Updated:** December 2024

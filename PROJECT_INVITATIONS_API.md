# Project Invitations API

## Tổng quan

Hệ thống invitations cho phép người dùng được mời vào project và có thể accept hoặc reject lời mời.

## WebSocket Notification

Khi một user được mời vào project:
- Notification sẽ được lưu vào database
- WebSocket notification sẽ được gửi real-time đến user qua Render.com WebSocket server
- Notification type: `added_to_project`

## API Endpoints

### 1. Lấy danh sách invitations của user

**GET** `/projects/my-invitations`

**Authentication**: Required (JWT)

**Response**:
```json
[
  {
    "id": 1,
    "role": "member",
    "invitedAt": "2024-01-15T10:00:00.000Z",
    "project": {
      "id": 5,
      "name": "Project Name",
      "key": "PROJ",
      "description": "Project description",
      "status": "active",
      "visibility": "private"
    },
    "invitedBy": {
      "id": 2,
      "username": "john_doe",
      "fullName": "John Doe",
      "email": "john@example.com",
      "avatarUrl": "https://..."
    }
  }
]
```

### 2. Accept invitation

**POST** `/project-invitations/:invitationId/accept`

**Authentication**: Required (JWT)

**Params**:
- `invitationId` (number): ID của invitation trong bảng `projectMembers`

**Response**:
```json
{
  "id": 1,
  "projectId": 5,
  "userId": 10,
  "role": "member",
  "status": "active",
  "invitedBy": 2,
  "invitedAt": "2024-01-15T10:00:00.000Z",
  "joinedAt": "2024-01-15T11:00:00.000Z"
}
```

**Notifications**:
- Gửi notification đến user với type `invitation_accepted`
- WebSocket notification real-time

**Errors**:
- `404`: Lời mời không tồn tại
- `403`: User không có quyền accept lời mời này (invitation không phải của user)
- `409`: Lời mời đã được xử lý hoặc không còn hợp lệ

### 3. Reject invitation

**POST** `/project-invitations/:invitationId/reject`

**Authentication**: Required (JWT)

**Params**:
- `invitationId` (number): ID của invitation trong bảng `projectMembers`

**Response**:
```json
{
  "statusCode": 200,
  "message": "Đã từ chối lời mời thành công"
}
```

**Notifications**:
- Gửi notification đến user với type `invitation_rejected`
- WebSocket notification real-time

**Errors**:
- `404`: Lời mời không tồn tại
- `403`: User không có quyền reject lời mời này (invitation không phải của user)
- `409`: Lời mời đã được xử lý hoặc không còn hợp lệ

## Database Schema

### Table: `project_members`

```sql
id: bigserial (primary key)
projectId: bigint (foreign key -> projects.id)
userId: bigint (foreign key -> users.id)
role: project_role ('viewer', 'member', 'admin')
status: member_status ('invited', 'active', 'removed')
invitedBy: bigint (foreign key -> users.id)
invitedAt: timestamp
joinedAt: timestamp
```

### Status Flow

```
invited -> active (khi accept)
invited -> removed (khi reject)
```

## Notification Types

- `added_to_project`: Khi được mời vào project
- `invitation_accepted`: Khi accept lời mời
- `invitation_rejected`: Khi reject lời mời

## Architecture

```
Frontend
   ↓
NestJS API (Vercel)
   ↓
PostgreSQL (Neon)
   ↓
Notification Helper
   ↓
WebSocket Trigger Service
   ↓
WebSocket Server (Render.com)
   ↓
Frontend (real-time notification)
```

## Example Flow

1. **Admin mời user vào project**:
   - Admin calls `POST /projects/:projectId/members` với `userId`
   - Status = 'invited'
   - WebSocket notification gửi đến user
   - User nhận được notification real-time

2. **User xem danh sách invitations**:
   - User calls `GET /projects/my-invitations`
   - Nhận danh sách các project đang được mời (status = 'invited')

3. **User accept invitation**:
   - User calls `POST /project-invitations/:invitationId/accept`
   - Status chuyển sang 'active'
   - `joinedAt` được set = current timestamp
   - WebSocket notification xác nhận

4. **User reject invitation**:
   - User calls `POST /project-invitations/:invitationId/reject`
   - Status chuyển sang 'removed'
   - WebSocket notification xác nhận

## Security

- Invitation ID được verify với authenticated user
- User chỉ có thể accept/reject invitation của chính mình
- Status validation đảm bảo invitation chưa được xử lý
- JWT authentication required cho tất cả endpoints

## Notes

- API cũ `PATCH /projects/:projectId/members/:userId/accept` vẫn còn hoạt động nhưng nên dùng API mới
- WebSocket server chạy trên Render.com (riêng biệt với REST API trên Vercel)
- JWT_EMAIL_SECRET được dùng cho cả Vercel và Render để verify tokens

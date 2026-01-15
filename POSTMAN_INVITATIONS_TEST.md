# Test Project Invitations API - Postman

## Setup

1. **Base URL**: `http://localhost:3000` (local) hoặc `https://your-api.vercel.app` (production)
2. **Authorization**: Thêm header `Authorization: Bearer <access_token>`

---

## 1. Mời user vào project

```
POST /projects/:projectId/members
```

**Body (JSON)**:
```json
{
  "userId": 15,
  "role": "member"
}
```

**Response**:
```json
{
  "id": 123,
  "projectId": 5,
  "userId": 15,
  "role": "member",
  "status": "invited",
  "invitedBy": 2,
  "invitedAt": "2024-01-15T10:00:00.000Z",
  "joinedAt": null
}
```

---

## 2. Lấy danh sách invitations

```
GET /projects/my-invitations
```

**Response**:
```json
[
  {
    "id": 123,
    "role": "member",
    "invitedAt": "2024-01-15T10:00:00.000Z",
    "project": {
      "id": 5,
      "name": "Project Name",
      "key": "PROJ"
    },
    "invitedBy": {
      "id": 2,
      "username": "admin",
      "fullName": "Admin User"
    }
  }
]
```

**Note**: Lấy `id` (123) từ response này để dùng cho bước 3 và 4

---

## 3. Accept invitation

```
POST /project-invitations/:invitationId/accept
```

**Example**:
```
POST /project-invitations/123/accept
```

**Body**: Không cần body (empty)

**Response**:
```json
{
  "id": 123,
  "projectId": 5,
  "userId": 15,
  "role": "member",
  "status": "active",
  "joinedAt": "2024-01-15T11:00:00.000Z"
}
```

---

## 4. Reject invitation

```
POST /project-invitations/:invitationId/reject
```

**Example**:
```
POST /project-invitations/123/reject
```

**Body**: Không cần body (empty)

**Response**:
```json
{
  "statusCode": 200,
  "message": "Đã từ chối lời mời thành công"
}
```

---

## Test Flow

### Scenario 1: Accept invitation

1. **Admin** mời user: `POST /projects/5/members` với `userId: 15`
2. **User 15** xem invitations: `GET /projects/my-invitations` → lấy `id: 123`
3. **User 15** accept: `POST /project-invitations/123/accept`
4. **User 15** kiểm tra lại: `GET /projects/my-invitations` → list rỗng (đã accept)

### Scenario 2: Reject invitation

1. **Admin** mời user: `POST /projects/5/members` với `userId: 15`
2. **User 15** xem invitations: `GET /projects/my-invitations` → lấy `id: 124`
3. **User 15** reject: `POST /project-invitations/124/reject`
4. **User 15** kiểm tra lại: `GET /projects/my-invitations` → list rỗng (đã reject)

---

## Common Errors

| Status | Error | Nguyên nhân |
|--------|-------|-------------|
| 401 | Unauthorized | Token không hợp lệ |
| 403 | Forbidden | Invitation không phải của user này |
| 404 | Not Found | invitationId không tồn tại |
| 409 | Conflict | Invitation đã được xử lý rồi |

---

## Postman Collection

Tạo collection với 4 requests:

1. **Invite User**
   - Method: POST
   - URL: `{{baseUrl}}/projects/{{projectId}}/members`
   - Headers: `Authorization: Bearer {{token}}`
   - Body: `{"userId": 15, "role": "member"}`

2. **Get My Invitations**
   - Method: GET
   - URL: `{{baseUrl}}/projects/my-invitations`
   - Headers: `Authorization: Bearer {{token}}`

3. **Accept Invitation**
   - Method: POST
   - URL: `{{baseUrl}}/project-invitations/{{invitationId}}/accept`
   - Headers: `Authorization: Bearer {{token}}`

4. **Reject Invitation**
   - Method: POST
   - URL: `{{baseUrl}}/project-invitations/{{invitationId}}/reject`
   - Headers: `Authorization: Bearer {{token}}`

### Variables
```
baseUrl: http://localhost:3000
token: <your_access_token>
projectId: 5
invitationId: 123
```

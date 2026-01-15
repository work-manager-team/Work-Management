# Hướng dẫn sử dụng Project Invitations API

## Luồng hoạt động (Flow)

```
1. Admin mời user → User nhận WebSocket notification
2. User xem danh sách invitations
3. User accept hoặc reject invitation
4. System cập nhật status và gửi notification xác nhận
```

## 1. Admin/Owner mời user vào project

### Endpoint
```
POST /projects/:projectId/members
```

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request Body
```json
{
  "userId": 15,
  "role": "member"  // "viewer" | "member" | "admin"
}
```

### Response
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

### WebSocket Notification (Real-time)
User với `userId: 15` sẽ nhận được notification qua WebSocket:
```json
{
  "id": 456,
  "type": "added_to_project",
  "title": "Bạn được thêm vào dự án",
  "message": "Bạn đã được thêm vào dự án \"Project Name\"",
  "taskId": null,
  "projectId": 5,
  "isRead": false,
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

### Ví dụ với Axios (Frontend)
```javascript
const inviteUserToProject = async (projectId, userId, role) => {
  try {
    const response = await axios.post(
      `${API_URL}/projects/${projectId}/members`,
      {
        userId: userId,
        role: role || 'member'
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    console.log('User invited:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error inviting user:', error.response?.data);
    throw error;
  }
};

// Sử dụng
inviteUserToProject(5, 15, 'member');
```

---

## 2. User xem danh sách invitations

### Endpoint
```
GET /projects/my-invitations
```

### Headers
```
Authorization: Bearer <access_token>
```

### Response
```json
[
  {
    "id": 123,
    "role": "member",
    "invitedAt": "2024-01-15T10:00:00.000Z",
    "project": {
      "id": 5,
      "name": "E-Commerce Platform",
      "key": "ECOM",
      "description": "Online shopping platform",
      "status": "active",
      "visibility": "private"
    },
    "invitedBy": {
      "id": 2,
      "username": "john_admin",
      "fullName": "John Admin",
      "email": "john@company.com",
      "avatarUrl": "https://example.com/avatar.jpg"
    }
  },
  {
    "id": 124,
    "role": "viewer",
    "invitedAt": "2024-01-14T15:30:00.000Z",
    "project": {
      "id": 7,
      "name": "Mobile App",
      "key": "MOBILE",
      "description": "iOS and Android app",
      "status": "planning",
      "visibility": "team"
    },
    "invitedBy": {
      "id": 3,
      "username": "sarah_pm",
      "fullName": "Sarah PM",
      "email": "sarah@company.com",
      "avatarUrl": null
    }
  }
]
```

### Ví dụ với Axios (Frontend)
```javascript
const getMyInvitations = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/projects/my-invitations`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    console.log('My invitations:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching invitations:', error.response?.data);
    throw error;
  }
};

// Sử dụng
const invitations = await getMyInvitations();
```

### Ví dụ React Component
```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function InvitationsList() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/projects/my-invitations`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          }
        );
        setInvitations(response.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="invitations-list">
      <h2>Lời mời tham gia dự án ({invitations.length})</h2>
      {invitations.map((invitation) => (
        <div key={invitation.id} className="invitation-card">
          <h3>{invitation.project.name}</h3>
          <p>Role: {invitation.role}</p>
          <p>Invited by: {invitation.invitedBy.fullName}</p>
          <button onClick={() => handleAccept(invitation.id)}>
            Accept
          </button>
          <button onClick={() => handleReject(invitation.id)}>
            Reject
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 3. User Accept Invitation

### Endpoint
```
POST /project-invitations/:invitationId/accept
```

### Headers
```
Authorization: Bearer <access_token>
```

### Path Parameters
- `invitationId`: ID của invitation (lấy từ `GET /projects/my-invitations`)

### Response
```json
{
  "id": 123,
  "projectId": 5,
  "userId": 15,
  "role": "member",
  "status": "active",
  "invitedBy": 2,
  "invitedAt": "2024-01-15T10:00:00.000Z",
  "joinedAt": "2024-01-15T11:30:00.000Z"
}
```

### WebSocket Notification (Real-time)
```json
{
  "id": 457,
  "type": "invitation_accepted",
  "title": "Bạn đã tham gia dự án",
  "message": "Bạn đã chấp nhận lời mời và trở thành thành viên của dự án \"E-Commerce Platform\"",
  "taskId": null,
  "projectId": 5,
  "isRead": false,
  "createdAt": "2024-01-15T11:30:00.000Z"
}
```

### Ví dụ với Axios (Frontend)
```javascript
const acceptInvitation = async (invitationId) => {
  try {
    const response = await axios.post(
      `${API_URL}/project-invitations/${invitationId}/accept`,
      {},  // Empty body
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    console.log('Invitation accepted:', response.data);
    alert('Bạn đã tham gia dự án thành công!');
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      alert('Lời mời không tồn tại');
    } else if (error.response?.status === 409) {
      alert('Lời mời này đã được xử lý rồi');
    } else if (error.response?.status === 403) {
      alert('Bạn không có quyền accept lời mời này');
    } else {
      alert('Có lỗi xảy ra');
    }
    throw error;
  }
};

// Sử dụng
acceptInvitation(123);
```

---

## 4. User Reject Invitation

### Endpoint
```
POST /project-invitations/:invitationId/reject
```

### Headers
```
Authorization: Bearer <access_token>
```

### Path Parameters
- `invitationId`: ID của invitation

### Response
```json
{
  "statusCode": 200,
  "message": "Đã từ chối lời mời thành công"
}
```

### WebSocket Notification (Real-time)
```json
{
  "id": 458,
  "type": "invitation_rejected",
  "title": "Bạn đã từ chối lời mời",
  "message": "Bạn đã từ chối lời mời tham gia dự án \"E-Commerce Platform\"",
  "taskId": null,
  "projectId": 5,
  "isRead": false,
  "createdAt": "2024-01-15T11:30:00.000Z"
}
```

### Ví dụ với Axios (Frontend)
```javascript
const rejectInvitation = async (invitationId) => {
  try {
    const response = await axios.post(
      `${API_URL}/project-invitations/${invitationId}/reject`,
      {},  // Empty body
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    console.log('Invitation rejected:', response.data);
    alert('Đã từ chối lời mời');
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      alert('Lời mời không tồn tại');
    } else if (error.response?.status === 409) {
      alert('Lời mời này đã được xử lý rồi');
    } else if (error.response?.status === 403) {
      alert('Bạn không có quyền reject lời mời này');
    } else {
      alert('Có lỗi xảy ra');
    }
    throw error;
  }
};

// Sử dụng
rejectInvitation(123);
```

---

## 5. Complete React Example

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'; // hoặc thư viện notification khác

const API_URL = process.env.REACT_APP_API_URL;

function ProjectInvitations() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const accessToken = localStorage.getItem('access_token');

  // Fetch invitations
  const fetchInvitations = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/projects/my-invitations`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );
      setInvitations(response.data);
    } catch (error) {
      toast.error('Không thể tải danh sách lời mời');
    } finally {
      setLoading(false);
    }
  };

  // Accept invitation
  const handleAccept = async (invitationId) => {
    try {
      await axios.post(
        `${API_URL}/project-invitations/${invitationId}/accept`,
        {},
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );

      toast.success('Đã tham gia dự án thành công!');

      // Remove from list
      setInvitations(prev =>
        prev.filter(inv => inv.id !== invitationId)
      );
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error('Lời mời này đã được xử lý rồi');
      } else {
        toast.error('Có lỗi xảy ra');
      }
    }
  };

  // Reject invitation
  const handleReject = async (invitationId) => {
    if (!window.confirm('Bạn có chắc muốn từ chối lời mời này?')) {
      return;
    }

    try {
      await axios.post(
        `${API_URL}/project-invitations/${invitationId}/reject`,
        {},
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );

      toast.info('Đã từ chối lời mời');

      // Remove from list
      setInvitations(prev =>
        prev.filter(inv => inv.id !== invitationId)
      );
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (invitations.length === 0) {
    return (
      <div className="empty-state">
        <p>Bạn không có lời mời nào</p>
      </div>
    );
  }

  return (
    <div className="invitations-container">
      <h2>Lời mời tham gia dự án ({invitations.length})</h2>

      <div className="invitations-grid">
        {invitations.map((invitation) => (
          <div key={invitation.id} className="invitation-card">
            <div className="card-header">
              <h3>{invitation.project.name}</h3>
              <span className="project-key">{invitation.project.key}</span>
            </div>

            <div className="card-body">
              <p className="description">
                {invitation.project.description}
              </p>

              <div className="invitation-info">
                <div className="info-row">
                  <span className="label">Role:</span>
                  <span className="value role">{invitation.role}</span>
                </div>

                <div className="info-row">
                  <span className="label">Invited by:</span>
                  <div className="inviter">
                    {invitation.invitedBy.avatarUrl && (
                      <img
                        src={invitation.invitedBy.avatarUrl}
                        alt={invitation.invitedBy.fullName}
                        className="avatar"
                      />
                    )}
                    <span>{invitation.invitedBy.fullName}</span>
                  </div>
                </div>

                <div className="info-row">
                  <span className="label">Invited at:</span>
                  <span className="value">
                    {new Date(invitation.invitedAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="card-actions">
              <button
                className="btn btn-success"
                onClick={() => handleAccept(invitation.id)}
              >
                ✓ Accept
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleReject(invitation.id)}
              >
                ✗ Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectInvitations;
```

---

## 6. WebSocket Integration (Frontend)

```javascript
import { io } from 'socket.io-client';

// Kết nối WebSocket
const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL; // Render.com URL
const accessToken = localStorage.getItem('access_token');

const socket = io(WEBSOCKET_URL, {
  auth: {
    token: accessToken
  }
});

// Lắng nghe notification
socket.on('notification', (notification) => {
  console.log('New notification:', notification);

  // Hiển thị notification
  if (notification.type === 'added_to_project') {
    toast.info(`📧 ${notification.title}: ${notification.message}`, {
      onClick: () => {
        // Chuyển đến trang invitations
        window.location.href = '/invitations';
      }
    });

    // Refresh invitations list nếu đang ở trang invitations
    if (window.location.pathname === '/invitations') {
      fetchInvitations();
    }
  }

  if (notification.type === 'invitation_accepted') {
    toast.success(`✓ ${notification.message}`);
  }

  if (notification.type === 'invitation_rejected') {
    toast.info(`✗ ${notification.message}`);
  }
});

// Xử lý lỗi
socket.on('connect_error', (error) => {
  console.error('WebSocket connection error:', error);
});

socket.on('disconnect', () => {
  console.log('WebSocket disconnected');
});
```

---

## 7. Error Handling

### Common Errors

| Status Code | Error | Giải thích |
|-------------|-------|------------|
| 401 | Unauthorized | Token không hợp lệ hoặc hết hạn |
| 403 | Forbidden | Không có quyền (invitation không phải của user) |
| 404 | Not Found | Invitation không tồn tại |
| 409 | Conflict | Invitation đã được xử lý rồi |

### Error Response Format
```json
{
  "statusCode": 404,
  "message": "Lời mời không tồn tại",
  "error": "Not Found"
}
```

---

## 8. Testing với Postman/Thunder Client

### 1. Mời user vào project
```
POST {{baseUrl}}/projects/5/members
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "userId": 15,
  "role": "member"
}
```

### 2. Lấy danh sách invitations
```
GET {{baseUrl}}/projects/my-invitations
Authorization: Bearer {{accessToken}}
```

### 3. Accept invitation
```
POST {{baseUrl}}/project-invitations/123/accept
Authorization: Bearer {{accessToken}}
```

### 4. Reject invitation
```
POST {{baseUrl}}/project-invitations/123/reject
Authorization: Bearer {{accessToken}}
```

---

## 9. Best Practices

1. **Always handle errors properly**
   ```javascript
   try {
     await acceptInvitation(id);
   } catch (error) {
     // Show user-friendly error message
   }
   ```

2. **Show loading states**
   ```jsx
   const [accepting, setAccepting] = useState(false);

   const handleAccept = async (id) => {
     setAccepting(true);
     try {
       await acceptInvitation(id);
     } finally {
       setAccepting(false);
     }
   };
   ```

3. **Refresh data after actions**
   ```javascript
   // After accept/reject, refresh the invitations list
   await fetchInvitations();
   ```

4. **Use WebSocket for real-time updates**
   ```javascript
   // Listen for notifications and update UI immediately
   socket.on('notification', handleNotification);
   ```

5. **Confirm destructive actions**
   ```javascript
   if (!window.confirm('Bạn có chắc muốn từ chối?')) {
     return;
   }
   ```

---

## 10. URLs

### Development
- REST API (Vercel): `http://localhost:3000`
- WebSocket (Render): `http://localhost:3001`
- Frontend: `http://localhost:5173`

### Production
- REST API (Vercel): `https://your-api.vercel.app`
- WebSocket (Render): `wss://your-websocket.onrender.com`
- Frontend: `https://your-app.vercel.app`

---

## Support

Nếu có vấn đề, kiểm tra:
1. Token JWT có hợp lệ không?
2. invitationId có đúng không?
3. Status của invitation có phải 'invited' không?
4. User có phải là người nhận invitation không?

# 📤 File Upload API Guide - Cloudinary Integration

## 📋 Tổng Quan

Hệ thống Work Management đã tích hợp **Cloudinary** để quản lý file upload (images, documents). Tất cả files được lưu trữ trên cloud, tự động tối ưu và có CDN toàn cầu.

**Base URL**: `https://work-management-chi.vercel.app`

---

## 🔐 Authentication

Tất cả API upload đều yêu cầu **JWT Bearer Token**:

```
Authorization: Bearer <your-jwt-token>
```

---

## 📝 API Endpoints Summary

| Endpoint | Method | Description | Max Size | File Types |
|----------|--------|-------------|----------|------------|
| `/users/avatar` | POST | Upload user avatar | 5MB | Images only |
| `/users/avatar` | DELETE | Delete user avatar | - | - |
| `/users/:id/avatar` | GET | Get user avatar | - | - |
| `/tasks/:id/attachments` | POST | Upload task attachment | 10MB | All types |
| `/tasks/:id/attachments` | GET | Get all task attachments | - | - |
| `/tasks/:taskId/attachments/:attachmentId` | DELETE | Delete attachment | - | - |

---

## 👤 User Avatar APIs

### 1. Upload User Avatar

**POST /users/avatar**

- Authentication: Required (JWT)
- Content-Type: multipart/form-data
- Body: `file` (image file)
- Max size: 5MB
- Allowed types: jpeg, png, webp, gif

**Response (200 OK)**:
```json
{
  "message": "Avatar uploaded successfully",
  "avatar": {
    "id": 123,
    "url": "https://res.cloudinary.com/.../avatar.jpg",
    "thumbnail": "https://res.cloudinary.com/.../avatar_150x150.jpg",
    "small": "https://res.cloudinary.com/.../avatar_50x50.jpg"
  }
}
```

### 2. Delete User Avatar

**DELETE /users/avatar**

- Authentication: Required (JWT)
- Response: 204 No Content

### 3. Get User Avatar

**GET /users/:id/avatar**

- Authentication: Public (no token required)
- Response: Avatar object or null

---

## 📋 Task Attachments APIs

### 1. Upload Task Attachment

**POST /tasks/:id/attachments**

- Authentication: Required (JWT)
- Content-Type: multipart/form-data
- Body: `file` (any file type)
- Max size: 10MB
- Allowed types: jpg, png, gif, webp, svg, pdf, doc, docx, xls, xlsx, ppt, pptx, txt, csv, zip, rar

**Response (200 OK)**:
```json
{
  "message": "File uploaded successfully",
  "attachment": {
    "id": 789,
    "url": "https://res.cloudinary.com/.../document.pdf",
    "thumbnail": "https://res.cloudinary.com/.../thumbnail.jpg",
    "filename": "document.pdf",
    "size": 245760,
    "type": "pdf",
    "uploadedAt": "2026-01-13T10:30:00.000Z"
  }
}
```

### 2. Get All Task Attachments

**GET /tasks/:id/attachments**

- Authentication: Required (JWT)
- Returns array of attachments

### 3. Delete Task Attachment

**DELETE /tasks/:taskId/attachments/:attachmentId**

- Authentication: Required (JWT)
- Permission: Only uploader can delete
- Response: 204 No Content

---

## 🚀 Frontend Integration (React Example)

```typescript
// Upload Avatar
const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('https://work-management-chi.vercel.app/users/avatar', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  return response.json();
};

// Upload Task Attachment
const uploadTaskFile = async (taskId: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `https://work-management-chi.vercel.app/tasks/${taskId}/attachments`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    }
  );

  return response.json();
};
```

---

## ⚠️ Validation & Limits

### File Size Limits
- Avatar: 5MB max
- Task Attachments: 10MB max

### Allowed File Types

**Avatar**: image/jpeg, image/png, image/webp, image/gif

**Task Attachments**: Images, documents (pdf, docx, xlsx, etc.), text files, archives

---

## 🔧 Error Handling

**400 Bad Request - File too large**:
```json
{
  "statusCode": 400,
  "message": "File size exceeds limit (5.00MB). Your file: 8.50MB"
}
```

**400 Bad Request - Invalid file type**:
```json
{
  "statusCode": 400,
  "message": "File type not allowed. Allowed types: image/jpeg, image/png, ..."
}
```

**401 Unauthorized**:
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**403 Forbidden**:
```json
{
  "statusCode": 403,
  "message": "You do not have permission to delete this attachment"
}
```

---

## 📊 Cloudinary Free Tier

- Storage: 25GB
- Bandwidth: 25GB/month
- Transformations: 25,000/month

Monitor usage at: https://cloudinary.com/console

---

## 🎨 Image Transformations

Cloudinary automatically optimizes images and provides transformations:

- Auto format (WebP, AVIF)
- Auto quality (compression)
- Resize, crop, thumbnail
- CDN delivery worldwide

**Avatar**: Circular crop with face detection (150x150, 50x50)
**Task Attachments**: Square crop thumbnails (200x200) for images

---

## 🎉 Summary

✅ Avatar Upload: POST `/users/avatar` (5MB max, images only)
✅ Task Attachments: POST `/tasks/:id/attachments` (10MB max, all types)
✅ Auto Optimization: Cloudinary handles compression & format conversion
✅ CDN: Fast delivery worldwide
✅ Security: JWT authentication required

For full implementation details, see `CLOUDINARY_INTEGRATION_STRATEGY.md`

---

**Happy Uploading! 🚀**

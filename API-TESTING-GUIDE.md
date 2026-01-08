# HƯỚNG DẪN TEST API - AUTHENTICATION & NOTIFICATION FLOWS

## BASE URL
```
Production: https://work-management-git-ngocminh-ngocminh000s-projects.vercel.app
Local: http://localhost:3000
```

---

## PHẦN I: AUTHENTICATION FLOWS

### 1. USER REGISTRATION (Đăng ký tài khoản)

#### Endpoint
```
POST {{BASE_URL}}/users
Content-Type: application/json
```

#### Request Body
```json
{
  "email": "user@example.com",
  "username": "username123",
  "password": "securePassword123",
  "fullName": "John Doe",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

#### Validation Rules
- `email`: Email hợp lệ, unique, bắt buộc
- `username`: Chỉ chấp nhận a-z, 0-9, _, - ; unique, bắt buộc
- `password`: Minimum 6 ký tự, bắt buộc
- `fullName`: Optional
- `avatarUrl`: URL hợp lệ, optional

#### Success Response (201 Created)
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username123",
  "fullName": "John Doe",
  "avatarUrl": "https://example.com/avatar.jpg",
  "status": "unverified",
  "emailVerifiedAt": null,
  "lastLoginAt": null,
  "createdAt": "2024-01-08T10:00:00Z",
  "updatedAt": "2024-01-08T10:00:00Z"
}
```

#### Error Responses
- `409 Conflict`: "Email đã được sử dụng"
- `409 Conflict`: "Username đã được sử dụng"
- `400 Bad Request`: Validation errors

#### Side Effects
- User được tạo với status: `unverified`
- Password được hash với bcrypt
- Email xác thực được gửi ngay
- Verification Token được tạo (Expiry: 3 giờ)

---

### 2. EMAIL VERIFICATION

#### 2.1 Resend Verification Email
```
POST {{BASE_URL}}/auth/resend-verification
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Email xác thực đã được gửi lại",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "email": "user@example.com"
}
```

**Error Responses:**
- `404 Not Found`: "Email không tồn tại trong hệ thống"
- `400 Bad Request`: "Email đã được xác thực rồi"

---

#### 2.2 Verify Email với Token
```
POST {{BASE_URL}}/auth/verify-email
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Email đã được xác thực thành công",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username123",
    "fullName": "John Doe",
    "avatarUrl": "https://example.com/avatar.jpg",
    "status": "active",
    "emailVerifiedAt": "2024-01-08T10:05:00Z",
    "lastLoginAt": null,
    "createdAt": "2024-01-08T10:00:00Z",
    "updatedAt": "2024-01-08T10:05:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: "Token đã hết hạn"
- `400 Bad Request`: "Token không hợp lệ"
- `404 Not Found`: "User không tồn tại"

---

### 3. LOGIN FLOWS

#### 3.1 Traditional Login (Email/Username + Password)
```
POST {{BASE_URL}}/users/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "emailOrUsername": "user@example.com",
  "password": "securePassword123"
}
```

**Success Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Đăng nhập thành công",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username123",
    "fullName": "John Doe",
    "avatarUrl": "https://example.com/avatar.jpg",
    "status": "active",
    "emailVerifiedAt": "2024-01-08T10:05:00Z",
    "lastLoginAt": "2024-01-08T10:10:00Z",
    "createdAt": "2024-01-08T10:00:00Z",
    "updatedAt": "2024-01-08T10:10:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: "Email/Username hoặc password không đúng"
- `401 Unauthorized`: "Vui lòng xác thực email trước khi đăng nhập"
- `409 Conflict`: "Tài khoản đã bị khóa hoặc vô hiệu hóa"

---

#### 3.2 Magic Link Login

**Step 1: Request Magic Link**
```
POST {{BASE_URL}}/auth/magic-link/request
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Magic link đã được gửi đến email của bạn",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "email": "user@example.com"
}
```

**Token Details:**
- Type: `magic_link`
- Expiry: 15 phút
- One-time use: YES

---

**Step 2: Verify Magic Link & Login**
```
POST {{BASE_URL}}/auth/magic-link/verify
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Đăng nhập thành công",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username123",
    "fullName": "John Doe",
    "status": "active",
    "emailVerifiedAt": "2024-01-08T10:05:00Z",
    "lastLoginAt": "2024-01-08T11:00:00Z"
  }
}
```

---

#### 3.3 OTP Login (One-Time Password)

**Step 1: Request OTP**
```
POST {{BASE_URL}}/auth/otp/request
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "OTP đã được gửi đến email của bạn",
  "otp": "123456",
  "userId": 1,
  "email": "user@example.com"
}
```

**OTP Details:**
- Format: 6 digit number (100000 - 999999)
- Expiry: 10 phút
- One-time use: YES

---

**Step 2: Verify OTP & Login**
```
POST {{BASE_URL}}/auth/otp/verify
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Success Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Đăng nhập thành công với OTP",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username123",
    "fullName": "John Doe",
    "status": "active",
    "emailVerifiedAt": "2024-01-08T10:05:00Z",
    "lastLoginAt": "2024-01-08T11:05:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: "OTP không tồn tại hoặc đã hết hạn"
- `400 Bad Request`: "OTP không đúng"

---

### 4. PASSWORD RESET FLOW

#### 4.1 Request Password Reset
```
POST {{BASE_URL}}/auth/forgot-password
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Link đặt lại mật khẩu đã được gửi đến email của bạn",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "email": "user@example.com"
}
```

**Token Details:**
- Type: `password_reset`
- Expiry: 1 giờ
- One-time use: YES

---

#### 4.2 Reset Password với Token
```
POST {{BASE_URL}}/auth/reset-password
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "newSecurePassword123"
}
```

**Success Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Mật khẩu đã được đặt lại thành công"
}
```

**Error Responses:**
- `400 Bad Request`: "Token đã hết hạn"
- `400 Bad Request`: "Token không hợp lệ"
- `404 Not Found`: "User không tồn tại"

---

### 5. CHANGE EMAIL FLOW

#### 5.1 Request Email Change
```
POST {{BASE_URL}}/auth/request-change-email
Content-Type: application/json
```

**Request Body:**
```json
{
  "newEmail": "newemail@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Email xác thực đã được gửi đến email mới",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "oldEmail": "user@example.com",
  "newEmail": "newemail@example.com"
}
```

**Error Responses:**
- `400 Bad Request`: "Email mới trùng với email hiện tại"
- `400 Bad Request`: "Email mới đã được sử dụng"

---

#### 5.2 Verify Email Change
```
POST {{BASE_URL}}/auth/verify-email-change
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Email đã được thay đổi thành công",
  "user": {
    "id": 1,
    "email": "newemail@example.com",
    "username": "username123",
    "status": "active",
    "emailVerifiedAt": "2024-01-08T10:05:00Z"
  }
}
```

---

### 6. CHANGE PASSWORD (Authenticated)

```
PATCH {{BASE_URL}}/users/:id/change-password
Content-Type: application/json
```

**Request Body:**
```json
{
  "oldPassword": "securePassword123",
  "newPassword": "newSecurePassword123"
}
```

**Success Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Đổi mật khẩu thành công"
}
```

**Error Responses:**
- `404 Not Found`: "User với ID {id} không tồn tại"
- `409 Conflict`: "Mật khẩu cũ không đúng"

---

## PHẦN II: NOTIFICATION FLOWS

### 1. NOTIFICATION TYPES

```
1. project_created - Project mới được tạo
2. added_to_project - User được thêm vào project
3. sprint_created - Sprint mới được tạo
4. task_created - Task mới được tạo
5. task_assigned - Task được assign cho user
```

---

### 2. CREATE NOTIFICATION

```
POST {{BASE_URL}}/notifications
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": 1,
  "taskId": null,
  "projectId": 1,
  "type": "project_created",
  "title": "Dự án mới được tạo",
  "message": "Dự án \"MyProject\" đã được tạo"
}
```

**Success Response (201 Created):**
```json
{
  "id": 1,
  "userId": 1,
  "taskId": null,
  "projectId": 1,
  "type": "project_created",
  "title": "Dự án mới được tạo",
  "message": "Dự án \"MyProject\" đã được tạo",
  "isRead": false,
  "readAt": null,
  "createdAt": "2024-01-08T11:20:00Z"
}
```

---

### 3. GET NOTIFICATIONS

#### 3.1 Get All Notifications for User
```
GET {{BASE_URL}}/notifications/user/:userId
```

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "userId": 1,
    "taskId": null,
    "projectId": 1,
    "type": "project_created",
    "title": "Dự án mới được tạo",
    "message": "Dự án \"MyProject\" đã được tạo",
    "isRead": false,
    "readAt": null,
    "createdAt": "2024-01-08T11:20:00Z"
  },
  {
    "id": 2,
    "userId": 1,
    "taskId": 5,
    "projectId": 1,
    "type": "task_assigned",
    "title": "Task được gán cho bạn",
    "message": "Bạn được gán task: \"Implement Auth\"",
    "isRead": true,
    "readAt": "2024-01-08T11:25:00Z",
    "createdAt": "2024-01-08T11:21:00Z"
  }
]
```

---

#### 3.2 Get Unread Notifications
```
GET {{BASE_URL}}/notifications/user/:userId/unread
```

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "userId": 1,
    "taskId": null,
    "projectId": 1,
    "type": "project_created",
    "title": "Dự án mới được tạo",
    "message": "Dự án \"MyProject\" đã được tạo",
    "isRead": false,
    "readAt": null,
    "createdAt": "2024-01-08T11:20:00Z"
  }
]
```

---

#### 3.3 Get Unread Count
```
GET {{BASE_URL}}/notifications/user/:userId/count
```

**Success Response (200 OK):**
```json
{
  "count": 5
}
```

---

#### 3.4 Get Single Notification
```
GET {{BASE_URL}}/notifications/:id
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "userId": 1,
  "taskId": null,
  "projectId": 1,
  "type": "project_created",
  "title": "Dự án mới được tạo",
  "message": "Dự án \"MyProject\" đã được tạo",
  "isRead": false,
  "readAt": null,
  "createdAt": "2024-01-08T11:20:00Z"
}
```

**Error Responses:**
- `404 Not Found`: "Notification với ID {id} không tồn tại"
- `403 Forbidden`: "Bạn không có quyền xem notification này"

---

### 4. MARK NOTIFICATIONS AS READ

#### 4.1 Mark Single Notification as Read
```
PATCH {{BASE_URL}}/notifications/:id/read
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "userId": 1,
  "taskId": null,
  "projectId": 1,
  "type": "project_created",
  "title": "Dự án mới được tạo",
  "message": "Dự án \"MyProject\" đã được tạo",
  "isRead": true,
  "readAt": "2024-01-08T11:30:00Z",
  "createdAt": "2024-01-08T11:20:00Z"
}
```

---

#### 4.2 Mark All Notifications as Read
```
PATCH {{BASE_URL}}/notifications/user/:userId/read-all
```

**Success Response (200 OK):**
```json
{
  "message": "Đã đánh dấu 5 notifications là đã đọc",
  "count": 5
}
```

---

### 5. DELETE NOTIFICATIONS

#### 5.1 Delete Single Notification
```
DELETE {{BASE_URL}}/notifications/:id
```

**Success Response (204 No Content)**

---

#### 5.2 Delete All Notifications for User
```
DELETE {{BASE_URL}}/notifications/user/:userId/all
```

**Success Response (200 OK):**
```json
{
  "message": "Đã xóa 10 notifications",
  "count": 10
}
```

---

## PHẦN III: TOKEN FLOWS

### Token Types & Expiration

```typescript
Token Types:
- email_verification    (3 hours)
- password_reset        (1 hour)
- email_change          (3 hours)
- magic_link            (15 minutes)
- otp                   (10 minutes)
```

### Token Structure
```json
{
  "userId": 1,
  "email": "user@example.com",
  "type": "email_verification",
  "newEmail": "newemail@example.com",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## PHẦN IV: TESTING SCENARIOS

### Success Flow 1: Complete Registration
```
1. POST /users (Register)
   → Get token from response
2. POST /auth/verify-email (Verify)
   → User status: active
3. POST /users/login (Login)
   → Success
```

### Success Flow 2: Magic Link Login
```
1. POST /auth/magic-link/request
   → Get token from response
2. POST /auth/magic-link/verify
   → Success
```

### Success Flow 3: OTP Login
```
1. POST /auth/otp/request
   → Get OTP from response
2. POST /auth/otp/verify
   → Success
```

### Success Flow 4: Password Reset
```
1. POST /auth/forgot-password
   → Get token from response
2. POST /auth/reset-password
   → Success
3. POST /users/login (with new password)
   → Success
```

### Success Flow 5: Notifications
```
1. POST /notifications (Create)
2. GET /notifications/user/:userId
3. PATCH /notifications/:id/read
4. GET /notifications/user/:userId/count
5. DELETE /notifications/:id
```

---

## PHẦN V: ERROR SCENARIOS

### Test Cases
```
1. Token Expiration
   - Wait for token to expire
   - Use expired token → Error

2. Wrong Token Type
   - Use email_verification token for password_reset
   - Should return error

3. Invalid Credentials
   - Login with wrong password
   - Login with non-existent email

4. Duplicate Registration
   - Register with existing email → Error
   - Register with existing username → Error

5. Unverified Login
   - Try to login without email verification
   - Should return error

6. Permission Denied
   - Access notifications of other user
   - Should return 403 Forbidden
```

---

## PHẦN VI: POSTMAN ENVIRONMENT SETUP

### Environment Variables
```json
{
  "BASE_URL": "https://work-management-git-ngocminh-ngocminh000s-projects.vercel.app",
  "LOCAL_URL": "http://localhost:3000",
  "TEST_EMAIL": "test@example.com",
  "TEST_USERNAME": "testuser123",
  "TEST_PASSWORD": "password123",
  "USER_ID": "1",
  "TOKEN": "",
  "OTP": ""
}
```

### Pre-request Script (Save token automatically)
```javascript
// Save token from response
if (pm.response.json().token) {
    pm.environment.set("TOKEN", pm.response.json().token);
}

// Save userId from response
if (pm.response.json().userId) {
    pm.environment.set("USER_ID", pm.response.json().userId);
}

// Save OTP from response
if (pm.response.json().otp) {
    pm.environment.set("OTP", pm.response.json().otp);
}
```

### Test Script (Validate response)
```javascript
// Check status code
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Check response time
pm.test("Response time is less than 2000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

// Check response body
pm.test("Response has required fields", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('statusCode');
    pm.expect(jsonData).to.have.property('message');
});
```

---

## PHẦN VII: API ENDPOINT SUMMARY

### Authentication
```
POST   /users                              - Register
POST   /users/login                        - Login
PATCH  /users/:id/change-password          - Change password
POST   /auth/verify-email                  - Verify email
POST   /auth/resend-verification           - Resend verification
POST   /auth/forgot-password               - Forgot password
POST   /auth/reset-password                - Reset password
POST   /auth/request-change-email          - Request email change
POST   /auth/verify-email-change           - Verify email change
POST   /auth/magic-link/request            - Request magic link
POST   /auth/magic-link/verify             - Verify magic link
POST   /auth/otp/request                   - Request OTP
POST   /auth/otp/verify                    - Verify OTP
```

### Notifications
```
POST   /notifications                      - Create notification
GET    /notifications/user/:userId         - Get all notifications
GET    /notifications/user/:userId/unread  - Get unread
GET    /notifications/user/:userId/count   - Get unread count
GET    /notifications/:id                  - Get single notification
PATCH  /notifications/:id/read             - Mark as read
PATCH  /notifications/user/:userId/read-all - Mark all as read
DELETE /notifications/:id                  - Delete notification
DELETE /notifications/user/:userId/all     - Delete all
```

---

## NOTES

### Security
- Tất cả passwords được hash với bcrypt (salt rounds: 10)
- Tokens có expiration time khác nhau
- One-time use tokens (magic link, OTP, reset password)
- Email enumeration prevention trong forgot password

### Current TODOs
1. Implement JWT authentication guards
2. Get userId from JWT token (currently hardcoded)
3. Integrate with email queue system
4. Replace in-memory OTP storage with Redis

### Database
- Framework: NestJS
- Database: PostgreSQL (Neon)
- ORM: Drizzle ORM
- Email: Nodemailer + Handlebars templates

---

**Document Version:** 1.0
**Last Updated:** 2026-01-08
**Base URL:** https://work-management-git-ngocminh-ngocminh000s-projects.vercel.app

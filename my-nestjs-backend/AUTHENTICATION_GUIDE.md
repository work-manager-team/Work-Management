# 🔐 AUTHENTICATION & AUTHORIZATION COMPLETE GUIDE

**Base URL:** `https://work-management-git-ngocminh-ngocminh000s-projects.vercel.app`

**Last Updated:** January 2026

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Authentication Methods](#authentication-methods)
3. [Email Verification Flow](#1-email-verification-flow)
4. [Password Reset Flow](#2-password-reset-flow)
5. [Email Change Flow](#3-email-change-flow)
6. [Magic Link Login](#4-magic-link-passwordless-login)
7. [OTP Login](#5-otp-one-time-password-login)
8. [Google OAuth Login](#6-google-oauth-login)
9. [Logout](#7-logout)
10. [Database Schema](#database-schema)
11. [JWT Token System](#jwt-token-system)
12. [Cookie Handling](#cookie-handling)
13. [Security Features](#security-features)
14. [Postman Testing Guide](#postman-testing-guide)

---

## 🎯 OVERVIEW

Hệ thống authentication hỗ trợ **7 phương thức** xác thực và quản lý tài khoản:

1. **Email Verification** - Xác thực email sau khi đăng ký
2. **Password Reset** - Đặt lại mật khẩu khi quên
3. **Email Change** - Thay đổi email tài khoản
4. **Magic Link** - Đăng nhập không cần mật khẩu (passwordless)
5. **OTP Login** - Đăng nhập bằng mã OTP 6 số
6. **Google OAuth** - Đăng nhập qua Google
7. **Logout** - Đăng xuất và xóa session

### ✨ Key Features

- ✅ JWT-based authentication với httpOnly cookies
- ✅ Multiple login methods (Magic Link, OTP, Google OAuth)
- ✅ Email verification system
- ✅ Password reset functionality
- ✅ Account linking (Google + local accounts)
- ✅ Secure token management với expiry times khác nhau
- ✅ CSRF protection với sameSite cookies
- ✅ XSS protection với httpOnly cookies

---

## 🔑 AUTHENTICATION METHODS

| Method | Endpoint | Token Type | Expiry | Use Case |
|--------|----------|------------|--------|----------|
| Email Verification | `POST /auth/verify-email` | `email_verification` | 3h | Kích hoạt tài khoản sau đăng ký |
| Password Reset | `POST /auth/reset-password` | `password_reset` | 1h | Đặt lại mật khẩu khi quên |
| Email Change | `POST /auth/verify-email-change` | `email_change` | 3h | Xác nhận email mới |
| Magic Link | `POST /auth/magic-link/verify` | `magic_link` | 15m | Đăng nhập nhanh, bảo mật cao |
| OTP | `POST /auth/otp/verify` | In-memory storage | 10m | Đăng nhập 2FA |
| Google OAuth | `GET /auth/google/callback` | `access_token` | 7d | Social login |
| Session Token | All authenticated routes | `access_token` | 7d | Duy trì phiên đăng nhập |

---

## 1️⃣ EMAIL VERIFICATION FLOW

### 📌 Mô tả
Xác thực email của user sau khi đăng ký tài khoản. Token được tạo trong quá trình signup và gửi qua email.

### 🔄 Luồng hoạt động

```
1. User đăng ký tài khoản → Nhận email verification
2. Click vào link trong email (chứa token)
3. Frontend gửi token đến API /auth/verify-email
4. Server verify token (JWT với type=email_verification)
5. Update user: status='active', emailVerifiedAt=now()
6. Trả về user object (đã xóa passwordHash)
```

### 🌐 API Endpoints

#### **Verify Email**
```http
POST /auth/verify-email
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200 OK:**
```json
{
  "statusCode": 200,
  "message": "Email đã được xác thực thành công",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "fullName": "John Doe",
    "status": "active",
    "emailVerifiedAt": "2026-01-08T10:30:00.000Z",
    "createdAt": "2026-01-08T09:00:00.000Z",
    "updatedAt": "2026-01-08T10:30:00.000Z"
  }
}
```

**Error 400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": "Token đã hết hạn"
}
```
hoặc
```json
{
  "statusCode": 400,
  "message": "Email đã được xác thực rồi"
}
```

#### **Resend Verification Email**
```http
POST /auth/resend-verification
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response 200 OK:**
```json
{
  "statusCode": 200,
  "message": "Email xác thực đã được gửi lại",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "email": "user@example.com"
}
```

### ⚙️ Implementation Details

- **Token Type:** `email_verification`
- **Token Expiry:** 3 giờ (có thể config qua `EMAIL_VERIFICATION_EXPIRY`)
- **JWT Secret:** `JWT_EMAIL_SECRET` từ environment
- **Database Update:** Set `status='active'` và `emailVerifiedAt=current_timestamp`

### 📝 Notes

- Token chỉ valid cho user được chỉ định trong payload (`userId`)
- Nếu email đã verified, trả về lỗi 400
- Token hết hạn sau 3h, user cần resend verification

---

## 2️⃣ PASSWORD RESET FLOW

### 📌 Mô tả
Cho phép user đặt lại mật khẩu khi quên. Sử dụng email verification để bảo mật.

### 🔄 Luồng hoạt động

```
1. User click "Forgot Password" và nhập email
2. Server tạo reset token (JWT, 1h expiry)
3. Gửi email với reset link (chứa token)
4. User click link và nhập mật khẩu mới
5. Frontend gửi token + newPassword đến /auth/reset-password
6. Server verify token, hash password mới (bcrypt 10 rounds)
7. Update passwordHash trong database
8. User có thể login với mật khẩu mới
```

### 🌐 API Endpoints

#### **Request Password Reset**
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response 200 OK (email exists or not):**
```json
{
  "statusCode": 200,
  "message": "Link đặt lại mật khẩu đã được gửi đến email của bạn",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "email": "user@example.com"
}
```

**Security Note:** Response luôn trả về 200 dù email có tồn tại hay không (tránh leak thông tin user)

#### **Reset Password with Token**
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "NewSecurePass123!"
}
```

**Response 200 OK:**
```json
{
  "statusCode": 200,
  "message": "Mật khẩu đã được đặt lại thành công"
}
```

**Error 400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": "Token không hợp lệ"
}
```

### ⚙️ Implementation Details

- **Token Type:** `password_reset`
- **Token Expiry:** 1 giờ (có thể config qua `PASSWORD_RESET_EXPIRY`)
- **Password Hashing:** bcrypt với 10 salt rounds
- **Validation:** newPassword phải tối thiểu 6 ký tự (DTO validation)

### 📝 Notes

- Token chỉ dùng được 1 lần (không có revocation list, nhưng thời gian ngắn)
- Sau khi reset, user nên login lại ngay
- Email không tồn tại vẫn trả về success (security best practice)

---

## 3️⃣ EMAIL CHANGE FLOW

### 📌 Mô tả
Cho phép user thay đổi email tài khoản. Cần xác thực qua email mới để đảm bảo ownership.

### 🔄 Luồng hoạt động

```
1. Authenticated user request đổi email mới
2. Server check:
   - Email mới != email hiện tại
   - Email mới chưa được dùng bởi user khác
3. Tạo token với payload chứa newEmail
4. Gửi email xác thực đến email MỚI
5. User click link trong email mới
6. Frontend gửi token đến /auth/verify-email-change
7. Server verify token, update email trong database
8. Trả về user object với email đã update
```

### 🌐 API Endpoints

#### **Request Email Change**
```http
POST /auth/request-change-email
Content-Type: application/json

{
  "newEmail": "newemail@example.com"
}
```

**Response 200 OK:**
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

**Error 400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": "Email mới trùng với email hiện tại"
}
```
hoặc
```json
{
  "statusCode": 400,
  "message": "Email mới đã được sử dụng"
}
```

#### **Verify Email Change**
```http
POST /auth/verify-email-change
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200 OK:**
```json
{
  "statusCode": 200,
  "message": "Email đã được thay đổi thành công",
  "user": {
    "id": 1,
    "email": "newemail@example.com",
    "username": "johndoe",
    "fullName": "John Doe",
    "status": "active",
    "updatedAt": "2026-01-08T11:00:00.000Z"
  }
}
```

### ⚙️ Implementation Details

- **Token Type:** `email_change`
- **Token Expiry:** 3 giờ
- **Token Payload:** Chứa `newEmail` trong additionalData
- **Validation:** Email format validation (DTO)

### ⚠️ Security Considerations

- **TODO:** Hiện tại hardcoded `userId=1` - CẦN implement JWT Guard để lấy userId từ access token
- Token chứa both old email và new email
- Verify email mới trước khi update database

### 📝 Notes

- Email change KHÔNG auto-logout user
- User vẫn có thể login với email cũ cho đến khi token được verify
- Sau khi đổi email, nên thông báo đến email CŨ (security alert)

---

## 4️⃣ MAGIC LINK (PASSWORDLESS) LOGIN

### 📌 Mô tả
Đăng nhập không cần nhập mật khẩu. User nhận link đặc biệt qua email, click vào là đăng nhập luôn.

### 🔄 Luồng hoạt động

```
1. User nhập email vào form "Login with Magic Link"
2. Server tạo magic link token (15 phút expiry)
3. Gửi email với magic link
4. User click link (hoặc copy token)
5. Frontend gửi token đến /auth/magic-link/verify
6. Server verify token:
   - Check user tồn tại
   - Check user status = 'active'
7. Generate access token (7 ngày expiry)
8. Set httpOnly cookie 'access_token'
9. Update lastLoginAt timestamp
10. Trả về user + access token
11. User đã đăng nhập, cookie tự động gửi kèm các request tiếp theo
```

### 🌐 API Endpoints

#### **Request Magic Link**
```http
POST /auth/magic-link/request
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response 200 OK:**
```json
{
  "statusCode": 200,
  "message": "Magic link đã được gửi đến email của bạn",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "email": "user@example.com"
}
```

**Error 400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": "Tài khoản chưa được kích hoạt"
}
```

#### **Verify Magic Link and Login**
```http
POST /auth/magic-link/verify
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200 OK:**
```json
{
  "statusCode": 200,
  "message": "Đăng nhập thành công",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "fullName": "John Doe",
    "avatarUrl": "https://...",
    "status": "active",
    "lastLoginAt": "2026-01-08T12:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Set-Cookie Header:**
```
Set-Cookie: access_token=eyJhbGci...; HttpOnly; Secure; SameSite=Lax; Max-Age=604800; Path=/
```

### ⚙️ Implementation Details

- **Magic Link Token Type:** `magic_link`
- **Magic Link Expiry:** 15 phút (short-lived for security)
- **Access Token Type:** `access_token`
- **Access Token Expiry:** 7 ngày
- **Cookie Name:** `access_token`
- **Cookie Settings:**
  - `httpOnly: true` - JavaScript không thể truy cập (prevent XSS)
  - `secure: true` - Chỉ gửi qua HTTPS (production mode)
  - `sameSite: 'lax'` - CSRF protection
  - `maxAge: 604800000` - 7 ngày (milliseconds)

### 🔐 Security Features

- **Short expiry time:** 15 phút để giảm risk nếu token bị lộ
- **One-time use recommended:** Mặc dù không enforce, nên chỉ dùng 1 lần
- **Account activation check:** Chỉ active users mới login được
- **httpOnly cookie:** Prevent XSS attacks

### 📝 Notes

- Magic link rất tiện cho mobile apps
- Không cần nhớ password
- Email account = authentication factor duy nhất
- Phù hợp cho apps ít sensitive data

---

## 5️⃣ OTP (ONE-TIME PASSWORD) LOGIN

### 📌 Mô tả
Đăng nhập bằng mã OTP 6 số gửi qua email. Tương tự 2FA nhưng dùng làm primary authentication.

### 🔄 Luồng hoạt động

```
1. User nhập email vào form "Login with OTP"
2. Server:
   - Generate random 6-digit OTP (100000-999999)
   - Store OTP in-memory với expiry 10 phút
   - Gửi email chứa OTP code
3. User nhận email, copy OTP code
4. User nhập email + OTP vào form
5. Frontend gửi đến /auth/otp/verify
6. Server verify:
   - OTP tồn tại trong storage
   - OTP chưa hết hạn
   - OTP match với email
   - User status = 'active'
7. Delete OTP khỏi storage (one-time use)
8. Generate access token (7 ngày)
9. Set httpOnly cookie
10. Update lastLoginAt
11. Trả về user + access token
```

### 🌐 API Endpoints

#### **Request OTP Code**
```http
POST /auth/otp/request
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response 200 OK:**
```json
{
  "statusCode": 200,
  "message": "OTP đã được gửi đến email của bạn",
  "otp": "123456",
  "userId": 1,
  "email": "user@example.com"
}
```

**⚠️ Production Note:** Field `otp` trong response chỉ để test. Trong production, PHẢI XÓA field này và chỉ gửi OTP qua email.

#### **Verify OTP and Login**
```http
POST /auth/otp/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response 200 OK:**
```json
{
  "statusCode": 200,
  "message": "Đăng nhập thành công với OTP",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "fullName": "John Doe",
    "status": "active",
    "lastLoginAt": "2026-01-08T12:30:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Set-Cookie Header:**
```
Set-Cookie: access_token=eyJhbGci...; HttpOnly; Secure; SameSite=Lax; Max-Age=604800; Path=/
```

**Error 400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": "OTP không đúng"
}
```
hoặc
```json
{
  "statusCode": 400,
  "message": "OTP đã hết hạn"
}
```

### ⚙️ Implementation Details

- **OTP Generation:** `Math.floor(100000 + Math.random() * 900000)` - Random 6 digits
- **OTP Storage:** In-memory Map `<email, {otp, expiresAt}>`
- **OTP Expiry:** 10 phút
- **OTP Validation:** Exact string match (case-sensitive, nhưng chỉ là số nên không quan trọng)
- **Cleanup:** Auto-cleanup expired OTPs sau 10 phút

### ⚠️ Production Considerations

**CRITICAL - In-Memory Storage Issue:**
- Current implementation dùng Map trong memory
- ❌ **KHÔNG phù hợp production** vì:
  - Mất OTP khi server restart
  - Không work với multiple server instances (load balancer)
  - Không có persistence

**✅ Recommended for Production:**
```typescript
// Use Redis instead
await redis.setex(`otp:${email}`, 600, otp); // 600s = 10 minutes
const storedOtp = await redis.get(`otp:${email}`);
await redis.del(`otp:${email}`); // Delete after verify
```

### 🔐 Security Features

- **One-time use:** OTP deleted sau khi verify thành công
- **Short expiry:** 10 phút
- **Rate limiting needed:** Nên thêm để prevent brute-force (e.g., max 5 requests/hour per email)
- **Account lockout needed:** Lock account sau N failed attempts

### 📝 Notes

- OTP phù hợp cho high-security apps
- User experience tốt hơn password cho mobile
- Có thể combine với SMS OTP (không chỉ email)

---

## 6️⃣ GOOGLE OAUTH LOGIN

### 📌 Mô tả
Đăng nhập qua Google account. Hỗ trợ account linking (nếu email đã tồn tại trong hệ thống).

### 🔄 Luồng hoạt động

```
1. User click "Login with Google"
2. Frontend redirect đến: GET /auth/google
3. GoogleOAuthGuard redirect user đến Google OAuth consent screen
4. User chọn Google account và authorize app
5. Google redirect về: GET /auth/google/callback?code=xxx
6. GoogleStrategy:
   - Exchange authorization code → access/refresh tokens
   - Fetch user profile từ Google (id, email, name, picture)
7. AuthService.validateGoogleUser():

   Case A: User đã login Google trước đây (googleId tồn tại)
     → Update lastLoginAt
     → Return existing user

   Case B: Email tồn tại nhưng chưa có googleId (local account)
     → Link accounts: set googleId, provider='google'
     → Set status='active', emailVerifiedAt=now (Google đã verify)
     → Update lastLoginAt
     → Return updated user

   Case C: User hoàn toàn mới
     → Create new user:
        - googleId from Google
        - email from Google (verified)
        - username = email prefix + random string
        - fullName from Google
        - avatarUrl from Google profile picture
        - provider = 'google'
        - status = 'active' (auto-activated)
        - emailVerifiedAt = now
     → Return new user

8. Generate access token (7 ngày)
9. Set httpOnly cookie
10. Return JSON response với user + accessToken
```

### 🌐 API Endpoints

#### **Initiate Google OAuth**
```http
GET /auth/google
```

**Response:** 302 Redirect đến Google OAuth consent screen
```
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=https://your-api.com/auth/google/callback&
  response_type=code&
  scope=email+profile
```

#### **Google OAuth Callback**
```http
GET /auth/google/callback?code=AUTHORIZATION_CODE
```

**Response 200 OK:**
```json
{
  "statusCode": 200,
  "message": "Đăng nhập Google thành công",
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "username": "user_a1b2c3",
    "fullName": "John Doe",
    "avatarUrl": "https://lh3.googleusercontent.com/...",
    "provider": "google",
    "status": "active",
    "emailVerifiedAt": "2026-01-08T13:00:00.000Z",
    "lastLoginAt": "2026-01-08T13:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Set-Cookie Header:**
```
Set-Cookie: access_token=eyJhbGci...; HttpOnly; Secure; SameSite=Lax; Max-Age=604800; Path=/
```

**Error 500 Internal Server Error:**
```json
{
  "statusCode": 500,
  "message": "Đăng nhập Google thất bại",
  "error": "Error message details"
}
```

### ⚙️ Implementation Details

**Google Strategy Configuration:**
```typescript
// In google.strategy.ts
passport.use(new Strategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  scope: ['email', 'profile']
}))
```

**Environment Variables Required:**
- `GOOGLE_CLIENT_ID` - OAuth 2.0 Client ID từ Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - OAuth 2.0 Client Secret
- `GOOGLE_CALLBACK_URL` - `https://your-api.com/auth/google/callback`

**Google Profile Mapping:**
```typescript
{
  googleId: profile.id,              // Google user ID (unique)
  email: profile.emails[0].value,    // Primary email
  fullName: profile.displayName,     // Display name
  avatarUrl: profile.photos[0].value // Profile picture URL
}
```

### 🔐 Account Linking Logic

**Smart Account Linking:**
1. **Check by googleId first** - Nếu tìm thấy → existing Google user
2. **Check by email** - Nếu tìm thấy → link local account với Google
3. **Create new** - Nếu không tìm thấy → new user

**Benefits:**
- User có thể login bằng cả Google và local password (nếu đã set)
- Không tạo duplicate accounts khi email trùng
- Auto-activate local accounts khi link với Google (vì Google đã verify email)

### 📝 Frontend Integration

**React/Next.js Example:**
```typescript
// Login button
<Button onClick={() => {
  window.location.href = 'https://your-api.com/auth/google'
}}>
  Login with Google
</Button>

// Callback page (e.g., /auth/callback)
useEffect(() => {
  // Server sẽ set cookie automatically
  // Check if logged in
  fetch('/api/me', { credentials: 'include' })
    .then(res => res.json())
    .then(user => {
      // User logged in successfully
      router.push('/dashboard')
    })
}, [])
```

### 🔒 Security Features

- **OAuth 2.0 standard** - Industry standard protocol
- **State parameter** - CSRF protection (handled by Passport)
- **HTTPS only** - Callback URL must be HTTPS in production
- **Email verification** - Google đã verify email, không cần verify lại
- **Token in cookie** - httpOnly, secure, sameSite

### 📝 Notes

- Google OAuth không cần quản lý password
- Avatar URL từ Google có thể expire → nên download và store locally
- Username auto-generated có thể cho phép user đổi sau
- Provider field giúp distinguish Google vs local users

---

## 7️⃣ LOGOUT

### 📌 Mô tả
Đăng xuất user khỏi hệ thống bằng cách xóa authentication cookie.

### 🔄 Luồng hoạt động

```
1. User click "Logout"
2. Frontend gửi request: POST /auth/logout
3. Server clear cookie 'access_token'
4. Return success message
5. Frontend redirect về login page hoặc homepage
```

### 🌐 API Endpoint

#### **Logout**
```http
POST /auth/logout
```

**Response 200 OK:**
```json
{
  "statusCode": 200,
  "message": "Đăng xuất thành công"
}
```

**Set-Cookie Header (Clear Cookie):**
```
Set-Cookie: access_token=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/
```

### ⚙️ Implementation Details

```typescript
@Post('logout')
async logout(@Res() res: Response) {
  res.clearCookie('access_token');
  return res.status(200).json({
    statusCode: 200,
    message: 'Đăng xuất thành công'
  });
}
```

- Dùng `res.clearCookie('access_token')` - Set Max-Age=0
- Cookie bị xóa ngay lập tức
- Không cần authentication để logout (idempotent operation)

### 📝 Frontend Handling

```typescript
// Logout function
const logout = async () => {
  await fetch('/auth/logout', {
    method: 'POST',
    credentials: 'include'
  });

  // Clear local state
  setUser(null);

  // Redirect
  router.push('/login');
};
```

### 📝 Notes

- **Server-side only:** Chỉ clear cookie, không có blacklist tokens
- **Client-side:** Frontend nên clear local state (Redux, Context, etc.)
- **Multi-device:** Logout trên 1 device không affect devices khác (vì mỗi device có cookie riêng)
- **Token still valid:** Access token vẫn valid cho đến khi hết hạn (7 ngày), nhưng browser không gửi nó nữa

**⚠️ Production Enhancement:**
- Implement token blacklist/revocation list trong Redis
- Track active sessions per user
- Allow "Logout all devices" functionality

---

## 📊 DATABASE SCHEMA

### **Users Table**

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  full_name VARCHAR(100),
  avatar_url VARCHAR(500),
  status VARCHAR(20) NOT NULL DEFAULT 'unverified',
  email_verified_at TIMESTAMP,
  last_login_at TIMESTAMP,
  google_id VARCHAR(255),
  provider VARCHAR(50) DEFAULT 'local',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_last_login ON users(last_login_at);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_provider ON users(provider);
```

### **Field Descriptions**

| Field | Type | Description | Notes |
|-------|------|-------------|-------|
| `id` | bigserial | Primary key | Auto-increment |
| `email` | varchar(255) | User email | Unique, indexed, NOT NULL |
| `username` | varchar(50) | Unique username | Unique, indexed, NOT NULL |
| `password_hash` | varchar(255) | Bcrypt hashed password | Nullable (Google users có thể không có) |
| `full_name` | varchar(100) | User's full name | Nullable |
| `avatar_url` | varchar(500) | Profile picture URL | Nullable |
| `status` | varchar(20) | Account status | Values: 'unverified', 'active', 'inactive', 'suspended' |
| `email_verified_at` | timestamp | Email verification time | NULL = chưa verify |
| `last_login_at` | timestamp | Last successful login | Updated on each login |
| `google_id` | varchar(255) | Google OAuth user ID | Nullable, indexed |
| `provider` | varchar(50) | Authentication provider | Values: 'local', 'google' |
| `created_at` | timestamp | Account creation time | Auto-set on INSERT |
| `updated_at` | timestamp | Last modification time | Auto-update on UPDATE |

### **User Status Values**

- `unverified` - Account created, email chưa verify (default for local signup)
- `active` - Email verified, account active (can login)
- `inactive` - User tự deactivate account
- `suspended` - Admin suspend account (security reasons)

### **Provider Values**

- `local` - Traditional email/password signup
- `google` - Google OAuth signup

**Note:** User có thể có cả password_hash VÀ google_id nếu accounts được linked.

---

## 🔐 JWT TOKEN SYSTEM

### **Token Types & Configuration**

| Token Type | Purpose | Expiry | Secret | Storage |
|-----------|---------|--------|--------|---------|
| `email_verification` | Email verification | 3h | JWT_EMAIL_SECRET | JWT |
| `password_reset` | Password reset | 1h | JWT_EMAIL_SECRET | JWT |
| `email_change` | Email change verification | 3h | JWT_EMAIL_SECRET | JWT |
| `magic_link` | Magic link login | 15m | JWT_EMAIL_SECRET | JWT |
| `otp` | OTP code | 10m | N/A | In-memory Map |
| `access_token` | Session authentication | 7d | JWT_EMAIL_SECRET | JWT + httpOnly Cookie |

### **Token Payload Structure**

```typescript
interface TokenPayload {
  userId: number;           // User ID
  email: string;            // User email
  type: TokenType;          // Token type (e.g., 'access_token')
  newEmail?: string;        // For email_change tokens
  iat?: number;             // Issued at (UNIX timestamp)
  exp?: number;             // Expiration (UNIX timestamp)
}
```

### **Token Generation Example**

```typescript
// Generate access token
const accessToken = jwtService.sign(
  {
    userId: user.id,
    email: user.email,
    type: 'access_token'
  },
  {
    secret: process.env.JWT_EMAIL_SECRET,
    expiresIn: '7d'
  }
);
```

### **Token Verification Example**

```typescript
// Verify access token
const payload = jwtService.verify<TokenPayload>(token, {
  secret: process.env.JWT_EMAIL_SECRET
});

// Check token type
if (payload.type !== 'access_token') {
  throw new BadRequestException('Invalid token type');
}
```

### **Environment Variables**

```env
# JWT Configuration
JWT_EMAIL_SECRET=your-super-secret-jwt-key-change-this-in-production
EMAIL_VERIFICATION_EXPIRY=3h
PASSWORD_RESET_EXPIRY=1h
```

### **Security Best Practices**

1. **Separate secrets** - Nên dùng JWT_EMAIL_SECRET khác JWT_ACCESS_SECRET
2. **Strong secrets** - Minimum 32 characters, random string
3. **Environment-based** - Different secrets cho dev/staging/production
4. **Rotation** - Rotate secrets periodically (invalidates all tokens)

### **Token Expiry Strategy**

- **Short-lived for actions:** email_verification (3h), password_reset (1h), magic_link (15m)
- **Long-lived for sessions:** access_token (7d)
- **Very short for OTP:** 10 minutes (prevent brute-force)

### **Decode Token Example (Debugging)**

```bash
# Decode JWT token (without verification)
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." | base64 -d

# Use jwt.io to decode and verify
# https://jwt.io/
```

---

## 🍪 COOKIE HANDLING

### **Access Token Cookie Configuration**

```typescript
res.cookie('access_token', accessToken, {
  httpOnly: true,                          // ✅ JS cannot access (XSS protection)
  secure: process.env.NODE_ENV === 'production', // ✅ HTTPS only in production
  sameSite: 'lax',                        // ✅ CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000        // 7 days in milliseconds
});
```

### **Cookie Attributes Explained**

| Attribute | Value | Purpose | Security Benefit |
|-----------|-------|---------|------------------|
| `name` | `access_token` | Cookie identifier | Consistent naming |
| `httpOnly` | `true` | Prevent JavaScript access | ✅ XSS protection - Malicious scripts không thể đọc token |
| `secure` | `true` (prod) | HTTPS only transmission | ✅ MITM protection - Token chỉ gửi qua encrypted connection |
| `sameSite` | `lax` | Cross-site request control | ✅ CSRF protection - Cookie không gửi kèm cross-site POST requests |
| `maxAge` | `604800000` | 7 days expiry | Auto-delete sau 7 ngày |
| `path` | `/` | Cookie valid for entire domain | All routes có thể access |

### **SameSite Options**

| Value | Behavior | Use Case |
|-------|----------|----------|
| `strict` | Cookie KHÔNG gửi trong bất kỳ cross-site request nào | Highest security, nhưng UX kém (user click link từ email sẽ không login) |
| `lax` | Cookie gửi trong safe cross-site requests (GET) | **✅ Recommended** - Balance security & UX |
| `none` | Cookie luôn gửi (requires `secure: true`) | Cần cho cross-origin requests (e.g., API và Frontend khác domain) |

**Current Setting:** `lax` - Cookie được gửi khi:
- User navigate đến site (click link từ Google, email, etc.)
- User submit GET form
- ❌ KHÔNG gửi trong POST, PUT, DELETE từ external sites (CSRF protection)

### **Cookie Workflow**

#### **Set Cookie (Login)**
```http
POST /auth/magic-link/verify
Content-Type: application/json

{ "token": "..." }

HTTP/1.1 200 OK
Set-Cookie: access_token=eyJhbGci...; HttpOnly; Secure; SameSite=Lax; Max-Age=604800; Path=/
```

#### **Browser Automatically Sends Cookie**
```http
GET /api/me
Cookie: access_token=eyJhbGci...

HTTP/1.1 200 OK
{ "user": { ... } }
```

#### **Clear Cookie (Logout)**
```http
POST /auth/logout

HTTP/1.1 200 OK
Set-Cookie: access_token=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/
```

### **Frontend Cookie Handling**

**Browser automatically handles cookies - NO JavaScript code needed!**

```typescript
// ✅ CORRECT - Browser tự động gửi cookie
fetch('/api/me', {
  credentials: 'include'  // Important: include cookies in request
})

// ❌ WRONG - Không cần manually set cookie
fetch('/api/me', {
  headers: {
    'Authorization': `Bearer ${token}` // Don't do this for cookie-based auth
  }
})
```

### **CORS Configuration for Cookies**

```typescript
// In NestJS main.ts
app.enableCors({
  origin: 'https://your-frontend.com',  // Specific origin, NOT '*'
  credentials: true                     // Allow cookies
});
```

**Important:** Khi dùng cookies, CORS origin KHÔNG thể là `*`. Phải specify exact origin.

### **Cross-Domain Considerations**

**Same Domain (Recommended):**
- Frontend: `https://example.com`
- API: `https://api.example.com`
- Cookie domain: `.example.com` (works for both subdomains)

**Different Domain (Complex):**
- Frontend: `https://myapp.com`
- API: `https://api.different.com`
- Must use:
  - `sameSite: 'none'`
  - `secure: true`
  - CORS properly configured
  - User browser must allow third-party cookies

### **Testing Cookies**

**Chrome DevTools:**
1. Open DevTools → Application tab
2. Storage → Cookies → Select your domain
3. See `access_token` cookie with all attributes

**Postman:**
1. Send request
2. Check "Cookies" tab in response
3. Cookie automatically stored and sent in subsequent requests

**cURL:**
```bash
# Login and save cookies
curl -X POST https://api.example.com/auth/magic-link/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"..."}' \
  -c cookies.txt

# Use saved cookies
curl https://api.example.com/api/me \
  -b cookies.txt
```

---

## 🛡️ SECURITY FEATURES

### **✅ Implemented Security Measures**

#### **1. Password Security**
- **Bcrypt hashing** với 10 salt rounds
- **Minimum length** validation (6 characters)
- **Password not stored** trong logs, responses
- **Password nullable** - Google OAuth users không cần password

#### **2. Token Security**
- **JWT signatures** - Tokens không thể forge
- **Type validation** - Mỗi token chỉ dùng cho 1 purpose
- **Expiry times** - Tokens tự động invalid sau time limit
- **Short-lived sensitive tokens** - password_reset (1h), magic_link (15m)
- **Separate secrets** - JWT_EMAIL_SECRET riêng biệt

#### **3. Cookie Security**
- **httpOnly flag** - JavaScript không thể access → XSS protection
- **secure flag** - HTTPS only in production → MITM protection
- **sameSite: lax** - CSRF protection
- **7-day expiry** - Auto-cleanup old sessions

#### **4. CSRF Protection**
- **sameSite cookies** - Prevent cross-site request forgery
- **Double-submit cookie pattern** (có thể thêm nếu cần stronger protection)

#### **5. XSS Protection**
- **httpOnly cookies** - Tokens không accessible via JavaScript
- **Input validation** - DTO validators prevent malicious input
- **Output encoding** - NestJS auto-escapes responses

#### **6. Privacy Protection**
- **Email existence hiding** - Forgot password không reveal email tồn tại hay không
- **Password removal** - Responses không bao giờ include passwordHash
- **Sensitive data filtering** - googleId removed from responses

#### **7. OAuth Security**
- **OAuth 2.0 standard** - Industry best practices
- **State parameter** - CSRF protection (Passport handles)
- **HTTPS callback** - Prevent token interception

#### **8. Database Security**
- **Indexed fields** - Fast lookups, prevent timing attacks
- **Unique constraints** - Prevent duplicate accounts
- **Status field** - Account suspension capability

### **⚠️ Security Enhancements Needed**

#### **1. Rate Limiting** ⚠️ CRITICAL
```typescript
// TODO: Implement rate limiting
// Example with @nestjs/throttler
@Throttler({ ttl: 60, limit: 5 })  // 5 requests per minute
@Post('auth/otp/request')
```

**Needed for:**
- `/auth/otp/request` - Prevent OTP spam
- `/auth/magic-link/request` - Prevent magic link spam
- `/auth/forgot-password` - Prevent email spam
- `/auth/otp/verify` - Prevent brute-force

#### **2. Account Lockout** ⚠️ HIGH PRIORITY
```typescript
// TODO: Implement account lockout after failed attempts
// Example logic:
// - Track failed login attempts per email
// - Lock account after 5 consecutive failures
// - Unlock after 30 minutes or email verification
```

#### **3. OTP Storage Migration** ⚠️ CRITICAL FOR PRODUCTION
```typescript
// TODO: Replace in-memory Map with Redis
// Current (DEV only):
private otpStore: Map<string, {otp: string; expiresAt: Date}> = new Map();

// Production (Redis):
await redis.setex(`otp:${email}`, 600, otp);
const storedOtp = await redis.get(`otp:${email}`);
await redis.del(`otp:${email}`);
```

#### **4. JWT Guard for Protected Routes** ⚠️ HIGH PRIORITY
```typescript
// TODO: Implement JwtAuthGuard
// Currently missing in routes like:
// - POST /auth/request-change-email (hardcoded userId=1)

@UseGuards(JwtAuthGuard)
@Post('request-change-email')
async requestChangeEmail(@Req() req) {
  const userId = req.user.id; // From JWT
  // ...
}
```

#### **5. Token Revocation/Blacklist** ⚠️ MEDIUM PRIORITY
```typescript
// TODO: Implement token blacklist in Redis
// When logout or password reset:
await redis.setex(`blacklist:${token}`, remainingTTL, '1');

// In JwtAuthGuard:
const isBlacklisted = await redis.get(`blacklist:${token}`);
if (isBlacklisted) throw new UnauthorizedException();
```

#### **6. Environment Variable Validation** ⚠️ HIGH PRIORITY
```typescript
// TODO: Enforce required env vars at startup
// Do NOT fallback to default secrets in production

if (!process.env.JWT_EMAIL_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_EMAIL_SECRET is required in production');
}
```

#### **7. Remove OTP from Response** ⚠️ CRITICAL FOR PRODUCTION
```typescript
// TODO: Remove in production
return {
  statusCode: 200,
  message: 'OTP đã được gửi đến email của bạn',
  // otp: otp,  ← DELETE THIS LINE IN PRODUCTION
  userId: user.id,
  email: user.email,
};
```

#### **8. Email Security Alerts** ⚠️ MEDIUM PRIORITY
```typescript
// TODO: Send security alerts for:
// - Password changed
// - Email changed (notify OLD email)
// - New login from unrecognized device/location
// - Account recovery attempts
```

#### **9. HTTPS Enforcement** ⚠️ CRITICAL FOR PRODUCTION
```typescript
// TODO: Enforce HTTPS in production
// In main.ts:
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
}
```

#### **10. Session Management** ⚠️ MEDIUM PRIORITY
```typescript
// TODO: Track active sessions
// - Store session info in Redis
// - Allow "View active sessions"
// - Allow "Logout all devices"
// - Show last login IP, device, location
```

### **🔍 Security Audit Checklist**

- [ ] Rate limiting on all auth endpoints
- [ ] Account lockout after failed attempts
- [ ] Redis for OTP storage (production)
- [ ] JWT guard on protected routes
- [ ] Token revocation/blacklist
- [ ] Environment variable validation
- [ ] Remove OTP from API response
- [ ] Email security alerts
- [ ] HTTPS enforcement
- [ ] Session management
- [ ] Input validation on all DTOs
- [ ] SQL injection prevention (using Drizzle ORM - ✅ safe)
- [ ] Logging & monitoring (audit trail)
- [ ] Regular dependency updates
- [ ] Penetration testing

---

## 🧪 POSTMAN TESTING GUIDE

### **Setup Postman Environment**

1. Create new Environment: `Work Management API`
2. Add variables:

| Variable | Initial Value | Current Value |
|----------|--------------|---------------|
| `baseUrl` | `https://work-management-git-ngocminh-ngocminh000s-projects.vercel.app` | Same |
| `accessToken` | (empty) | (auto-set by tests) |
| `userId` | (empty) | (auto-set by tests) |
| `email` | `test@example.com` | Your test email |
| `otp` | (empty) | (auto-set by tests) |

### **Collection Structure**

```
📁 Work Management API
  📁 Authentication
    📄 1. Resend Email Verification
    📄 2. Verify Email
    📄 3. Request Password Reset
    📄 4. Reset Password
    📄 5. Request Email Change
    📄 6. Verify Email Change
    📄 7. Request Magic Link
    📄 8. Verify Magic Link
    📄 9. Request OTP
    📄 10. Verify OTP
    📄 11. Google OAuth (manual test)
    📄 12. Logout
```

---

### **1. Resend Email Verification**

**Request:**
```
POST {{baseUrl}}/auth/resend-verification
Content-Type: application/json

Body (raw JSON):
{
  "email": "{{email}}"
}
```

**Expected Response 200:**
```json
{
  "statusCode": 200,
  "message": "Email xác thực đã được gửi lại",
  "token": "eyJhbGci...",
  "userId": 1,
  "email": "test@example.com"
}
```

**Tests Tab:**
```javascript
// Parse response
const response = pm.response.json();

// Tests
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has token", function () {
    pm.expect(response).to.have.property('token');
    pm.environment.set("emailVerificationToken", response.token);
});

pm.test("Response has userId", function () {
    pm.expect(response).to.have.property('userId');
    pm.environment.set("userId", response.userId);
});
```

---

### **2. Verify Email**

**Request:**
```
POST {{baseUrl}}/auth/verify-email
Content-Type: application/json

Body (raw JSON):
{
  "token": "{{emailVerificationToken}}"
}
```

**Expected Response 200:**
```json
{
  "statusCode": 200,
  "message": "Email đã được xác thực thành công",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "status": "active",
    "emailVerifiedAt": "2026-01-08T10:00:00.000Z"
  }
}
```

**Tests Tab:**
```javascript
const response = pm.response.json();

pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("User status is active", function () {
    pm.expect(response.user.status).to.equal("active");
});

pm.test("Email verified at is set", function () {
    pm.expect(response.user).to.have.property('emailVerifiedAt');
});
```

---

### **3. Request Password Reset**

**Request:**
```
POST {{baseUrl}}/auth/forgot-password
Content-Type: application/json

Body (raw JSON):
{
  "email": "{{email}}"
}
```

**Expected Response 200:**
```json
{
  "statusCode": 200,
  "message": "Link đặt lại mật khẩu đã được gửi đến email của bạn",
  "token": "eyJhbGci...",
  "userId": 1,
  "email": "test@example.com"
}
```

**Tests Tab:**
```javascript
const response = pm.response.json();

pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has reset token", function () {
    pm.expect(response).to.have.property('token');
    pm.environment.set("passwordResetToken", response.token);
});
```

---

### **4. Reset Password**

**Request:**
```
POST {{baseUrl}}/auth/reset-password
Content-Type: application/json

Body (raw JSON):
{
  "token": "{{passwordResetToken}}",
  "newPassword": "NewSecurePass123!"
}
```

**Expected Response 200:**
```json
{
  "statusCode": 200,
  "message": "Mật khẩu đã được đặt lại thành công"
}
```

**Tests Tab:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Success message", function () {
    const response = pm.response.json();
    pm.expect(response.message).to.include("thành công");
});
```

---

### **5. Request Email Change**

**⚠️ Note:** Endpoint này hiện tại hardcoded `userId=1`. Cần JWT guard để production-ready.

**Request:**
```
POST {{baseUrl}}/auth/request-change-email
Content-Type: application/json

Body (raw JSON):
{
  "newEmail": "newemail@example.com"
}
```

**Expected Response 200:**
```json
{
  "statusCode": 200,
  "message": "Email xác thực đã được gửi đến email mới",
  "token": "eyJhbGci...",
  "userId": 1,
  "oldEmail": "test@example.com",
  "newEmail": "newemail@example.com"
}
```

**Tests Tab:**
```javascript
const response = pm.response.json();

pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has email change token", function () {
    pm.expect(response).to.have.property('token');
    pm.environment.set("emailChangeToken", response.token);
});

pm.test("New email is correct", function () {
    pm.expect(response.newEmail).to.equal("newemail@example.com");
});
```

---

### **6. Verify Email Change**

**Request:**
```
POST {{baseUrl}}/auth/verify-email-change
Content-Type: application/json

Body (raw JSON):
{
  "token": "{{emailChangeToken}}"
}
```

**Expected Response 200:**
```json
{
  "statusCode": 200,
  "message": "Email đã được thay đổi thành công",
  "user": {
    "id": 1,
    "email": "newemail@example.com",
    "username": "johndoe",
    "updatedAt": "2026-01-08T11:00:00.000Z"
  }
}
```

**Tests Tab:**
```javascript
const response = pm.response.json();

pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Email updated successfully", function () {
    pm.expect(response.user.email).to.equal("newemail@example.com");
});
```

---

### **7. Request Magic Link**

**Request:**
```
POST {{baseUrl}}/auth/magic-link/request
Content-Type: application/json

Body (raw JSON):
{
  "email": "{{email}}"
}
```

**Expected Response 200:**
```json
{
  "statusCode": 200,
  "message": "Magic link đã được gửi đến email của bạn",
  "token": "eyJhbGci...",
  "userId": 1,
  "email": "test@example.com"
}
```

**Tests Tab:**
```javascript
const response = pm.response.json();

pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has magic link token", function () {
    pm.expect(response).to.have.property('token');
    pm.environment.set("magicLinkToken", response.token);
});
```

---

### **8. Verify Magic Link (LOGIN)**

**Request:**
```
POST {{baseUrl}}/auth/magic-link/verify
Content-Type: application/json

Body (raw JSON):
{
  "token": "{{magicLinkToken}}"
}
```

**Expected Response 200:**
```json
{
  "statusCode": 200,
  "message": "Đăng nhập thành công",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "username": "johndoe",
    "fullName": "John Doe",
    "status": "active",
    "lastLoginAt": "2026-01-08T12:00:00.000Z"
  },
  "accessToken": "eyJhbGci..."
}
```

**Response Headers:**
```
Set-Cookie: access_token=eyJhbGci...; HttpOnly; Secure; SameSite=Lax; Max-Age=604800; Path=/
```

**Tests Tab:**
```javascript
const response = pm.response.json();

pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has access token", function () {
    pm.expect(response).to.have.property('accessToken');
    pm.environment.set("accessToken", response.accessToken);
});

pm.test("User is logged in", function () {
    pm.expect(response.user).to.have.property('lastLoginAt');
});

pm.test("Cookie is set", function () {
    pm.expect(pm.cookies.has('access_token')).to.be.true;
});
```

**Postman Settings:**
- ✅ Enable "Automatically follow redirects"
- ✅ Enable "Send cookies"

---

### **9. Request OTP**

**Request:**
```
POST {{baseUrl}}/auth/otp/request
Content-Type: application/json

Body (raw JSON):
{
  "email": "{{email}}"
}
```

**Expected Response 200:**
```json
{
  "statusCode": 200,
  "message": "OTP đã được gửi đến email của bạn",
  "otp": "123456",
  "userId": 1,
  "email": "test@example.com"
}
```

**⚠️ Production Note:** Field `otp` sẽ bị remove trong production.

**Tests Tab:**
```javascript
const response = pm.response.json();

pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has OTP code", function () {
    pm.expect(response).to.have.property('otp');
    pm.environment.set("otp", response.otp);
});

pm.test("OTP is 6 digits", function () {
    pm.expect(response.otp).to.match(/^\d{6}$/);
});
```

---

### **10. Verify OTP (LOGIN)**

**Request:**
```
POST {{baseUrl}}/auth/otp/verify
Content-Type: application/json

Body (raw JSON):
{
  "email": "{{email}}",
  "otp": "{{otp}}"
}
```

**Expected Response 200:**
```json
{
  "statusCode": 200,
  "message": "Đăng nhập thành công với OTP",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "username": "johndoe",
    "status": "active",
    "lastLoginAt": "2026-01-08T12:30:00.000Z"
  },
  "accessToken": "eyJhbGci..."
}
```

**Response Headers:**
```
Set-Cookie: access_token=eyJhbGci...; HttpOnly; Secure; SameSite=Lax; Max-Age=604800; Path=/
```

**Tests Tab:**
```javascript
const response = pm.response.json();

pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has access token", function () {
    pm.expect(response).to.have.property('accessToken');
    pm.environment.set("accessToken", response.accessToken);
});

pm.test("User is logged in", function () {
    pm.expect(response.user).to.have.property('lastLoginAt');
});

pm.test("Cookie is set", function () {
    pm.expect(pm.cookies.has('access_token')).to.be.true;
});
```

---

### **11. Google OAuth (Manual Test)**

**⚠️ Important:** Google OAuth không thể test trực tiếp trong Postman vì cần browser redirect flow.

**Testing Steps:**

1. **Browser Test:**
   ```
   Navigate to: https://work-management-git-ngocminh-ngocminh000s-projects.vercel.app/auth/google
   ```

2. **What happens:**
   - Browser redirects to Google login
   - You choose Google account
   - Google redirects back to `/auth/google/callback`
   - Server sets cookie and returns JSON

3. **Check Response in Browser DevTools:**
   ```javascript
   // Expected JSON response
   {
     "statusCode": 200,
     "message": "Đăng nhập Google thành công",
     "user": {
       "id": 1,
       "email": "yourname@gmail.com",
       "username": "yourname_a1b2c3",
       "fullName": "Your Name",
       "avatarUrl": "https://lh3.googleusercontent.com/...",
       "provider": "google",
       "status": "active"
     },
     "accessToken": "eyJhbGci..."
   }
   ```

4. **Verify Cookie:**
   - Open DevTools → Application → Cookies
   - Check `access_token` cookie exists with:
     - HttpOnly: ✅
     - Secure: ✅ (if HTTPS)
     - SameSite: Lax
     - Max-Age: 604800

**Alternative: Test Callback Directly (if you have auth code):**
```
GET {{baseUrl}}/auth/google/callback?code=AUTHORIZATION_CODE_FROM_GOOGLE
```

---

### **12. Logout**

**Request:**
```
POST {{baseUrl}}/auth/logout
```

**Expected Response 200:**
```json
{
  "statusCode": 200,
  "message": "Đăng xuất thành công"
}
```

**Response Headers:**
```
Set-Cookie: access_token=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/
```

**Tests Tab:**
```javascript
const response = pm.response.json();

pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Success message", function () {
    pm.expect(response.message).to.include("thành công");
});

pm.test("Cookie is cleared", function () {
    // Cookie should have Max-Age=0
    const cookieHeader = pm.response.headers.get('Set-Cookie');
    pm.expect(cookieHeader).to.include('Max-Age=0');
});

// Clear environment token
pm.environment.unset("accessToken");
```

---

### **📚 Testing Best Practices**

#### **1. Test Order**
Run tests in this order for a complete flow:
1. Email Verification (if new user)
2. Login (Magic Link or OTP)
3. Test authenticated actions (if needed)
4. Logout

#### **2. Cookie Testing**
- Enable "Send cookies" in Postman settings
- Check "Cookies" tab after each request
- Verify cookie attributes in response headers

#### **3. Environment Variables**
- Use `{{variable}}` syntax
- Auto-set tokens in Tests tab using `pm.environment.set()`
- Clear sensitive data after logout

#### **4. Error Testing**
Test error scenarios:
- Invalid token: `{ "token": "invalid" }`
- Expired token: Use old token from previous day
- Missing fields: `{ }`
- Wrong email format: `{ "email": "not-an-email" }`

#### **5. Pre-request Scripts**
Add to Collection level:
```javascript
// Set dynamic timestamp
pm.environment.set("timestamp", new Date().toISOString());

// Log request
console.log(`[${pm.info.requestName}] Starting request...`);
```

#### **6. Collection Variables vs Environment**
- **Collection:** Shared constants (baseUrl)
- **Environment:** Dynamic values (tokens, userId)

---

### **🔍 Debugging Tips**

#### **Check Token Expiry**
Decode JWT at [jwt.io](https://jwt.io):
```json
{
  "userId": 1,
  "email": "test@example.com",
  "type": "access_token",
  "iat": 1704715200,
  "exp": 1705320000
}
```
- `iat`: Issued at (UNIX timestamp)
- `exp`: Expiration (UNIX timestamp)

#### **Common Errors**

| Error | Cause | Solution |
|-------|-------|----------|
| `Token đã hết hạn` | Token expired | Request new token |
| `Token không hợp lệ` | Malformed/invalid token | Check token format |
| `Email không tồn tại` | User not found | Use valid email |
| `OTP không đúng` | Wrong OTP | Check OTP from response/email |
| `Tài khoản chưa được kích hoạt` | User status != 'active' | Verify email first |

#### **Console Logs**
Check Postman Console (View → Show Postman Console):
- Request headers
- Response headers
- Cookies sent/received
- Test results

---

### **📥 Import Postman Collection**

**JSON Collection Example:**
```json
{
  "info": {
    "name": "Work Management API - Authentication",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Request Magic Link",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"{{email}}\"\n}"
        },
        "url": "{{baseUrl}}/auth/magic-link/request"
      },
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "const response = pm.response.json();",
              "pm.test('Status code is 200', () => pm.response.to.have.status(200));",
              "pm.test('Has token', () => pm.environment.set('magicLinkToken', response.token));"
            ]
          }
        }
      ]
    }
    // ... more requests
  ]
}
```

Save this to `.json` file và import vào Postman: **Import → File → Select JSON**

---

## 🎓 SUMMARY

### **Quick Reference Card**

| Task | Endpoint | Method | Auth Required |
|------|----------|--------|---------------|
| Verify email | `/auth/verify-email` | POST | ❌ No (token in body) |
| Resend verification | `/auth/resend-verification` | POST | ❌ No |
| Forgot password | `/auth/forgot-password` | POST | ❌ No |
| Reset password | `/auth/reset-password` | POST | ❌ No (token in body) |
| Change email | `/auth/request-change-email` | POST | ⚠️ Yes (TODO: needs JWT guard) |
| Verify email change | `/auth/verify-email-change` | POST | ❌ No (token in body) |
| Request magic link | `/auth/magic-link/request` | POST | ❌ No |
| Login with magic link | `/auth/magic-link/verify` | POST | ❌ No (token in body) |
| Request OTP | `/auth/otp/request` | POST | ❌ No |
| Login with OTP | `/auth/otp/verify` | POST | ❌ No |
| Login with Google | `/auth/google` | GET | ❌ No |
| Google callback | `/auth/google/callback` | GET | ❌ No (handled by OAuth) |
| Logout | `/auth/logout` | POST | ❌ No (clears cookie) |

### **Authentication Methods Comparison**

| Method | Security | UX | Production Ready | Use Case |
|--------|----------|----|--------------------|----------|
| **Magic Link** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Yes | Best for mobile, passwordless |
| **OTP** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⚠️ Needs Redis | 2FA, high security |
| **Google OAuth** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Yes | Social login, no password |
| **Password** | ⭐⭐⭐ | ⭐⭐⭐ | ✅ Yes | Traditional auth |

### **Common Workflows**

**New User Registration:**
```
1. Signup (external endpoint) → Receive verification email
2. POST /auth/verify-email → Account activated
3. POST /auth/magic-link/request → Receive magic link
4. POST /auth/magic-link/verify → Logged in ✅
```

**Existing User Login:**
```
Option A: Magic Link
  1. POST /auth/magic-link/request
  2. POST /auth/magic-link/verify → Logged in ✅

Option B: OTP
  1. POST /auth/otp/request
  2. POST /auth/otp/verify → Logged in ✅

Option C: Google
  1. GET /auth/google → Redirect to Google
  2. User authorizes → Auto redirect to callback
  3. Logged in ✅
```

**Forgot Password:**
```
1. POST /auth/forgot-password → Receive reset email
2. POST /auth/reset-password → Password changed
3. Login with new password
```

### **Production Checklist**

Before deploying to production:

- [ ] Set strong `JWT_EMAIL_SECRET` (32+ characters, random)
- [ ] Enable HTTPS (`secure: true` for cookies)
- [ ] Implement rate limiting on all auth endpoints
- [ ] Migrate OTP storage to Redis
- [ ] Remove OTP from `/auth/otp/request` response
- [ ] Add JWT guard to `/auth/request-change-email`
- [ ] Implement account lockout after failed attempts
- [ ] Add token revocation/blacklist
- [ ] Set up monitoring & alerting
- [ ] Configure CORS properly
- [ ] Test all flows end-to-end
- [ ] Set up email service (SMTP credentials)
- [ ] Configure Google OAuth credentials
- [ ] Test cookie behavior in production domain
- [ ] Add security headers (Helmet.js)
- [ ] Enable audit logging

---

**Document Version:** 1.0
**Author:** Generated from codebase analysis
**Last Updated:** January 8, 2026
**Base URL:** https://work-management-git-ngocminh-ngocminh000s-projects.vercel.app

---

For questions or issues, please contact the development team.

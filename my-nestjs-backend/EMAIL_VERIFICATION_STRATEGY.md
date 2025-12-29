# 📧 Chiến Lược Xác Thực Email - Email Verification Strategy

## 📊 Phân Tích Hệ Thống Hiện Tại

### Tình Trạng Hiện Tại:
- ✅ Có chức năng đăng ký (register)
- ✅ Có chức năng đăng nhập (login)
- ✅ Hash password với bcrypt
- ❌ **CHƯA CÓ** xác thực email
- ❌ User đăng ký xong có thể login ngay lập tức
- ❌ Không có cơ chế verify email
- ❌ Không có cơ chế forgot password qua email

### User Schema Hiện Tại:
```typescript
{
  id: bigserial
  email: varchar(255) - unique
  username: varchar(50) - unique
  passwordHash: varchar(255)
  fullName: varchar(100)
  avatarUrl: varchar(500)
  status: 'active' | 'inactive' | 'suspended'  // ← Hiện tại chỉ có 3 status
  lastLoginAt: timestamp
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

## 🎯 Mục Tiêu

1. **Xác thực email khi đăng ký** - User phải verify email trước khi sử dụng hệ thống
2. **Forgot Password** - Cho phép user reset password qua email
3. **Resend Verification Email** - Cho phép gửi lại email xác thực
4. **Email Change Verification** - Khi user đổi email, phải verify email mới

---

## 🔧 Chiến Lược Kỹ Thuật

## PHƯƠNG ÁN 1: 🏆 **JWT Token Based (KHUYẾN NGHỊ)**

### ✅ Ưu Điểm:
- **Không cần database table mới** (lưu token trong JWT)
- Stateless, dễ scale
- Bảo mật tốt với expiration time
- Đơn giản, dễ implement
- Phù hợp với serverless (Vercel)

### ❌ Nhược Điểm:
- Không thể revoke token trước khi hết hạn
- Token có thể bị dài nếu chứa nhiều thông tin

### 📋 Cách Thức Hoạt Động:

#### 1. **Flow Đăng Ký (Register)**
```
User Register
    ↓
Tạo account với status = 'unverified'
    ↓
Generate JWT token (chứa: userId, email, type='email_verification', exp=24h)
    ↓
Gửi email với link: https://yourapp.com/verify-email?token=xxxxx
    ↓
Return response: "Vui lòng kiểm tra email để xác thực"
    ↓
User click link trong email
    ↓
Backend verify JWT token
    ↓
Update user status: 'unverified' → 'active'
    ↓
Redirect to login page hoặc auto login
```

#### 2. **Flow Forgot Password**
```
User nhập email
    ↓
Check email có tồn tại không
    ↓
Generate JWT token (chứa: userId, email, type='password_reset', exp=1h)
    ↓
Gửi email với link: https://yourapp.com/reset-password?token=xxxxx
    ↓
User click link
    ↓
Frontend show form nhập password mới
    ↓
Submit password mới + token
    ↓
Backend verify token & update password
```

#### 3. **Flow Change Email**
```
User nhập email mới
    ↓
Generate JWT token (chứa: userId, newEmail, type='email_change', exp=24h)
    ↓
Gửi email đến email MỚI
    ↓
User click link verify
    ↓
Backend verify token & update email
```

---

## PHƯƠNG ÁN 2: **Database Token Based**

### ✅ Ưu Điểm:
- Có thể revoke token bất cứ lúc nào
- Có thể track lịch sử verification
- Có thể giới hạn số lần gửi email

### ❌ Nhược Điểm:
- Cần thêm table mới
- Cần cleanup tokens expired
- Phức tạp hơn
- Thêm database queries

### 📋 Cần Tạo Table Mới:
```typescript
verification_tokens {
  id: bigserial
  userId: bigint (foreign key)
  token: varchar(255) - unique
  type: 'email_verification' | 'password_reset' | 'email_change'
  email: varchar(255) // email cần verify
  expiresAt: timestamp
  usedAt: timestamp (nullable)
  createdAt: timestamp
}
```

---

## 🏆 CHIẾN LƯỢC ĐỀ XUẤT (PHƯƠNG ÁN 1 - JWT)

### Lý do chọn:
1. **Đơn giản, nhanh** - Không cần thêm table, dễ maintain
2. **Phù hợp serverless** - Stateless, không cần cleanup job
3. **Bảo mật tốt** - JWT với secret key + expiration
4. **Đủ dùng** - Cho hầu hết use cases

---

## 📐 Thiết Kế Chi Tiết (JWT Based)

### 1. **Database Changes**

#### Thêm User Status
```typescript
// Thay đổi user_status enum
export const userStatusEnum = pgEnum('user_status', [
  'unverified',  // ← MỚI - User vừa đăng ký, chưa verify email
  'active',
  'inactive',
  'suspended'
]);
```

#### Thêm Field (Optional)
```typescript
// Thêm vào users table
emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true })
```

### 2. **Environment Variables**

```env
# Email Service (chọn 1 trong các option dưới)
# Option 1: Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Option 2: SendGrid
SENDGRID_API_KEY=your-sendgrid-key

# Option 3: Nodemailer với Ethereal (Development)
# Sẽ tự động tạo test account

# JWT Secret cho email verification
JWT_EMAIL_SECRET=your-super-secret-key-for-email-verification
EMAIL_VERIFICATION_EXPIRY=24h
PASSWORD_RESET_EXPIRY=1h

# Frontend URLs
FRONTEND_URL=http://localhost:5173
EMAIL_VERIFY_REDIRECT=/verify-email
PASSWORD_RESET_REDIRECT=/reset-password
```

### 3. **NPM Packages Cần Cài**

```bash
npm install @nestjs/jwt
npm install nodemailer
npm install @types/nodemailer --save-dev

# Nếu dùng SendGrid (optional)
npm install @sendgrid/mail

# Nếu dùng Handlebars cho email templates (optional)
npm install handlebars
```

### 4. **Cấu Trúc Module Mới**

```
src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.service.ts           # JWT generation/verification
│   ├── auth.controller.ts        # verify-email, forgot-password endpoints
│   └── dto/
│       ├── verify-email.dto.ts
│       ├── forgot-password.dto.ts
│       └── reset-password.dto.ts
│
├── email/
│   ├── email.module.ts
│   ├── email.service.ts          # Send email logic
│   └── templates/
│       ├── verify-email.hbs      # Email verification template
│       ├── reset-password.hbs    # Password reset template
│       └── email-changed.hbs     # Email changed notification
│
└── users/
    ├── users.service.ts          # CẬP NHẬT: thêm check verification
    └── users.controller.ts       # CẬP NHẬT: resend verification
```

### 5. **API Endpoints Mới**

```http
# 1. Verify Email (sau khi user click link trong email)
POST /auth/verify-email
Body: { "token": "jwt-token" }
Response: { "message": "Email verified successfully", "user": {...} }

# 2. Resend Verification Email
POST /auth/resend-verification
Body: { "email": "user@example.com" }
Response: { "message": "Email sent" }

# 3. Forgot Password (gửi email reset password)
POST /auth/forgot-password
Body: { "email": "user@example.com" }
Response: { "message": "Password reset email sent" }

# 4. Reset Password (sau khi user click link và nhập password mới)
POST /auth/reset-password
Body: { "token": "jwt-token", "newPassword": "new-pass" }
Response: { "message": "Password reset successfully" }

# 5. Request Change Email (gửi email xác thực đến email mới)
POST /auth/request-change-email
Body: { "newEmail": "new@example.com" }
Headers: Authorization: Bearer <access-token>
Response: { "message": "Verification email sent to new email" }

# 6. Verify New Email
POST /auth/verify-email-change
Body: { "token": "jwt-token" }
Response: { "message": "Email changed successfully" }
```

### 6. **Cập Nhật Logic Đăng Ký**

#### Trước (hiện tại):
```typescript
async create(createUserDto) {
  // Check email/username exists
  // Hash password
  // Insert user với status = 'active'
  // Return user
}
```

#### Sau (có verification):
```typescript
async create(createUserDto) {
  // Check email/username exists
  // Hash password
  // Insert user với status = 'unverified'  ← THAY ĐỔI
  // Generate JWT verification token
  // Send verification email              ← MỚI
  // Return { message: "Please check email", user: {...} }
}
```

### 7. **Cập Nhật Logic Login**

#### Trước (hiện tại):
```typescript
async login(loginDto) {
  // Find user
  // Check password
  // Return user + access token
}
```

#### Sau (có verification):
```typescript
async login(loginDto) {
  // Find user
  // Check if email verified                    ← MỚI
  if (user.status === 'unverified') {
    throw new UnauthorizedException('Please verify your email first')
  }
  // Check password
  // Return user + access token
}
```

### 8. **JWT Token Structure**

#### Email Verification Token:
```json
{
  "userId": 123,
  "email": "user@example.com",
  "type": "email_verification",
  "iat": 1234567890,
  "exp": 1234654290  // 24h sau
}
```

#### Password Reset Token:
```json
{
  "userId": 123,
  "email": "user@example.com",
  "type": "password_reset",
  "iat": 1234567890,
  "exp": 1234571490  // 1h sau
}
```

#### Email Change Token:
```json
{
  "userId": 123,
  "oldEmail": "old@example.com",
  "newEmail": "new@example.com",
  "type": "email_change",
  "iat": 1234567890,
  "exp": 1234654290  // 24h sau
}
```

### 9. **Email Templates**

#### Verification Email:
```html
Subject: Xác thực email của bạn

Xin chào {{fullName}},

Cảm ơn bạn đã đăng ký tài khoản!

Vui lòng click vào link dưới đây để xác thực email:
{{verificationLink}}

Link này sẽ hết hạn sau 24 giờ.

Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.
```

#### Password Reset Email:
```html
Subject: Đặt lại mật khẩu

Xin chào {{fullName}},

Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.

Click vào link dưới đây để đặt lại mật khẩu:
{{resetLink}}

Link này sẽ hết hạn sau 1 giờ.

Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
```

### 10. **Security Considerations**

#### ✅ Best Practices:
1. **Token expiration** - Email verification: 24h, Password reset: 1h
2. **Separate JWT secret** - Dùng secret khác với access token
3. **Rate limiting** - Giới hạn số lần gửi email (3 lần/15 phút)
4. **Email validation** - Validate email format kỹ càng
5. **HTTPS only** - Chỉ gửi link qua HTTPS ở production
6. **Token single-use** - Khi verify, mark as used (optional với JWT)

#### 🔒 Additional Security:
```typescript
// Rate limiting middleware
@UseGuards(ThrottlerGuard)
@Throttle(3, 900) // 3 requests per 15 minutes
async resendVerification() {}

// Email validation
import { IsEmail } from 'class-validator';
class VerifyEmailDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;
}
```

---

## 🧪 Testing Strategy

### 1. Development - Ethereal Email
```typescript
// Dùng Ethereal để test email mà không gửi thật
// Nodemailer tự động tạo test account
// Xem email tại: https://ethereal.email
```

### 2. Staging - Real Email Service
```typescript
// Dùng Gmail SMTP hoặc SendGrid
// Test với email thật
```

### 3. Production
```typescript
// SendGrid hoặc AWS SES
// Có monitoring và logging
```

---

## 📊 Migration Plan

### Bước 1: Database Migration
```sql
-- Thêm 'unverified' vào user_status enum
ALTER TYPE "public"."user_status" ADD VALUE 'unverified' BEFORE 'active';

-- Thêm field emailVerifiedAt (optional)
ALTER TABLE "public"."users"
ADD COLUMN "email_verified_at" TIMESTAMP WITH TIME ZONE;

-- Update tất cả users hiện tại đã verified
UPDATE "public"."users"
SET "email_verified_at" = "created_at"
WHERE "status" = 'active';
```

### Bước 2: Install Dependencies
```bash
npm install @nestjs/jwt nodemailer @types/nodemailer handlebars
```

### Bước 3: Setup Environment
```bash
# Thêm vào .env
JWT_EMAIL_SECRET=...
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...
```

### Bước 4: Create Modules
```bash
# Tạo auth module
nest g module auth
nest g service auth
nest g controller auth

# Tạo email module
nest g module email
nest g service email
```

### Bước 5: Update Existing Code
- Update users.service.ts - register logic
- Update users.service.ts - login logic
- Add middleware/guards

### Bước 6: Testing
- Test register flow
- Test email sending
- Test verification flow
- Test forgot password
- Test edge cases

---

## 🔄 Alternative Options

### Option A: Magic Link Login (Passwordless)
```
User nhập email → Gửi link → Click link → Auto login
```
**Ưu điểm:** Không cần nhớ password, UX tốt
**Nhược điểm:** Phụ thuộc hoàn toàn vào email

### Option B: OTP Code
```
User nhập email → Gửi 6-digit code → Nhập code → Verify
```
**Ưu điểm:** Đơn giản, dễ implement
**Nhược điểm:** User phải copy-paste code

### Option C: Social Login (Google, Facebook)
```
User click "Login with Google" → OAuth flow → Auto verified
```
**Ưu điểm:** Email đã verified sẵn
**Nhược điểm:** Cần setup OAuth, phụ thuộc bên thứ 3

---

## 💰 Chi Phí Email Service

### Free Tier:
1. **Gmail SMTP** - 500 emails/day (free)
2. **SendGrid** - 100 emails/day (free)
3. **Ethereal** - Unlimited (development only)

### Paid (nếu scale):
1. **SendGrid** - $15/month for 40k emails
2. **AWS SES** - $0.10 per 1000 emails
3. **Mailgun** - $35/month for 50k emails

---

## 📝 Checklist Implementation

### Phase 1: Basic Email Verification
- [ ] Update database schema (add 'unverified' status)
- [ ] Install @nestjs/jwt, nodemailer
- [ ] Create Auth module & service
- [ ] Create Email module & service
- [ ] Update register logic (set status = unverified)
- [ ] Generate JWT verification token
- [ ] Send verification email
- [ ] Implement verify-email endpoint
- [ ] Update login logic (check verified)
- [ ] Implement resend-verification endpoint
- [ ] Test basic flow

### Phase 2: Password Reset
- [ ] Implement forgot-password endpoint
- [ ] Generate password reset token
- [ ] Send password reset email
- [ ] Implement reset-password endpoint
- [ ] Test password reset flow

### Phase 3: Email Change
- [ ] Implement request-change-email endpoint
- [ ] Generate email change token
- [ ] Send verification to new email
- [ ] Implement verify-email-change endpoint
- [ ] Test email change flow

### Phase 4: Enhancements
- [ ] Add rate limiting
- [ ] Add email templates với Handlebars
- [ ] Add logging & monitoring
- [ ] Add admin panel to view verification status
- [ ] Add automatic email cleanup (optional)
- [ ] Production deployment

---

## 🎯 Timeline Ước Tính

| Phase | Tasks | Time |
|-------|-------|------|
| Phase 1 | Basic Email Verification | 4-6 hours |
| Phase 2 | Password Reset | 2-3 hours |
| Phase 3 | Email Change | 2-3 hours |
| Phase 4 | Enhancements | 3-4 hours |
| **Total** | | **11-16 hours** |

---

## ❓ Câu Hỏi Cần Làm Rõ

Trước khi bắt đầu code, bạn cần quyết định:

1. **Email Service nào?**
   - [ ] Gmail SMTP (free, dễ setup, giới hạn 500/day)
   - [ ] SendGrid (free 100/day, pro features)
   - [ ] Ethereal (development only)
   - [ ] Khác: ___________

2. **Token expiration time?**
   - Email verification: 24h (mặc định) hoặc ___________
   - Password reset: 1h (mặc định) hoặc ___________

3. **Các tính năng nào cần implement?**
   - [x] Email Verification khi đăng ký (bắt buộc)
   - [x] Forgot Password
   - [ ] Email Change Verification
   - [ ] Resend Verification Email
   - [ ] Magic Link Login (passwordless)
   - [ ] OTP Code

4. **User hiện tại trong DB xử lý thế nào?**
   - [ ] Mark tất cả là 'active' và verified
   - [ ] Yêu cầu verify lại
   - [ ] Admin manually approve

5. **Frontend có sẵn chưa?**
   - [ ] Có - URL: ___________
   - [ ] Chưa - cần tạo page verify-email và reset-password

6. **Muốn có email template đẹp không?**
   - [ ] Có - dùng Handlebars với CSS
   - [ ] Không - plain text là đủ

---

## 🏁 Next Steps

Sau khi bạn review chiến lược này và trả lời các câu hỏi trên, tôi sẽ:

1. ✅ Generate migration scripts
2. ✅ Tạo Auth module với JWT
3. ✅ Tạo Email service
4. ✅ Update Users service
5. ✅ Tạo email templates
6. ✅ Implement tất cả endpoints
7. ✅ Test flow hoàn chỉnh
8. ✅ Update documentation

**Bạn có câu hỏi gì hoặc muốn thay đổi chiến lược không?**

# 📚 Work Management - Complete API Collection Guide

## 🎯 Tổng Quan

**Collection:** Work-Management-COMPLETE-ALL-APIs.postman_collection.json

Đây là collection hoàn chỉnh chứa **TOÀN BỘ 90+ API endpoints** của Work Management System, được tổ chức khoa học thành 12 modules để dễ test và hiểu.

---

## 📦 Thông Tin Collection

- **Tên:** Work Management - ALL APIs (Complete & Organized)
- **Server:** Production - https://work-management-chi.vercel.app
- **Authentication:** JWT Bearer Token (tự động lưu sau khi login)
- **Tổng số APIs:** 90+ endpoints
- **Modules:** 12 modules logic
- **Test Scripts:** Tất cả APIs quan trọng đều có test scripts và console logging

---

## 🗂️ Cấu Trúc Collection

### Module 00: System Health Check (1 API)
**Mục đích:** Kiểm tra server có hoạt động hay không

| API | Method | Endpoint | Auth | Mô tả |
|-----|--------|----------|------|-------|
| Health Check - Root | GET | `/` | Public | Kiểm tra server status |

---

### Module 01: Authentication & Authorization (20 APIs)

**Mục đích:** Xác thực người dùng và quản lý phiên đăng nhập

#### 01.1 Basic Auth (4 APIs)
| API | Method | Endpoint | Mô tả |
|-----|--------|----------|-------|
| Register New User | POST | `/users` | Đăng ký tài khoản mới |
| Login Creator | POST | `/users/login` | Login tài khoản creator |
| Login Receiver | POST | `/users/login` | Login tài khoản receiver |
| Logout | POST | `/auth/logout` | Đăng xuất |

#### 01.2 Email Verification (3 APIs)
| API | Method | Endpoint | Mô tả |
|-----|--------|----------|-------|
| Verify Email (POST) | POST | `/auth/verify-email` | Verify qua token |
| Verify Email (GET) | GET | `/auth/verify-email/:token` | Verify qua link |
| Resend Verification | POST | `/auth/resend-verification` | Gửi lại email verify |

#### 01.3 Password Reset (2 APIs)
| API | Method | Endpoint | Mô tả |
|-----|--------|----------|-------|
| Forgot Password | POST | `/auth/forgot-password` | Yêu cầu reset password |
| Reset Password | POST | `/auth/reset-password` | Reset password với token |

#### 01.4 Email Change (2 APIs)
| API | Method | Endpoint | Mô tả |
|-----|--------|----------|-------|
| Request Change Email | POST | `/auth/request-change-email` | Yêu cầu đổi email |
| Verify Email Change | POST | `/auth/verify-email-change` | Xác nhận đổi email |

#### 01.5 Magic Link (3 APIs)
| API | Method | Endpoint | Mô tả |
|-----|--------|----------|-------|
| Request Magic Link | POST | `/auth/magic-link/request` | Yêu cầu magic link |
| Verify Magic Link (POST) | POST | `/auth/magic-link/verify` | Verify qua POST |
| Verify Magic Link (GET) | GET | `/auth/magic-link/:token` | Verify qua link |

#### 01.6 OTP Authentication (2 APIs)
| API | Method | Endpoint | Mô tả |
|-----|--------|----------|-------|
| Request OTP | POST | `/auth/otp/request` | Yêu cầu OTP code |
| Verify OTP | POST | `/auth/otp/verify` | Xác thực OTP |

#### 01.7 Google OAuth (2 APIs)
| API | Method | Endpoint | Mô tả |
|-----|--------|----------|-------|
| Google Auth - Initiate | GET | `/auth/google` | Bắt đầu Google login |
| Google Auth - Callback | GET | `/auth/google/callback` | Callback từ Google |

---

### Module 02: User Management (5 APIs)

**Mục đích:** Quản lý thông tin người dùng

| API | Method | Endpoint | Auth | Mô tả |
|-----|--------|----------|------|-------|
| Get All Users | GET | `/users` | JWT | Lấy danh sách tất cả users |
| Get User By ID | GET | `/users/:id` | JWT | Lấy thông tin user theo ID |
| Update User Profile | PUT | `/users/:id` | JWT | Cập nhật profile |
| Change Password | PATCH | `/users/:id/change-password` | JWT | Đổi mật khẩu |
| Delete User | DELETE | `/users/:id` | JWT | Xóa user |

---

### Module 03: Project Management (11 APIs)

**Mục đích:** Quản lý dự án

| API | Method | Endpoint | Auth | Mô tả |
|-----|--------|----------|------|-------|
| Create Project | POST | `/projects` | JWT | Tạo project mới |
| Get All Projects | GET | `/projects` | Public | Lấy tất cả projects |
| Get Projects By User | GET | `/projects?userId=:id` | Public | Lấy projects của user |
| Search Projects | GET | `/projects/search?name=` | Public | Tìm kiếm project |
| Get Project Count | GET | `/projects/count` | Public | Đếm số lượng projects |
| Get Project By ID | GET | `/projects/:id` | Public | Lấy project theo ID |
| Get Project Details | GET | `/projects/:id/details` | Public | Chi tiết project đầy đủ |
| Get Project Activities | GET | `/projects/:id/activities` | Public | Lịch sử hoạt động |
| Get User Role in Project | GET | `/projects/:id/role` | JWT | Lấy role của user hiện tại |
| Get User Role By IDs | GET | `/projects/:projectId/users/:userId/role` | Public | Lấy role theo IDs |
| Update Project | PUT | `/projects/:id` | JWT | Cập nhật project |
| Delete Project | DELETE | `/projects/:id` | JWT | Xóa project |

---

### Module 04: Project Members (7 APIs)

**Mục đích:** Quản lý thành viên trong dự án, bao gồm auto notifications

| API | Method | Endpoint | Auth | Notification | Mô tả |
|-----|--------|----------|------|--------------|-------|
| Add Member to Project | POST | `/projects/:id/members` | JWT | ❌ | Thêm member vào project |
| Get All Project Members | GET | `/projects/:id/members` | JWT | ❌ | Lấy tất cả members |
| Get Active Members Only | GET | `/projects/:id/members/active` | JWT | ❌ | Lấy members đang active |
| **Get All Users in Project** | GET | `/projects/:id/members/users` | Public | ❌ | **[NEW]** Lấy users với full info |
| Accept Invitation | POST | `/projects/:id/members/accept` | JWT | ✅ | Accept invite, gửi notification |
| Update Member Role | PATCH | `/projects/:id/members/:userId` | JWT | ❌ | Đổi role của member |
| Remove Member | DELETE | `/projects/:id/members/:userId` | JWT | ❌ | Remove member |

**Auto Notification:**
- **added_to_project** - Khi user accept invitation

---

### Module 05: Sprint Management (12 APIs)

**Mục đích:** Quản lý sprint và sprint comments, bao gồm auto notifications

| API | Method | Endpoint | Auth | Notification | Mô tả |
|-----|--------|----------|------|--------------|-------|
| Create Sprint | POST | `/sprints` | JWT | ✅ | Tạo sprint mới |
| Get All Sprints in Project | GET | `/sprints?projectId=:id` | JWT | ❌ | Lấy sprints của project |
| Get Sprint By ID | GET | `/sprints/:id` | JWT | ❌ | Lấy sprint theo ID |
| Update Sprint | PUT | `/sprints/:id` | JWT | ❌ | Cập nhật sprint |
| Start Sprint | PATCH | `/sprints/:id/start` | JWT | ✅ | Start sprint (status: active) |
| Complete Sprint | PATCH | `/sprints/:id/complete` | JWT | ✅ | Complete sprint |
| Cancel Sprint | PATCH | `/sprints/:id/cancel` | JWT | ❌ | Cancel sprint |
| Delete Sprint | DELETE | `/sprints/:id` | JWT | ❌ | Xóa sprint |
| Get Sprint Comments | GET | `/sprints/:id/comments` | JWT | ❌ | Lấy comments của sprint |
| Add Comment to Sprint | POST | `/sprints/:id/comments` | JWT | ❌ | Thêm comment vào sprint |
| Update Sprint Comment | PUT | `/sprints/:id/comments/:commentId` | JWT | ❌ | Sửa comment |
| Delete Sprint Comment | DELETE | `/sprints/:id/comments/:commentId` | JWT | ❌ | Xóa comment |

**Auto Notifications:**
- **sprint_created** - Khi sprint mới được tạo
- **sprint_status_changed** - Khi sprint đổi status (start/complete)

---

### Module 06: Task Management (13 APIs)

**Mục đích:** Quản lý tasks, bao gồm auto notifications

| API | Method | Endpoint | Auth | Notification | Mô tả |
|-----|--------|----------|------|--------------|-------|
| Create Task | POST | `/tasks` | JWT | ✅✅ | Tạo task mới (2 notifications) |
| Get All Tasks | GET | `/tasks` | JWT | ❌ | Lấy tất cả tasks |
| Get Tasks By Project | GET | `/tasks?projectId=:id` | JWT | ❌ | Lấy tasks của project |
| Get Tasks By Sprint | GET | `/tasks?sprintId=:id` | JWT | ❌ | Lấy tasks của sprint |
| Get Tasks By Assignee | GET | `/tasks?assigneeId=:id` | JWT | ❌ | Lấy tasks của assignee |
| Get Task By ID | GET | `/tasks/:id` | JWT | ❌ | Lấy task theo ID |
| Get Task Subtasks | GET | `/tasks/:id/subtasks` | JWT | ❌ | Lấy subtasks |
| **Get Task Assignee** | GET | `/tasks/:id/assignee` | JWT | ❌ | **[NEW]** Lấy assignee info |
| Update Task | PUT | `/tasks/:id` | JWT | ❌ | Cập nhật task |
| Update Task Status | PATCH | `/tasks/:id/status` | JWT | ✅ | Đổi status |
| Assign Task | PATCH | `/tasks/:id/assign` | JWT | ✅ | Assign task cho user |
| Update Task Priority | PATCH | `/tasks/:id/priority` | JWT | ❌ | Đổi priority |
| Delete Task | DELETE | `/tasks/:id` | JWT | ✅ | Xóa task |

**Auto Notifications:**
- **task_created** - Khi task mới được tạo (gửi cho tất cả members)
- **task_assigned** - Khi task được assign (gửi cho assignee)
- **task_status_changed** - Khi task đổi status
- **task_deleted** - Khi task bị xóa

---

### Module 07: Task History (2 APIs)

**Mục đích:** Xem lịch sử thay đổi của task

| API | Method | Endpoint | Auth | Mô tả |
|-----|--------|----------|------|-------|
| Get Task History | GET | `/tasks/:id/history` | JWT | Lịch sử của 1 task |
| Get Project Task History | GET | `/projects/:id/task-history` | JWT | Lịch sử tất cả tasks trong project |

---

### Module 08: Comments Management (6 APIs)

**Mục đích:** Quản lý comments trên task, bao gồm auto notifications

| API | Method | Endpoint | Auth | Notification | Mô tả |
|-----|--------|----------|------|--------------|-------|
| Create Comment on Task | POST | `/comments` | JWT | ✅ | Thêm comment mới |
| Get Comments By Task | GET | `/comments?taskId=:id` | JWT | ❌ | Lấy comments của task |
| Get Comments By Project | GET | `/comments?projectId=:id` | JWT | ❌ | Lấy comments của project |
| Get Comment By ID | GET | `/comments/:id` | JWT | ❌ | Lấy comment theo ID |
| Update Comment | PUT | `/comments/:id` | JWT | ❌ | Sửa comment |
| Delete Comment | DELETE | `/comments/:id` | JWT | ❌ | Xóa comment |

**Auto Notification:**
- **comment_added** - Khi có comment mới trên task

---

### Module 09: Labels Management (8 APIs)

**Mục đích:** Quản lý labels (tags) cho tasks

| API | Method | Endpoint | Auth | Mô tả |
|-----|--------|----------|------|-------|
| Create Label | POST | `/labels` | JWT | Tạo label mới |
| Get All Labels | GET | `/labels` | JWT | Lấy tất cả labels |
| Get Labels By Project | GET | `/labels?projectId=:id` | JWT | Lấy labels của project |
| Get Label By ID | GET | `/labels/:id` | JWT | Lấy label theo ID |
| Update Label | PUT | `/labels/:id` | JWT | Cập nhật label |
| Add Label to Task | POST | `/labels/:labelId/tasks/:taskId` | JWT | Gắn label vào task |
| Remove Label from Task | DELETE | `/labels/:labelId/tasks/:taskId` | JWT | Gỡ label khỏi task |
| Delete Label | DELETE | `/labels/:id` | JWT | Xóa label |

---

### Module 10: Attachments Management (4 APIs)

**Mục đích:** Quản lý file đính kèm

| API | Method | Endpoint | Auth | Mô tả |
|-----|--------|----------|------|-------|
| Upload Attachment | POST | `/attachments` | JWT | Upload file (multipart/form-data) |
| Get Attachments By Task | GET | `/attachments?taskId=:id` | JWT | Lấy attachments của task |
| Get Attachment By ID | GET | `/attachments/:id` | JWT | Lấy attachment theo ID |
| Delete Attachment | DELETE | `/attachments/:id` | JWT | Xóa attachment |

---

### Module 11: Notifications (9 APIs)

**Mục đích:** Quản lý thông báo

| API | Method | Endpoint | Auth | Mô tả |
|-----|--------|----------|------|-------|
| Get All User Notifications | GET | `/notifications/user/:userId` | JWT | Lấy tất cả notifications |
| Get Unread Notifications | GET | `/notifications/user/:userId/unread` | JWT | Lấy notifications chưa đọc |
| Get Unread Count | GET | `/notifications/user/:userId/count` | JWT | Đếm số lượng chưa đọc |
| Get Notifications By Type | GET | `/notifications/user/:userId/type/:type` | JWT | Lấy theo type |
| Get Notifications By Project | GET | `/notifications/user/:userId/project/:projectId` | JWT | Lấy theo project |
| Mark Notification as Read | PATCH | `/notifications/:id/read` | JWT | Đánh dấu 1 notification đã đọc |
| Mark All as Read | PATCH | `/notifications/user/:userId/read-all` | JWT | Đánh dấu tất cả đã đọc |
| Delete Notification | DELETE | `/notifications/:id` | JWT | Xóa 1 notification |
| Delete All Notifications | DELETE | `/notifications/user/:userId/all` | JWT | Xóa tất cả notifications |

---

## 🚀 Cách Sử Dụng

### Bước 1: Import vào Postman

1. Mở Postman
2. Click **Import** (góc trên bên trái)
3. Chọn file: `Work-Management-COMPLETE-ALL-APIs.postman_collection.json`
4. Import environment file: `Work-Management-Complete-Test.postman_environment.json`

### Bước 2: Chọn Environment

1. Góc trên bên phải, chọn dropdown **Environments**
2. Chọn: **Work Management - Complete Test Environment**
3. Verify các biến:
   - `base_url`: https://work-management-chi.vercel.app
   - `creator_email`: dongocminh1210@gmail.com
   - `creator_password`: Password123!
   - `receiver_email`: ngocminhyc1@gmail.com
   - `receiver_password`: Password123!

### Bước 3: Login để Lấy Tokens

**Quan trọng:** Phải login trước khi test các APIs khác!

1. Mở folder: `01. Authentication` > `01.1 Basic Auth`
2. Chạy request: **Login Creator** (dongocminh1210@gmail.com)
   - Tự động lưu `creator_token` và `creator_id` vào environment
3. Chạy request: **Login Receiver** (ngocminhyc1@gmail.com)
   - Tự động lưu `receiver_token` và `receiver_id` vào environment

### Bước 4: Test Các Modules Theo Thứ Tự

**Workflow đề xuất:**

```
1. Module 00: Health Check
   └─ Verify server đang chạy

2. Module 01: Authentication
   └─ Login cả 2 accounts (Creator + Receiver)

3. Module 03: Project Management
   └─ Create Project → Lưu project_id

4. Module 04: Project Members
   └─ Add Receiver to Project
   └─ Receiver Accept Invitation → 🔔 NOTIFICATION

5. Module 05: Sprint Management
   └─ Create Sprint → 🔔 NOTIFICATION
   └─ Start Sprint → 🔔 NOTIFICATION

6. Module 06: Task Management
   └─ Create Task (assign to Receiver) → 🔔 2 NOTIFICATIONS
   └─ Update Status → 🔔 NOTIFICATION
   └─ Add Comment → 🔔 NOTIFICATION

7. Module 11: Notifications
   └─ Get All Notifications (check tất cả notifications đã nhận)
```

---

## 🔔 Auto Notification System

### Các Sự Kiện Tự Động Gửi Notification:

| Sự kiện | API Trigger | Type | Người nhận |
|---------|-------------|------|-----------|
| User được thêm vào project | Accept Invitation | `added_to_project` | User được thêm |
| Sprint mới được tạo | Create Sprint | `sprint_created` | Tất cả members |
| Sprint đổi status | Start/Complete Sprint | `sprint_status_changed` | Tất cả members |
| Task mới được tạo | Create Task | `task_created` | Tất cả members |
| Task được assign | Create/Assign Task | `task_assigned` | Assignee |
| Task đổi status | Update Task Status | `task_status_changed` | Assignee |
| Task bị xóa | Delete Task | `task_deleted` | Assignee (nếu có) |
| Comment mới | Create Comment | `comment_added` | Task owner + Assignee |

### Cách Test Auto Notifications:

**Scenario đầy đủ:**

```javascript
// 1. Creator login
POST /users/login (dongocminh1210@gmail.com)

// 2. Receiver login
POST /users/login (ngocminhyc1@gmail.com)

// 3. Creator tạo project
POST /projects
→ Lưu project_id

// 4. Creator add Receiver vào project
POST /projects/:id/members (userId = receiver_id)

// 5. Receiver accept invitation
POST /projects/:id/members/accept (dùng receiver_token)
→ 🔔 Notification #1: added_to_project

// 6. Creator tạo sprint
POST /sprints
→ 🔔 Notification #2: sprint_created

// 7. Creator start sprint
PATCH /sprints/:id/start
→ 🔔 Notification #3: sprint_status_changed

// 8. Creator tạo task và assign cho Receiver
POST /tasks (assigneeId = receiver_id)
→ 🔔 Notification #4: task_created
→ 🔔 Notification #5: task_assigned

// 9. Creator đổi task status
PATCH /tasks/:id/status (status = "in_progress")
→ 🔔 Notification #6: task_status_changed

// 10. Creator thêm comment
POST /comments (taskId = task_id)
→ 🔔 Notification #7: comment_added

// 11. Creator xóa task
DELETE /tasks/:id
→ 🔔 Notification #8: task_deleted

// 12. Receiver check notifications
GET /notifications/user/:userId (dùng receiver_token)
→ Xem tất cả 8 notifications đã nhận
```

---

## 📊 Test Scripts & Console Logging

### Console Output Examples:

**Khi Login:**
```
✅ Logged in as: dongocminh1210@gmail.com
```

**Khi Create Project:**
```
✅ Project created: Test Project 1736467200
```

**Khi Create Sprint:**
```
✅ Sprint created: Sprint 1736467201
🔔 Notifications sent to all members
```

**Khi Create Task:**
```
✅ Task created: Test Task 1736467202
🔔 2 Notifications: task_created + task_assigned
```

**Khi Get Notifications:**
```
🔔 USER NOTIFICATIONS
═══════════════════════════════════
Total: 12
Unread: 8

📊 Recent 5 Notifications:
1. [task_deleted] Task đã bị xóa khỏi dự án
2. [comment_added] Có comment mới trên task của bạn
3. [task_status_changed] Task đã chuyển từ Đang làm sang Hoàn thành
4. [task_assigned] Task được gán cho bạn
5. [sprint_created] Sprint mới được tạo
```

---

## 🆕 2 APIs Mới Vừa Thêm

### 1. Get All Users in Project

**Endpoint:** `GET /projects/:projectId/members/users`

**Auth:** Public (không cần token)

**Response:**
```json
[
  {
    "userId": 1,
    "email": "user@example.com",
    "username": "username",
    "fullName": "Full Name",
    "avatarUrl": "https://...",
    "role": "member",
    "status": "active",
    "joinedAt": "2026-01-10T00:00:00Z"
  }
]
```

**Use Cases:**
- Hiển thị danh sách members trong project
- Chọn user để assign task
- Hiển thị team members với role

**Console Output:**
```
👥 USERS IN PROJECT
═══════════════════════════════════
Total users: 3
1. Đỗ Ngọc Minh (admin)
2. Ngọc Minh YC (member)
3. Another User (member)
```

---

### 2. Get Task Assignee

**Endpoint:** `GET /tasks/:taskId/assignee`

**Auth:** JWT Bearer token

**Response (có assignee):**
```json
{
  "userId": 5,
  "email": "assignee@example.com",
  "username": "assignee_user",
  "fullName": "Assignee Name",
  "avatarUrl": "https://...",
  "status": "active"
}
```

**Response (không có assignee):**
```json
null
```

**Use Cases:**
- Hiển thị thông tin người được assign task
- Hiển thị avatar và tên assignee
- Check xem task đã được assign chưa

**Console Output:**
```
👤 Assignee: Ngọc Minh YC
```

Hoặc:
```
⚠️ No assignee for this task
```

---

## 🔧 Environment Variables

### Variables được tự động lưu:

**User Credentials:**
- `creator_email`, `creator_password`
- `receiver_email`, `receiver_password`

**Authentication Tokens:**
- `creator_id`, `creator_token`
- `receiver_id`, `receiver_token`
- `new_user_id`, `new_user_token`

**Resource IDs:**
- `project_id` - ID của project vừa tạo
- `sprint_id` - ID của sprint vừa tạo
- `sprint_comment_id` - ID của sprint comment
- `task_id` - ID của task vừa tạo
- `comment_id` - ID của comment vừa tạo
- `label_id` - ID của label vừa tạo
- `attachment_id` - ID của attachment vừa upload
- `notification_id` - ID của notification

**Authentication Tokens (các phương thức khác):**
- `verification_token` - Email verification
- `reset_token` - Password reset
- `email_change_token` - Email change
- `magic_link_token` - Magic link login
- `otp_code` - OTP code

---

## ⚠️ Lưu Ý Quan Trọng

### Authentication:
- **JWT Token** tự động được set sau khi login
- Collection mặc định dùng `{{creator_token}}`
- Một số APIs cần `{{receiver_token}}` (đã set riêng trong request)
- Public APIs không cần token (đã set `auth: noauth`)

### Request Order:
- **Luôn login trước** khi test các APIs khác
- Tạo Project → Thêm Members → Tạo Sprint → Tạo Task (theo thứ tự)
- Environment variables tự động lưu IDs để dùng cho requests tiếp theo

### Notification Testing:
- Cần có ít nhất **2 users**: Creator (người tạo sự kiện) và Receiver (người nhận thông báo)
- Receiver phải là **active member** của project
- Chạy `GET /notifications/user/:userId` với receiver_token để xem notifications

### Error Handling:
- **401 Unauthorized**: Token hết hạn → Login lại
- **403 Forbidden**: Không có quyền → Check role trong project
- **404 Not Found**: Resource không tồn tại → Check IDs
- **409 Conflict**: Duplicate → Check xem đã tồn tại chưa

---

## 📈 Statistics

### Tổng quan:
- **Total APIs:** 90+
- **Modules:** 12
- **Authentication Methods:** 7 (Password, Email Verify, Magic Link, OTP, Google OAuth, Password Reset, Email Change)
- **Auto Notifications:** 8 types
- **Resource Types:** 10 (Users, Projects, Members, Sprints, Tasks, Comments, Labels, Attachments, Notifications, History)

### APIs by Module:
```
00. System Health Check       1 API
01. Authentication            20 APIs
02. User Management           5 APIs
03. Project Management        11 APIs
04. Project Members           7 APIs (1 NEW)
05. Sprint Management         12 APIs
06. Task Management           13 APIs (1 NEW)
07. Task History              2 APIs
08. Comments Management       6 APIs
09. Labels Management         8 APIs
10. Attachments Management    4 APIs
11. Notifications             9 APIs
─────────────────────────────────
TOTAL:                        90+ APIs
```

---

## 🎯 Quick Start (5 phút)

**Test nhanh tất cả tính năng:**

1. Import collection + environment vào Postman
2. Chọn environment
3. Login Creator + Receiver
4. Chạy folder **"01. Authentication"** → **Run**
5. Chạy folder **"03. Project Management"** → Create Project
6. Chạy folder **"04. Project Members"** → Add & Accept Member
7. Chạy folder **"05. Sprint Management"** → Create & Start Sprint
8. Chạy folder **"06. Task Management"** → Create Task
9. Chạy folder **"11. Notifications"** → Get All Notifications

**Done!** Bạn đã test toàn bộ workflow và thấy notifications hoạt động! 🎉

---

## 🔗 Files Liên Quan

**Postman Collections:**
- `Work-Management-COMPLETE-ALL-APIs.postman_collection.json` - Collection mới hoàn chỉnh (90+ APIs)
- `Work-Management-Complete-API-Test.postman_collection.json` - Collection cũ (70+ APIs)
- `Auto-Notification-Complete-Test.postman_collection.json` - Test riêng cho notifications

**Environment:**
- `Work-Management-Complete-Test.postman_environment.json` - Environment file chung

**Documentation:**
- `COMPLETE_API_COLLECTION_GUIDE.md` - Tài liệu này
- `POSTMAN_TEST_GUIDE.md` - Hướng dẫn chi tiết test
- `NEW_APIs_SUMMARY.md` - Tóm tắt 2 APIs mới

---

## 💡 Tips & Best Practices

### 1. Sử dụng Collection Runner
- Click **Run** ở folder để chạy nhiều requests cùng lúc
- Set delay = 500ms để tránh quá tải server
- Check console output để debug

### 2. Xem Console Logs
- Mở **Postman Console** (View > Show Postman Console)
- Tất cả requests quan trọng đều có console.log
- Logs hiển thị notifications, IDs, và status

### 3. Environment Variables
- Tất cả IDs tự động lưu vào environment
- Có thể edit trực tiếp trong Environment tab nếu cần
- Reset về giá trị ban đầu bằng cách re-import environment

### 4. Parallel Testing
- Chạy GET requests song song để tiết kiệm thời gian
- POST/PUT/DELETE nên chạy tuần tự
- Notifications cần chạy sau khi đã có events

---

## ✅ Checklist Trước Khi Test

- [ ] Đã import collection vào Postman
- [ ] Đã import environment file
- [ ] Đã chọn đúng environment
- [ ] Base URL đúng: `https://work-management-chi.vercel.app`
- [ ] Đã mở Postman Console để xem logs
- [ ] Internet connection ổn định
- [ ] Tài khoản dongocminh1210@gmail.com đã tồn tại và active
- [ ] Tài khoản ngocminhyc1@gmail.com đã tồn tại và active

---

**Tạo bởi:** Claude Code Assistant
**Ngày:** 2026-01-10
**Version:** 2.0 - Complete Collection
**Total APIs:** 90+

🚀 **Ready for Production!**

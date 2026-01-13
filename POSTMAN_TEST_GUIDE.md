# 📚 Hướng Dẫn Sử Dụng Postman Test Collections

## 🎯 Tổng Quan

Tài liệu này hướng dẫn cách sử dụng các Postman Collections để test toàn bộ API của Work Management System, bao gồm cả tính năng auto notifications.

---

## 📦 Các File Đã Tạo

### 1. **Work-Management-Complete-API-Test.postman_collection.json**
Collection toàn diện cho TẤT CẢ các API endpoints trong hệ thống.

**Bao gồm:**
- ✅ Authentication (Login, Verify Email, Reset Password, Magic Link, OTP, Google OAuth)
- ✅ Users Management
- ✅ Projects Management
- ✅ Project Members (với Auto Notifications)
- ✅ Sprints (với Auto Notifications)
- ✅ Tasks (với Auto Notifications)
- ✅ Comments (với Auto Notifications)
- ✅ Notifications
- ✅ Labels
- ✅ Attachments

**Tổng cộng:** 70+ API endpoints được test đầy đủ

---

### 2. **Auto-Notification-Complete-Test.postman_collection.json**
Collection chuyên biệt để test TOÀN BỘ tính năng Auto Notifications.

**Scenarios được test:**
1. 🔔 Project Member Notification - Khi được thêm vào dự án
2. 🔔 Sprint Created Notification - Khi sprint mới được tạo
3. 🔔 Sprint Status Changed - Khi sprint thay đổi trạng thái
4. 🔔 Task Created Notification - Khi task mới được tạo
5. 🔔 Task Assigned Notification - Khi được gán task
6. 🔔 Task Status Changed - Khi task thay đổi trạng thái
7. 🔔 Comment Added Notification - Khi có comment mới
8. 🔔 Task Deleted Notification - Khi task bị xóa

**Tổng cộng:** ~12 notifications được test tự động

---

### 3. **Work-Management-Complete-Test.postman_environment.json**
Environment file chứa tất cả biến môi trường cần thiết.

**Biến được cấu hình:**
```
base_url: https://work-management-chi.vercel.app

Tài khoản Creator (Người tạo sự kiện):
- creator_email: dongocminh1210@gmail.com
- creator_password: Password123!

Tài khoản Receiver (Người nhận thông báo):
- receiver_email: ngocminhyc1@gmail.com
- receiver_password: Password123!

Auto-saved variables:
- creator_id, creator_token
- receiver_id, receiver_token
- project_id, sprint_id, task_id
- comment_id, label_id, attachment_id
- notification_id
- verification_token, reset_token, magic_link_token, otp_code
```

---

## 🚀 Cách Sử Dụng

### Bước 1: Import vào Postman

1. Mở Postman
2. Click **Import** (góc trên bên trái)
3. Kéo thả hoặc chọn các file:
   - `Work-Management-Complete-API-Test.postman_collection.json`
   - `Auto-Notification-Complete-Test.postman_collection.json`
   - `Work-Management-Complete-Test.postman_environment.json`

### Bước 2: Chọn Environment

1. Ở góc trên bên phải, chọn dropdown **Environments**
2. Chọn: **Work Management - Complete Test Environment**

### Bước 3: Test Complete API (Collection 1)

#### 3.1 Test Authentication

```
📁 01. Authentication
  ├─ Login Creator (dongocminh1210) ✅
  ├─ Login Receiver (ngocminhyc1) ✅
  ├─ Verify Email
  ├─ Resend Verification
  ├─ Forgot Password
  ├─ Reset Password
  ├─ Request Magic Link
  ├─ Request OTP
  └─ Logout
```

**Chạy:**
- Chọn folder `01. Authentication`
- Click **Run** > **Run 01. Authentication**
- Hoặc chạy từng request riêng lẻ

#### 3.2 Test Projects & Members

```
📁 03. Projects Management
  └─ Create Project → Lưu project_id vào environment

📁 04. Project Members (Auto Notify)
  ├─ Add Receiver to Project
  ├─ Receiver Accept Invitation → 🔔 NOTIFICATION SENT!
  └─ Get All Project Members
```

#### 3.3 Test Sprints & Tasks

```
📁 05. Sprints (Auto Notify)
  ├─ Create Sprint → 🔔 NOTIFICATION SENT!
  ├─ Start Sprint → 🔔 NOTIFICATION SENT!
  └─ Complete Sprint → 🔔 NOTIFICATION SENT!

📁 06. Tasks (Auto Notify)
  ├─ Create Task → 🔔 2 NOTIFICATIONS SENT!
  ├─ Update Task Status → 🔔 NOTIFICATION SENT!
  └─ Delete Task → 🔔 NOTIFICATION SENT!
```

#### 3.4 Check Notifications

```
📁 08. Notifications
  ├─ Get All Notifications (Receiver) → Xem tất cả thông báo
  ├─ Get Unread Notifications
  ├─ Get Unread Count
  └─ Mark All as Read
```

---

### Bước 4: Test Auto Notifications (Collection 2)

Collection này được thiết kế để chạy tuần tự từ đầu đến cuối.

#### 4.1 Chạy Toàn Bộ Collection

1. Mở collection **Auto Notification - Complete Test with Real Accounts**
2. Click **Run** (góc trên bên phải)
3. Đảm bảo environment đã chọn đúng
4. Click **Run Auto Notification - Complete Test**
5. Xem kết quả real-time trong Console

#### 4.2 Kết Quả Mong Đợi

```
✅ CREATOR LOGGED IN
   Email: dongocminh1210@gmail.com

✅ RECEIVER LOGGED IN
   Email: ngocminhyc1@gmail.com

🔔 NOTIFICATION #1: added_to_project
🔔 NOTIFICATION #2: sprint_created
🔔 NOTIFICATION #3: task_created
🔔 NOTIFICATION #4: task_assigned
🔔 NOTIFICATION #5: task_status_changed (todo → in_progress)
🔔 NOTIFICATION #6: task_status_changed (in_progress → done)
🔔 NOTIFICATION #7: comment_added
🔔 NOTIFICATION #8: sprint_status_changed (planned → active)
🔔 NOTIFICATION #9: sprint_status_changed (active → completed)
🔔 NOTIFICATION #10: task_deleted

📊 FINAL NOTIFICATION REPORT
═══════════════════════════
Total notifications: ~12
✅ AUTO NOTIFICATION TEST COMPLETED!
```

#### 4.3 Xem Chi Tiết Notifications

Sau khi chạy xong, mở request cuối cùng:
- **📊 Final Report - All Notifications** > **Get Complete Notification Summary**
- Xem **Console** tab để thấy báo cáo chi tiết với:
  - Tổng số notifications
  - Phân loại theo type
  - 5 notifications gần nhất
  - Số lượng unread

---

## 🧪 Các Scenarios Test Chi Tiết

### Scenario 1: Project Member Notification

```javascript
1. Creator login
2. Receiver login
3. Creator add Receiver to project
4. Receiver accept invitation
   → 🔔 Notification: "Bạn được thêm vào dự án"
5. Receiver check notifications
   ✅ Verify notification received
```

### Scenario 2: Task Lifecycle Notifications

```javascript
1. Creator create sprint
   → 🔔 To all members: "Sprint mới được tạo"

2. Creator create task (assign to Receiver)
   → 🔔 To all members: "Task mới được tạo"
   → 🔔 To Receiver: "Task được gán cho bạn"

3. Creator update task status (todo → in_progress)
   → 🔔 To Receiver: "Task đã chuyển từ Cần làm sang Đang làm"

4. Creator update task status (in_progress → done)
   → 🔔 To Receiver: "Task đã chuyển từ Đang làm sang Hoàn thành"

5. Creator add comment
   → 🔔 To Receiver: "Có comment mới trên task của bạn"

6. Creator delete task
   → 🔔 To Receiver: "Task đã bị xóa khỏi dự án"
```

### Scenario 3: Sprint Status Notifications

```javascript
1. Creator start sprint (planned → active)
   → 🔔 To all members: "Sprint đã chuyển từ Lên kế hoạch sang Đang hoạt động"

2. Creator complete sprint (active → completed)
   → 🔔 To all members: "Sprint đã chuyển từ Đang hoạt động sang Hoàn thành"
```

---

## 📊 Verification & Assertions

Mỗi request đều có **Test Scripts** để tự động verify:

### 1. Status Code Verification
```javascript
pm.test("Request successful", function () {
    pm.response.to.have.status(200);
});
```

### 2. Auto-Save Environment Variables
```javascript
pm.environment.set("creator_token", jsonData.accessToken);
pm.environment.set("project_id", jsonData.id);
```

### 3. Notification Verification
```javascript
pm.test("Should have notification", function () {
    var jsonData = pm.response.json();
    var notif = jsonData.find(n => n.type === 'task_assigned');
    pm.expect(notif).to.not.be.undefined;
});
```

### 4. Console Logging
```javascript
console.log("🔔 NOTIFICATION SENT!");
console.log("Type:", notif.type);
console.log("Message:", notif.message);
```

---

## 🔧 Troubleshooting

### Issue 1: "Unauthorized 401"

**Nguyên nhân:** Token hết hạn hoặc chưa login

**Giải pháp:**
1. Chạy lại request login
2. Kiểm tra environment variable `creator_token` và `receiver_token`
3. Đảm bảo Bearer token đã được set trong Authorization tab

### Issue 2: "User not found"

**Nguyên nhân:** Tài khoản chưa tồn tại trong database

**Giải pháp:**
1. Kiểm tra email: `dongocminh1210@gmail.com` và `ngocminhyc1@gmail.com`
2. Nếu chưa có, dùng endpoint Register để tạo tài khoản
3. Verify email nếu cần

### Issue 3: "Project not found"

**Nguyên nhân:** Chưa tạo project hoặc `project_id` chưa được lưu

**Giải pháp:**
1. Chạy request "Create Project" trước
2. Kiểm tra environment variable `project_id`
3. Hoặc chạy "Get Creator's Projects" để lấy project_id có sẵn

### Issue 4: Không nhận được notifications

**Nguyên nhân:** Các nguyên nhân có thể:
- Auto notification feature chưa hoạt động
- User không phải member của project
- Sprint/Task chưa được tạo

**Giải pháp:**
1. Kiểm tra Receiver đã accept invitation chưa
2. Chạy lại toàn bộ flow từ đầu (sử dụng Collection Runner)
3. Check server logs để xem notifications có được tạo không

---

## 📝 Best Practices

### 1. Chạy Tests Theo Thứ Tự

**Collection 1:** Work-Management-Complete-API-Test
```
1. Authentication → Login both users
2. Projects → Create project
3. Project Members → Add & accept member
4. Sprints → Create sprint
5. Tasks → Create & manage tasks
6. Notifications → Verify all notifications
```

**Collection 2:** Auto-Notification-Complete-Test
```
Chạy toàn bộ collection một lần (Collection Runner)
→ Tự động test tất cả notification scenarios
```

### 2. Sử Dụng Collection Runner

- Click **Run** button ở góc trên
- Chọn environment
- Chọn số lần chạy (Iterations): 1
- Chọn delay giữa requests: 500ms (nếu cần)
- Click **Run**

### 3. Xem Console Output

- Mở **Postman Console** (View > Show Postman Console)
- Xem real-time logs khi chạy tests
- Tất cả notifications đều được log ra với format rõ ràng

### 4. Cleanup After Tests

Sau khi test xong, có thể cleanup:
```
📁 Final Report
  └─ [Cleanup] Mark All as Read
```

---

## 🎨 Console Output Examples

### Khi Login Thành Công:
```
✅ CREATOR LOGGED IN
═══════════════════════════════════
Email: dongocminh1210@gmail.com
Username: dongocminh1210
User ID: 123
Role: Event Creator (will trigger notifications)
```

### Khi Notification Được Gửi:
```
🔔 NOTIFICATION #4 SENT!
═══════════════════════════════════
Type: task_assigned
To: ngocminhyc1@gmail.com (assignee)
From: dongocminh1210@gmail.com
Message: Task được gán cho bạn
```

### Final Report:
```
📊 FINAL NOTIFICATION REPORT
═══════════════════════════════════
Receiver: ngocminhyc1@gmail.com
Creator: dongocminh1210@gmail.com

Total notifications received: 12

Breakdown by Type:
──────────────────────────────────
  added_to_project            1 █
  comment_added               1 █
  sprint_created              1 █
  sprint_status_changed       2 ██
  task_assigned               2 ██
  task_created                2 ██
  task_deleted                1 █
  task_status_changed         2 ██

✅ AUTO NOTIFICATION TEST COMPLETED!
```

---

## 🔗 API Endpoints Reference

### Base URL
```
Production: https://work-management-chi.vercel.app
```

### Authentication Endpoints
```
POST   /users/login
POST   /users (Register)
POST   /auth/verify-email
POST   /auth/resend-verification
POST   /auth/forgot-password
POST   /auth/reset-password
POST   /auth/magic-link/request
POST   /auth/otp/request
POST   /auth/logout
```

### Project Endpoints
```
GET    /projects
GET    /projects/:id
POST   /projects
PUT    /projects/:id
DELETE /projects/:id
GET    /projects/:id/details
GET    /projects/:id/activities
GET    /projects/:id/role
GET    /projects/:projectId/members/users  [NEW] Get all users in project
```

### Sprint Endpoints
```
GET    /sprints?projectId=:id
GET    /sprints/:id
POST   /sprints
PUT    /sprints/:id
DELETE /sprints/:id
PATCH  /sprints/:id/start
PATCH  /sprints/:id/complete
PATCH  /sprints/:id/cancel
```

### Task Endpoints
```
GET    /tasks
GET    /tasks/:id
POST   /tasks
PUT    /tasks/:id
DELETE /tasks/:id
PATCH  /tasks/:id/status
PATCH  /tasks/:id/assign
PATCH  /tasks/:id/priority
GET    /tasks/:id/assignee  [NEW] Get assignee info for task
```

### Notification Endpoints
```
GET    /notifications/user/:userId
GET    /notifications/user/:userId/unread
GET    /notifications/user/:userId/count
PATCH  /notifications/:id/read
PATCH  /notifications/user/:userId/read-all
DELETE /notifications/:id
DELETE /notifications/user/:userId/all
```

---

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra Console logs trong Postman
2. Kiểm tra Test Results tab
3. Xem Response body để biết error message
4. Kiểm tra Environment variables

---

## ✅ Checklist Before Testing

- [ ] Đã import đủ 3 files (2 collections + 1 environment)
- [ ] Đã chọn đúng environment: "Work Management - Complete Test Environment"
- [ ] Tài khoản `dongocminh1210@gmail.com` đã tồn tại và verify
- [ ] Tài khoản `ngocminhyc1@gmail.com` đã tồn tại và verify
- [ ] Base URL đúng: `https://work-management-chi.vercel.app`
- [ ] Đã mở Postman Console để xem logs
- [ ] Internet connection ổn định

---

## 🎯 Quick Start Guide

**Test nhanh trong 5 phút:**

1. Import 3 files vào Postman
2. Chọn environment
3. Mở Collection: **Auto-Notification-Complete-Test**
4. Click **Run**
5. Xem kết quả trong Console

**Done!** Bạn sẽ thấy tất cả 12 notifications được test tự động! 🎉

---

**Tạo bởi:** Claude Code Assistant
**Ngày:** 2026-01-10
**Version:** 1.0

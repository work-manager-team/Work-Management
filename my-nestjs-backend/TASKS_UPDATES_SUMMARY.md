# Tasks Module Updates Summary

## Các thay đổi đã thực hiện

### 1. ✅ Thêm API cập nhật Priority

**Endpoint mới**: `PATCH /tasks/:id/priority`

**Body**:
```json
{
  "priority": "high"
}
```

**Valid priorities**:
- `lowest`
- `low`
- `medium`
- `high`
- `highest`

**Response**: Task object với priority đã được cập nhật

**Permission**: Member hoặc Admin trong project

**Ví dụ**:
```bash
curl -X PATCH http://localhost:3000/tasks/1/priority \
  -H "Content-Type: application/json" \
  -d '{"priority": "high"}'
```

---

### 2. 📝 Giải thích assigneeId vs reporterId

#### **reporterId** (Người tạo/báo cáo task)
- **Ý nghĩa**: User tạo task, người báo cáo vấn đề
- **Khi nào được set**: Tự động khi tạo task, lấy từ JWT token của user đang login
- **Không thể thay đổi**: Trường này được set 1 lần duy nhất khi tạo task
- **Quyền đặc biệt**: Reporter có quyền xóa task của chính mình (ngoài Admin)

#### **assigneeId** (Người được giao việc)
- **Ý nghĩa**: User được giao nhiệm vụ thực hiện task
- **Khi nào được set**: Khi tạo task (optional) hoặc khi assign task sau này
- **Có thể null**: Task có thể chưa được assign cho ai
- **Có thể thay đổi**: Có thể re-assign task cho người khác
- **Notification**: Người được assign sẽ nhận thông báo

#### **Workflow ví dụ**:

**Scenario 1**: Team Lead tạo task và assign cho Developer
```javascript
POST /tasks
{
  "projectId": 1,
  "title": "Fix login bug",
  "assigneeId": 5  // Developer User ID
}
// reporterId = 3 (Team Lead, từ JWT)
// assigneeId = 5 (Developer)
```

**Scenario 2**: Developer tự tạo task để track công việc
```javascript
POST /tasks
{
  "projectId": 1,
  "title": "Refactor authentication module"
  // không có assigneeId
}
// reporterId = 5 (Developer, từ JWT)
// assigneeId = null (chưa assign)
```

**Scenario 3**: Re-assign task cho người khác
```javascript
PATCH /tasks/1/assign
{
  "assigneeId": 7  // Assign cho Backend Developer khác
}
```

---

### 3. 🔧 Fix lỗi Status Update với 'not_completed'

#### **Vấn đề**:
- Database schema định nghĩa 4 statuses: `todo`, `in_progress`, `done`, `not_completed`
- DTO cũ định nghĩa 8 statuses khác: `backlog`, `todo`, `in_progress`, `in_review`, `testing`, `blocked`, `done`, `closed`
- Khi gửi `not_completed`, validation fail vì không match với DTO

#### **Giải pháp**:
- **Đồng bộ DTO với Schema**: Cập nhật `CreateTaskDto` để chỉ chấp nhận 4 statuses hợp lệ
- **Thêm validation trong Service**: Validate status trước khi update database

#### **Valid statuses** (sau khi fix):
- `todo` - Chưa bắt đầu
- `in_progress` - Đang thực hiện
- `done` - Hoàn thành
- `not_completed` - Không hoàn thành (bị cancel/skip)

#### **Files đã sửa**:
1. `src/tasks/dto/create-task.dto.ts` - Cập nhật enum validation
2. `src/tasks/tasks.service.ts` - Thêm validation trong `updateStatus()`

#### **Trước khi fix**:
```typescript
@IsEnum(['backlog', 'todo', 'in_progress', 'in_review', 'testing', 'blocked', 'done', 'closed'])
status?: 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'testing' | 'blocked' | 'done' | 'closed';
```

#### **Sau khi fix**:
```typescript
@IsEnum(['todo', 'in_progress', 'done', 'not_completed'])
status?: 'todo' | 'in_progress' | 'done' | 'not_completed';
```

---

### 4. 🔔 Fix Auto Notifications

#### **Vấn đề**:
- NotificationHelperService đã có sẵn nhưng không được gọi
- TasksService và SprintsService không integrate với notification system
- Notifications không được tự động gửi khi tạo task/sprint

#### **Giải pháp đã triển khai**:

##### **A. Tasks Auto Notifications**

**1. Khi tạo task mới**:
```typescript
// Gửi thông báo cho tất cả members trong project (trừ người tạo)
await notificationHelper.notifyTaskCreated(
  taskId,
  taskTitle,
  createdByUserId
);

// Nếu task được assign ngay, gửi thêm notification cho assignee
if (assigneeId) {
  await notificationHelper.notifyTaskAssigned(
    taskId,
    taskTitle,
    assigneeId,
    createdByUserId,
    projectId
  );
}
```

**2. Khi assign/re-assign task**:
```typescript
// Gửi thông báo cho người được assign (nếu khác người assign)
await notificationHelper.notifyTaskAssigned(
  taskId,
  taskTitle,
  assigneeId,
  assignedByUserId,
  projectId
);
```

##### **B. Sprints Auto Notifications**

**Khi tạo sprint mới**:
```typescript
// Gửi thông báo cho tất cả members trong project (trừ người tạo)
await notificationHelper.notifySprintCreated(
  projectId,
  sprintName,
  createdByUserId
);
```

#### **Files đã sửa**:
1. `src/tasks/tasks.module.ts` - Import NotificationsModule
2. `src/tasks/tasks.service.ts` - Inject NotificationHelperService và thêm notification calls
3. `src/sprints/sprints.module.ts` - Import NotificationsModule
4. `src/sprints/sprints.service.ts` - Inject NotificationHelperService và thêm notification calls

#### **Flow hoạt động**:

```
User tạo Task
    ↓
TasksService.create()
    ↓
Lưu task vào database
    ↓
NotificationHelper.notifyTaskCreated()
    ↓
Lấy danh sách members trong project (status='active')
    ↓
Tạo notification cho từng member (trừ người tạo)
    ↓
[Optional] Nếu có assignee, gửi thêm notification riêng
    ↓
Notification được lưu vào bảng notifications
    ↓
User có thể xem notifications qua GET /notifications
```

#### **Error Handling**:
- Tất cả notification calls được wrap trong `try-catch`
- Nếu notification fail, log error nhưng KHÔNG throw exception
- Task/Sprint vẫn được tạo thành công ngay cả khi notification fail
- Đảm bảo core functionality không bị ảnh hưởng

#### **Testing**:
```bash
# 1. Tạo task mới
POST /tasks
{
  "projectId": 1,
  "title": "New Feature",
  "assigneeId": 5
}

# 2. Kiểm tra notifications
GET /notifications?userId=2  # Member khác trong project

# Response sẽ có notification:
{
  "type": "task_created",
  "title": "Task mới được tạo",
  "message": "Task mới: \"New Feature\""
}

# 3. Assignee (userId=5) sẽ nhận thêm notification:
{
  "type": "task_assigned",
  "title": "Task được gán cho bạn",
  "message": "Bạn được gán task: \"New Feature\""
}
```

---

## Tóm tắt các API mới/đã sửa

### Tasks APIs

| Method | Endpoint | Mô tả | Status |
|--------|----------|-------|--------|
| PATCH | `/tasks/:id/priority` | Cập nhật priority của task | ✅ NEW |
| PATCH | `/tasks/:id/status` | Cập nhật status của task | ✅ FIXED |
| POST | `/tasks` | Tạo task mới | ✅ ENHANCED (auto notification) |
| PATCH | `/tasks/:id/assign` | Assign task cho user | ✅ ENHANCED (auto notification) |

### Valid Values

**Priorities**:
- `lowest`, `low`, `medium`, `high`, `highest`

**Statuses**:
- `todo`, `in_progress`, `done`, `not_completed`

---

## Migration Notes

### Database
- ✅ Không cần migration mới
- ✅ Schema đã có đủ fields cần thiết

### Breaking Changes
- ⚠️ Status values đã thay đổi từ 8 → 4 values
- ⚠️ Nếu FE đang dùng `backlog`, `in_review`, `testing`, `blocked`, `closed` cần cập nhật

### Migration Guide cho Frontend

**Old statuses** → **New statuses**:
```javascript
'backlog' → 'todo'
'todo' → 'todo' (không đổi)
'in_progress' → 'in_progress' (không đổi)
'in_review' → 'in_progress'
'testing' → 'in_progress'
'blocked' → 'not_completed'
'done' → 'done' (không đổi)
'closed' → 'done'
```

---

## Test Cases

### 1. Update Priority
```bash
# Valid priority
curl -X PATCH http://localhost:3000/tasks/1/priority \
  -H "Content-Type: application/json" \
  -d '{"priority": "highest"}'
# Expected: 200 OK

# Invalid priority
curl -X PATCH http://localhost:3000/tasks/1/priority \
  -H "Content-Type: application/json" \
  -d '{"priority": "critical"}'
# Expected: 400 Bad Request
```

### 2. Update Status
```bash
# Valid status
curl -X PATCH http://localhost:3000/tasks/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "not_completed"}'
# Expected: 200 OK (FIXED!)

# Invalid status
curl -X PATCH http://localhost:3000/tasks/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "backlog"}'
# Expected: 400 Bad Request
```

### 3. Auto Notifications
```bash
# 1. Tạo task
POST /tasks
{
  "projectId": 1,
  "title": "Test Task",
  "assigneeId": 3
}

# 2. Kiểm tra notifications cho members
GET /notifications?userId=2

# 3. Kiểm tra notifications cho assignee
GET /notifications?userId=3
# Nên có 2 notifications: task_created và task_assigned
```

---

## Notes for Developers

1. **reporterId vs assigneeId**:
   - `reporterId`: Set 1 lần khi tạo, từ JWT token
   - `assigneeId`: Có thể null, có thể thay đổi

2. **Status Validation**:
   - LUÔN validate status trước khi update
   - Chỉ chấp nhận 4 values: `todo`, `in_progress`, `done`, `not_completed`

3. **Notifications**:
   - Tự động gửi khi tạo task/sprint
   - Tự động gửi khi assign task
   - Error-safe: Không ảnh hưởng core functionality

4. **Permissions**:
   - Member + Admin: Có thể update priority, status, assign
   - Reporter: Có thể delete task của chính mình
   - Viewer: Read-only

# ✨ Cập Nhật Sprint Status - Thêm Trạng Thái "Cancelled"

## 📋 Tổng Quan

Đã thêm status mới `cancelled` cho sprint để xử lý các sprint bị hủy giữa chừng.

## 🔄 Sprint Status Flow

### Trước đây (3 status):
```
planned → active → completed
```

### Bây giờ (4 status):
```
planned ──→ active ──→ completed
   │           │
   └──→ cancelled ←──┘
```

## 📊 Chi Tiết Các Trạng Thái

| Status | Mô tả | Có thể chuyển sang |
|--------|-------|---------------------|
| `planned` | Sprint đang lên kế hoạch | `active`, `cancelled` |
| `active` | Sprint đang chạy | `completed`, `cancelled` |
| `completed` | Sprint hoàn thành | *(không thể thay đổi)* |
| `cancelled` | Sprint bị hủy | *(không thể thay đổi)* |

## 🆕 API Mới

### Cancel Sprint
```http
PATCH /sprints/:id/cancel
```

**Quyền hạn:** Chỉ Admin

**Mô tả:** Hủy một sprint. Có thể hủy sprint ở trạng thái `planned` hoặc `active`.

**Ví dụ:**
```bash
curl -X PATCH http://localhost:3000/sprints/1/cancel
```

**Response Success (200 OK):**
```json
{
  "id": 1,
  "projectId": 1,
  "name": "Sprint 1",
  "goal": "Complete user authentication",
  "startDate": "2024-01-01",
  "endDate": "2024-01-14",
  "status": "cancelled",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-10T10:30:00.000Z"
}
```

**Error Responses:**
```json
// Khi sprint đã hoàn thành
{
  "statusCode": 400,
  "message": "Không thể cancel sprint đã hoàn thành",
  "error": "Bad Request"
}

// Khi sprint đã bị cancel rồi
{
  "statusCode": 400,
  "message": "Sprint đã bị cancel rồi",
  "error": "Bad Request"
}

// Khi user không phải admin
{
  "statusCode": 403,
  "message": "Chỉ admin mới có quyền cancel sprint",
  "error": "Forbidden"
}
```

## 🔧 Thay Đổi Code

### 1. Database Schema (`src/db/schema.ts`)
```typescript
// Thêm 'cancelled' vào sprint status enum
export const sprintStatusEnum = pgEnum('sprint_status', [
  'planned',
  'active',
  'completed',
  'cancelled'  // ← MỚI
]);
```

### 2. Service (`src/sprints/sprints.service.ts`)
```typescript
async cancelSprint(id: number, userId: number): Promise<Sprint> {
  const sprint = await this.findOne(id);

  if (sprint.status === 'completed') {
    throw new BadRequestException('Không thể cancel sprint đã hoàn thành');
  }

  if (sprint.status === 'cancelled') {
    throw new BadRequestException('Sprint đã bị cancel rồi');
  }

  const canCancel = await this.checkPermission(sprint.projectId, userId, ['admin']);
  if (!canCancel) {
    throw new ForbiddenException('Chỉ admin mới có quyền cancel sprint');
  }

  const [updated] = await this.db
    .update(sprints)
    .set({ status: 'cancelled', updatedAt: new Date() })
    .where(eq(sprints.id, id))
    .returning();

  return updated;
}
```

### 3. Controller (`src/sprints/sprints.controller.ts`)
```typescript
@Patch(':id/cancel')
cancelSprint(@Param('id', ParseIntPipe) id: number) {
  // TODO: Get userId from JWT token
  const userId = 1;
  return this.sprintsService.cancelSprint(id, userId);
}
```

### 4. Database Migration
```sql
-- drizzle/0002_fat_kulan_gath.sql
ALTER TYPE "public"."sprint_status" ADD VALUE 'cancelled';
```

**Migration đã được push lên database:** ✅

## 📖 So Sánh Với Các API Khác

| Endpoint | Quyền hạn | Status cũ | Status mới |
|----------|-----------|-----------|------------|
| `PATCH /sprints/:id/start` | Member/Admin | `planned` | `active` |
| `PATCH /sprints/:id/complete` | Member/Admin | `active` | `completed` |
| `PATCH /sprints/:id/cancel` | **Admin only** | `planned`/`active` | `cancelled` |

## 🧪 Testing

### Test 1: Cancel sprint ở trạng thái planned
```bash
# Tạo sprint mới
curl -X POST http://localhost:3000/sprints \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": 1,
    "name": "Test Sprint",
    "goal": "Testing cancellation",
    "startDate": "2024-01-15",
    "endDate": "2024-01-28"
  }'

# Cancel sprint (status: planned → cancelled)
curl -X PATCH http://localhost:3000/sprints/1/cancel
```

### Test 2: Cancel sprint ở trạng thái active
```bash
# Start sprint trước
curl -X PATCH http://localhost:3000/sprints/1/start

# Cancel sprint (status: active → cancelled)
curl -X PATCH http://localhost:3000/sprints/1/cancel
```

### Test 3: Thử cancel sprint đã completed (sẽ lỗi)
```bash
# Complete sprint trước
curl -X PATCH http://localhost:3000/sprints/1/complete

# Thử cancel (sẽ nhận lỗi 400)
curl -X PATCH http://localhost:3000/sprints/1/cancel
```

## 📚 Use Cases

### Use Case 1: Hủy Sprint Do Thay Đổi Kế Hoạch
Khi team quyết định thay đổi hướng phát triển sản phẩm, project manager (admin) có thể cancel sprint hiện tại và tạo sprint mới phù hợp với kế hoạch mới.

### Use Case 2: Hủy Sprint Do Thiếu Resources
Khi có nhiều members nghỉ việc hoặc nghỉ ốm, admin có thể cancel sprint và reschedule lại.

### Use Case 3: Hủy Sprint Do Khách Hàng Đổi Yêu Cầu
Khi khách hàng thay đổi yêu cầu lớn, admin cancel sprint hiện tại để replan toàn bộ.

## ✅ Checklist

- ✅ Cập nhật schema với status mới
- ✅ Tạo service method `cancelSprint()`
- ✅ Thêm controller endpoint `PATCH /sprints/:id/cancel`
- ✅ Tạo migration cho database
- ✅ Push migration lên database
- ✅ Cập nhật documentation (API_DOCUMENTATION.md)
- ✅ Cập nhật summary (NEW_APIS_SUMMARY.md)
- ✅ Build thành công
- ✅ Tạo file hướng dẫn này

## 🎯 Next Steps (Khuyến nghị)

1. **Thêm validation khi tạo báo cáo sprint**
   - Sprint cancelled không nên tính vào sprint velocity
   - Tasks trong sprint cancelled nên được move về backlog

2. **Auto-notification khi cancel sprint**
   ```typescript
   // Trong cancelSprint method
   await this.notificationsService.notifyAllMembers({
     projectId: sprint.projectId,
     type: 'sprint_cancelled',
     title: 'Sprint đã bị hủy',
     message: `Sprint "${sprint.name}" đã bị hủy bởi admin`
   });
   ```

3. **Thêm lý do cancel (optional field)**
   ```typescript
   // Thêm vào schema
   cancelReason: text('cancel_reason'),
   cancelledBy: bigint('cancelled_by').references(() => users.id),
   cancelledAt: timestamp('cancelled_at')
   ```

---

**Status:** ✅ Hoàn tất
**Last Updated:** December 2024
**Migration:** `0002_fat_kulan_gath.sql`

# 🔔 Auto Notification System - Hướng Dẫn Tích Hợp

## 📋 Tổng Quan

Đã tạo `NotificationHelperService` để tự động gửi thông báo đến người dùng khi có sự kiện quan trọng xảy ra trong dự án.

## ✅ Các Sự Kiện Được Hỗ Trợ

1. **Project Events:**
   - Project được tạo
   - User được thêm vào project

2. **Sprint Events:**
   - Sprint được tạo
   - Sprint thay đổi status
   - Comment mới trên sprint

3. **Task Events:**
   - Task được tạo
   - Task được assign
   - Task thay đổi status
   - Comment mới trên task

---

## 🔧 CÁCH SỬ DỤNG

### Bước 1: Import NotificationHelperService vào Module

Thêm `NotificationsModule` vào imports của module bạn muốn sử dụng:

```typescript
// Ví dụ: projects.module.ts
import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    DatabaseModule,
    NotificationsModule,  // ← Thêm này
  ],
  // ...
})
export class ProjectsModule {}
```

### Bước 2: Inject Service vào Constructor

```typescript
// Ví dụ: projects.service.ts
import { NotificationHelperService } from '../notifications/notification-helper.service';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(DRIZZLE) private db: NeonHttpDatabase<typeof schema>,
    private notificationHelper: NotificationHelperService,  // ← Inject này
  ) {}
}
```

### Bước 3: Gọi Notification Method

```typescript
// Sau khi tạo project
async create(createProjectDto: CreateProjectDto, ownerId: number) {
  // Create project logic...
  const [project] = await this.db.insert(projects).values({...}).returning();

  // ✨ Send notification
  await this.notificationHelper.notifyProjectCreated(
    project.id,
    project.name,
    ownerId,
  );

  return project;
}
```

---

## 📚 API METHODS

### 1. notifyUser()
Gửi thông báo đến 1 user cụ thể.

```typescript
await this.notificationHelper.notifyUser(
  userId: number,
  type: string,
  title: string,
  message: string,
  relatedEntityId?: number,
  relatedEntityType?: 'project' | 'sprint' | 'task' | 'comment',
);
```

### 2. notifyProjectMembers()
Gửi thông báo đến tất cả members của project (trừ người trigger).

```typescript
await this.notificationHelper.notifyProjectMembers(
  projectId: number,
  excludeUserId: number | null,
  type: string,
  title: string,
  message: string,
  relatedEntityId?: number,
  relatedEntityType?: 'project' | 'sprint' | 'task' | 'comment',
);
```

### 3. notifyProjectCreated()
```typescript
await this.notificationHelper.notifyProjectCreated(
  projectId: number,
  projectName: string,
  createdByUserId: number,
);
```

### 4. notifyUserAddedToProject()
```typescript
await this.notificationHelper.notifyUserAddedToProject(
  userId: number,
  projectId: number,
  projectName: string,
  addedByUserId: number,
);
```

### 5. notifySprintCreated()
```typescript
await this.notificationHelper.notifySprintCreated(
  projectId: number,
  sprintId: number,
  sprintName: string,
  createdByUserId: number,
);
```

### 6. notifySprintStatusChanged()
```typescript
await this.notificationHelper.notifySprintStatusChanged(
  projectId: number,
  sprintId: number,
  sprintName: string,
  oldStatus: string,
  newStatus: string,
  changedByUserId: number,
);
```

### 7. notifyTaskCreated()
```typescript
await this.notificationHelper.notifyTaskCreated(
  projectId: number,
  taskId: number,
  taskTitle: string,
  assigneeId: number | null,
  createdByUserId: number,
);
```

### 8. notifyTaskAssigned()
```typescript
await this.notificationHelper.notifyTaskAssigned(
  taskId: number,
  taskTitle: string,
  assigneeId: number,
  assignedByUserId: number,
);
```

### 9. notifyTaskStatusChanged()
```typescript
await this.notificationHelper.notifyTaskStatusChanged(
  projectId: number,
  taskId: number,
  taskTitle: string,
  oldStatus: string,
  newStatus: string,
  changedByUserId: number,
);
```

### 10. notifyCommentAdded()
```typescript
await this.notificationHelper.notifyCommentAdded(
  projectId: number,
  taskId: number,
  taskTitle: string,
  commentId: number,
  commentedByUserId: number,
);
```

### 11. notifySprintCommentAdded()
```typescript
await this.notificationHelper.notifySprintCommentAdded(
  projectId: number,
  sprintId: number,
  sprintName: string,
  commentId: number,
  commentedByUserId: number,
);
```

---

## 💡 VÍ DỤ TÍCH HỢP ĐẦY ĐỦ

### Example 1: Projects Service

```typescript
// src/projects/projects.module.ts
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [DatabaseModule, NotificationsModule],
  // ...
})
export class ProjectsModule {}

// src/projects/projects.service.ts
import { NotificationHelperService } from '../notifications/notification-helper.service';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(DRIZZLE) private db: NeonHttpDatabase<typeof schema>,
    private notificationHelper: NotificationHelperService,
  ) {}

  async create(createProjectDto: CreateProjectDto, ownerId: number) {
    const [project] = await this.db.insert(projects).values({
      name: createProjectDto.name,
      key: createProjectDto.key,
      ownerId,
      // ...
    }).returning();

    // ✨ Auto notify
    await this.notificationHelper.notifyProjectCreated(
      project.id,
      project.name,
      ownerId,
    );

    return project;
  }

  async addMember(projectId: number, userId: number, addedBy: number) {
    // Add member logic...

    const project = await this.findOne(projectId);

    // ✨ Auto notify
    await this.notificationHelper.notifyUserAddedToProject(
      userId,
      projectId,
      project.name,
      addedBy,
    );
  }
}
```

### Example 2: Sprints Service

```typescript
// src/sprints/sprints.module.ts
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [DatabaseModule, NotificationsModule],
  // ...
})
export class SprintsModule {}

// src/sprints/sprints.service.ts
import { NotificationHelperService } from '../notifications/notification-helper.service';

@Injectable()
export class SprintsService {
  constructor(
    @Inject(DRIZZLE) private db: NeonHttpDatabase<typeof schema>,
    private notificationHelper: NotificationHelperService,
  ) {}

  async create(createSprintDto: CreateSprintDto, userId: number) {
    const [sprint] = await this.db.insert(sprints).values({
      projectId: createSprintDto.projectId,
      name: createSprintDto.name,
      // ...
    }).returning();

    // ✨ Auto notify
    await this.notificationHelper.notifySprintCreated(
      sprint.projectId,
      sprint.id,
      sprint.name,
      userId,
    );

    return sprint;
  }

  async updateSprintStatus(id: number, newStatus: string, userId: number) {
    const sprint = await this.findOne(id);
    const oldStatus = sprint.status;

    // Update status logic...
    const [updated] = await this.db.update(sprints)
      .set({ status: newStatus })
      .where(eq(sprints.id, id))
      .returning();

    // ✨ Auto notify
    await this.notificationHelper.notifySprintStatusChanged(
      updated.projectId,
      updated.id,
      updated.name,
      oldStatus,
      newStatus,
      userId,
    );

    return updated;
  }
}
```

### Example 3: Tasks Service

```typescript
// src/tasks/tasks.module.ts
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [DatabaseModule, NotificationsModule],
  // ...
})
export class TasksModule {}

// src/tasks/tasks.service.ts
import { NotificationHelperService } from '../notifications/notification-helper.service';

@Injectable()
export class TasksService {
  constructor(
    @Inject(DRIZZLE) private db: NeonHttpDatabase<typeof schema>,
    private notificationHelper: NotificationHelperService,
  ) {}

  async create(createTaskDto: CreateTaskDto, reporterId: number) {
    const [task] = await this.db.insert(tasks).values({
      projectId: createTaskDto.projectId,
      title: createTaskDto.title,
      reporterId,
      assigneeId: createTaskDto.assigneeId,
      // ...
    }).returning();

    // ✨ Auto notify
    await this.notificationHelper.notifyTaskCreated(
      task.projectId,
      task.id,
      task.title,
      task.assigneeId,
      reporterId,
    );

    return task;
  }

  async assignTask(taskId: number, assigneeId: number, userId: number) {
    const task = await this.findOne(taskId, userId);

    const [updated] = await this.db.update(tasks)
      .set({ assigneeId })
      .where(eq(tasks.id, taskId))
      .returning();

    // ✨ Auto notify
    await this.notificationHelper.notifyTaskAssigned(
      updated.id,
      updated.title,
      assigneeId,
      userId,
    );

    return updated;
  }

  async updateStatus(taskId: number, newStatus: string, userId: number) {
    const task = await this.findOne(taskId, userId);
    const oldStatus = task.status;

    const [updated] = await this.db.update(tasks)
      .set({ status: newStatus })
      .where(eq(tasks.id, taskId))
      .returning();

    // ✨ Auto notify
    await this.notificationHelper.notifyTaskStatusChanged(
      updated.projectId,
      updated.id,
      updated.title,
      oldStatus,
      newStatus,
      userId,
    );

    return updated;
  }
}
```

---

## 🎯 CHECKLIST TÍCH HỢP

### ProjectsService
- [ ] Import NotificationsModule vào ProjectsModule
- [ ] Inject NotificationHelperService
- [ ] Gọi `notifyProjectCreated()` trong `create()`
- [ ] Gọi `notifyUserAddedToProject()` trong `addMember()`

### SprintsService
- [ ] Import NotificationsModule vào SprintsModule
- [ ] Inject NotificationHelperService
- [ ] Gọi `notifySprintCreated()` trong `create()`
- [ ] Gọi `notifySprintStatusChanged()` trong `updateSprintStatus()`
- [ ] Gọi `notifySprintCommentAdded()` trong `createComment()`

### TasksService
- [ ] Import NotificationsModule vào TasksModule
- [ ] Inject NotificationHelperService
- [ ] Gọi `notifyTaskCreated()` trong `create()`
- [ ] Gọi `notifyTaskAssigned()` trong `assignTask()`
- [ ] Gọi `notifyTaskStatusChanged()` trong `updateStatus()`

### CommentsService
- [ ] Import NotificationsModule vào CommentsModule
- [ ] Inject NotificationHelperService
- [ ] Gọi `notifyCommentAdded()` trong `create()`

---

## ⚠️ LƯU Ý

1. **Error Handling**: Notifications không nên làm fail main operation
```typescript
try {
  await this.notificationHelper.notifyXxx(...);
} catch (error) {
  console.error('Failed to send notification:', error);
  // Don't throw - main operation should succeed
}
```

2. **Performance**: Notification được gửi sync. Nếu có nhiều users, cân nhắc:
   - Dùng queue (Bull/BullMQ)
   - Fire and forget pattern
   - Batch processing

3. **Testing**: Mock NotificationHelperService trong unit tests

---

## 🚀 NEXT STEPS

1. **Real-time Updates**: Integrate WebSocket/SSE để push notifications real-time
2. **Email Notifications**: Gửi email cho important notifications
3. **Push Notifications**: Mobile/Desktop push notifications
4. **Notification Preferences**: Cho phép user config loại notification muốn nhận

---

Hệ thống notification helper đã sẵn sàng! Chỉ cần import và gọi methods trong các service.

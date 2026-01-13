import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { AttachmentsModule } from '../attachments/attachments.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [NotificationsModule, AttachmentsModule, CloudinaryModule],
  providers: [TasksService],
  controllers: [TasksController]
})
export class TasksModule {}

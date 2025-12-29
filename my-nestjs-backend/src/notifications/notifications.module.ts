import { Module } from '@nestjs/common';
import { DatabaseModule } from '../db/database.module';
import { NotificationsService } from './notifications.service';
import { NotificationHelperService } from './notification-helper.service';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [DatabaseModule],
  providers: [NotificationsService, NotificationHelperService],
  controllers: [NotificationsController],
  exports: [NotificationsService, NotificationHelperService],
})
export class NotificationsModule {}

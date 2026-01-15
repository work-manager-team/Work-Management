import { Module } from '@nestjs/common';
import { ProjectMembersService } from './project-members.service';
import { ProjectMembersController } from './project-members.controller';
import { ProjectInvitationsController } from './project-invitations.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  providers: [ProjectMembersService],
  controllers: [ProjectMembersController, ProjectInvitationsController]
})
export class ProjectMembersModule {}

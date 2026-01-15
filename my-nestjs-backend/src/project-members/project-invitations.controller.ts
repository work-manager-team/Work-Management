// src/project-members/project-invitations.controller.ts
import {
  Controller,
  Post,
  Param,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ProjectMembersService } from './project-members.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('project-invitations')
export class ProjectInvitationsController {
  constructor(private readonly projectMembersService: ProjectMembersService) {}

  /**
   * Accept project invitation
   */
  @Post(':invitationId/accept')
  @HttpCode(HttpStatus.OK)
  acceptInvitation(
    @Param('invitationId', ParseIntPipe) invitationId: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.projectMembersService.acceptInvitationById(invitationId, userId);
  }

  /**
   * Reject project invitation
   */
  @Post(':invitationId/reject')
  @HttpCode(HttpStatus.OK)
  rejectInvitation(
    @Param('invitationId', ParseIntPipe) invitationId: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.projectMembersService.rejectInvitationById(invitationId, userId);
  }
}

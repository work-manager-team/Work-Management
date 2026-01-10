// src/project-members/project-members.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { ProjectMembersService } from './project-members.service';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('projects/:projectId/members')
export class ProjectMembersController {
  constructor(private readonly projectMembersService: ProjectMembersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  addMember(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() addMemberDto: AddMemberDto,
    @CurrentUser('userId') invitedBy: number,
  ) {
    return this.projectMembersService.addMember(projectId, addMemberDto, invitedBy);
  }

  @Public()
  @Get()
  findAllByProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.projectMembersService.findAllByProject(projectId);
  }

  @Public()
  @Get('active')
  findActiveMembers(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.projectMembersService.findActiveMembers(projectId);
  }

  @Public()
  @Get('users')
  getUsersInProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.projectMembersService.getUsersInProject(projectId);
  }

  @Patch(':userId/accept')
  acceptInvitation(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.projectMembersService.acceptInvitation(projectId, userId);
  }

  @Patch(':userId/role')
  updateRole(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateRoleDto: UpdateMemberRoleDto,
    @CurrentUser('userId') updatedBy: number,
  ) {
    return this.projectMembersService.updateRole(projectId, userId, updateRoleDto, updatedBy);
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMember(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser('userId') removedBy: number,
  ) {
    return this.projectMembersService.removeMember(projectId, userId, removedBy);
  }
}
// src/task-history/task-history.controller.ts
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { TaskHistoryService } from './task-history.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('task-history')
export class TaskHistoryController {
  constructor(private readonly taskHistoryService: TaskHistoryService) {}

  @Get()
  findByTask(
    @Query('taskId', ParseIntPipe) taskId: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.taskHistoryService.findByTask(taskId, userId);
  }

  @Get('user/:userId')
  findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser('userId') requesterId: number,
  ) {
    return this.taskHistoryService.findByUser(userId, requesterId);
  }
}
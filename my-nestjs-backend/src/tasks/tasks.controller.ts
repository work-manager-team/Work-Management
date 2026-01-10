// src/tasks/tasks.controller.ts
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
  Query,
  Patch,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser('userId') reporterId: number,
  ) {
    return this.tasksService.create(createTaskDto, reporterId);
  }

  @Get()
  findAll(
    @CurrentUser('userId') userId: number,
    @Query('projectId') projectId?: string,
    @Query('projectID') projectID?: string,
    @Query('sprintId') sprintId?: string,
    @Query('sprintID') sprintID?: string,
    @Query('assigneeId') assigneeId?: string,
    @Query('assigneeID') assigneeID?: string,
  ) {
    // Support both camelCase and uppercase ID
    const finalProjectId = projectId || projectID;
    const finalSprintId = sprintId || sprintID;
    const finalAssigneeId = assigneeId || assigneeID;

    if (finalProjectId) {
      return this.tasksService.findByProject(parseInt(finalProjectId), userId);
    }

    if (finalSprintId) {
      return this.tasksService.findBySprint(parseInt(finalSprintId), userId);
    }

    if (finalAssigneeId) {
      return this.tasksService.findByAssignee(parseInt(finalAssigneeId), userId);
    }

    return this.tasksService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.tasksService.findOne(id, userId);
  }

  @Get(':id/subtasks')
  getSubtasks(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.tasksService.getSubtasks(id, userId);
  }

  @Get(':id/assignee')
  getTaskAssignee(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.tasksService.getTaskAssignee(id, userId);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.tasksService.update(id, updateTaskDto, userId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
    @CurrentUser('userId') userId: number,
  ) {
    return this.tasksService.updateStatus(id, status, userId);
  }

  @Patch(':id/assign')
  assignTask(
    @Param('id', ParseIntPipe) id: number,
    @Body('assigneeId', ParseIntPipe) assigneeId: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.tasksService.assignTask(id, assigneeId, userId);
  }

  @Patch(':id/priority')
  updatePriority(
    @Param('id', ParseIntPipe) id: number,
    @Body('priority') priority: string,
    @CurrentUser('userId') userId: number,
  ) {
    return this.tasksService.updatePriority(id, priority, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.tasksService.remove(id, userId);
  }
}
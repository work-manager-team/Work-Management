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

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTaskDto: CreateTaskDto) {
    // TODO: Get reporterId from JWT token
    const reporterId = 1;
    return this.tasksService.create(createTaskDto, reporterId);
  }

  @Get()
  findAll(
    @Query('projectId') projectId?: string,
    @Query('projectID') projectID?: string,
    @Query('sprintId') sprintId?: string,
    @Query('sprintID') sprintID?: string,
    @Query('assigneeId') assigneeId?: string,
    @Query('assigneeID') assigneeID?: string,
  ) {
    // TODO: Get userId from JWT token
    const userId = 1;

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
  findOne(@Param('id', ParseIntPipe) id: number) {
    // TODO: Get userId from JWT token
    const userId = 1;
    return this.tasksService.findOne(id, userId);
  }

  @Get(':id/subtasks')
  getSubtasks(@Param('id', ParseIntPipe) id: number) {
    // TODO: Get userId from JWT token
    const userId = 1;
    return this.tasksService.getSubtasks(id, userId);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    // TODO: Get userId from JWT token
    const userId = 1;
    return this.tasksService.update(id, updateTaskDto, userId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    // TODO: Get userId from JWT token
    const userId = 1;
    return this.tasksService.updateStatus(id, status, userId);
  }

  @Patch(':id/assign')
  assignTask(
    @Param('id', ParseIntPipe) id: number,
    @Body('assigneeId', ParseIntPipe) assigneeId: number,
  ) {
    // TODO: Get userId from JWT token
    const userId = 1;
    return this.tasksService.assignTask(id, assigneeId, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    // TODO: Get userId from JWT token
    const userId = 1;
    return this.tasksService.remove(id, userId);
  }
}
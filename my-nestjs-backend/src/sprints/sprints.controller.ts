// src/sprints/sprints.controller.ts
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
import { SprintsService } from './sprints.service';
import { CreateSprintDto } from './dto/create-sprint.dto';
import { UpdateSprintDto } from './dto/update-sprint.dto';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('sprints')
export class SprintsController {
  constructor(private readonly sprintsService: SprintsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createSprintDto: CreateSprintDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.sprintsService.create(createSprintDto, userId);
  }

  @Public()
  @Get()
  findAll(@Query('projectId', ParseIntPipe) projectId: number) {
    return this.sprintsService.findAllByProject(projectId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sprintsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSprintDto: UpdateSprintDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.sprintsService.update(id, updateSprintDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.sprintsService.remove(id, userId);
  }

  @Patch(':id/start')
  startSprint(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.sprintsService.startSprint(id, userId);
  }

  @Patch(':id/complete')
  completeSprint(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.sprintsService.completeSprint(id, userId);
  }

  @Patch(':id/cancel')
  cancelSprint(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.sprintsService.cancelSprint(id, userId);
  }

  @Patch(':id/status')
  updateSprintStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'planned' | 'active' | 'completed' | 'cancelled',
    @CurrentUser('userId') userId: number,
  ) {
    return this.sprintsService.updateSprintStatus(id, status, userId);
  }

  // Sprint Comments
  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  createComment(
    @Param('id', ParseIntPipe) sprintId: number,
    @Body() body: { content: string; parentCommentId?: number },
    @CurrentUser('userId') userId: number,
  ) {
    return this.sprintsService.createComment(
      { sprintId, content: body.content, parentCommentId: body.parentCommentId },
      userId,
    );
  }

  @Get(':id/comments')
  getComments(
    @Param('id', ParseIntPipe) sprintId: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.sprintsService.getComments(sprintId, userId);
  }

  @Get('comments/:commentId/replies')
  getCommentReplies(
    @Param('commentId', ParseIntPipe) commentId: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.sprintsService.getCommentReplies(commentId, userId);
  }
}
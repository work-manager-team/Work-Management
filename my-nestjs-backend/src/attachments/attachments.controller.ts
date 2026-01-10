// src/attachments/attachments.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createAttachmentDto: CreateAttachmentDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.attachmentsService.create(createAttachmentDto, userId);
  }

  @Get()
  findByTask(
    @Query('taskId', ParseIntPipe) taskId: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.attachmentsService.findByTask(taskId, userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.attachmentsService.findOne(id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.attachmentsService.remove(id, userId);
  }
}
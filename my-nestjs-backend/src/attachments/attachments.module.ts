// src/attachments/attachments.module.ts
import { Module } from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { DatabaseModule } from '../db/database.module';

@Module({
  imports: [DatabaseModule, CloudinaryModule],
  providers: [AttachmentsService],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}

// src/attachments/dto/create-attachment.dto.ts
import { IsNotEmpty, IsString, IsInt, IsOptional, IsIn } from 'class-validator';

export class CreateAttachmentDto {
  @IsInt()
  @IsNotEmpty()
  uploadedBy: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['user_avatar', 'task', 'project', 'comment'])
  entityType: 'user_avatar' | 'task' | 'project' | 'comment';

  @IsInt()
  @IsOptional()
  entityId?: number;
}

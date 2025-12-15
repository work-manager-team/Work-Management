// src/sprints/dto/create-sprint-comment.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateSprintCommentDto {
  @IsNumber()
  @IsNotEmpty()
  sprintId: number;

  @IsString()
  @IsNotEmpty({ message: 'Content không được để trống' })
  content: string;

  @IsNumber()
  @IsOptional()
  parentCommentId?: number;
}

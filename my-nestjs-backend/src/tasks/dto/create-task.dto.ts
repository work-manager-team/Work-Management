import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';

export class CreateTaskDto {
  @IsNumber()
  @IsNotEmpty()
  projectId: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['task', 'bug', 'story', 'epic', 'subtask'])
  @IsOptional()
  type?: 'task' | 'bug' | 'story' | 'epic' | 'subtask';

  @IsEnum(['todo', 'in_progress', 'done', 'not_completed'])
  @IsOptional()
  status?: 'todo' | 'in_progress' | 'done' | 'not_completed';

  @IsEnum(['lowest', 'low', 'medium', 'high', 'highest'])
  @IsOptional()
  priority?: 'lowest' | 'low' | 'medium' | 'high' | 'highest';

  @IsNumber()
  @IsOptional()
  assigneeId?: number;

  @IsNumber()
  @IsOptional()
  sprintId?: number;

  @IsNumber()
  @IsOptional()
  parentTaskId?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsNumber()
  @IsOptional()
  estimatedHours?: number;
}
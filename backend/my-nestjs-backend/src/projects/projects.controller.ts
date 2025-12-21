// src/projects/projects.controller.ts
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
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createProjectDto: CreateProjectDto,
    // TODO: Get userId from JWT token
    // @CurrentUser() user: User
  ) {
    // Tạm thời hardcode userId = 1 cho demo
    // Trong thực tế sẽ lấy từ JWT token
    const ownerId = 1;
    return this.projectsService.create(createProjectDto, ownerId);
  }

  @Get('search')
  searchProjects(@Query('name') name: string) {
    return this.projectsService.searchByName(name);
  }

  @Get('count')
  async getCount() {
    const count = await this.projectsService.getProjectCount();
    return { count };
  }

  @Get()
  findAll(@Query('userId', ParseIntPipe) userId?: number) {
    if (userId) {
      return this.projectsService.findByUser(userId);
    }
    return this.projectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    // TODO: Get userId from JWT token
    const userId = 1;
    return this.projectsService.update(id, updateProjectDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    // TODO: Get userId from JWT token
    const userId = 1;
    return this.projectsService.remove(id, userId);
  }

  @Get(':id/details')
  async getProjectDetails(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.getProjectDetails(id);
  }

  @Get(':id/activities')
  async getProjectActivities(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit', ParseIntPipe) limit: number = 50,
  ) {
    return this.projectsService.getProjectActivities(id, limit);
  }

  @Get(':id/role')
  async getUserRole(@Param('id', ParseIntPipe) id: number) {
    // TODO: Get userId from JWT token
    const userId = 1;
    const role = await this.projectsService.getUserRole(id, userId);
    return { role };
  }
}
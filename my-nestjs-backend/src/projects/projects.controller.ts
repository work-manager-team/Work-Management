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
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser('userId') ownerId: number,
  ) {
    return this.projectsService.create(createProjectDto, ownerId);
  }

  @Public()
  @Get('search')
  searchProjects(@Query('name') name: string) {
    return this.projectsService.searchByName(name);
  }

  @Public()
  @Get('count')
  async getCount() {
    const count = await this.projectsService.getProjectCount();
    return { count };
  }

  @Public()
  @Get()
  findAll(@Query('userId', ParseIntPipe) userId?: number) {
    if (userId) {
      return this.projectsService.findByUser(userId);
    }
    return this.projectsService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.projectsService.update(id, updateProjectDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.projectsService.remove(id, userId);
  }

  @Public()
  @Get(':id/details')
  async getProjectDetails(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.getProjectDetails(id);
  }

  @Public()
  @Get(':id/activities')
  async getProjectActivities(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit', ParseIntPipe) limit: number = 50,
  ) {
    return this.projectsService.getProjectActivities(id, limit);
  }

  @Get(':id/role')
  async getUserRole(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
  ) {
    const role = await this.projectsService.getUserRole(id, userId);
    return {
      projectId: id,
      userId,
      role
    };
  }

  @Public()
  @Get(':projectId/users/:userId/role')
  async getUserRoleByIds(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    // TODO: Optional - Check if requester has permission to view this info
    // For now, any member can view other member's role in the same project

    const role = await this.projectsService.getUserRole(projectId, userId);

    if (role === null) {
      return {
        statusCode: 404,
        message: 'User không phải là thành viên của project này',
        projectId,
        userId,
        role: null,
      };
    }

    return {
      statusCode: 200,
      projectId,
      userId,
      role
    };
  }
}
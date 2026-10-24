import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import { User } from '../common/decorators/user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import { ProjectsService } from './projects.service';
import { PermissionUtils } from '../common/utils/permission.util';
import { ForbiddenException } from '@nestjs/common';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@ApiTags('Projects')
@Controller('projects')
@UseGuards(AccessTokenGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  private createSuccessResponse<T>(message: string, data?: T): ApiResponse<T> {
    return { success: true, message, data };
  }

  private createPaginatedResponse<T>(
    message: string,
    data: T,
    pagination: any,
  ): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      pagination,
    };
  }

  /**
   * Check if user has permission to access projects
   * Users can access if they are:
   * 1. The creator of the content
   * 2. Have admin/staff/developer/support agent roles
   */
  private checkProjectAccess(user: any): void {
    if (!user) {
      throw new ForbiddenException('User authentication required');
    }

    // Check if user has admin, staff, developer, or support agent role
    if (PermissionUtils.isStaff(user.roles)) {
      return; // User has staff privileges
    }

    // If not staff, user must be authenticated (creator-based access is handled in service layer)
    if (!user.id || !user.roles) {
      throw new ForbiddenException('Access denied. Insufficient permissions.');
    }
  }

  @Post()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new project' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['slug', 'title', 'services', 'technologies', 'website', 'thumbnail', 'about', 'goal', 'execution', 'results'],
      properties: {
        slug: {
          type: 'string',
          example: 'ecommerce-platform-solution',
        },
        title: {
          type: 'string',
          example: 'E-commerce Platform Solution',
        },
        subtitle: {
          type: 'string',
          example: 'Modern e-commerce solution with React and Node.js',
        },
        client: {
          type: 'string',
          example: 'TechStart Inc.',
        },
        logo: {
          type: 'string',
          example: 'https://example.com/logos/techstart-logo.png',
        },
        services: {
          type: 'array',
          items: { type: 'string' },
          example: ['Web Development', 'UI/UX Design', 'Database Design'],
        },
        technologies: {
          type: 'array',
          items: { type: 'string' },
          example: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
        },
        website: {
          type: 'string',
          example: 'https://techstart-ecommerce.com',
        },
        thumbnail: {
          type: 'string',
          example: 'https://example.com/projects/ecommerce-platform-thumb.jpg',
        },
        about: {
          type: 'string',
          example: 'A comprehensive e-commerce platform built with modern technologies...',
        },
        goal: {
          type: 'string',
          example: 'To create a scalable e-commerce solution that can handle high traffic...',
        },
        execution: {
          type: 'string',
          example: 'We followed an agile development process with bi-weekly sprints...',
        },
        results: {
          type: 'string',
          example: 'The platform successfully increased client sales by 150% and reduced page load time by 60%',
        },
        goalImages: {
          type: 'array',
          items: { type: 'string' },
          example: ['https://example.com/projects/ecommerce/wireframe-1.jpg'],
        },
        resultImages: {
          type: 'array',
          items: { type: 'string' },
          example: ['https://example.com/projects/ecommerce/dashboard-screenshot.jpg'],
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          example: ['ecommerce', 'react', 'nodejs', 'aws'],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
    schema: {
      example: {
        success: true,
        message: 'Project created successfully',
        data: {
          id: 'project-id',
          slug: 'ecommerce-platform-solution',
          title: 'E-commerce Platform Solution',
          subtitle: 'Modern e-commerce solution with React and Node.js',
          client: 'TechStart Inc.',
          logo: 'https://example.com/logos/techstart-logo.png',
          services: ['Web Development', 'UI/UX Design', 'Database Design'],
          technologies: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
          website: 'https://techstart-ecommerce.com',
          thumbnail: 'https://example.com/projects/ecommerce-platform-thumb.jpg',
          about: 'A comprehensive e-commerce platform...',
          goal: 'To create a scalable e-commerce solution...',
          execution: 'We followed an agile development process...',
          results: 'The platform successfully increased client sales...',
          goalImages: [],
          resultImages: [],
          tags: [
            {
              id: 'tag-id',
              name: 'ecommerce',
            },
          ],
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  async createProject(@Body() dto: CreateProjectDto): Promise<ApiResponse> {
    const project = await this.projectsService.createProject(dto);
    return this.createSuccessResponse('Project created successfully', project);
  }

  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get projects with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'client', required: false, type: String })
  @ApiQuery({ name: 'services', required: false, type: [String] })
  @ApiQuery({ name: 'technologies', required: false, type: [String] })
  @ApiQuery({ name: 'tags', required: false, type: [String] })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Projects retrieved successfully',
        data: [
          {
            id: 'project-id',
            slug: 'ecommerce-platform-solution',
            title: 'E-commerce Platform Solution',
            subtitle: 'Modern e-commerce solution with React and Node.js',
            client: 'TechStart Inc.',
            logo: 'https://example.com/logos/techstart-logo.png',
            services: ['Web Development', 'UI/UX Design'],
            technologies: ['React', 'Node.js'],
            website: 'https://techstart-ecommerce.com',
            thumbnail: 'https://example.com/projects/ecommerce-platform-thumb.jpg',
            tags: [
              {
                id: 'tag-id',
                name: 'ecommerce',
              },
            ],
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z',
            _count: {
              tags: 1,
            },
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3,
        },
      },
    },
  })
  async getProjects(@Query() query: ProjectQueryDto, @User() user: any): Promise<ApiResponse> {
    this.checkProjectAccess(user);
    const result = await this.projectsService.getProjects(query);
    return this.createPaginatedResponse(
      'Projects retrieved successfully',
      result.projects,
      result.pagination,
    );
  }

  @Get('stats')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get project statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Project statistics retrieved successfully',
        data: {
          total: 25,
          clients: 15,
          totalServices: 8,
          totalTechnologies: 12,
          services: ['Web Development', 'UI/UX Design', 'Mobile Development'],
          technologies: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
        },
      },
    },
  })
  async getProjectStats(): Promise<ApiResponse> {
    const stats = await this.projectsService.getProjectStats();
    return this.createSuccessResponse('Project statistics retrieved successfully', stats);
  }

  @Get(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get a specific project by ID' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Project retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Project retrieved successfully',
        data: {
          id: 'project-id',
          slug: 'ecommerce-platform-solution',
          title: 'E-commerce Platform Solution',
          subtitle: 'Modern e-commerce solution with React and Node.js',
          client: 'TechStart Inc.',
          logo: 'https://example.com/logos/techstart-logo.png',
          services: ['Web Development', 'UI/UX Design', 'Database Design'],
          technologies: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
          website: 'https://techstart-ecommerce.com',
          thumbnail: 'https://example.com/projects/ecommerce-platform-thumb.jpg',
          about: 'A comprehensive e-commerce platform...',
          goal: 'To create a scalable e-commerce solution...',
          execution: 'We followed an agile development process...',
          results: 'The platform successfully increased client sales...',
          goalImages: [],
          resultImages: [],
          tags: [
            {
              id: 'tag-id',
              name: 'ecommerce',
            },
          ],
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  async getProjectById(@Param('id') projectId: string, @User() user: any): Promise<ApiResponse> {
    this.checkProjectAccess(user);
    const project = await this.projectsService.getProjectById(projectId);
    return this.createSuccessResponse('Project retrieved successfully', project);
  }

  @Get('slug/:slug')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get a specific project by slug' })
  @ApiParam({ name: 'slug', description: 'Project Slug' })
  @ApiResponse({
    status: 200,
    description: 'Project retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  async getProjectBySlug(@Param('slug') slug: string, @User() user: any): Promise<ApiResponse> {
    this.checkProjectAccess(user);
    const project = await this.projectsService.getProjectBySlug(slug);
    return this.createSuccessResponse('Project retrieved successfully', project);
  }

  @Get(':id/related')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get related projects' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of related projects to return' })
  @ApiResponse({
    status: 200,
    description: 'Related projects retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  async getRelatedProjects(
    @Param('id') projectId: string,
    @Query('limit') limit?: number,
    @User() user?: any,
  ): Promise<ApiResponse> {
    this.checkProjectAccess(user);
    const relatedProjects = await this.projectsService.getRelatedProjects(projectId, limit || 5);
    return this.createSuccessResponse('Related projects retrieved successfully', relatedProjects);
  }

  @Put(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a project' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          example: 'Updated E-commerce Platform Solution',
        },
        subtitle: {
          type: 'string',
          example: 'Updated modern e-commerce solution with React and Node.js',
        },
        services: {
          type: 'array',
          items: { type: 'string' },
          example: ['Web Development', 'UI/UX Design', 'Database Design', 'DevOps'],
        },
        technologies: {
          type: 'array',
          items: { type: 'string' },
          example: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          example: ['ecommerce', 'react', 'nodejs', 'aws', 'mobile'],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Project updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  async updateProject(
    @Param('id') projectId: string,
    @Body() dto: UpdateProjectDto,
    @User() user: any,
  ): Promise<ApiResponse> {
    const project = await this.projectsService.updateProject(
      projectId,
      dto,
      user?.id,
      user?.roles,
    );
    return this.createSuccessResponse('Project updated successfully', project);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a project' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Project deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  async deleteProject(
    @Param('id') projectId: string,
    @User() user: any,
  ): Promise<ApiResponse> {
    const result = await this.projectsService.deleteProject(
      projectId,
      user?.id,
      user?.roles,
    );
    return this.createSuccessResponse(result.message);
  }

  // PUBLIC ENDPOINTS - No authentication required

  @Get('/public/projects')
  @Public()
  @ApiOperation({ summary: 'Get published projects with pagination and filters (Public)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'client', required: false, type: String })
  @ApiQuery({ name: 'services', required: false, type: [String] })
  @ApiQuery({ name: 'technologies', required: false, type: [String] })
  @ApiQuery({ name: 'tags', required: false, type: [String] })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Published projects retrieved successfully',
  })
  async getPublicProjects(@Query() query: ProjectQueryDto): Promise<ApiResponse> {
    const result = await this.projectsService.getPublishedProjects(query);
    return this.createPaginatedResponse(
      'Published projects retrieved successfully',
      result.projects,
      result.pagination,
    );
  }

  @Get('/public/projects/:id')
  @Public()
  @ApiOperation({ summary: 'Get a specific published project by ID (Public)' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Published project retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Published project not found',
  })
  async getPublicProjectById(@Param('id') projectId: string): Promise<ApiResponse> {
    const project = await this.projectsService.getPublicProjectById(projectId);
    return this.createSuccessResponse('Published project retrieved successfully', project);
  }

  @Get('/public/projects/slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get a specific published project by slug (Public)' })
  @ApiParam({ name: 'slug', description: 'Project Slug' })
  @ApiResponse({
    status: 200,
    description: 'Published project retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Published project not found',
  })
  async getPublicProjectBySlug(@Param('slug') slug: string): Promise<ApiResponse> {
    const project = await this.projectsService.getPublicProjectBySlug(slug);
    return this.createSuccessResponse('Published project retrieved successfully', project);
  }

  @Get('/public/projects/:id/related')
  @Public()
  @ApiOperation({ summary: 'Get related published projects (Public)' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of related projects to return' })
  @ApiResponse({
    status: 200,
    description: 'Related published projects retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  async getPublicRelatedProjects(
    @Param('id') projectId: string,
    @Query('limit') limit?: number,
  ): Promise<ApiResponse> {
    const relatedProjects = await this.projectsService.getPublicRelatedProjects(projectId, limit || 5);
    return this.createSuccessResponse('Related published projects retrieved successfully', relatedProjects);
  }
}
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { LoggerService } from '../utils/logger/logger.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly logger: LoggerService,
  ) {
    this.logger.info('ProjectsService constructor called');
  }

  async createProject(dto: CreateProjectDto) {
    try {
      const existingProject = await this.prisma.project.findUnique({
        where: { slug: dto.slug },
      });

      if (existingProject) {
        throw new BadRequestException('A project with this slug already exists');
      }

      const tagConnections = await this.connectOrCreateTags(dto.tags || []);

      const project = await this.prisma.project.create({
        data: {
          slug: dto.slug,
          title: dto.title,
          subtitle: dto.subtitle,
          client: dto.client,
          logo: dto.logo,
          services: dto.services,
          technologies: dto.technologies,
          website: dto.website,
          thumbnail: dto.thumbnail,
          about: dto.about,
          goal: dto.goal,
          execution: dto.execution,
          results: dto.results,
          goalImages: dto.goalImages || [],
          resultImages: dto.resultImages || [],
          published: dto.published !== undefined ? dto.published : true,
          tags: {
            connectOrCreate: tagConnections,
          },
        },
        include: {
          tags: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      this.logger.info(`Project created: ${project.id} with slug ${project.slug}`);

      return project;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to create project with slug ${dto.slug}`, error.message);
      throw error;
    }
  }

  async getProjects(query: ProjectQueryDto) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        client,
        services,
        technologies,
        tags,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = query;

      const where: any = {};

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { subtitle: { contains: search, mode: 'insensitive' } },
          { client: { contains: search, mode: 'insensitive' } },
          { about: { contains: search, mode: 'insensitive' } },
          { services: { has: search } },
          { technologies: { has: search } },
        ];
      }

      if (client) {
        where.client = { contains: client, mode: 'insensitive' };
      }

      if (services && services.length > 0) {
        where.services = {
          hasSome: services,
        };
      }

      if (technologies && technologies.length > 0) {
        where.technologies = {
          hasSome: technologies,
        };
      }

      if (tags && tags.length > 0) {
        where.tags = {
          some: {
            name: {
              in: tags,
              mode: 'insensitive',
            },
          },
        };
      }

      const total = await this.prisma.project.count({ where });

      const projects = await this.prisma.project.findMany({
        where,
        include: {
          tags: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              tags: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      return {
        projects,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error('Failed to get projects', error.message);
      throw error;
    }
  }

  async getPublishedProjects(query: ProjectQueryDto) {
    // Get only published projects for public consumption
    try {
      const publishedQuery = { ...query };
      const {
        page = 1,
        limit = 10,
        search,
        client,
        services,
        technologies,
        tags,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = publishedQuery;

      const where: any = { published: true };

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { subtitle: { contains: search, mode: 'insensitive' } },
          { client: { contains: search, mode: 'insensitive' } },
          { about: { contains: search, mode: 'insensitive' } },
          { services: { has: search } },
          { technologies: { has: search } },
        ];
      }

      if (client) {
        where.client = { contains: client, mode: 'insensitive' };
      }

      if (services && services.length > 0) {
        where.services = {
          hasSome: services,
        };
      }

      if (technologies && technologies.length > 0) {
        where.technologies = {
          hasSome: technologies,
        };
      }

      if (tags && tags.length > 0) {
        where.tags = {
          some: {
            name: {
              in: tags,
              mode: 'insensitive',
            },
          },
        };
      }

      const total = await this.prisma.project.count({ where });

      const projects = await this.prisma.project.findMany({
        where,
        include: {
          tags: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              tags: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      return {
        projects,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error('Failed to get published projects', error.message);
      throw error;
    }
  }

  async getProjectById(projectId: string) {
    try {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        include: {
          tags: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      return project;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get project ${projectId}`, error.message);
      throw error;
    }
  }

  async getPublicProjectById(projectId: string) {
    try {
      const project = await this.prisma.project.findFirst({
        where: {
          id: projectId,
          published: true
        },
        include: {
          tags: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!project) {
        throw new NotFoundException('Published project not found');
      }

      return project;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get public project ${projectId}`, error.message);
      throw error;
    }
  }

  async getProjectBySlug(slug: string) {
    try {
      const project = await this.prisma.project.findUnique({
        where: { slug },
        include: {
          tags: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      return project;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get project with slug ${slug}`, error.message);
      throw error;
    }
  }

  async getPublicProjectBySlug(slug: string) {
    try {
      const project = await this.prisma.project.findFirst({
        where: {
          slug,
          published: true
        },
        include: {
          tags: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!project) {
        throw new NotFoundException('Published project not found');
      }

      return project;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get public project with slug ${slug}`, error.message);
      throw error;
    }
  }

  async getRelatedProjects(projectId: string, limit: number = 5) {
    try {
      const currentProject = await this.prisma.project.findUnique({
        where: { id: projectId },
        include: {
          tags: true,
        },
      });

      if (!currentProject) {
        throw new NotFoundException('Project not found');
      }

      const relatedProjects = await this.prisma.project.findMany({
        where: {
          AND: [
            { id: { not: projectId } },
            {
              OR: [
                {
                  tags: {
                    some: {
                      name: {
                        in: currentProject.tags.map(tag => tag.name),
                      },
                    },
                  },
                },
                {
                  technologies: {
                    hasSome: currentProject.technologies.slice(0, 3),
                  },
                },
                {
                  services: {
                    hasSome: currentProject.services.slice(0, 2),
                  },
                },
              ],
            },
          ],
        },
        include: {
          tags: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return relatedProjects;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get related projects for ${projectId}`, error.message);
      throw error;
    }
  }

  async getPublicRelatedProjects(projectId: string, limit: number = 5) {
    try {
      const currentProject = await this.prisma.project.findFirst({
        where: {
          id: projectId,
          published: true
        },
        include: {
          tags: true,
        },
      });

      if (!currentProject) {
        throw new NotFoundException('Published project not found');
      }

      const relatedProjects = await this.prisma.project.findMany({
        where: {
          AND: [
            { id: { not: projectId } },
            { published: true },
            {
              OR: [
                {
                  tags: {
                    some: {
                      name: {
                        in: currentProject.tags.map(tag => tag.name),
                      },
                    },
                  },
                },
                {
                  technologies: {
                    hasSome: currentProject.technologies.slice(0, 3),
                  },
                },
                {
                  services: {
                    hasSome: currentProject.services.slice(0, 2),
                  },
                },
              ],
            },
          ],
        },
        include: {
          tags: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return relatedProjects;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get public related projects for ${projectId}`, error.message);
      throw error;
    }
  }

  async updateProject(
    projectId: string,
    dto: UpdateProjectDto,
    _userId?: string,
    _userRoles?: string[],
  ) {
    try {
      const existingProject = await this.prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!existingProject) {
        throw new NotFoundException('Project not found');
      }

      if (dto.slug && dto.slug !== existingProject.slug) {
        const slugExists = await this.prisma.project.findUnique({
          where: { slug: dto.slug },
        });

        if (slugExists) {
          throw new BadRequestException('A project with this slug already exists');
        }
      }

      const updateData: any = {};

      if (dto.slug !== undefined) updateData.slug = dto.slug;
      if (dto.title !== undefined) updateData.title = dto.title;
      if (dto.subtitle !== undefined) updateData.subtitle = dto.subtitle;
      if (dto.client !== undefined) updateData.client = dto.client;
      if (dto.logo !== undefined) updateData.logo = dto.logo;
      if (dto.services !== undefined) updateData.services = dto.services;
      if (dto.technologies !== undefined) updateData.technologies = dto.technologies;
      if (dto.website !== undefined) updateData.website = dto.website;
      if (dto.thumbnail !== undefined) updateData.thumbnail = dto.thumbnail;
      if (dto.about !== undefined) updateData.about = dto.about;
      if (dto.goal !== undefined) updateData.goal = dto.goal;
      if (dto.execution !== undefined) updateData.execution = dto.execution;
      if (dto.results !== undefined) updateData.results = dto.results;
      if (dto.goalImages !== undefined) updateData.goalImages = dto.goalImages;
      if (dto.resultImages !== undefined) updateData.resultImages = dto.resultImages;
      if (dto.published !== undefined) updateData.published = dto.published;

      if (dto.tags !== undefined) {
        const tagConnections = await this.connectOrCreateTags(dto.tags);
        updateData.tags = {
          set: [],
          connectOrCreate: tagConnections,
        };
      }

      const updatedProject = await this.prisma.project.update({
        where: { id: projectId },
        data: updateData,
        include: {
          tags: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      this.logger.info(`Project ${projectId} updated successfully`);

      return updatedProject;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to update project ${projectId}`, error.message);
      throw error;
    }
  }

  async deleteProject(projectId: string, _userId?: string, userRoles?: string[]) {
    try {
      const existingProject = await this.prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!existingProject) {
        throw new NotFoundException('Project not found');
      }

      const isAdmin = userRoles?.includes('admin');

      if (!isAdmin) {
        throw new ForbiddenException('Only administrators can delete projects');
      }

      await this.prisma.project.delete({
        where: { id: projectId },
      });

      this.logger.info(`Project ${projectId} deleted successfully`);

      return { message: 'Project deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Failed to delete project ${projectId}`, error.message);
      throw error;
    }
  }

  async getProjectStats() {
    try {
      const totalProjects = await this.prisma.project.count();

      const clientsCount = await this.prisma.project.count({
        where: {
          client: {
            not: null,
          },
        },
      });

      const allProjects = await this.prisma.project.findMany({
        select: {
          services: true,
          technologies: true,
        },
      });

      const allServices = new Set<string>();
      const allTechnologies = new Set<string>();

      allProjects.forEach(project => {
        project.services.forEach(service => allServices.add(service));
        project.technologies.forEach(tech => allTechnologies.add(tech));
      });

      return {
        total: totalProjects,
        clients: clientsCount,
        totalServices: allServices.size,
        totalTechnologies: allTechnologies.size,
        services: Array.from(allServices).sort(),
        technologies: Array.from(allTechnologies).sort(),
      };
    } catch (error) {
      this.logger.error('Failed to get project stats', error.message);
      throw error;
    }
  }

  private async connectOrCreateTags(tagNames: string[]) {
    if (!tagNames || tagNames.length === 0) {
      return [];
    }

    return tagNames.map(tagName => ({
      where: { name: tagName.trim() },
      create: { name: tagName.trim() },
    }));
  }
}
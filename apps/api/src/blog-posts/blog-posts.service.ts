
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { LoggerService } from '../utils/logger/logger.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { BlogPostQueryDto } from './dto/blog-post-query.dto';

@Injectable()
export class BlogPostsService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly logger: LoggerService,
  ) {
    this.logger.info('BlogPostsService constructor called');
  }

  async createBlogPost(userId: string, userName: string, dto: CreateBlogPostDto) {
    try {
      // Check if slug already exists
      const existingPost = await this.prisma.blogPost.findUnique({
        where: { slug: dto.slug },
      });

      if (existingPost) {
        throw new BadRequestException('A blog post with this slug already exists');
      }

      // Create or get tags
      const tagConnections = await this.connectOrCreateTags(dto.tags || []);

      const blogPost = await this.prisma.blogPost.create({
        data: {
          title: dto.title,
          slug: dto.slug,
          content: dto.content,
          thumbnail: dto.thumbnail || '',
          published: dto.published || false,
          authorId: userId,
          authorName: userName,
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

      this.logger.info(`Blog post created: ${blogPost.id} by user ${userId}`);

      return blogPost;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to create blog post for user ${userId}`, error.message);
      throw error;
    }
  }

  async getBlogPosts(query: BlogPostQueryDto) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        published,
        author,
        tags,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        minViews,
        minReactions,
      } = query;

      // Build where clause
      const where: any = {};

      // Apply filters
      if (published !== undefined) {
        where.published = published;
      }

      if (author) {
        where.authorName = { contains: author, mode: 'insensitive' };
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (minViews !== undefined) {
        where.views = { gte: minViews };
      }

      if (minReactions !== undefined) {
        where.reactions = { gte: minReactions };
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

      // Get total count for pagination
      const total = await this.prisma.blogPost.count({ where });

      // Get blog posts with pagination
      const blogPosts = await this.prisma.blogPost.findMany({
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
        blogPosts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error('Failed to get blog posts', error.message);
      throw error;
    }
  }

  async getBlogPostById(blogPostId: string, incrementView = false) {
    try {
      const blogPost = await this.prisma.blogPost.findUnique({
        where: { id: blogPostId },
        include: {
          tags: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!blogPost) {
        throw new NotFoundException('Blog post not found');
      }

      // Increment view count if requested
      if (incrementView) {
        await this.prisma.blogPost.update({
          where: { id: blogPostId },
          data: {
            views: {
              increment: 1,
            },
          },
        });
        blogPost.views += 1;
      }

      return blogPost;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get blog post ${blogPostId}`, error.message);
      throw error;
    }
  }

  async getBlogPostBySlug(slug: string, incrementView = false) {
    try {
      const blogPost = await this.prisma.blogPost.findUnique({
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

      if (!blogPost) {
        throw new NotFoundException('Blog post not found');
      }

      // Increment view count if requested and post is published
      if (incrementView && blogPost.published) {
        await this.prisma.blogPost.update({
          where: { id: blogPost.id },
          data: {
            views: {
              increment: 1,
            },
          },
        });
        blogPost.views += 1;
      }

      return blogPost;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get blog post with slug ${slug}`, error.message);
      throw error;
    }
  }

  async updateBlogPost(
    blogPostId: string,
    userId: string,
    userRoles: string[],
    dto: UpdateBlogPostDto,
  ) {
    try {
      // Get existing blog post
      const existingPost = await this.prisma.blogPost.findUnique({
        where: { id: blogPostId },
      });

      if (!existingPost) {
        throw new NotFoundException('Blog post not found');
      }

      // Check permissions - only author or admin/staff can update
      const isAuthor = existingPost.authorId === userId;
      const isStaff = userRoles.includes('admin') || userRoles.includes('staff');

      if (!isAuthor && !isStaff) {
        throw new ForbiddenException('You can only update your own blog posts');
      }

      // Check if slug is being updated and if it already exists
      if (dto.slug && dto.slug !== existingPost.slug) {
        const slugExists = await this.prisma.blogPost.findUnique({
          where: { slug: dto.slug },
        });

        if (slugExists) {
          throw new BadRequestException('A blog post with this slug already exists');
        }
      }

      // Prepare update data
      const updateData: any = {};

      if (dto.title !== undefined) updateData.title = dto.title;
      if (dto.slug !== undefined) updateData.slug = dto.slug;
      if (dto.content !== undefined) updateData.content = dto.content;
      if (dto.thumbnail !== undefined) updateData.thumbnail = dto.thumbnail;
      if (dto.published !== undefined) updateData.published = dto.published;

      // Handle tags update
      if (dto.tags !== undefined) {
        const tagConnections = await this.connectOrCreateTags(dto.tags);
        updateData.tags = {
          set: [], // Clear existing tags first
          connectOrCreate: tagConnections,
        };
      }

      const updatedBlogPost = await this.prisma.blogPost.update({
        where: { id: blogPostId },
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

      this.logger.info(`Blog post ${blogPostId} updated by user ${userId}`);

      return updatedBlogPost;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to update blog post ${blogPostId} for user ${userId}`, error.message);
      throw error;
    }
  }

  async deleteBlogPost(blogPostId: string, userId: string, userRoles: string[]) {
    try {
      // Get existing blog post
      const existingPost = await this.prisma.blogPost.findUnique({
        where: { id: blogPostId },
      });

      if (!existingPost) {
        throw new NotFoundException('Blog post not found');
      }

      // Check permissions - only author or admin can delete
      const isAuthor = existingPost.authorId === userId;
      const isAdmin = userRoles.includes('admin');

      if (!isAuthor && !isAdmin) {
        throw new ForbiddenException('You can only delete your own blog posts');
      }

      await this.prisma.blogPost.delete({
        where: { id: blogPostId },
      });

      this.logger.info(`Blog post ${blogPostId} deleted by user ${userId}`);

      return { message: 'Blog post deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Failed to delete blog post ${blogPostId} for user ${userId}`, error.message);
      throw error;
    }
  }

  async addReaction(blogPostId: string, userId: string) {
    try {
      const blogPost = await this.prisma.blogPost.findUnique({
        where: { id: blogPostId },
      });

      if (!blogPost) {
        throw new NotFoundException('Blog post not found');
      }

      if (!blogPost.published) {
        throw new BadRequestException('Cannot add reaction to unpublished post');
      }

      const updatedBlogPost = await this.prisma.blogPost.update({
        where: { id: blogPostId },
        data: {
          reactions: {
            increment: 1,
          },
        },
      });

      this.logger.info(`Reaction added to blog post ${blogPostId} by user ${userId}`);

      return { reactions: updatedBlogPost.reactions };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to add reaction to blog post ${blogPostId}`, error.message);
      throw error;
    }
  }

  async removeReaction(blogPostId: string, userId: string) {
    try {
      const blogPost = await this.prisma.blogPost.findUnique({
        where: { id: blogPostId },
      });

      if (!blogPost) {
        throw new NotFoundException('Blog post not found');
      }

      if (blogPost.reactions <= 0) {
        throw new BadRequestException('Cannot remove reaction from post with no reactions');
      }

      const updatedBlogPost = await this.prisma.blogPost.update({
        where: { id: blogPostId },
        data: {
          reactions: {
            decrement: 1,
          },
        },
      });

      this.logger.info(`Reaction removed from blog post ${blogPostId} by user ${userId}`);

      return { reactions: updatedBlogPost.reactions };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to remove reaction from blog post ${blogPostId}`, error.message);
      throw error;
    }
  }

  async getBlogPostStats() {
    try {
      const [totalPosts, publishedPosts, draftPosts, totalViews, totalReactions] = await Promise.all([
        this.prisma.blogPost.count(),
        this.prisma.blogPost.count({ where: { published: true } }),
        this.prisma.blogPost.count({ where: { published: false } }),
        this.prisma.blogPost.aggregate({
          _sum: {
            views: true,
          },
        }),
        this.prisma.blogPost.aggregate({
          _sum: {
            reactions: true,
          },
        }),
      ]);

      return {
        total: totalPosts,
        published: publishedPosts,
        draft: draftPosts,
        totalViews: totalViews._sum.views || 0,
        totalReactions: totalReactions._sum.reactions || 0,
      };
    } catch (error) {
      this.logger.error('Failed to get blog post stats', error.message);
      throw error;
    }
  }

  async getPublishedBlogPosts(query: BlogPostQueryDto) {
    // Get only published posts for public consumption
    const publishedQuery = { ...query, published: true };
    return this.getBlogPosts(publishedQuery);
  }

  async getUserBlogPosts(userId: string, query: BlogPostQueryDto) {
    try {
      const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;

      const where: any = { authorId: userId };

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ];
      }

      const total = await this.prisma.blogPost.count({ where });

      const blogPosts = await this.prisma.blogPost.findMany({
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
        blogPosts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get blog posts for user ${userId}`, error.message);
      throw error;
    }
  }

  /**
   * Helper method to connect or create tags
   * @param tagNames - Array of tag names
   * @returns Promise<Array<{ where: { name: string }, create: { name: string } }>>
   */
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
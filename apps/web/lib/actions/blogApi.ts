// Blog Posts API integration
import { apiClient } from '@/lib/utils/api-client';
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  content: string;
  reactions: number;
  views: number;
  authorId: string;
  authorName: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
  _count?: {
    tags: number;
  };
}

export interface Tag {
  id: string;
  name: string;
}

export interface CreateBlogPostRequest {
  title: string;
  slug: string;
  content: string;
  thumbnail?: string;
  tags?: string[];
  published?: boolean;
}

export interface UpdateBlogPostRequest {
  title?: string;
  slug?: string;
  content?: string;
  thumbnail?: string;
  tags?: string[];
  published?: boolean;
}

export interface BlogPostQuery {
  page?: number;
  limit?: number;
  search?: string;
  published?: boolean;
  author?: string;
  tags?: string[];
  sortBy?: string;
  sortOrder?: string;
  minViews?: number;
  minReactions?: number;
}

export interface BlogPostStats {
  total: number;
  published: number;
  draft: number;
  totalViews: number;
  totalReactions: number;
}

export interface ApiResponse<T> {
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

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class BlogAPI {
  private async fetchWithAuth(
    url: string,
    options: RequestInit = {},
    accessToken?: string
  ): Promise<Response> {
    return apiClient.fetchWithAuth(url, options, undefined, accessToken);
  }

  private handleResponse<T>(response: Response): Promise<T> {
    return apiClient.handleResponse<T>(response);
  }

  // Authenticated endpoints
  async createBlogPost(data: CreateBlogPostRequest, accessToken?: string): Promise<{ data: ApiResponse<BlogPost> }> {
    const response = await this.fetchWithAuth(
      '/blog-posts',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      accessToken
    );

    const result = await this.handleResponse<ApiResponse<BlogPost>>(response);
    return { data: result };
  }

  async getBlogPosts(
    query: BlogPostQuery = {},
    accessToken?: string
  ): Promise<{ data: ApiResponse<BlogPost[]> }> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await this.fetchWithAuth(
      `/blog-posts?${params.toString()}`,
      { method: 'GET' },
      accessToken
    );

    const result = await this.handleResponse<ApiResponse<BlogPost[]>>(response);
    return { data: result };
  }

  async getPublishedBlogPosts(
    query: BlogPostQuery = {},
    accessToken?: string
  ): Promise<{ data: ApiResponse<BlogPost[]> }> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await this.fetchWithAuth(
      `/blog-posts/published?${params.toString()}`,
      { method: 'GET' },
      accessToken
    );

    const result = await this.handleResponse<ApiResponse<BlogPost[]>>(response);
    return { data: result };
  }

  async getUserBlogPosts(
    userId: string,
    query: BlogPostQuery = {},
    accessToken?: string
  ): Promise<{ data: ApiResponse<BlogPost[]> }> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await this.fetchWithAuth(
      `/blog-posts/user/${userId}?${params.toString()}`,
      { method: 'GET' },
      accessToken
    );

    const result = await this.handleResponse<ApiResponse<BlogPost[]>>(response);
    return { data: result };
  }

  async getBlogPostById(id: string, incrementViews = false, accessToken?: string): Promise<{ data: ApiResponse<BlogPost> }> {
    const params = new URLSearchParams();
    if (incrementViews) {
      params.append('incrementViews', 'true');
    }

    const response = await this.fetchWithAuth(
      `/blog-posts/${id}?${params.toString()}`,
      { method: 'GET' },
      accessToken
    );

    const result = await this.handleResponse<ApiResponse<BlogPost>>(response);
    return { data: result };
  }

  async getBlogPostBySlug(slug: string, incrementViews = false, accessToken?: string): Promise<{ data: ApiResponse<BlogPost> }> {
    const params = new URLSearchParams();
    if (incrementViews) {
      params.append('incrementViews', 'true');
    }

    const response = await this.fetchWithAuth(
      `/blog-posts/slug/${slug}?${params.toString()}`,
      { method: 'GET' },
      accessToken
    );

    const result = await this.handleResponse<ApiResponse<BlogPost>>(response);
    return { data: result };
  }

  async updateBlogPost(
    id: string,
    data: UpdateBlogPostRequest,
    accessToken?: string
  ): Promise<{ data: ApiResponse<BlogPost> }> {
    const response = await this.fetchWithAuth(
      `/blog-posts/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      accessToken
    );

    const result = await this.handleResponse<ApiResponse<BlogPost>>(response);
    return { data: result };
  }

  async deleteBlogPost(id: string, accessToken?: string): Promise<{ data: ApiResponse<any> }> {
    const response = await this.fetchWithAuth(
      `/blog-posts/${id}`,
      { method: 'DELETE' },
      accessToken
    );

    const result = await this.handleResponse<ApiResponse<any>>(response);
    return { data: result };
  }

  async addReaction(id: string, accessToken?: string): Promise<{ data: ApiResponse<{ reactions: number }> }> {
    const response = await this.fetchWithAuth(
      `/blog-posts/${id}/reactions`,
      { method: 'POST' },
      accessToken
    );

    const result = await this.handleResponse<ApiResponse<{ reactions: number }>>(response);
    return { data: result };
  }

  async removeReaction(id: string, accessToken?: string): Promise<{ data: ApiResponse<{ reactions: number }> }> {
    const response = await this.fetchWithAuth(
      `/blog-posts/${id}/reactions`,
      { method: 'DELETE' },
      accessToken
    );

    const result = await this.handleResponse<ApiResponse<{ reactions: number }>>(response);
    return { data: result };
  }

  async getBlogPostStats(accessToken?: string): Promise<{ data: ApiResponse<BlogPostStats> }> {
    const response = await this.fetchWithAuth(
      '/blog-posts/stats',
      { method: 'GET' },
      accessToken
    );

    const result = await this.handleResponse<ApiResponse<BlogPostStats>>(response);
    return { data: result };
  }

  // Public endpoints (no authentication required)
  async getPublicBlogPosts(query: BlogPostQuery = {}): Promise<{ data: ApiResponse<BlogPost[]> }> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    try {
      const response = await fetch(`${API_BASE_URL}/blog-posts/public/blog-posts?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 3600 }
      });

      if (!response.ok) throw new Error(`API_NODE_OFFLINE: ${response.status}`);

      const result = await this.handleResponse<ApiResponse<BlogPost[]>>(response);
      
      // Fallback if no data found in API
      if (!result.data || result.data.length === 0) {
        throw new Error("NO_DATA_FOUND_IN_API");
      }
      
      return { data: result };
    } catch (error) {
      if (process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_VERBOSE_API_FALLBACK === 'true') {
        console.debug("BLOG_API_OFFLINE: using local data fallback for blog posts", error);
      }
      try {
        let result;
        if (typeof window === 'undefined') {
          // Server-side: Read from filesystem to avoid relative URL issues during build
          const fs = require('fs');
          const path = require('path');
          const filePath = path.join(process.cwd(), 'public', 'data', 'blogposts.json');
          const fileData = fs.readFileSync(filePath, 'utf8');
          result = JSON.parse(fileData);
        } else {
          // Client-side: Use fetch
          const fallbackResponse = await fetch('/data/blogposts.json');
          if (!fallbackResponse.ok) throw new Error("VAULT_OFFLINE");
          result = await fallbackResponse.json();
        }
        return { data: result };
      } catch (fallbackError) {
        console.error("BLOG_API_FALLBACK_FAILED: local data vault also unreachable.", fallbackError);
        return {
          data: {
            success: false,
            message: "Blog API and local data fallback both unavailable.",
            data: []
          }
        };
      }
    }
  }

  async getPublicBlogPostById(id: string, incrementViews = false): Promise<{ data: ApiResponse<BlogPost> }> {
    const params = new URLSearchParams();
    if (incrementViews) {
      params.append('incrementViews', 'true');
    }

    const response = await fetch(`${API_BASE_URL}/blog-posts/public/blog-posts/${id}?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 3600 }
    });

    const result = await this.handleResponse<ApiResponse<BlogPost>>(response);
    return { data: result };
  }

  async getPublicBlogPostBySlug(slug: string, incrementViews = false): Promise<{ data: ApiResponse<BlogPost> }> {
    const params = new URLSearchParams();
    if (incrementViews) {
      params.append('incrementViews', 'true');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/blog-posts/public/blog-posts/slug/${slug}?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 3600 }
      });

      if (!response.ok) throw new Error(`API_NODE_OFFLINE: ${response.status}`);

      const result = await this.handleResponse<ApiResponse<BlogPost>>(response);
      return { data: result };
    } catch (error) {
      console.warn(`CRITICAL: SEARCHING LOCAL BLOG VAULT FOR SLUG: ${slug}`, error);
      try {
        let allData;
        if (typeof window === 'undefined') {
          // Server-side: Read from filesystem
          const fs = require('fs');
          const path = require('path');
          const filePath = path.join(process.cwd(), 'public', 'data', 'blogposts.json');
          const fileData = fs.readFileSync(filePath, 'utf8');
          allData = JSON.parse(fileData);
        } else {
          // Client-side: Use fetch
          const fallbackResponse = await fetch('/data/blogposts.json');
          if (!fallbackResponse.ok) throw new Error("VAULT_OFFLINE");
          allData = await fallbackResponse.json();
        }

        const post = allData.data.find((p: any) => p.slug === slug);

        if (post) {
          return { data: { success: true, message: "BLOG_DATA_RECOVERED_FROM_VAULT", data: post } };
        }
        throw new Error("SLUG_NOT_FOUND_IN_VAULT");
      } catch (fallbackError) {
        console.error("VAULT_READ_ERROR", fallbackError);
        return {
          data: {
            success: false,
            message: "SYSTEM_FAILURE: BLOG VAULT CORRUPTED OR UNREACHABLE",
          }
        };
      }
    }
  }
}

// Export singleton instance
export const blogAPI = new BlogAPI();

// Export utility functions for easier usage (with proper this binding)
export const createBlogPost = blogAPI.createBlogPost.bind(blogAPI);
export const getBlogPosts = blogAPI.getBlogPosts.bind(blogAPI);
export const getPublishedBlogPosts = blogAPI.getPublishedBlogPosts.bind(blogAPI);
export const getUserBlogPosts = blogAPI.getUserBlogPosts.bind(blogAPI);
export const getBlogPostById = blogAPI.getBlogPostById.bind(blogAPI);
export const getBlogPostBySlug = blogAPI.getBlogPostBySlug.bind(blogAPI);
export const updateBlogPost = blogAPI.updateBlogPost.bind(blogAPI);
export const deleteBlogPost = blogAPI.deleteBlogPost.bind(blogAPI);
export const addReaction = blogAPI.addReaction.bind(blogAPI);
export const removeReaction = blogAPI.removeReaction.bind(blogAPI);
export const getBlogPostStats = blogAPI.getBlogPostStats.bind(blogAPI);
export const getPublicBlogPosts = blogAPI.getPublicBlogPosts.bind(blogAPI);
export const getPublicBlogPostById = blogAPI.getPublicBlogPostById.bind(blogAPI);
export const getPublicBlogPostBySlug = blogAPI.getPublicBlogPostBySlug.bind(blogAPI);
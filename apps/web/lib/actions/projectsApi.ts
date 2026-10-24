// Projects API integration
import { apiClient } from '@/lib/utils/api-client';
export interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  client?: string;
  logo?: string;
  services: string[];
  technologies: string[];
  website: string;
  thumbnail: string;
  about: string;
  goal: string;
  execution: string;
  results: string;
  goalImages: string[];
  resultImages: string[];
  tags: Tag[];
  published?: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    tags: number;
  };
}

export interface Tag {
  id: string;
  name: string;
}

export interface CreateProjectRequest {
  slug: string;
  title: string;
  subtitle?: string;
  client?: string;
  logo?: string;
  services: string[];
  technologies: string[];
  website: string;
  thumbnail: string;
  about: string;
  goal: string;
  execution: string;
  results: string;
  goalImages?: string[];
  resultImages?: string[];
  tags?: string[];
}

export interface UpdateProjectRequest {
  title?: string;
  subtitle?: string;
  client?: string;
  logo?: string;
  services?: string[];
  technologies?: string[];
  website?: string;
  thumbnail?: string;
  about?: string;
  goal?: string;
  execution?: string;
  results?: string;
  goalImages?: string[];
  resultImages?: string[];
  tags?: string[];
  published?: boolean;
}

export interface ProjectQuery {
  page?: number;
  limit?: number;
  search?: string;
  client?: string;
  services?: string[];
  technologies?: string[];
  tags?: string[];
  sortBy?: string;
  sortOrder?: string;
}

export interface ProjectStats {
  total: number;
  clients: number;
  totalServices: number;
  totalTechnologies: number;
  services: string[];
  technologies: string[];
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

class ProjectsAPI {
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
  async createProject(data: CreateProjectRequest, accessToken?: string): Promise<{ data: ApiResponse<Project> }> {
    const response = await this.fetchWithAuth(
      '/projects',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      accessToken
    );

    const result = await this.handleResponse<ApiResponse<Project>>(response);
    return { data: result };
  }

  async getProjects(
    query: ProjectQuery = {},
    accessToken?: string
  ): Promise<{ data: ApiResponse<Project[]> }> {
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
      `/projects?${params.toString()}`,
      { method: 'GET' },
      accessToken
    );

    const result = await this.handleResponse<ApiResponse<Project[]>>(response);
    return { data: result };
  }

  async getProjectById(id: string, accessToken?: string): Promise<{ data: ApiResponse<Project> }> {
    const response = await this.fetchWithAuth(
      `/projects/${id}`,
      { method: 'GET' },
      accessToken
    );

    const result = await this.handleResponse<ApiResponse<Project>>(response);
    return { data: result };
  }

  async getProjectBySlug(slug: string, accessToken?: string): Promise<{ data: ApiResponse<Project> }> {
    const response = await this.fetchWithAuth(
      `/projects/slug/${slug}`,
      { method: 'GET' },
      accessToken
    );

    const result = await this.handleResponse<ApiResponse<Project>>(response);
    return { data: result };
  }

  async getRelatedProjects(id: string, limit = 5, accessToken?: string): Promise<{ data: ApiResponse<Project[]> }> {
    const response = await this.fetchWithAuth(
      `/projects/${id}/related?limit=${limit}`,
      { method: 'GET' },
      accessToken
    );

    const result = await this.handleResponse<ApiResponse<Project[]>>(response);
    return { data: result };
  }

  async updateProject(
    id: string,
    data: UpdateProjectRequest,
    accessToken?: string
  ): Promise<{ data: ApiResponse<Project> }> {
    const response = await this.fetchWithAuth(
      `/projects/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      accessToken
    );

    const result = await this.handleResponse<ApiResponse<Project>>(response);
    return { data: result };
  }

  async deleteProject(id: string, accessToken?: string): Promise<{ data: ApiResponse<any> }> {
    const response = await this.fetchWithAuth(
      `/projects/${id}`,
      { method: 'DELETE' },
      accessToken
    );

    const result = await this.handleResponse<ApiResponse<any>>(response);
    return { data: result };
  }

  async getProjectStats(accessToken?: string): Promise<{ data: ApiResponse<ProjectStats> }> {
    const response = await this.fetchWithAuth(
      '/projects/stats',
      { method: 'GET' },
      accessToken
    );

    const result = await this.handleResponse<ApiResponse<ProjectStats>>(response);
    return { data: result };
  }

  // Public endpoints (no authentication required)
  async getPublicProjects(query: ProjectQuery = {}): Promise<{ data: ApiResponse<Project[]> }> {
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
      const response = await fetch(`${API_BASE_URL}/projects/public/projects?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 3600 }
      });

      if (!response.ok) throw new Error(`API_NODE_OFFLINE: ${response.status}`);

      const result = await this.handleResponse<ApiResponse<Project[]>>(response);
      
      // Fallback if no data found in API
      if (!result.data || result.data.length === 0) {
        throw new Error("NO_DATA_FOUND_IN_API");
      }
      
      return { data: result };
    } catch (error) {
      if (process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_VERBOSE_API_FALLBACK === 'true') {
        console.debug("API_NODES_OFFLINE: using local data fallback for projects", error);
      }
      try {
        let result;
        if (typeof window === 'undefined') {
          // Server-side: Read from filesystem to avoid relative URL issues during build
          const fs = require('fs');
          const path = require('path');
          const filePath = path.join(process.cwd(), 'public', 'data', 'projects.json');
          const fileData = fs.readFileSync(filePath, 'utf8');
          result = JSON.parse(fileData);
        } else {
          // Client-side: Use fetch
          const fallbackResponse = await fetch('/data/projects.json');
          if (!fallbackResponse.ok) throw new Error("VAULT_OFFLINE");
          result = await fallbackResponse.json();
        }
        return { data: result };
      } catch (fallbackError) {
        console.error("API_FALLBACK_FAILED: local data nodes also unreachable.", fallbackError);
        return {
          data: {
            success: false,
            message: "API and local data fallback both unavailable.",
            data: []
          }
        };
      }
    }
  }

  async getPublicProjectById(id: string): Promise<{ data: ApiResponse<Project> }> {
    const response = await fetch(`${API_BASE_URL}/projects/public/projects/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 3600 }
    });

    const result = await this.handleResponse<ApiResponse<Project>>(response);
    return { data: result };
  }

  async getPublicProjectBySlug(slug: string): Promise<{ data: ApiResponse<Project> }> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/public/projects/slug/${slug}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 3600 }
      });

      if (!response.ok) throw new Error(`API_NODE_OFFLINE: ${response.status}`);

      const result = await this.handleResponse<ApiResponse<Project>>(response);
      return { data: result };
    } catch (error) {
      console.warn(`CRITICAL: SEARCHING LOCAL VAULT FOR SLUG: ${slug}`, error);
      try {
        let allData;
        if (typeof window === 'undefined') {
          // Server-side: Read from filesystem
          const fs = require('fs');
          const path = require('path');
          const filePath = path.join(process.cwd(), 'public', 'data', 'projects.json');
          const fileData = fs.readFileSync(filePath, 'utf8');
          allData = JSON.parse(fileData);
        } else {
          // Client-side: Use fetch
          const fallbackResponse = await fetch('/data/projects.json');
          if (!fallbackResponse.ok) throw new Error("VAULT_OFFLINE");
          allData = await fallbackResponse.json();
        }

        const project = allData.data.find((p: any) => p.slug === slug);

        if (project) {
          return { data: { success: true, message: "DATA_RECOVERED_FROM_VAULT", data: project } };
        }
        throw new Error("SLUG_NOT_FOUND_IN_VAULT");
      } catch (fallbackError) {
        console.error("VAULT_READ_ERROR", fallbackError);
        return {
          data: {
            success: false,
            message: "SYSTEM_FAILURE: DATA VAULT CORRUPTED OR UNREACHABLE",
          }
        };
      }
    }
  }

  async getPublicRelatedProjects(id: string, limit = 5): Promise<{ data: ApiResponse<Project[]> }> {
    const response = await fetch(`${API_BASE_URL}/projects/public/projects/${id}/related?limit=${limit}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 3600 }
    });

    const result = await this.handleResponse<ApiResponse<Project[]>>(response);
    return { data: result };
  }
}

// Export singleton instance
export const projectsAPI = new ProjectsAPI();

// Export utility functions for easier usage (with proper this binding)
export const createProject = projectsAPI.createProject.bind(projectsAPI);
export const getProjects = projectsAPI.getProjects.bind(projectsAPI);
export const getProjectById = projectsAPI.getProjectById.bind(projectsAPI);
export const getProjectBySlug = projectsAPI.getProjectBySlug.bind(projectsAPI);
export const getRelatedProjects = projectsAPI.getRelatedProjects.bind(projectsAPI);
export const updateProject = projectsAPI.updateProject.bind(projectsAPI);
export const deleteProject = projectsAPI.deleteProject.bind(projectsAPI);
export const getProjectStats = projectsAPI.getProjectStats.bind(projectsAPI);
export const getPublicProjects = projectsAPI.getPublicProjects.bind(projectsAPI);
export const getPublicProjectById = projectsAPI.getPublicProjectById.bind(projectsAPI);
export const getPublicProjectBySlug = projectsAPI.getPublicProjectBySlug.bind(projectsAPI);
export const getPublicRelatedProjects = projectsAPI.getPublicRelatedProjects.bind(projectsAPI);
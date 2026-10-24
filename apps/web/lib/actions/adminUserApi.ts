
import { apiClient } from '@/lib/utils/api-client';
export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role?: string;
    roles?: string[];
    provider: string;
    isEmailVerified: boolean;
    isTwoFactorEnabled: boolean;
    createdAt: string;
    updatedAt: string;
    status?: 'ACTIVE' | 'SUSPENDED'; // Assuming status field exists or will be added
}

export interface UserQuery {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    role?: string;
}

export interface PaginatedUsers {
    data: AdminUser[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
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

const _API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class AdminUserAPI {
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

    async getUsers(query: UserQuery = {}, accessToken?: string): Promise<{ data: ApiResponse<AdminUser[]> }> {
        const params = new URLSearchParams();
        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                params.append(key, value.toString());
            }
        });

        const response = await this.fetchWithAuth(
            `/admin/users?${params.toString()}`,
            { method: 'GET' },
            accessToken
        );

        const result = await this.handleResponse<ApiResponse<AdminUser[]>>(response);
        return { data: result };
    }

    async getUser(id: string, accessToken?: string): Promise<{ data: ApiResponse<AdminUser> }> {
        const response = await this.fetchWithAuth(
            `/admin/users/${id}`,
            { method: 'GET' },
            accessToken
        );

        const result = await this.handleResponse<ApiResponse<AdminUser>>(response);
        return { data: result };
    }

    async updateUser(id: string, data: Partial<AdminUser>, accessToken?: string): Promise<{ data: ApiResponse<AdminUser> }> {
        const response = await this.fetchWithAuth(
            `/admin/users/${id}`,
            {
                method: 'PUT',
                body: JSON.stringify(data),
            },
            accessToken
        );

        const result = await this.handleResponse<ApiResponse<AdminUser>>(response);
        return { data: result };
    }

    async deleteUser(id: string, accessToken?: string): Promise<{ data: ApiResponse<any> }> {
        const response = await this.fetchWithAuth(
            `/admin/users/${id}`,
            { method: 'DELETE' },
            accessToken
        );

        const result = await this.handleResponse<ApiResponse<any>>(response);
        return { data: result };
    }

    async suspendUser(id: string, accessToken?: string): Promise<{ data: ApiResponse<any> }> {
        const response = await this.fetchWithAuth(
            `/admin/users/${id}/suspend`,
            { method: 'POST' },
            accessToken
        );

        const result = await this.handleResponse<ApiResponse<any>>(response);
        return { data: result };
    }

    async reactivateUser(id: string, accessToken?: string): Promise<{ data: ApiResponse<any> }> {
        const response = await this.fetchWithAuth(
            `/admin/users/${id}/reactivate`,
            { method: 'POST' },
            accessToken
        );

        const result = await this.handleResponse<ApiResponse<any>>(response);
        return { data: result };
    }
}

export const adminUserAPI = new AdminUserAPI();

export const getUsers = adminUserAPI.getUsers.bind(adminUserAPI);
export const getUser = adminUserAPI.getUser.bind(adminUserAPI);
export const updateUser = adminUserAPI.updateUser.bind(adminUserAPI);
export const deleteUser = adminUserAPI.deleteUser.bind(adminUserAPI);
export const suspendUser = adminUserAPI.suspendUser.bind(adminUserAPI);
export const reactivateUser = adminUserAPI.reactivateUser.bind(adminUserAPI);

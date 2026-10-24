// Contact API integration
import { apiClient } from '@/lib/utils/api-client';
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactMessageRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactMessageQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  email?: string;
}

export interface ContactMessageStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}

export interface PaginatedContactMessages {
  data: ContactMessage[];
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

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class ContactAPI {
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

  // Public endpoints (no authentication required)
  async createContactMessage(data: CreateContactMessageRequest): Promise<{ data: ApiResponse<ContactMessage> }> {
    const response = await fetch(`${API_BASE_URL}/contact-messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<ApiResponse<ContactMessage>>(response);
    return { data: result };
  }

  // Authenticated endpoints
  async getContactMessages(
    query: ContactMessageQuery = {},
    accessToken?: string
  ): Promise<{ data: ApiResponse<ContactMessage[]> }> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await this.fetchWithAuth(
      `/admin/contact-messages?${params.toString()}`,
      { method: 'GET' },
      accessToken
    );

    const result = await this.handleResponse<ApiResponse<ContactMessage[]>>(response);
    return { data: result };
  }

  async getContactMessageById(id: string, accessToken?: string): Promise<{ data: ApiResponse<ContactMessage> }> {
    const response = await this.fetchWithAuth(
      `/admin/contact-messages/${id}`,
      { method: 'GET' },
      accessToken
    );

    const result = await this.handleResponse<ApiResponse<ContactMessage>>(response);
    return { data: result };
  }

  async deleteContactMessage(id: string, accessToken?: string): Promise<{ data: ApiResponse<any> }> {
    const response = await this.fetchWithAuth(
      `/admin/contact-messages/${id}`,
      { method: 'DELETE' },
      accessToken
    );

    const result = await this.handleResponse<ApiResponse<any>>(response);
    return { data: result };
  }

  async getContactMessageStats(accessToken?: string): Promise<{ data: ApiResponse<ContactMessageStats> }> {
    const response = await this.fetchWithAuth(
      `/admin/contact-messages/stats`,
      { method: 'GET' },
      accessToken
    );

    const result = await this.handleResponse<ApiResponse<any>>(response);

    // Map backend response to frontend interface if needed, or return as is if types match
    // Backend returns: { totalMessages, messagesToday, messagesThisWeek }
    // Frontend expects: { total, today, thisWeek, thisMonth }

    if (result.success && result.data) {
      const stats: ContactMessageStats = {
        total: result.data.totalMessages,
        today: result.data.messagesToday,
        thisWeek: result.data.messagesThisWeek,
        thisMonth: 0 // Backend doesn't provide this yet
      };
      return { data: { ...result, data: stats } };
    }

    return { data: result };
  }
}

// Export singleton instance
export const contactAPI = new ContactAPI();

// Export utility functions for easier usage with proper binding
export const createContactMessage = contactAPI.createContactMessage.bind(contactAPI);
export const getContactMessages = contactAPI.getContactMessages.bind(contactAPI);
export const getContactMessageById = contactAPI.getContactMessageById.bind(contactAPI);
export const deleteContactMessage = contactAPI.deleteContactMessage.bind(contactAPI);
export const getContactMessageStats = contactAPI.getContactMessageStats.bind(contactAPI);

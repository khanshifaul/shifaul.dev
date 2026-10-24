// Newsletter API integration
export interface NewsletterSubscriber {
    id: string;
    email: string;
    subscribedAt: string;
}

export interface SubscribeNewsletterRequest {
    email: string;
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

export interface NewsletterSubscriberQuery {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    email?: string;
}

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class NewsletterAPI {
    private handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            });
        }
        return response.json();
    }

    async subscribeNewsletter(data: SubscribeNewsletterRequest): Promise<{ data: ApiResponse<NewsletterSubscriber> }> {
        const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await this.handleResponse<ApiResponse<NewsletterSubscriber>>(response);
        return { data: result };
    }

    async unsubscribeNewsletter(email: string): Promise<{ data: ApiResponse<any> }> {
        const response = await fetch(`${API_BASE_URL}/newsletter/unsubscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const result = await this.handleResponse<ApiResponse<any>>(response);
        return { data: result };
    }

    async checkSubscription(email: string): Promise<{ data: ApiResponse<{ isSubscribed: boolean }> }> {
        const response = await fetch(`${API_BASE_URL}/newsletter/check-subscription?email=${encodeURIComponent(email)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await this.handleResponse<ApiResponse<{ isSubscribed: boolean }>>(response);
        return { data: result };
    }

    async getNewsletterSubscribers(query: NewsletterSubscriberQuery = {}): Promise<{ data: ApiResponse<NewsletterSubscriber[]> }> {
        const params = new URLSearchParams();
        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });

        const response = await fetch(`${API_BASE_URL}/newsletter/subscribers?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await this.handleResponse<ApiResponse<NewsletterSubscriber[]>>(response);
        return { data: result };
    }

    async deleteNewsletterSubscriber(id: string): Promise<{ data: ApiResponse<any> }> {
        const response = await fetch(`${API_BASE_URL}/newsletter/subscribers/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await this.handleResponse<ApiResponse<any>>(response);
        return { data: result };
    }
}

// Export singleton instance
export const newsletterAPI = new NewsletterAPI();

// Export utility functions for easier usage (with proper this binding)
export const subscribeNewsletter = newsletterAPI.subscribeNewsletter.bind(newsletterAPI);
export const unsubscribeNewsletter = newsletterAPI.unsubscribeNewsletter.bind(newsletterAPI);
export const checkSubscription = newsletterAPI.checkSubscription.bind(newsletterAPI);
export const getNewsletterSubscribers = newsletterAPI.getNewsletterSubscribers.bind(newsletterAPI);
export const deleteNewsletterSubscriber = newsletterAPI.deleteNewsletterSubscriber.bind(newsletterAPI);
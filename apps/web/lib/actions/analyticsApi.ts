import { apiClient } from '@/lib/utils/api-client';

export interface VisitorStat {
    name: string;
    views: number;
    engagement: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}

class AnalyticsAPI {
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

    async getVisitorStats(timeRange: string = '7d', accessToken?: string): Promise<{ data: ApiResponse<{ stats: VisitorStat[]; avgEmqScore: string }> }> {
        const response = await this.fetchWithAuth(
            `/admin/analytics/visitor-stats?timeRange=${timeRange}`,
            { method: 'GET' },
            accessToken
        );

        const result = await this.handleResponse<ApiResponse<{ stats: VisitorStat[]; avgEmqScore: string }>>(response);
        return { data: result };
    }

    async getActiveVisitors(accessToken?: string): Promise<{ data: ApiResponse<number> }> {
        const response = await this.fetchWithAuth(
            `/admin/analytics/active-visitors`,
            { method: 'GET' },
            accessToken
        );

        const result = await this.handleResponse<ApiResponse<number>>(response);
        return { data: result };
    }
}

export const analyticsAPI = new AnalyticsAPI();
export const getVisitorStats = analyticsAPI.getVisitorStats.bind(analyticsAPI);
export const getActiveVisitors = analyticsAPI.getActiveVisitors.bind(analyticsAPI);

import { logout, setUser } from '@/lib/store/slices/authSlice';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://backend.shifaul.dev/api' : 'http://localhost:4000/api');

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}

interface LoginResponseData {
    user: any;
    accessToken: string;
    refreshToken: string;
}

// Mutex for token refreshing
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

/**
 * Add a callback to the subscriber queue.
 * Called when a request fails with 401 while a refresh is already in progress.
 */
const subscribeToRefresh = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback);
};

/**
 * Process the subscriber queue with the new token.
 */
const onRefreshed = (token: string) => {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
};

/**
 * Shared API Client to handle authentication, token refreshing, and headers centrally.
 */
export const apiClient = {
    /**
     * Fetch with automatic authorization header injection and 401 handling (token refresh).
     * @param url Endpoint URL (relative to API_BASE_URL)
     * @param options Fetch options
     * @param dispatch Redux dispatch function (required for state updates/logout)
     * @param accessToken Optional access token (if not provided, will rely on refresh logic if 401)
     */
    async fetchWithAuth(
        url: string,
        options: RequestInit = {},
        dispatch?: any,
        accessToken?: string
    ): Promise<Response> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (accessToken) {
            headers.Authorization = `Bearer ${accessToken}`;
        }

        const response = await fetch(`${API_BASE_URL}${url}`, {
            ...options,
            headers,
        });

        // If 401 Unauthorized, handle token refresh
        if (response.status === 401) {
            // Determine if we have a refresh token available
            const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');

            if (!refreshToken) {
                // No refresh token, logout immediately if dispatch is available
                if (dispatch) dispatch(logout());
                return response;
            }

            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    const rememberMe = !!localStorage.getItem('refreshToken');
                    const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh?rememberMe=${rememberMe}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${refreshToken}`,
                            'Content-Type': 'application/json'
                        },
                    });

                    if (refreshResponse.ok) {
                        const result: ApiResponse<LoginResponseData> = await refreshResponse.json();

                        if (result.success && result.data) {
                            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = result.data;

                            // Update stored tokens
                            if (rememberMe) {
                                localStorage.setItem('accessToken', newAccessToken);
                                localStorage.setItem('refreshToken', newRefreshToken);
                            } else {
                                sessionStorage.setItem('accessToken', newAccessToken);
                                sessionStorage.setItem('refreshToken', newRefreshToken);
                            }

                            // Update Redux state
                            if (dispatch) dispatch(setUser(result.data));

                            // Notify subscribers
                            onRefreshed(newAccessToken);
                            isRefreshing = false;

                            // Retry original request
                            const retryHeaders = { ...headers, Authorization: `Bearer ${newAccessToken}` };
                            return fetch(`${API_BASE_URL}${url}`, {
                                ...options,
                                headers: retryHeaders,
                            });
                        }
                    }

                    // Refresh failed or invalid response
                    throw new Error('Refresh failed');

                } catch (error) {
                    isRefreshing = false;
                    refreshSubscribers = []; // Clear queue
                    if (dispatch) dispatch(logout()); // Logout user
                    console.error('Token refresh failed:', error);
                    return response; // Return original 401
                }
            } else {
                // Refresh already in progress, queue this request
                return new Promise((resolve) => {
                    subscribeToRefresh((token: string) => {
                        const retryHeaders = { ...headers, Authorization: `Bearer ${token}` };
                        resolve(
                            fetch(`${API_BASE_URL}${url}`, {
                                ...options,
                                headers: retryHeaders,
                            })
                        );
                    });
                });
            }
        }

        return response;
    },

    /**
     * Standardized response handler
     */
    async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }).catch(() => {
                // Fallback if json parsing fails
                throw new Error(`HTTP error! status: ${response.status}`);
            });
        }
        return response.json();
    }
};

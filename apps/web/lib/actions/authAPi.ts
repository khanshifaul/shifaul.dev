import { logout, setUser } from '@/lib/store/slices/authSlice';
import { apiClient } from '@/lib/utils/api-client';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  provider: "LOCAL" | "GOOGLE" | "FACEBOOK" | "GITHUB";
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  roles: string[];
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  avatar?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface TwoFactorLoginRequest {
  email: string;
  tempToken: string;
  totpCode: string;
  rememberMe?: boolean;
}

export interface BackupCodeLoginRequest {
  backupCode: string;
  tempToken: string;
  rememberMe?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface TwoFactorVerificationRequest {
  totpCode: string;
}

export interface TwoFactorEnableRequest {
  totpCode: string;
  secret?: string;
}

export interface TwoFactorDisableRequest {
  totpCode: string;
}

export interface BackupCodeRequest {
  totpCode: string;
}

export interface ProviderUnlinkRequest {
  provider: string;
}

export interface SetPrimaryProviderRequest {
  provider: string;
}

export interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
}

// Backend API Response structure
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// Auth Response structure matching backend
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface TwoFactorSetupResponse {
  secret: string;
  qrCodeUrl: string;
  manualEntryKey: string;
  otpAuthUrl: string;
}

export interface BackupCodesResponse {
  backupCodes: string[];
}

export interface ProviderStatusResponse {
  id: string;
  provider: string;
  email: string;
  isPrimary: boolean;
  linkedAt: string;
  lastUsedAt: string;
}

export interface TwoFactorStatusResponse {
  isEnabled: boolean;
  hasSecret: boolean;
  hasBackupCodes?: boolean;
  enabledMethods?: string[];
}

export interface LoginResponseData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://backend.shifaul.dev/api' : 'http://localhost:4000/api');

class AuthAPI {
  private async fetchWithAuth(
    url: string,
    options: RequestInit = {},
    dispatch: any,
    accessToken?: string
  ): Promise<Response> {
    return apiClient.fetchWithAuth(url, options, dispatch, accessToken);
  }

  private handleResponse<T>(response: Response): Promise<T> {
    return apiClient.handleResponse<T>(response);
  }

  // Authentication endpoints
  async register(data: RegisterRequest, _dispatch: any): Promise<{ data: AuthResponse }> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<ApiResponse<LoginResponseData>>(response);

    // Handle the backend response structure
    if (result.success) {
      return { data: result.data || { user: null as any, accessToken: '', refreshToken: '' } }; // Return data to satisfy existing return type, but don't login
    }

    throw new Error(result.message || 'Registration failed');
  }

  async verifyEmail(token: string, _dispatch: any): Promise<{ data: any }> {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`, {
      method: 'GET',
    });

    const result = await this.handleResponse<ApiResponse<any>>(response);
    return { data: result.data };
  }

  async login(credentials: LoginRequest, dispatch: any): Promise<{ data: AuthResponse }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const result = await this.handleResponse<ApiResponse<LoginResponseData>>(response);

    // Handle the backend response structure
    if (result.success && result.data) {
      const authData = result.data;

      // Store tokens
      if (credentials.rememberMe) {
        localStorage.setItem('accessToken', authData.accessToken);
        localStorage.setItem('refreshToken', authData.refreshToken);
      } else {
        sessionStorage.setItem('accessToken', authData.accessToken);
        sessionStorage.setItem('refreshToken', authData.refreshToken);
      }

      dispatch(setUser(authData));

      return { data: authData };
    }

    throw new Error(result.message || 'Login failed');
  }

  async loginWithTwoFactor(requestData: TwoFactorLoginRequest, dispatch: any): Promise<{ data: AuthResponse }> {
    const response = await fetch(`${API_BASE_URL}/auth/2fa/login/totp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    });

    const result = await this.handleResponse<ApiResponse<LoginResponseData>>(response);

    if (result.success && result.data) {
      const authData = result.data;

      localStorage.setItem('accessToken', authData.accessToken);
      localStorage.setItem('refreshToken', authData.refreshToken);

      dispatch(setUser(authData));

      return { data: authData };
    }

    throw new Error(result.message || 'Two-factor authentication failed');
  }

  async loginWithBackupCode(requestData: BackupCodeLoginRequest, dispatch: any): Promise<{ data: AuthResponse }> {
    const response = await fetch(`${API_BASE_URL}/auth/2fa/login/backup-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    });

    const result = await this.handleResponse<ApiResponse<LoginResponseData>>(response);

    if (result.success && result.data) {
      const authData = result.data;

      localStorage.setItem('accessToken', authData.accessToken);
      localStorage.setItem('refreshToken', authData.refreshToken);

      dispatch(setUser(authData));

      return { data: authData };
    }

    throw new Error(result.message || 'Backup code authentication failed');
  }

  async logout(dispatch: any): Promise<{ data: any }> {
    const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

    try {
      const response = await this.fetchWithAuth(
        '/auth/logout',
        { method: 'POST' },
        dispatch,
        accessToken || undefined
      );

      const result = await this.handleResponse<ApiResponse<any>>(response);

      // Clear auth state regardless of API response
      dispatch(logout());

      return { data: result.data };
    } catch (error) {
      // Even if API call fails, clear local state
      dispatch(logout());
      throw error;
    }
  }

  async changePassword(passwordData: ChangePasswordRequest, dispatch: any): Promise<{ data: any }> {
    const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

    const response = await this.fetchWithAuth(
      '/auth/change-password',
      {
        method: 'POST',
        body: JSON.stringify(passwordData),
      },
      dispatch,
      accessToken || undefined
    );

    const result = await this.handleResponse<ApiResponse<any>>(response);
    return { data: result.data };
  }

  async refreshToken(refreshToken: string, dispatch: any): Promise<{ data: AuthResponse }> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh?rememberMe=${!!localStorage.getItem('refreshToken')}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${refreshToken}`, 'Content-Type': 'application/json' },
    });

    const result = await this.handleResponse<ApiResponse<LoginResponseData>>(response);

    if (result.success && result.data) {
      const authData = result.data;

      // Update stored tokens
      const rememberMe = !!localStorage.getItem('refreshToken');
      if (rememberMe) {
        localStorage.setItem('accessToken', authData.accessToken);
        localStorage.setItem('refreshToken', authData.refreshToken);
      } else {
        sessionStorage.setItem('accessToken', authData.accessToken);
        sessionStorage.setItem('refreshToken', authData.refreshToken);
      }

      dispatch(setUser(authData));

      return { data: authData };
    }

    throw new Error(result.message || 'Token refresh failed');
  }

  async forgotPassword(email: ForgotPasswordRequest, _dispatch: any): Promise<{ data: any }> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(email),
    });

    const result = await this.handleResponse<ApiResponse<any>>(response);
    return { data: result.data };
  }

  async resetPassword(data: ResetPasswordRequest, _dispatch: any): Promise<{ data: any }> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<ApiResponse<any>>(response);
    return { data: result.data };
  }

  async verifyNewUser(token: string, _dispatch: any): Promise<{ data: any }> {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await this.handleResponse<ApiResponse<any>>(response);
    return { data: result.data };
  }

  async resendVerificationEmail(email: string, _dispatch: any): Promise<{ data: any }> {
    const response = await fetch(`${API_BASE_URL}/auth/resend-verification-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const result = await this.handleResponse<ApiResponse<any>>(response);
    return { data: result.data };
  }

  async verifyForgotPasswordOtp(data: any, _dispatch: any): Promise<{ data: any }> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: data.otp,
        password: data.newPassword,
      }),
    });

    const result = await this.handleResponse<ApiResponse<any>>(response);
    return { data: result.data };
  }

  // Two-factor authentication endpoints
  async generateTwoFactorSecret(dispatch: any): Promise<{ data: TwoFactorSetupResponse }> {
    const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

    const response = await this.fetchWithAuth(
      '/auth/2fa/generate',
      { method: 'GET' },
      dispatch,
      accessToken || undefined
    );

    const result = await this.handleResponse<ApiResponse<TwoFactorSetupResponse>>(response);
    return { data: result.data! };
  }

  async verifyTwoFactor(data: TwoFactorVerificationRequest, dispatch: any): Promise<{ data: any }> {
    const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

    const response = await this.fetchWithAuth(
      '/auth/2fa/verify',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      dispatch,
      accessToken || undefined
    );

    const result = await this.handleResponse<ApiResponse<any>>(response);
    return { data: result.data };
  }

  async enableTwoFactor(data: TwoFactorEnableRequest, dispatch: any): Promise<{ data: any }> {
    const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

    const response = await this.fetchWithAuth(
      '/auth/2fa/enable',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      dispatch,
      accessToken || undefined
    );

    const result = await this.handleResponse<ApiResponse<any>>(response);
    return { data: result.data };
  }

  async disableTwoFactor(data: TwoFactorDisableRequest, dispatch: any): Promise<{ data: any }> {
    const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

    const response = await this.fetchWithAuth(
      '/auth/2fa/disable',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      dispatch,
      accessToken || undefined
    );

    const result = await this.handleResponse<ApiResponse<any>>(response);
    return { data: result.data };
  }

  async getTwoFactorStatus(dispatch: any): Promise<{ data: TwoFactorStatusResponse }> {
    const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

    const response = await this.fetchWithAuth(
      '/auth/2fa/status',
      { method: 'GET' },
      dispatch,
      accessToken || undefined
    );

    const result = await this.handleResponse<ApiResponse<TwoFactorStatusResponse>>(response);
    return { data: result.data! };
  }

  // Backup codes endpoints
  async generateBackupCodes(data: BackupCodeRequest, dispatch: any): Promise<{ data: BackupCodesResponse }> {
    const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

    const response = await this.fetchWithAuth(
      '/auth/2fa/generate-backup-codes',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      dispatch,
      accessToken || undefined
    );

    const result = await this.handleResponse<ApiResponse<BackupCodesResponse>>(response);
    return { data: result.data! };
  }

  async regenerateBackupCodes(data: BackupCodeRequest, dispatch: any): Promise<{ data: BackupCodesResponse }> {
    const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

    const response = await this.fetchWithAuth(
      '/auth/2fa/regenerate-backup-codes',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      dispatch,
      accessToken || undefined
    );

    const result = await this.handleResponse<ApiResponse<BackupCodesResponse>>(response);
    return { data: result.data! };
  }

  async getBackupCodesStatus(dispatch: any): Promise<{ data: any }> {
    const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

    const response = await this.fetchWithAuth(
      '/auth/2fa/backup-codes/status',
      { method: 'GET' },
      dispatch,
      accessToken || undefined
    );

    const result = await this.handleResponse<ApiResponse<any>>(response);
    return { data: result.data };
  }

  // Provider management endpoints
  async getUserProviders(dispatch: any): Promise<{ data: ProviderStatusResponse[] }> {
    const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

    const response = await this.fetchWithAuth(
      '/auth/providers',
      { method: 'GET' },
      dispatch,
      accessToken || undefined
    );

    const result = await this.handleResponse<ApiResponse<ProviderStatusResponse[]>>(response);
    return { data: result.data! };
  }

  async unlinkProvider(provider: ProviderUnlinkRequest, dispatch: any): Promise<{ data: any }> {
    const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

    const response = await this.fetchWithAuth(
      '/auth/providers/unlink',
      {
        method: 'POST',
        body: JSON.stringify(provider),
      },
      dispatch,
      accessToken || undefined
    );

    const result = await this.handleResponse<ApiResponse<any>>(response);
    return { data: result.data };
  }

  async setPrimaryProvider(provider: SetPrimaryProviderRequest, dispatch: any): Promise<{ data: any }> {
    const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

    const response = await this.fetchWithAuth(
      '/auth/providers/set-primary',
      {
        method: 'POST',
        body: JSON.stringify(provider),
      },
      dispatch,
      accessToken || undefined
    );

    const result = await this.handleResponse<ApiResponse<any>>(response);
    return { data: result.data };
  }

  // OAuth authentication methods
  initiateGoogleAuth(): void {
    window.location.href = `${API_BASE_URL}/auth/google`;
  }

  initiateGitHubAuth(): void {
    window.location.href = `${API_BASE_URL}/auth/github`;
  }

  initiateFacebookAuth(): void {
    window.location.href = `${API_BASE_URL}/auth/facebook`;
  }

  async handleOAuthCallback(searchParams: URLSearchParams, dispatch: any): Promise<{ data: AuthResponse }> {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const user = searchParams.get('user');

    if (error) {
      throw new Error(decodeURIComponent(searchParams.get('message') || 'OAuth authentication failed'));
    }

    if (!success || !accessToken || !refreshToken || !user) {
      throw new Error('Invalid OAuth callback parameters');
    }

    // Parse user data
    let userData;
    try {
      userData = JSON.parse(decodeURIComponent(user));
    } catch {
      throw new Error('Invalid user data in OAuth callback');
    }

    const authData: AuthResponse = {
      user: userData,
      accessToken,
      refreshToken,
    };

    // Store tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    // Update auth state
    dispatch(setUser(authData));

    return { data: authData };
  }

  async updateProfile(data: UpdateProfileRequest, dispatch: any): Promise<{ data: AuthResponse }> {
    const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

    const response = await this.fetchWithAuth(
      '/auth/profile',
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      dispatch,
      accessToken || undefined
    );

    const result = await this.handleResponse<ApiResponse<LoginResponseData>>(response);

    if (result.success && result.data) {
      const authData = result.data;
      // Update stored user data in Redux
      dispatch(setUser(authData));
      return { data: authData };
    }

    throw new Error(result.message || 'Profile update failed');
  }
}

// Export singleton instance
export const authAPI = new AuthAPI();

// Auth functions
export const register = authAPI.register.bind(authAPI);
export const verifyEmail = authAPI.verifyEmail.bind(authAPI);
export const login = authAPI.login.bind(authAPI);
export const loginWithTwoFactor = authAPI.loginWithTwoFactor.bind(authAPI);
export const loginWithBackupCode = authAPI.loginWithBackupCode.bind(authAPI);
export const changePassword = authAPI.changePassword.bind(authAPI);
export const refreshToken = authAPI.refreshToken.bind(authAPI);
export const forgotPassword = authAPI.forgotPassword.bind(authAPI);
export const resetPassword = authAPI.resetPassword.bind(authAPI);
export const verifyNewUser = authAPI.verifyNewUser.bind(authAPI);
export const resendVerificationEmail = authAPI.resendVerificationEmail.bind(authAPI);
export const verifyForgotPasswordOtp = authAPI.verifyForgotPasswordOtp.bind(authAPI);
export const generateTwoFactorSecret = authAPI.generateTwoFactorSecret.bind(authAPI);
export const verifyTwoFactor = authAPI.verifyTwoFactor.bind(authAPI);
export const enableTwoFactor = authAPI.enableTwoFactor.bind(authAPI);
export const disableTwoFactor = authAPI.disableTwoFactor.bind(authAPI);
export const getTwoFactorStatus = authAPI.getTwoFactorStatus.bind(authAPI);
export const generateBackupCodes = authAPI.generateBackupCodes.bind(authAPI);
export const regenerateBackupCodes = authAPI.regenerateBackupCodes.bind(authAPI);
export const getBackupCodesStatus = authAPI.getBackupCodesStatus.bind(authAPI);
export const getUserProviders = authAPI.getUserProviders.bind(authAPI);
export const unlinkProvider = authAPI.unlinkProvider.bind(authAPI);
export const setPrimaryProvider = authAPI.setPrimaryProvider.bind(authAPI);
export const updateProfile = authAPI.updateProfile.bind(authAPI);


// OAuth authentication functions
export const initiateGoogleAuth = authAPI.initiateGoogleAuth.bind(authAPI);
export const initiateGitHubAuth = authAPI.initiateGitHubAuth.bind(authAPI);
export const initiateFacebookAuth = authAPI.initiateFacebookAuth.bind(authAPI);
export const handleOAuthCallback = authAPI.handleOAuthCallback.bind(authAPI);
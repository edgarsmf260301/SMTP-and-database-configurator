export interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  data?: T;
  message?: string;
}

export interface UsersApiResponse extends ApiResponse {
  users?: any[];
}

export interface UserApiResponse extends ApiResponse {
  user?: any;
  emailChanged?: boolean;
  statusChanged?: boolean;
}

export interface VerificationApiResponse extends ApiResponse {
  code?: string;
  hashedToken?: string;
}

export interface SetupApiResponse extends ApiResponse {
  mongodb?: string;
  smtp?: {
    email: string;
    password: string;
  };
  adminExists?: boolean;
  systemConfigured?: boolean;
}

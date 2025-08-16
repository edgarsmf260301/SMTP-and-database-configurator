export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  roles: string[];
  isActive: boolean;
  emailVerified: boolean;
}

export interface LoginCredentials {
  name: string;
  password: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: (reason?: string) => void;
  softLogout: (reason?: string) => void;
}

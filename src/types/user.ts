export interface User {
  _id: string;
  name: string;
  email: string;
  username?: string;
  roles: string[];
  isActive: boolean;
  emailVerified: boolean;
  verificationToken?: string;
  tokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  resetPasswordAttempts: number;
  lastResetPasswordAttempt?: Date;
  statusChangedAt?: Date;
  statusChangedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserFormData {
  name: string;
  email: string;
  roles: string[];
  isActive: boolean;
  emailVerified: boolean;
  password?: string;
  confirmPassword?: string;
  verificationCode?: string;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  roles?: string[];
  isActive?: boolean;
}

export type UserRole =
  | 'admin'
  | 'director'
  | 'manager'
  | 'staff'
  | 'box'
  | 'kitchen'
  | 'administration'
  | 'Waiter';

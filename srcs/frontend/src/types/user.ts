export type UserRole = 'ADMIN' | 'USER';

export interface AdminUser {
  id: string | number;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  date_joined?: string;
  avatar?: string;
}

export interface InviteUserData {
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  password?: string;
}

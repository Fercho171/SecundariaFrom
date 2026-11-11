export type UserRole = 'TEACHER' | 'ADMIN' | 'COORDINATOR';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  teacherId?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

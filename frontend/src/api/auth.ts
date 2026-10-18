import { apiClient } from './client'
import type { RegisterRequest, LoginRequest, AuthResponse } from '../types/auth'

export const authApi = {
  register: (data: RegisterRequest) => apiClient.post<AuthResponse>('/api/auth/register', data),
  login: (data: LoginRequest) => apiClient.post<AuthResponse>('/api/auth/login', data),
}

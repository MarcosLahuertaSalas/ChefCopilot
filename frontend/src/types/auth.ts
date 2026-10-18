export interface User {
  userId: string
  email: string
  fullName: string
  restaurantName: string
  role: string
  createdAt: string
}

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
  restaurantName?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  userId: string
  email: string
  fullName: string
  restaurantName: string
  role: string
  createdAt: string
  message: string
}

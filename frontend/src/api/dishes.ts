import { apiClient } from './client'
import type { Dish, CreateDishRequest, UpdateDishRequest } from '../types/dish'

export const dishesApi = {
  getAll: () => apiClient.get<Dish[]>('/api/dishes'),
  create: (data: CreateDishRequest) => apiClient.post<string>('/api/dishes', data),
  update: (id: string, data: UpdateDishRequest) => apiClient.put<void>(`/api/dishes/${id}`, data),
  delete: (id: string) => apiClient.delete<void>(`/api/dishes/${id}`),
}

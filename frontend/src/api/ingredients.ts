import { apiClient } from './client'
import type { Ingredient, CreateIngredientRequest, UpdateIngredientRequest } from '../types/ingredient'

export const ingredientsApi = {
  getAll: () => apiClient.get<Ingredient[]>('/api/ingredients'),
  create: (data: CreateIngredientRequest) => apiClient.post<string>('/api/ingredients', data),
  update: (id: string, data: UpdateIngredientRequest) => apiClient.put<void>(`/api/ingredients/${id}`, data),
  delete: (id: string) => apiClient.delete<void>(`/api/ingredients/${id}`),
}

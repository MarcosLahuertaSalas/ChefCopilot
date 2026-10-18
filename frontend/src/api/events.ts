import { apiClient } from './client'
import type { Event, CreateEventRequest, UpdateEventRequest, EventShoppingList } from '../types/event'

export const eventsApi = {
  getAll: () => apiClient.get<Event[]>('/api/events'),
  getById: (id: string) => apiClient.get<Event>(`/api/events/${id}`),
  create: (data: CreateEventRequest) => apiClient.post<string>('/api/events', data),
  update: (id: string, data: UpdateEventRequest) => apiClient.put<void>(`/api/events/${id}`, data),
  delete: (id: string) => apiClient.delete<void>(`/api/events/${id}`),
  getShoppingList: (id: string) => apiClient.get<EventShoppingList>(`/api/events/${id}/shopping-list`),
}

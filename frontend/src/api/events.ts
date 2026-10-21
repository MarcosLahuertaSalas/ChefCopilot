import { apiClient } from './client'
import type { 
  Event, 
  CreateEventRequest, 
  UpdateEventRequest, 
  EventShoppingList,
  EventPostMortemReport,
  CloseEventRequest
} from '../types/event'

export const eventsApi = {
  getAll: () => apiClient.get<Event[]>('/api/events'),
  getById: (id: string) => apiClient.get<Event>(`/api/events/${id}`),
  create: (data: CreateEventRequest) => apiClient.post<string>('/api/events', data),
  update: (id: string, data: UpdateEventRequest) => apiClient.put<void>(`/api/events/${id}`, data),
  delete: (id: string) => apiClient.delete<void>(`/api/events/${id}`),
  getShoppingList: (id: string) => apiClient.get<EventShoppingList>(`/api/events/${id}/shopping-list`),
  getPostMortem: (id: string) => apiClient.get<EventPostMortemReport>(`/api/events/${id}/post-mortem`),
  closeEvent: (id: string, data: CloseEventRequest) => apiClient.post<void>(`/api/events/${id}/close`, data),
  reopenEvent: (id: string) => apiClient.post<void>(`/api/events/${id}/reopen`, {}),
}

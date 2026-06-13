import api from '@/lib/axios';
import { User } from '@/types';

export const authService = {
  syncUser: (role?: string) => api.post<User>('/auth/sync', role ? { role } : {}),
  getMe: () => api.get<User>('/auth/me'),
  switchRole: () => api.patch<User>('/users/me/switch-role'),
};

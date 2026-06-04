import api from '@/lib/axios';
import { User } from '@/types';

export const authService = {
  syncUser: () => api.post<User>('/auth/sync'),
  getMe: () => api.get<User>('/auth/me'),
};
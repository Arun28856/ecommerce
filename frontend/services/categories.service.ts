import api from '@/lib/axios';
import { Category } from '@/types';

export const categoriesService = {
  getAll: () => api.get<Category[]>('/categories'),
  getOne: (slug: string) => api.get<Category>(`/categories/${slug}`),
  create: (data: Partial<Category>) => api.post<Category>('/categories', data),
  update: (slug: string, data: Partial<Category>) =>
    api.put<Category>(`/categories/${slug}`, data),
  remove: (slug: string) => api.delete(`/categories/${slug}`),
};
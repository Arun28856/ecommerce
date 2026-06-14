import api from '@/lib/axios';
import { Product, PaginatedProducts } from '@/types';

export interface ProductQuery {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export const productsService = {
  getAll: (query?: ProductQuery) =>
    api.get<PaginatedProducts>('/products', { params: query }),

  getOne: (slug: string) =>
    api.get<Product>(`/products/${slug}`),

  getMySells: () =>
    api.get<Product[]>('/products/seller/my-products'),

  create: (data: FormData) =>
    api.post<Product>('/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (slug: string, data: FormData) =>
    api.put<Product>(`/products/${slug}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  remove: (slug: string) =>
    api.delete(`/products/${slug}`),
};
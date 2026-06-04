import api from '@/lib/axios';
import { Order, OrderStatus } from '@/types';

export const ordersService = {
  getMyOrders: () =>
    api.get<Order[]>('/orders/my-orders'),

  getOne: (id: string) =>
    api.get<Order>(`/orders/my-orders/${id}`),

  cancel: (id: string) =>
    api.patch<Order>(`/orders/my-orders/${id}/cancel`),

  getSellerOrders: () =>
    api.get<Order[]>('/orders/seller/my-sales'),

  updateStatus: (id: string, status: OrderStatus) =>
    api.patch(`/orders/seller/${id}/status`, { status }),
};
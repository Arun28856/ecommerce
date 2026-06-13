import api from '@/lib/axios';
import { Payment, PaymentMethod } from '@/types';

export const paymentService = {
  create: (orderId: string, method: PaymentMethod) =>
    api.post('/payments/create', { orderId, method }),

  verify: (data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    orderId: string;
  }) => api.post('/payments/verify', data),

  getByOrder: (orderId: string) =>
    api.get<Payment>(`/payments/order/${orderId}`),

  getEarnings: () =>
    api.get('/earnings'),

  getEarningsSummary: () =>
    api.get('/earnings/summary'),
};
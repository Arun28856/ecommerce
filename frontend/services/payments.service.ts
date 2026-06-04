import api from '@/lib/axios';
import { Payment, PaymentMethod } from '@/types';

export const paymentService = {
  create: (orderId: string, method: PaymentMethod) =>
    api.post('/payment/create', { orderId, method }),

  verify: (data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    orderId: string;
  }) => api.post('/payment/verify', data),

  getByOrder: (orderId: string) =>
    api.get<Payment>(`/payment/order/${orderId}`),

  getEarnings: () =>
    api.get('/payment/earnings'),

  getEarningsSummary: () =>
    api.get('/payment/earnings/summary'),
};
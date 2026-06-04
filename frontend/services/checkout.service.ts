import api from '@/lib/axios';
import { PaymentMethod, ShippingAddress } from '@/types';

export interface CartItemPayload {
  productSlug: string;
  quantity: number;
}

export const checkoutService = {
  validate: (items: CartItemPayload[]) =>
    api.post('/checkout/validate', { items }),

  getSummary: (items: CartItemPayload[]) =>
    api.post('/checkout/summary', { items }),

  checkout: (data: {
    items: CartItemPayload[];
    shippingAddress: ShippingAddress;
    paymentMethod: PaymentMethod;
  }) => api.post('/checkout', data),
};
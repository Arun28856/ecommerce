'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCartStore } from '@/store/cart.store';
import { checkoutService } from '@/services/checkout.service';
import { paymentService } from '@/services/payments.service';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { PaymentMethod } from '@/types';

const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Valid phone number required').max(15),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(4, 'Postal code is required'),
});

type AddressForm = z.infer<typeof addressSchema>;

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'cod', label: 'Cash on Delivery', icon: '💵' },
  { value: 'upi', label: 'UPI', icon: '📱' },
  { value: 'card', label: 'Credit / Debit Card', icon: '💳' },
  { value: 'netbanking', label: 'Net Banking', icon: '🏦' },
  { value: 'wallet', label: 'Wallet', icon: '👛' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, totalAmount } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [summary, setSummary] = useState<{
    subtotal: number;
    deliveryCharge: number;
    platformFee: number;
    totalAmount: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [razorpayReady, setRazorpayReady] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressForm>({ resolver: zodResolver(addressSchema) });

  useEffect(() => {
    if (items.length === 0) {
      router.replace('/buyer/cart');
      return;
    }
    const payload = items.map((i) => ({ productSlug: i.product.slug, quantity: i.quantity }));
    checkoutService.getSummary(payload)
      .then((r) => setSummary(r.data))
      .catch(() => {});
  }, [items, router]);

  const onSubmit = async (address: AddressForm) => {
    setError('');
    setLoading(true);
    try {
      const payload = {
        items: items.map((i) => ({ productSlug: i.product.slug, quantity: i.quantity })),
        shippingAddress: address,
        paymentMethod,
      };

      const res = await checkoutService.checkout(payload);
      const { order, payment, isCOD } = res.data;

      if (isCOD) {
        clearCart();
        router.push(`/buyer/orders/${order._id}?success=1`);
        return;
      }

      // Razorpay flow
      const RazorpayConstructor = (window as any).Razorpay;
      if (!RazorpayConstructor) {
        setError('Payment gateway not ready. Please select Cash on Delivery or refresh the page.');
        return;
      }
      const rzp = new RazorpayConstructor({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: payment.amount * 100,
        currency: 'INR',
        name: 'ShopHub',
        order_id: payment.razorpayOrderId,
        handler: async (response: any) => {
          try {
            await paymentService.verify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: order._id,
            });
            clearCart();
            router.push(`/buyer/orders/${order._id}?success=1`);
          } catch {
            setError('Payment verification failed. Contact support.');
          }
        },
        prefill: { contact: address.phone },
        theme: { color: '#2563EB' },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });
      rzp.open();
    } catch (err: any) {
      setError(err?.message ?? 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setRazorpayReady(true)}
      />
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Address + Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input label="Full Name" placeholder="John Doe" error={errors.fullName?.message} {...register('fullName')} />
                </div>
                <div className="sm:col-span-2">
                  <Input label="Phone Number" type="tel" placeholder="9876543210" error={errors.phone?.message} {...register('phone')} />
                </div>
                <div className="sm:col-span-2">
                  <Input label="Address" placeholder="House No, Street, Area" error={errors.address?.message} {...register('address')} />
                </div>
                <Input label="City" placeholder="Mumbai" error={errors.city?.message} {...register('city')} />
                <Input label="State" placeholder="Maharashtra" error={errors.state?.message} {...register('state')} />
                <Input label="Postal Code" placeholder="400001" error={errors.postalCode?.message} {...register('postalCode')} />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((pm) => (
                  <label
                    key={pm.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      paymentMethod === pm.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={pm.value}
                      checked={paymentMethod === pm.value}
                      onChange={() => setPaymentMethod(pm.value)}
                      className="accent-blue-600"
                    />
                    <span className="text-lg">{pm.icon}</span>
                    <span className="text-sm font-medium text-gray-800">{pm.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                {items.map(({ product, quantity }) => (
                  <div key={product._id} className="flex justify-between text-sm text-gray-600">
                    <span className="line-clamp-1 flex-1 mr-2">{product.name} × {quantity}</span>
                    <span className="flex-shrink-0">₹{(product.price * quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {summary && (
                <div className="space-y-2 text-sm border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{summary.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className={summary.deliveryCharge === 0 ? 'text-green-600' : ''}>
                      {summary.deliveryCharge === 0 ? 'Free' : `₹${summary.deliveryCharge}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-200 pt-2">
                    <span>Total</span>
                    <span>₹{summary.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                fullWidth
                loading={isSubmitting || loading}
                disabled={paymentMethod !== 'cod' && !razorpayReady}
                className="mt-4"
              >
                {paymentMethod === 'cod'
                  ? 'Place Order (COD)'
                  : razorpayReady
                  ? 'Pay Now'
                  : 'Loading payment...'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
    </>
  );
}

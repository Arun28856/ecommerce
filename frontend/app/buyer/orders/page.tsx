'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ordersService } from '@/services/orders.service';
import { useToastStore } from '@/store/toast.store';
import { Order, OrderStatus } from '@/types';

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
};

const STATUS_BORDER: Record<OrderStatus, string> = {
  pending: 'border-l-yellow-400',
  confirmed: 'border-l-blue-400',
  shipped: 'border-l-purple-400',
  delivered: 'border-l-green-400',
  cancelled: 'border-l-red-400',
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const showToast = useToastStore((s) => s.show);

  useEffect(() => {
    ordersService.getMyOrders()
      .then((r) => setOrders(r.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (e: React.MouseEvent, orderId: string) => {
    e.preventDefault();
    if (!confirm('Cancel this order?')) return;
    setCancellingId(orderId);
    try {
      const res = await ordersService.cancel(orderId);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? res.data : o)));
      showToast('Order cancelled successfully');
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? 'Failed to cancel order', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
            <div className="flex justify-between mb-3">
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-5 bg-gray-200 rounded w-20" />
            </div>
            <div className="h-3 bg-gray-200 rounded w-48 mb-4" />
            <div className="flex gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-lg" />
              <div className="w-12 h-12 bg-gray-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-24">
        <svg className="w-14 h-14 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
        <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
        <Link
          href="/buyer/products"
          className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className={`bg-white rounded-xl border border-l-4 border-gray-200 p-5 hover:shadow-md transition-shadow ${STATUS_BORDER[order.status]}`}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="text-xs text-gray-500 font-mono">#{order._id.slice(-8).toUpperCase()}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[order.status]}`}>
                {order.status}
              </span>
            </div>

            <div className="flex gap-2 mb-3">
              {order.orderItems.slice(0, 3).map((item, i) => (
                <div key={i} className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">?</div>
                  )}
                </div>
              ))}
              {order.orderItems.length > 3 && (
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500 font-medium">
                  +{order.orderItems.length - 3}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''}
              </p>
              <p className="font-semibold text-gray-900">₹{order.totalPrice.toLocaleString()}</p>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
              <Link
                href={`/buyer/orders/${order._id}`}
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                View Details →
              </Link>
              {order.status === 'pending' && (
                <button
                  onClick={(e) => handleCancel(e, order._id)}
                  disabled={cancellingId === order._id}
                  className="text-sm text-red-500 hover:text-red-700 font-medium border border-red-200 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
                >
                  {cancellingId === order._id ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

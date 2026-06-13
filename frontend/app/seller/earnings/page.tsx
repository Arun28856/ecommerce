'use client';

import { useState, useEffect } from 'react';
import { paymentService } from '@/services/payments.service';
import { SellerEarning } from '@/types';

interface EarningsSummary {
  totalNet: number;
  pending: number;
  available: number;
  paidOut: number;
}

function SummaryCard({ label, amount, color }: { label: string; amount: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>₹{amount.toLocaleString()}</p>
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  available: 'bg-green-100 text-green-700',
  paid_out: 'bg-blue-100 text-blue-700',
};

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<SellerEarning[]>([]);
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      paymentService.getEarnings().then((r) => setEarnings(r.data)),
      paymentService.getEarningsSummary().then((r) => setSummary(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
        <p className="text-sm text-gray-500 mt-1">Track your revenue and payouts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          label="Total Net Earnings"
          amount={loading ? 0 : (summary?.totalNet ?? 0)}
          color="text-gray-900"
        />
        <SummaryCard
          label="Pending"
          amount={loading ? 0 : (summary?.pending ?? 0)}
          color="text-yellow-600"
        />
        <SummaryCard
          label="Available"
          amount={loading ? 0 : (summary?.available ?? 0)}
          color="text-green-600"
        />
        <SummaryCard
          label="Paid Out"
          amount={loading ? 0 : (summary?.paidOut ?? 0)}
          color="text-blue-600"
        />
      </div>

      {/* Earnings Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Earnings History</h2>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : earnings.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <svg className="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">No earnings yet</p>
            <p className="text-sm mt-1">Earnings appear when buyers place orders</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Order</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600 hidden sm:table-cell">Date</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-600">Gross</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-600 hidden md:table-cell">Platform Fee</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-600">Net</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {earnings.map((e) => (
                  <tr key={e._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-gray-600">
                      #{typeof e.order === 'object' ? e.order._id.slice(-6).toUpperCase() : e.order.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-5 py-3 text-gray-500 hidden sm:table-cell text-xs">
                      {new Date(e.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-900">₹{e.grossAmount.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right text-red-500 hidden md:table-cell">
                      −₹{e.platformFeeAmount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-900">₹{e.netAmount.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[e.status] || 'bg-gray-100 text-gray-500'}`}>
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <p className="text-sm text-blue-700">
          <span className="font-medium">How earnings work:</span> Earnings become available after the order is marked as delivered. Platform fee (2%) is deducted from gross sales.
        </p>
      </div>
    </div>
  );
}

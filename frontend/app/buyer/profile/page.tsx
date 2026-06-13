'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';

export default function ProfilePage() {
  const { user, logout, switchRole } = useAuth();
  const router = useRouter();
  const [switching, setSwitching] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const handleSwitchRole = async () => {
    if (!confirm('Switch to Seller account? You will be redirected to the seller dashboard.')) return;
    setSwitching(true);
    try {
      await switchRole();
      router.push('/seller/dashboard');
    } catch (err: any) {
      alert(err?.message ?? 'Failed to switch role');
    } finally {
      setSwitching(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold flex-shrink-0">
            {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">{user.name || 'User'}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 capitalize">
              {user.role}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</label>
            <p className="mt-1 text-sm text-gray-900">{user.name || '—'}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
            <p className="mt-1 text-sm text-gray-900">{user.email}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Account Role</label>
            <p className="mt-1 text-sm text-gray-900 capitalize">{user.role}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Member Since</label>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(user.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Switch to Seller */}
      <div className="mt-4 bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-50 rounded-lg text-purple-600 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Become a Seller</p>
            <p className="text-sm text-gray-500 mt-0.5">Switch to seller mode to list products and manage orders</p>
            <Button
              variant="outline"
              loading={switching}
              onClick={handleSwitchRole}
              className="mt-3"
            >
              Switch to Seller Account
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Button variant="danger" fullWidth onClick={handleLogout}>
          Sign Out
        </Button>
      </div>
    </div>
  );
}

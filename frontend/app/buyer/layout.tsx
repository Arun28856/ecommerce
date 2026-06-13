'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore } from '@/store/cart.store';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

function BuyerNav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const totalItems = useCartStore((s) => s.totalItems());
  const [searchInput, setSearchInput] = useState('');

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/buyer/products?search=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-blue-600 shadow-md">
      {/* Main bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4 h-16">
        {/* Logo */}
        <Link href="/buyer/products" className="flex-shrink-0">
          <span className="text-xl font-extrabold text-white tracking-tight">ShopHub</span>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-2 hidden sm:flex">
          <div className="flex w-full rounded-lg overflow-hidden shadow-sm">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search for products, brands and more"
              className="flex-1 px-4 py-2.5 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 transition-colors text-white"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-1 ml-auto">
          {/* My Orders */}
          <Link
            href="/buyer/orders"
            className="hidden sm:flex flex-col items-center px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-white"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-xs mt-0.5">Orders</span>
          </Link>

          {/* Profile */}
          <Link
            href="/buyer/profile"
            className="hidden sm:flex flex-col items-center px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-white"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs mt-0.5 max-w-[64px] truncate">{user?.name?.split(' ')[0] || 'Profile'}</span>
          </Link>

          {/* Cart */}
          <Link
            href="/buyer/cart"
            className="flex flex-col items-center px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-white relative"
          >
            <div className="relative">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </div>
            <span className="text-xs mt-0.5">Cart</span>
          </Link>

          {/* Logout (desktop) */}
          <button
            onClick={handleLogout}
            className="hidden sm:flex flex-col items-center px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-white"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-xs mt-0.5">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="sm:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="flex rounded-lg overflow-hidden shadow-sm">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products..."
            className="flex-1 px-3 py-2 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none"
          />
          <button type="submit" className="px-4 bg-orange-500 text-white">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>

      {/* Mobile bottom nav links */}
      <div className="sm:hidden bg-white border-t border-gray-100 flex">
        {[
          { href: '/buyer/products', label: 'Shop' },
          { href: '/buyer/orders', label: 'Orders' },
          { href: '/buyer/profile', label: 'Profile' },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex-1 text-center py-2 text-xs font-medium transition-colors ${
              pathname.startsWith(link.href)
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
          >
            {link.label}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex-1 text-center py-2 text-xs font-medium text-red-500"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="buyer">
      <div className="min-h-screen bg-gray-50">
        <BuyerNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}

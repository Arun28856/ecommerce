'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  children: React.ReactNode;
  requiredRole?: 'buyer' | 'seller';
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Not logged in → go to login
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Wrong role → redirect to their correct home
      if (requiredRole && user.role !== requiredRole) {
        router.push(user.role === 'seller' ? '/seller/dashboard' : '/buyer/products');
        return;
      }
    }
  }, [user, loading, requiredRole, router]);

  // Show nothing while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) return null;

  if (requiredRole && user.role !== requiredRole) return null;

  return <>{children}</>;
}
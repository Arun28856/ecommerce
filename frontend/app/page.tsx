'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-8">
      {user ? (
        <div>
          <p>Welcome {user.name}!</p>
          <p>Role: {user.role}</p>
          <p>Email: {user.email}</p>
          <button
            onClick={async () => { await logout(); router.push('/auth/login'); }}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
          >
            Logout
          </button>
        </div>
      ) : (
        <p>Not logged in</p>
      )}
    </div>
  );
}
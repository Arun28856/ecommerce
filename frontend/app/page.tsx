'use client';

import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user, loading, logout } = useAuth();

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-8">
      {user ? (
        <div>
          <p>Welcome {user.name}!</p>
          <p>Role: {user.role}</p>
          <p>Email: {user.email}</p>
          <button
            onClick={logout}
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
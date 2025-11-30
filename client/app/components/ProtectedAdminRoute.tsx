'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AlertCircle, LogOut } from 'lucide-react';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

/**
 * Component untuk melindungi route admin
 * Hanya admin yang dapat mengakses halaman yang dibungkus dengan component ini
 */
export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const router = useRouter();
  const { isLoggedIn, user, isHydrated, logout } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'not-logged-in' | 'not-admin'>('loading');

  useEffect(() => {
    // Tunggu hingga AuthContext selesai hydrate
    if (!isHydrated) {
      return;
    }

    // Cek apakah user login dan memiliki role admin
    if (!isLoggedIn || !user) {
      console.warn('Access denied: User not logged in');
      setAuthStatus('not-logged-in');
      setIsLoading(false);
      return;
    }

    if (user.role !== 'admin') {
      console.warn('Access denied: User is not an admin');
      setAuthStatus('not-admin');
      setIsLoading(false);
      return;
    }

    setAuthStatus('authorized');
    setIsAuthorized(true);
    setIsLoading(false);
  }, [isHydrated, isLoggedIn, user]);

  const handleLogout = () => {
    console.log("Logging out...");
    logout();
    router.push('/login');
  };

  // Loading state
  if (isLoading || !isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  // If not authorized - User Biasa
  if (authStatus === 'not-admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Akses Ditolak
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Anda tidak memiliki izin untuk mengakses dashboard admin. Hanya admin yang dapat mengakses halaman ini.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Kembali ke Home
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If not logged in
  if (authStatus === 'not-logged-in') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Silakan Login
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Anda harus login terlebih dahulu untuk mengakses dashboard admin.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Pergi ke Login
          </button>
        </div>
      </div>
    );
  }

  // Authorized - render children
  return <>{children}</>;
}

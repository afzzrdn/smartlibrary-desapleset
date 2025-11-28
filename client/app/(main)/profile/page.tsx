"use client"
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/app/context/AuthContext'; 
// Asumsi path ke AuthContext sudah benar

// --- Tipe Data Profil (lebih detail) ---
interface UserProfile {
  id: number;
  email: string;
  role: string;
  name: string | null;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  createdAt: string;
  updatedAt: string;
}

const ProfilePage: React.FC = () => {
  const { user, logout, api, isHydrated } = useAuth(); // Ambil instance api dan data user dari context
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fungsi untuk mengambil data profil
    const fetchProfile = async () => {
      // Tunggu hingga hydration selesai
      if (!isHydrated) {
        return;
      }

      try {
        // Gunakan instance api yang sudah memiliki token di header
        console.log('Fetching profile...');
        console.log('isHydrated:', isHydrated);
        console.log('Authorization header:', api.defaults.headers.common?.['Authorization']);
        
        const response = await api.get('api/auth/profile'); 
        
        // Asumsi response.data.user adalah objek UserProfile
        setProfileData(response.data.user); 
        setError(null);
      } catch (err) {
        console.error("Gagal mengambil data profil:", err);
        
        if (axios.isAxiosError(err)) {
          console.log('Error status:', err.response?.status);
          console.log('Error data:', err.response?.data);
          
          // Jika error 401/403/400 (Unauthorized), paksa logout
          if (err.response?.status === 401 || err.response?.status === 403 || err.response?.status === 400) {
            setError("Anda belum login atau token tidak valid. Silakan login terlebih dahulu.");
            logout();
          } else {
            setError("Gagal memuat profil. Silakan coba login kembali.");
          }
        } else {
          setError("Gagal memuat profil. Silakan coba login kembali.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isHydrated, api, logout]);

  if (isLoading) {
    return (
        <div className="text-center p-6">
            <p>Memuat profil...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="text-center p-6 text-red-600">
            <h2 className="text-xl font-bold mb-4">Akses Ditolak</h2>
            <p>{error}</p>
            <button 
                onClick={logout} 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Coba Login Ulang
            </button>
        </div>
    );
  }

  if (!profileData) {
    return <div className="text-center p-6">Data profil tidak ditemukan.</div>;
  }

  return (
    <main className="bg-white rounded-xl lg:h-[87.5vh] h-auto p-6 lg:p-10 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">👤 Profil Pengguna</h1>
        <p className="text-sm lg:text-base text-gray-600">Informasi akun dan pengaturan profil Anda</p>
      </div>

      {/* Profile Card Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left Column - Avatar & Basic Info */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            {/* Avatar */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-gray-900 shadow-lg flex items-center justify-center bg-gray-100 overflow-hidden">
                {profileData.avatar_url ? (
                  <img 
                    src={profileData.avatar_url} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold">
                    {profileData.name ? profileData.name.charAt(0).toUpperCase() : profileData.email.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Name & Role */}
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {profileData.name || 'Pengguna'}
              </h2>
              <div className="mt-3">
                <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${
                  profileData.role === 'admin' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-200 text-gray-900'
                }`}>
                  {profileData.role === 'admin' ? '👑 Admin' : '👤 Pengguna'}
                </span>
              </div>
            </div>

            {/* Bio */}
            {profileData.bio && (
              <p className="text-center text-gray-700 text-xs sm:text-sm italic px-2">
                "{profileData.bio}"
              </p>
            )}
          </div>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="md:col-span-2 space-y-4 lg:space-y-6">
          
          {/* Email & Phone Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
            {/* Email Card */}
            <div className="bg-white rounded-lg p-4 lg:p-5 border border-gray-200">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide block mb-2">📧 Email</label>
              <p className="text-gray-900 font-semibold break-all text-sm lg:text-base">{profileData.email}</p>
            </div>

            {/* Phone Card */}
            <div className="bg-white rounded-lg p-4 lg:p-5 border border-gray-200">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide block mb-2">📞 Telepon</label>
              <p className="text-gray-900 font-semibold text-sm lg:text-base">{profileData.phone || '—'}</p>
            </div>
          </div>

          {/* ID & Member Since Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
            {/* User ID Card */}
            <div className="bg-white rounded-lg p-4 lg:p-5 border border-gray-200">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide block mb-2">🔐 ID Pengguna</label>
              <p className="text-gray-900 font-mono font-semibold text-xs sm:text-sm lg:text-base">{profileData.id}</p>
            </div>

            {/* Member Since Card */}
            <div className="bg-white rounded-lg p-4 lg:p-5 border border-gray-200">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide block mb-2">📅 Bergabung</label>
              <p className="text-gray-900 font-semibold text-xs sm:text-sm lg:text-base">
                {new Date(profileData.createdAt).toLocaleDateString('id-ID', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Last Updated */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs lg:text-sm text-gray-700">
              ℹ️ Diperbarui: {new Date(profileData.updatedAt).toLocaleDateString('id-ID', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          onClick={logout}
          className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-2"
        >
          <span>🚪</span>
          Keluar (Logout)
        </button>
      </div>
    </main>
  );
};

export default ProfilePage;
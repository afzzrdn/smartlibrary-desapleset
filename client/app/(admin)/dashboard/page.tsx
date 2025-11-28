'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Book, Users } from 'lucide-react';
import Cookies from 'js-cookie';

interface DashboardStats {
  totalBooks: number;
  totalMembers: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = Cookies.get('auth_token');
        if (!token) {
          setError('Token tidak ditemukan. Silakan login kembali.');
          setIsLoading(false);
          return;
        }

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await fetch(`${apiBaseUrl}/api/auth/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Gagal mengambil data dashboard');
        }

        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching dashboard stats:', err);
        setError(err.message || 'Terjadi kesalahan saat memuat data');
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Selamat datang kembali di Admin Panel E-Library</p>
        </div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-12 bg-gray-200 rounded animate-pulse mt-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Selamat datang kembali di Admin Panel E-Library</p>
        </div>
        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600 font-semibold">Error: {error}</p>
            <p className="text-red-500 text-sm mt-1">Silakan coba refresh halaman</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Selamat datang kembali di Admin Panel E-Library</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
        {/* Card Total Buku */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Buku</CardTitle>
            <div className="bg-blue-100 p-2.5 rounded-lg">
              <Book className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalBooks}</div>
            <p className="text-xs text-gray-500 mt-1">
              buku terdaftar di sistem
            </p>
          </CardContent>
        </Card>

        {/* Card Total Anggota */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Anggota</CardTitle>
            <div className="bg-green-100 p-2.5 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalMembers}</div>
            <p className="text-xs text-gray-500 mt-1">
              anggota terverifikasi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900">Informasi Sistem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-gray-600">Pantau semua buku dalam koleksi</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">{stats.totalBooks} Buku</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <p className="text-sm text-gray-600">Kelola keanggotaan pengguna</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{stats.totalMembers} Anggota</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Book, Users, Library, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const stats = {
    totalBuku: 150,
    totalAnggota: 450,
    bukuDipinjam: 30,
    daftarBaru: 12,
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Selamat datang kembali di Admin Panel E-Library</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card Total Buku */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Buku</CardTitle>
            <div className="bg-blue-100 p-2.5 rounded-lg">
              <Book className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalBuku}</div>
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
            <div className="text-3xl font-bold text-gray-900">{stats.totalAnggota}</div>
            <p className="text-xs text-gray-500 mt-1">
              anggota terverifikasi
            </p>
          </CardContent>
        </Card>

        {/* Card Buku Dipinjam */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Sedang Dipinjam</CardTitle>
            <div className="bg-purple-100 p-2.5 rounded-lg">
              <Library className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.bukuDipinjam}</div>
            <p className="text-xs text-gray-500 mt-1">
              dalam peminjaman aktif
            </p>
          </CardContent>
        </Card>

        {/* Card Daftar Baru */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Daftar Baru</CardTitle>
            <div className="bg-orange-100 p-2.5 rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.daftarBaru}</div>
            <p className="text-xs text-gray-500 mt-1">
              minggu ini
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900">Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>Tidak ada aktivitas terbaru saat ini</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
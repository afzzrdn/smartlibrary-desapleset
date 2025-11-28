import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Book, Users, Library } from 'lucide-react';

export default function DashboardPage() {
  // TODO: Ganti angka ini dengan data asli dari API
  const stats = {
    totalBuku: 150,
    totalAnggota: 450,
    bukuDipinjam: 30,
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Card Total Buku */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Buku</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBuku}</div>
            <p className="text-xs text-muted-foreground">
              buku terdaftar di sistem
            </p>
          </CardContent>
        </Card>

        {/* Card Total Anggota */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Anggota</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAnggota}</div>
            <p className="text-xs text-muted-foreground">
              anggota terverifikasi
            </p>
          </CardContent>
        </Card>

        {/* Card Peminjaman */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buku Dipinjam</CardTitle>
            <Library className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bukuDipinjam}</div>
            <p className="text-xs text-muted-foreground">
              sedang dalam peminjaman
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Di sini Anda bisa tambahkan Chart atau Tabel Aktivitas Terbaru */}
    </div>
  );
}
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';

// Client Component untuk Form (membutuhkan state)
import GenreForm from './genre-form'; // Import komponen form genre

// --- SERVER COMPONENT: FETCH DATA ---
async function getGenres() {
  // Fetch data dari API genres
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const res = await fetch(`${apiBaseUrl}/api/genres`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Gagal mengambil data genre dari API');
  }

  return res.json();
}


// --- MAIN PAGE ---
export default async function ManageGenresPage() {
  let genres = [];
  try {
    genres = await getGenres();
  } catch (e) {
    return <h1 className="text-xl text-red-600">ERROR: Gagal memuat data. Pastikan server Express berjalan.</h1>;
  }
  
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Kelola Genre</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Kolom 1: Form untuk Create */}
        <div className="lg:col-span-1">
          <Card className='sticky top-6'>
            <CardHeader>
              <CardTitle>Tambah Genre Baru</CardTitle>
            </CardHeader>
            <CardContent>
              <GenreForm /> {/* Komponen Form Genre */}
            </CardContent>
          </Card>
        </div>

        {/* Kolom 2: Tabel untuk Read */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Genre ({genres.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nama Genre</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {genres.map((genre: any) => (
                    <TableRow key={genre.id}>
                      <TableCell className='w-1/12'>{genre.id}</TableCell>
                      <TableCell className="font-medium">{genre.name}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="destructive" size="icon" className='h-8 w-8'>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
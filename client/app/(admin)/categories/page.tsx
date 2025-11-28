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
import { PlusCircle, Trash2 } from 'lucide-react';
import CategoryForm from './category-form';

// Client Component untuk Form (membutuhkan state)

// --- SERVER COMPONENT: FETCH DATA ---
async function getCategories() {
  // Fetch data di sisi server (Sangat cepat di Next.js)
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  const res = await fetch(`${apiBaseUrl}/api/categories`, {
    cache: 'no-store', // Selalu fetch data terbaru
  });

  if (!res.ok) {
    throw new Error('Gagal mengambil data kategori dari API');
  }

  return res.json();
}


// --- MAIN PAGE ---
export default async function ManageCategoriesPage() {
  let categories = [];
  try {
    categories = await getCategories();
  } catch (e) {
    return <h1 className="text-xl text-red-600">ERROR: Gagal memuat data. Pastikan server Express berjalan.</h1>;
  }
  
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Kelola Kategori</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Kolom 1: Form untuk Create */}
        <div className="lg:col-span-1">
          <Card className='sticky top-6'>
            <CardHeader>
              <CardTitle>Tambah Kategori Baru</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryForm /> {/* Komponen Form Client */}
            </CardContent>
          </Card>
        </div>

        {/* Kolom 2: Tabel untuk Read */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Kategori ({categories.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nama Kategori</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat: any) => (
                    <TableRow key={cat.id}>
                      <TableCell className='w-1/12'>{cat.id}</TableCell>
                      <TableCell className="font-medium">{cat.name}</TableCell>
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
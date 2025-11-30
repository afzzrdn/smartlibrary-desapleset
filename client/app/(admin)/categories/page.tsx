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
import { PlusCircle, Trash2, Edit2 } from 'lucide-react';
import CategoryForm from './category-form';
import CategoryActions from './category-actions';

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
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold">Kelola Kategori</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">ERROR: Gagal memuat data kategori. Pastikan server berjalan.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kelola Kategori</h1>
        <p className="text-gray-600 mt-1">Tambah, edit, dan hapus kategori buku</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        
        {/* Kolom 1: Form untuk Create */}
        <div className="lg:col-span-1">
          <Card className='sticky top-6 border-0 shadow-md'>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold">Tambah Kategori</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryForm />
            </CardContent>
          </Card>
        </div>

        {/* Kolom 2-4: Tabel untuk Read */}
        <div className="lg:col-span-3">
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold">Daftar Kategori</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Total: {categories.length} kategori</p>
            </CardHeader>
            <CardContent className="p-0">
              {categories.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 border-b">
                        <TableHead className="font-semibold text-gray-700 w-12">No</TableHead>
                        <TableHead className="font-semibold text-gray-700">Nama Kategori</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((cat: any, index: number) => (
                        <TableRow key={cat.id} className="border-b hover:bg-gray-50">
                          <TableCell className='text-sm text-center font-bold text-gray-600'>{index + 1}</TableCell>
                          <TableCell className="font-medium text-gray-900">{cat.name}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <CategoryActions categoryId={cat.id} categoryName={cat.name} />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>Belum ada kategori. Silakan tambahkan kategori baru.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
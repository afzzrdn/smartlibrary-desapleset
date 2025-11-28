import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import BookForm from './book-form';
import BookActions from './book-actions'; 

// --- 1. Fungsi Fetch Buku ---
async function getBooks() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/books`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Gagal mengambil data buku');
  return res.json();
}

// --- 2. Fungsi Fetch Kategori ---
async function getCategories() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Gagal mengambil data kategori');
  return res.json();
}

// --- 3. Fungsi Fetch Genre ---
async function getGenres() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/genres`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Gagal mengambil data genre');
  return res.json();
}

// --- MAIN PAGE (SERVER COMPONENT) ---
export default async function ManageBooksPage() {
  let books = [];
  let categories = [];
  let genres = [];
  
  try {
    // Ambil semua data secara paralel (lebih cepat)
    [books, categories, genres] = await Promise.all([
      getBooks(),
      getCategories(),
      getGenres(),
    ]);
  } catch (e) {
    return <h1 className="text-xl text-red-600">ERROR: Gagal memuat data Books/Categories/Genres. Pastikan server berjalan.</h1>;
  }
  
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Kelola Buku ({books.length} total)</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Kolom Kiri: Form Tambah Buku */}
        <div className="lg:col-span-1">
          <BookForm categories={categories} genres={genres} /> 
        </div>

        {/* Kolom Kanan: Tabel Buku (Read) */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul & Penulis</TableHead>
                    <TableHead>Kategori / Genre</TableHead>
                    <TableHead>Path File</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.map((book: any) => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium">
                        <span className='font-bold'>{book.title}</span><br/>
                        <span className='text-sm text-gray-500'>Oleh: {book.author}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{book.category?.name || 'N/A'}</Badge>
                        <br/>
                        <Badge variant="secondary">{book.genre?.name || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell className='text-xs text-blue-500'>{book.file_url}</TableCell>
                      <TableCell className="text-right flex gap-2 justify-end">
                        <BookActions
                          bookId={book.id}
                          bookData={{
                            title: book.title,
                            author: book.author,
                            description: book.description,
                            categoryId: book.categoryId,
                            genreId: book.genreId,
                            ISBN: book.ISBN,
                          }}
                          categories={categories}
                          genres={genres}
                        />
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
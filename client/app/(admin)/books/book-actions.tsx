'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit2, Trash2, X, Save } from 'lucide-react';
import Cookies from 'js-cookie';

interface BookActionsProps {
  bookId: number;
  bookData: {
    title: string;
    author: string;
    description: string;
    categoryId: number;
    genreId: number;
    ISBN: string;
  };
  categories: Array<{ id: number; name: string }>;
  genres: Array<{ id: number; name: string }>;
}

export default function BookActions({
  bookId,
  bookData,
  categories,
  genres,
}: BookActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState(bookData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleEdit = async () => {
    if (!editData.title.trim() || !editData.author.trim()) {
      setError('Judul dan Penulis tidak boleh kosong');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = Cookies.get('auth_token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/books/${bookId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(editData),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || 'Gagal mengupdate buku');
        return;
      }

      setIsEditOpen(false);
      router.refresh();
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Apakah Anda yakin ingin menghapus buku "${bookData.title}"?`)) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = Cookies.get('auth_token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/books/${bookId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || 'Gagal menghapus buku');
        return;
      }

      router.refresh();
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isEditOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 my-8">
            <h2 className="text-lg font-bold mb-4">Edit Buku</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded p-3 mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title" className="text-sm font-medium">
                  Judul Buku
                </Label>
                <Input
                  id="edit-title"
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                  placeholder="Masukkan judul buku"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="edit-author" className="text-sm font-medium">
                  Penulis
                </Label>
                <Input
                  id="edit-author"
                  value={editData.author}
                  onChange={(e) =>
                    setEditData({ ...editData, author: e.target.value })
                  }
                  placeholder="Masukkan nama penulis"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="edit-isbn" className="text-sm font-medium">
                  ISBN
                </Label>
                <Input
                  id="edit-isbn"
                  value={editData.ISBN}
                  onChange={(e) =>
                    setEditData({ ...editData, ISBN: e.target.value })
                  }
                  placeholder="Masukkan ISBN"
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-category" className="text-sm font-medium">
                    Kategori
                  </Label>
                  <select
                    id="edit-category"
                    value={editData.categoryId}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        categoryId: parseInt(e.target.value),
                      })
                    }
                    className="mt-2 w-full px-3 py-2 border rounded-md"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="edit-genre" className="text-sm font-medium">
                    Genre
                  </Label>
                  <select
                    id="edit-genre"
                    value={editData.genreId}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        genreId: parseInt(e.target.value),
                      })
                    }
                    className="mt-2 w-full px-3 py-2 border rounded-md"
                  >
                    {genres.map((gen) => (
                      <option key={gen.id} value={gen.id}>
                        {gen.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-description" className="text-sm font-medium">
                  Deskripsi
                </Label>
                <textarea
                  id="edit-description"
                  value={editData.description}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                  placeholder="Masukkan deskripsi buku"
                  className="mt-2 w-full px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={isLoading}
                className="px-4"
              >
                <X className="h-4 w-4 mr-2" />
                Batal
              </Button>
              <Button
                onClick={handleEdit}
                disabled={isLoading}
                className="px-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsEditOpen(true)}
        disabled={isLoading}
        className="h-8 px-3 text-xs"
      >
        <Edit2 className="h-4 w-4 mr-1" />
        Edit
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={isLoading}
        className="h-8 px-3 text-xs"
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Hapus
      </Button>
    </>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit2, Trash2, X, Save } from 'lucide-react';
import Cookies from 'js-cookie';

interface CategoryActionsProps {
  categoryId: number;
  categoryName: string;
}

export default function CategoryActions({ categoryId, categoryName }: CategoryActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState(categoryName);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Handle Edit
  const handleEdit = async () => {
    if (!editName.trim()) {
      setError('Nama tidak boleh kosong');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = Cookies.get('auth_token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories/${categoryId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ name: editName.trim() }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || 'Gagal mengupdate kategori');
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

  // Handle Delete
  const handleDelete = async () => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kategori "${categoryName}"?`)) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = Cookies.get('auth_token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories/${categoryId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || 'Gagal menghapus kategori');
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
      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-lg font-bold mb-4">Edit Kategori</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded p-3 mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <Label htmlFor="edit-name" className="text-sm font-medium">
                Nama Kategori
              </Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Masukkan nama kategori"
                className="mt-2"
              />
            </div>

            <div className="flex gap-2 justify-end">
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

      {/* Action Buttons */}
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

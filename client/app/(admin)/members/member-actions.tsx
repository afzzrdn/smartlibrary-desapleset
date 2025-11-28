'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit2, Trash2, X, Save } from 'lucide-react';
import Cookies from 'js-cookie';

interface MemberActionsProps {
  memberId: number;
  memberData: {
    email: string;
    name: string;
    phone: string;
    role: string;
  };
}

export default function MemberActions({
  memberId,
  memberData,
}: MemberActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    name: memberData.name || '',
    phone: memberData.phone || '',
    role: memberData.role,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleEdit = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = Cookies.get('auth_token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/members/${memberId}`,
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
        setError(errorData.error || 'Gagal mengupdate member');
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
    if (!confirm(`Apakah Anda yakin ingin menghapus member "${memberData.email}"?`)) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = Cookies.get('auth_token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/members/${memberId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || 'Gagal menghapus member');
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-lg font-bold mb-4">Edit Member</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded p-3 mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-email" className="text-sm font-medium">
                  Email (Tidak dapat diubah)
                </Label>
                <Input
                  id="edit-email"
                  value={memberData.email}
                  disabled
                  className="mt-2 bg-gray-100"
                />
              </div>

              <div>
                <Label htmlFor="edit-name" className="text-sm font-medium">
                  Nama
                </Label>
                <Input
                  id="edit-name"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                  placeholder="Masukkan nama member"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="edit-phone" className="text-sm font-medium">
                  Telepon
                </Label>
                <Input
                  id="edit-phone"
                  value={editData.phone}
                  onChange={(e) =>
                    setEditData({ ...editData, phone: e.target.value })
                  }
                  placeholder="Masukkan nomor telepon"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="edit-role" className="text-sm font-medium">
                  Role
                </Label>
                <select
                  id="edit-role"
                  value={editData.role}
                  onChange={(e) =>
                    setEditData({ ...editData, role: e.target.value })
                  }
                  className="mt-2 w-full px-3 py-2 border rounded-md"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
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

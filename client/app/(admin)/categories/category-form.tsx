'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';

export default function CategoryForm() {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter(); 

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    if (!name.trim()) {
        setError('Nama kategori tidak boleh kosong.');
        setIsLoading(false);
        return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Di sini nanti perlu menambahkan Token Admin untuk Auth
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || 'Gagal menambahkan kategori.');
        return;
      }
      
      // Sukses: Bersihkan form dan refresh halaman
      setName('');
      // Memaksa Next.js untuk merender ulang Server Component dan menampilkan data baru
      router.refresh(); 

    } catch (err) {
      setError('Terjadi kesalahan koneksi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreate} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nama Kategori</Label>
        <Input
          id="name"
          placeholder="Contoh: Fiksi Ilmiah"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Menyimpan...' : (
          <>
            <PlusCircle className="mr-2 h-4 w-4" />
            Simpan Kategori
          </>
        )}
      </Button>
    </form>
  );
}
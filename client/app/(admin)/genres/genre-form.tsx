'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';

export default function GenreForm() {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter(); 

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    if (!name.trim()) {
        setError('Nama genre tidak boleh kosong.');
        setIsLoading(false);
        return;
    }

    try {
      // Mengirim POST ke API genres
      const apiBaseUrl= process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${apiBaseUrl}/api/genres`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Di sini nanti perlu menambahkan Token Admin untuk Auth
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || 'Gagal menambahkan genre.');
        return;
      }
      
      // Sukses: Bersihkan form dan refresh halaman
      setName('');
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
        <Label htmlFor="name">Nama Genre</Label>
        <Input
          id="name"
          placeholder="Contoh: Thriller, Romansa"
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
            Simpan Genre
          </>
        )}
      </Button>
    </form>
  );
}

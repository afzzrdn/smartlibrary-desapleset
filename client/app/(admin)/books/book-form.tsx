'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Cookies from 'js-cookie';

interface Option {
    id: number;
    name: string;
}

interface BookFormProps {
    categories: Option[];
    genres: Option[];
}

export default function BookForm({ categories, genres }: BookFormProps) {
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        description: '',
        categoryId: '',
        genreId: '',
    });
    const [bookFile, setBookFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.name === 'bookFile' && e.target.files) {
            setBookFile(e.target.files[0]);
        } else if (e.target.name === 'coverFile' && e.target.files) {
            setCoverFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!bookFile) {
            setError('File buku (PDF/ePub) wajib diisi.');
            setIsLoading(false);
            return;
        }

        // --- Persiapan Multipart Form Data ---
        const data = new FormData();
        data.append('title', formData.title);
        data.append('author', formData.author);
        data.append('description', formData.description);
        data.append('categoryId', formData.categoryId);
        data.append('genreId', formData.genreId);
        data.append('bookFile', bookFile);
        if (coverFile) {
            data.append('coverFile', coverFile);
        }

        try {
            // KIRIM DATA KE API EXPRESS
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
            
            // Ambil token dari cookie
            const token = Cookies.get('auth_token');
            if (!token) {
                setError('Token tidak ditemukan. Silakan login terlebih dahulu.');
                return;
            }

            const res = await fetch(`${apiBaseUrl}/api/books`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                // PENTING: Jangan set Content-Type, browser akan set otomatis 'multipart/form-data' dengan boundary
                body: data, 
            });

            if (!res.ok) {
                const errorText = await res.text();
                setError(`Gagal menyimpan buku. Respon API: ${errorText.slice(0, 100)}`);
                return;
            }

            // Sukses
            alert("Buku berhasil ditambahkan! Silakan cek tabel.");
            setFormData({ title: '', author: '', description: '', categoryId: '', genreId: '' });
            setBookFile(null);
            setCoverFile(null);
            router.refresh(); // Refresh Server Component untuk menampilkan buku baru

        } catch (err) {
            setError('Kesalahan koneksi atau server.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className='sticky top-6'>
            <CardHeader>
                <CardTitle>Tambah Buku Baru</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Judul</Label>
                        <Input name="title" value={formData.title} onChange={handleChange} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="author">Penulis</Label>
                        <Input name="author" value={formData.author} onChange={handleChange} required />
                    </div>
                    
                    <div className="grid gap-2">
                        <Label htmlFor="category">Kategori</Label>
                        <Select 
                            name="categoryId" 
                            onValueChange={(value) => handleSelectChange('categoryId', value)}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(cat => (
                                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="genre">Genre</Label>
                         <Select 
                            name="genreId" 
                            onValueChange={(value) => handleSelectChange('genreId', value)}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Genre" />
                            </SelectTrigger>
                            <SelectContent>
                                {genres.map(gen => (
                                    <SelectItem key={gen.id} value={String(gen.id)}>{gen.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Deskripsi</Label>
                        <Textarea name="description" value={formData.description} onChange={handleChange} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="bookFile">File Buku (PDF/ePub)</Label>
                        <Input type="file" name="bookFile" onChange={handleFileChange} required />
                    </div>
                    
                    <div className="grid gap-2">
                        <Label htmlFor="coverFile">Cover Gambar (Opsional)</Label>
                        <Input type="file" name="coverFile" onChange={handleFileChange} />
                    </div>

                    {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                    
                    <Button type="submit" disabled={isLoading} className="mt-4">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Mengunggah...
                            </>
                        ) : (
                            <>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Simpan Buku
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
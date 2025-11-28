'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Cookies from 'js-cookie'; // Impor js-cookie

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@elibrary.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth(); 

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(''); 

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), 
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login gagal. Coba lagi.');
        return;
      }

      // KONEKSI BERHASIL
      // 1. Simpan token ke cookie
      Cookies.set('auth_token', data.token, { expires: 1 }); // Simpan untuk 1 hari

      // 2. Simpan user data ke context dan localStorage
      const userData = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
      };
      login(data.token, userData);

      // 3. Redirect ke dashboard
      router.push('/');

    } catch (err) {
      setError('Tidak bisa terhubung ke server. Pastikan server Express berjalan.');
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleLogin}>
          <CardHeader>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>
              Masukkan email dan password admin.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 px-1">{error}</p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
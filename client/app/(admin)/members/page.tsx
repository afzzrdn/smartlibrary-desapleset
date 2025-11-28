'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MemberActions from './member-actions';
import Cookies from 'js-cookie';

// --- MAIN PAGE ---
export default function ManageMembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const token = Cookies.get('auth_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/members`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Gagal mengambil data pengguna');
        }

        const data = await res.json();
        setMembers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold">Kelola Pengguna</h1>
        <h2 className="text-xl text-red-600">ERROR: {error}</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold">Kelola Pengguna</h1>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">Memuat data pengguna...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Kelola Pengguna</h1>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna ({members.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {members.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Belum ada pengguna terdaftar
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member: any) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.id}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{member.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Aktif
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right flex gap-2 justify-end">
                      <MemberActions memberId={member.id} memberData={member} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
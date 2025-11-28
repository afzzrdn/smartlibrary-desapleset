"use client"
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Book, Layers, Users, PanelLeft, LogOut, User as UserIcon, Heart, Menu, X } from 'lucide-react'; 
import { Button } from '@/components/ui/button'; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';

// --- UTILITY: Hapus Cookie ---
const deleteAuthCookie = (name: string) => {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

function SidebarNav() {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/books', icon: Book, label: 'Kelola Buku' },
    { href: '/categories', icon: Layers, label: 'Kategori' },
    { href: '/genres', icon: Layers, label: 'Genre' },
    { href: '/members', icon: Users, label: 'Anggota' },
  ];

  return (
    <nav className="grid items-start gap-1 px-4 text-sm font-medium">
      {navItems.map((item) => {
        const isRootRoute = item.href === '/dashboard';
        const isActive = 
            isRootRoute 
            ? pathname === item.href 
            : pathname.startsWith(item.href);
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center gap-3 rounded-lg px-4 py-2.5 transition-all duration-200
              ${
                isActive 
                ? 'bg-gray-900 text-white font-semibold' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' 
              }
            `}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

// Komponen Header Atas (Topbar)
function Header() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    console.log("Logging out...");
    deleteAuthCookie("auth_token");
    deleteAuthCookie("user_role");
    router.push('/login'); 
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-white px-4 sm:px-8 shadow-sm">
      {/* Logo/Title untuk Mobile */}
      <div className="flex items-center gap-3 sm:hidden">
        <Link href="/dashboard" className="font-bold text-lg text-gray-900">
          E-Lib
        </Link>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User Section */}
      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-600 hidden sm:block">Selamat datang, Admin</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-10 w-10 cursor-pointer border-2 border-gray-200 hover:border-gray-400 transition">
              <AvatarImage src="/placeholder-user.jpg" alt="Admin" />
              <AvatarFallback className="bg-gray-900 text-white font-bold">A</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleProfile} className="cursor-pointer">
              <UserIcon className="mr-2 h-4 w-4" />
              Profil Saya
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:bg-red-50">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

// Layout Utama Admin
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      {/* Sidebar untuk Desktop */}
      <aside className="hidden sm:flex w-64 flex-col border-r bg-white shadow-lg"> 
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="font-bold text-lg text-gray-900">
            E-Library
          </Link>
          <span className="text-xs bg-gray-900 text-white px-2 py-1 rounded ml-auto">Admin</span>
        </div>
        <div className="flex-1 overflow-y-auto py-6">
          <SidebarNav />
        </div>
      </aside>

      {/* Konten Utama */}
      <div className="flex flex-col flex-1"> 
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
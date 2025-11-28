"use client"
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // Import useRouter
import { Home, Book, Users, PanelLeft, LogOut, User as UserIcon, Heart } from 'lucide-react'; 
// Asumsi path komponen UI (shadcn/ui) sudah benar
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

// --- UTILITY: Hapus Cookie ---
const deleteAuthCookie = (name: string) => {
    // Menyetel tanggal kedaluwarsa ke masa lalu untuk menghapus cookie
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

function SidebarNav() {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/books', icon: Book, label: 'Kelola Buku' },
    { href: '/categories', icon: Users, label: 'Kelola Kategori' },
    { href: '/genres', icon: Users, label: 'Kelola Genre' },
    { href: '/members', icon: Users, label: 'Kelola Anggota' },
    { href: '/favorites', icon: Heart, label: 'Favorit Anggota' }, // Contoh rute baru
  ];

  return (
    <nav className="grid items-start gap-2 px-4 text-sm font-medium">
      {navItems.map((item) => {
        // Tentukan apakah item ini adalah root rute (seperti /dashboard)
        const isRootRoute = item.href === '/dashboard';
        
        // Cek apakah rute aktif, termasuk sub-rute (kecuali dashboard)
        const isActive = 
            isRootRoute 
            ? pathname === item.href 
            : pathname.startsWith(item.href);
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center gap-3 rounded-lg px-3 py-2 transition-all 
              hover:text-gray-900 hover:bg-gray-100
              ${
                isActive 
                ? 'text-blue-600 bg-blue-50 font-semibold border border-blue-200' // Styling untuk aktif
                : 'text-gray-500' 
              }
            `}
          >
            <item.icon className="h-4 w-4" />
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

  // Logic untuk Logout
  const handleLogout = () => {
    console.log("Melakukan proses logout: Menghapus auth_token...");
    
    // 1. Hapus cookie otentikasi
    deleteAuthCookie("auth_token");
    
    // 2. Redirect ke halaman login
    router.push('/login'); 
  };

  // Logic untuk Profil
  const handleProfile = () => {
    console.log("Mengarahkan ke halaman profil...");
    // TODO: Implementasi navigasi ke halaman profil admin jika ada
    alert("Fitur Profil: Anda akan diarahkan ke halaman profil admin."); 
    // router.push('/admin/profile');
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white px-6 shadow-sm">
      {/* Sidebar untuk Mobile (Sheet) */}
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <SidebarNav />
        </SheetContent>
      </Sheet>

      {/* Konten Header (kanan) */}
      <div className="flex-1" />
      <p className="font-medium text-sm hidden sm:block text-gray-700">Halo, Admin!</p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="h-9 w-9 cursor-pointer border-2 border-gray-200 hover:border-blue-500 transition">
            <AvatarImage src="/placeholder-user.jpg" alt="Admin Avatar" />
            <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">A</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleProfile} className="cursor-pointer">
            <UserIcon className="mr-2 h-4 w-4 text-gray-600" />
            Profil
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

// Layout Utama Admin (Export Default)
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Gunakan min-h-screen untuk memastikan layout admin mengambil tinggi penuh
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      {/* Sidebar untuk Desktop */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-white sm:flex shadow-xl"> 
        <div className="flex h-14 items-center border-b px-6">
          <Link href="/dashboard" className="font-extrabold text-xl text-blue-600 tracking-wider">
            E-Library Admin
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto pt-4">
            <SidebarNav />
        </div>
      </aside>

      {/* Konten Utama (Header + Isi Halaman) */}
      <div className="flex flex-col sm:pl-64 w-full"> 
        <Header />
        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
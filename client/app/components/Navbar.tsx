"use client"
import React, { useState, useEffect, ChangeEvent } from 'react';
import { Search, User, LogOut, Heart, LayoutDashboard, Menu, Filter } from 'lucide-react'; 
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
// Asumsi path komponen UI (shadcn/ui) sudah benar
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Book {
  id: number;
  title: string;
  author: string;
  cover_image_url: string;
  file_url: string;
  category: { name: string } | null;
  genre: { name: string } | null;
  is_favorite: boolean;
}

type DebounceValue = string | number | undefined;


const useDebounce = <T extends DebounceValue>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

interface NavbarProps {
  onSearch?: (searchTerm: string) => void;
  onMenuClick?: () => void;
  onFilterClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSearch, onMenuClick, onFilterClick }) => {
  const router = useRouter();
  const { isLoggedIn, user, logout } = useAuth();
  
  // State untuk nilai input saat ini
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // 💡 FIX HYDRATION: State baru untuk menandai kapan klien selesai memuat (hanya true di client)
  const [isClientReady, setIsClientReady] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  
  // Check auth status on mount
  useEffect(() => {
    setIsClientReady(true);
  }, []); 

  // Gunakan debounce untuk menunda proses pencarian aktual
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 500); 

  // Fungsi yang dipanggil saat nilai input berubah
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  // Efek yang dipicu HANYA ketika debouncedSearchTerm berubah
  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, onSearch]);
  
  // Logic untuk Logout
  const handleLogout = () => {
    console.log("Melakukan proses logout user...");
    logout();
    router.push('/login'); 
  };

  // Cek apakah user adalah admin
  const isAdmin = isLoggedIn && user?.role === 'admin';


  return (
    <nav className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-white gap-2 sm:gap-4">
      
      {/* Hamburger Menu for Mobile */}
      <button 
        onClick={onMenuClick}
        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition shrink-0"
        aria-label="Toggle Sidebar"
      >
        <Menu className="text-lg sm:text-xl text-gray-700" />
      </button>
      
      {/* Search Input Area - Responsive */}
      <div className="flex items-center gap-2 sm:gap-3 bg-gray-50 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl shadow-inner transition duration-200 focus-within:shadow-md focus-within:ring-1 focus-within:ring-blue-400 flex-1 min-w-0">
        <Search className="text-gray-500 text-lg sm:text-xl shrink-0" />
        <input
          type="text"
          placeholder="Cari buku..."
          value={searchTerm}
          onChange={handleInputChange}
          className="outline-none w-full bg-transparent text-sm sm:text-base text-gray-800 placeholder-gray-400"
        />
        
        {/* Tombol Clear */}
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')} 
            className="text-gray-400 hover:text-gray-600 transition duration-150 text-sm shrink-0"
            aria-label="Hapus Pencarian"
          >
            &times;
          </button>
        )}
      </div>

      {/* Filter Button */}
      <button
        onClick={onFilterClick}
        className="p-2 hover:bg-gray-100 rounded-lg transition shrink-0"
        aria-label="Toggle Filter"
        title="Filter"
      >
        <Filter className="text-lg sm:text-xl text-gray-700" />
      </button>

      {/* User Profile / Auth Area - Render hanya ketika Client Ready */}
      <div className="relative">
        {isClientReady ? (
            <>
              {isLoggedIn ? (
                <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                    <DropdownMenuTrigger asChild>
                        <button 
                            type="button"
                            className="rounded-full w-10 h-10 sm:w-12 sm:h-12 bg-white shadow-md flex items-center justify-center hover:ring-2 hover:ring-blue-500 transition duration-200 shrink-0"
                            aria-label="Menu Pengguna" 
                        >
                            <User className="text-lg sm:text-2xl text-blue-600" />
                            <span className="absolute bottom-0 right-0 block h-2 w-2 sm:h-3 sm:w-3 rounded-full ring-2 ring-white bg-green-400"></span>
                        </button>
                    </DropdownMenuTrigger>
                    
                    <DropdownMenuContent align="end" className="w-48">
                        
                        {/* TOMBOL DASHBOARD (TAMPIL HANYA JIKA ADMIN) */}
                        {isAdmin && (
                            <>
                                <DropdownMenuItem 
                                    onClick={() => {
                                      setDropdownOpen(false);
                                      router.push('/dashboard');
                                    }}
                                    className="cursor-pointer font-semibold text-blue-600 focus:bg-blue-50 focus:text-blue-700"
                                >
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    Dashboard Admin
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                            </>
                        )}

                        {/* Menu Pengguna Reguler */}
                        <DropdownMenuItem 
                            onClick={() => {
                              setDropdownOpen(false);
                              router.push('/profile');
                            }}
                            className="cursor-pointer"
                        >
                            <User className="mr-2 h-4 w-4 text-gray-600" />
                            Profil Saya
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                            onClick={() => {
                              setDropdownOpen(false);
                              router.push('/favorit');
                            }}
                            className="cursor-pointer"
                        >
                            <Heart className="mr-2 h-4 w-4 text-red-500" />
                            Daftar Favorit
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        {/* Tombol Logout */}
                        <DropdownMenuItem 
                            onClick={() => {
                              setDropdownOpen(false);
                              handleLogout();
                            }}
                            className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                // Tombol Login untuk user yang belum login
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="rounded-full w-10 h-10 sm:w-12 sm:h-12 bg-white shadow-md flex items-center justify-center hover:ring-2 hover:ring-blue-500 transition duration-200 shrink-0"
                  aria-label="Login"
                >
                  <User className="text-lg sm:text-2xl text-gray-600" />
                </button>
              )}
            </>
        ) : (
            // Server-safe placeholder saat SSR/initial hydration
            <div 
                className="rounded-full w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 shadow-md flex items-center justify-center animate-pulse shrink-0"
            >
                <User className={'text-gray-400'} />
            </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
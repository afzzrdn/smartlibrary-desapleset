"use client"

import { useRouter } from 'next/navigation'
import React, { useEffect, useState, useMemo } from 'react'
import { FiBook, FiHeart, FiFilter, FiX } from 'react-icons/fi';
import { GoChevronDown, GoChevronUp } from 'react-icons/go';
import { useFilter } from '../(main)/layout';

// --- Interface untuk item yang tersimpan di localStorage ---
interface LastReadItem {
    id: number;
    readAt: number; // Timestamp untuk pengurutan
}

// --- Utilitas Sederhana untuk Mengambil Cookie ---
const getAuthTokenFromCookie = (): string | undefined => {
    const name = "auth_token=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return undefined;
};

// --- Utilitas untuk Mencatat Buku Terakhir Dibaca ke LocalStorage ---
const trackLastRead = (bookId: number) => {
    // Pastikan kode berjalan di sisi klien (browser)
    if (typeof window === 'undefined') return;

    const newReadItem: LastReadItem = { id: bookId, readAt: Date.now() };
    const maxItems = 10; // Batasi jumlah item yang disimpan

    try {
        const storedItems = localStorage.getItem("last_read_books");
        let items: LastReadItem[] = storedItems ? JSON.parse(storedItems) : [];

        // 1. Hapus duplikat (jika ID buku sudah ada)
        items = items.filter(item => item.id !== bookId);
        
        // 2. Tambahkan item baru di awal (menjadikannya yang paling baru)
        items.unshift(newReadItem);

        // 3. Batasi jumlah item dan simpan kembali
        localStorage.setItem("last_read_books", JSON.stringify(items.slice(0, maxItems)));
    } catch (error) {
        console.error("Gagal menyimpan Last Read ke localStorage:", error);
    }
};
// --------------------------------------------------------------------------

// Interface Book (diperbarui)
interface Book {
    id: number;
    title: string;
    author: string;
    cover_image_url: string; 
    file_url: string; 
    category: { name: string } | null;
    genre: { name: string } | null;
    is_favorite: boolean; // Properti untuk status favorit
}

// Interface untuk filter
interface FilterItem {
    id: number;
    name: string;
}

interface BookCardProps {
  books?: Book[];
  searchTerm?: string;
  onFilterClick?: () => void;
}

const BookCard: React.FC<BookCardProps> = ({ books: initialBooks = [], searchTerm = '', onFilterClick }) => {
    const router = useRouter();
    const { filterOpen, setFilterOpen } = useFilter();
    const [allBooks, setAllBooks] = useState<Book[]>([]); 
    const [displayBooks, setDisplayBooks] = useState<Book[]>([]); 
    const [authToken, setAuthToken] = useState<string | undefined>(undefined);
    const [hasFetched, setHasFetched] = useState(false);
    
    // State untuk filters
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
    
    // State untuk kontrol dropdown filter
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showGenreDropdown, setShowGenreDropdown] = useState(false);


    useEffect(() => {
        const token = getAuthTokenFromCookie();
        setAuthToken(token);
    }, []);

    useEffect(() => {
        // Jika ada initialBooks dari server, gunakan itu
        if (initialBooks.length > 0) {
            setAllBooks(initialBooks);
            setDisplayBooks(initialBooks);
        } 
        // Jika initialBooks kosong dan belum fetch, fetch dari API
        else if (!hasFetched) {
            fetchBooks(authToken); // Bisa null untuk guest users
            setHasFetched(true);
        }
    }, [authToken, hasFetched, initialBooks]);

    // Helper untuk membuat ID unik
    const createFilterId = (name: string): number => {
        if (!name) return 0;
        return name.charCodeAt(0) + name.charCodeAt(1);
    }

    // Get unique categories dan genres (useMemo)
    const uniqueCategories: FilterItem[] = useMemo(() => {
        const categories = new Map<number, string>();
        allBooks.forEach(book => {
            if (book.category) {
                const id = createFilterId(book.category.name);
                categories.set(id, book.category.name);
            }
        });
        return Array.from(categories.entries()).map(([id, name]) => ({ id, name }));
    }, [allBooks]);

    const uniqueGenres: FilterItem[] = useMemo(() => {
        const genres = new Map<number, string>();
        allBooks.forEach(book => {
            if (book.genre) {
                const id = createFilterId(book.genre.name);
                genres.set(id, book.genre.name);
            }
        });
        return Array.from(genres.entries()).map(([id, name]) => ({ id, name }));
    }, [allBooks]);


    // Filter Toggle Logic (Tidak berubah)
    const toggleCategoryFilter = (categoryName: string) => {
        const categoryId = createFilterId(categoryName);
        setSelectedCategories(prev => 
            prev.includes(categoryId) 
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const toggleGenreFilter = (genreName: string) => {
        const genreId = createFilterId(genreName);
        setSelectedGenres(prev => 
            prev.includes(genreId) 
                ? prev.filter(id => id !== genreId)
                : [...prev, genreId]
        );
    };

    // Apply all filters (Tidak berubah)
    useEffect(() => {
        let filtered = [...allBooks];

        // 1. Filter berdasarkan search term
        if (searchTerm && searchTerm.trim()) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(book =>
                book.title.toLowerCase().includes(lowerSearchTerm) ||
                book.author.toLowerCase().includes(lowerSearchTerm) ||
                book.category?.name.toLowerCase().includes(lowerSearchTerm) ||
                book.genre?.name.toLowerCase().includes(lowerSearchTerm)
            );
        }

        // 2. Filter berdasarkan selected categories
        if (selectedCategories.length > 0) {
            filtered = filtered.filter(book => 
                book.category && selectedCategories.includes(
                    createFilterId(book.category.name)
                )
            );
        }

        // 3. Filter berdasarkan selected genres
        if (selectedGenres.length > 0) {
            filtered = filtered.filter(book => 
                book.genre && selectedGenres.includes(
                    createFilterId(book.genre.name)
                )
            );
        }

        setDisplayBooks(filtered);
    }, [searchTerm, selectedCategories, selectedGenres, allBooks]);

    const fetchBooks = async (token: string | undefined) => {
        try {
            const headers: HeadersInit = {};
            
            // Hanya tambahkan Authorization header jika token ada (untuk user yang sudah login)
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/books`, {
                headers,
            }); 
            
            if (!res.ok) {
                if (res.status === 401) {
                    console.error("Token invalid. Silakan login kembali.");
                }
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const data: Book[] = await res.json(); 
            
            setAllBooks(data);
            setDisplayBooks(data); 

        } catch (err) {
            console.error("Gagal memuat buku:", err);
        }
    };

    // FUNGSI TOGGLE FAVORITE (Tidak berubah)
    const toggleFavorite = async (bookId: number, currentStatus: boolean) => {
        if (!authToken) {
            alert("Anda harus login untuk menambahkan ke favorit.");
            router.push('/login');
            return;
        }

        setAllBooks(prevBooks => 
            prevBooks.map((book: Book) => 
                book.id === bookId ? { ...book, is_favorite: !currentStatus } : book
            )
        );

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/favorites/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({ 
                    bookId: bookId 
                }),
            });

            if (!res.ok) {
                if (res.status === 401) {
                    alert("Sesi berakhir. Silakan login kembali.");
                    router.push('/login');
                }
                throw new Error("Gagal mengubah status favorit di server.");
            }
            
            console.log("Status favorit berhasil diubah.");

        } catch (err) {
            console.error(`Error toggling favorite for ID ${bookId}:`, err);

            setAllBooks(prevBooks => 
                prevBooks.map((book: Book) => 
                    book.id === bookId ? { ...book, is_favorite: currentStatus } : book
                )
            );
        }
    };
    
    // Tampilkan pesan jika belum ada token dan buku tidak dimuat
    if (!authToken && allBooks.length === 0) {
         return <p className="text-center text-red-500 mt-10">
            Akses dibatasi. Silakan login untuk melihat dan mengelola favorit.
        </p>
    }
    
    // Cek apakah ada filter yang aktif
    const hasActiveFilters = selectedCategories.length > 0 || selectedGenres.length > 0;

    return (
        <div>
            {/* Filter Section - Modern & Compact (Tidak berubah) */}
            <div className="mb-6 flex flex-col md:flex-row md:items-start md:justify-between p-3 bg-white shadow-md rounded-xl border border-gray-100">
                
                {/* 1. Tombol Toggle Filter Utama */}
                <button 
                    onClick={() => setFilterOpen(!filterOpen)}
                    className="flex items-center justify-center md:justify-start px-4 py-2 mb-3 md:mb-0 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition text-sm font-medium w-full md:w-auto"
                >
                    <FiFilter className="mr-2 text-base" />
                    {filterOpen ? 'Tutup Filter' : 'Buka Filter'}
                    {filterOpen ? <GoChevronUp className="ml-2" /> : <GoChevronDown className="ml-2" />}
                </button>

                {/* 2. Chip Filter Aktif */}
                <div className="flex flex-wrap gap-2 items-center">
                    {hasActiveFilters && (
                        <span className="text-sm font-semibold text-gray-600 mr-2 hidden sm:inline-block">Filter Aktif:</span>
                    )}
                    {/* Tampilkan Category Chips */}
                    {selectedCategories.map(id => {
                        const category = uniqueCategories.find(c => c.id === id);
                        return category ? (
                            <button
                                key={id}
                                onClick={() => toggleCategoryFilter(category.name)}
                                className="flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full transition hover:bg-blue-200"
                            >
                                {category.name} <FiX className="ml-1.5 text-sm" />
                            </button>
                        ) : null;
                    })}
                    {/* Tampilkan Genre Chips */}
                    {selectedGenres.map(id => {
                        const genre = uniqueGenres.find(g => g.id === id);
                        return genre ? (
                            <button
                                key={id}
                                onClick={() => toggleGenreFilter(genre.name)}
                                className="flex items-center px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full transition hover:bg-purple-200"
                            >
                                {genre.name} <FiX className="ml-1.5 text-sm" />
                            </button>
                        ) : null;
                    })}
                    
                    {/* Tombol Hapus Filter */}
                    {hasActiveFilters && (
                        <button 
                            onClick={() => {
                                setSelectedCategories([]);
                                setSelectedGenres([]);
                            }}
                            className="px-3 py-1 text-xs bg-red-500 text-white rounded-full hover:bg-red-600 transition flex items-center"
                        >
                            Hapus Semua
                        </button>
                    )}
                </div>

                {/* 3. Panel Filter Dropdown/Expanded */}
                {filterOpen && (
                    <div className="mt-4 pt-4 border-t border-gray-200 w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            
                            {/* Category Filter Dropdown/Toggle */}
                            <div>
                                <button 
                                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                    className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                >
                                    Kategori ({selectedCategories.length})
                                    {showCategoryDropdown ? <GoChevronUp /> : <GoChevronDown />}
                                </button>
                                {showCategoryDropdown && (
                                    <div className="mt-2 p-3 border border-gray-200 rounded-lg max-h-40 overflow-y-auto bg-white shadow-inner">
                                        <div className="flex flex-wrap gap-2">
                                            {uniqueCategories.map(category => (
                                                <button
                                                    key={category.id}
                                                    onClick={() => toggleCategoryFilter(category.name)}
                                                    className={`px-3 py-1 text-xs rounded-full transition ${
                                                        selectedCategories.includes(category.id)
                                                            ? 'bg-blue-600 text-white shadow-md'
                                                            : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-600'
                                                    }`}
                                                >
                                                    {category.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Genre Filter Dropdown/Toggle */}
                            <div>
                                <button 
                                    onClick={() => setShowGenreDropdown(!showGenreDropdown)}
                                    className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                >
                                    Genre ({selectedGenres.length})
                                    {showGenreDropdown ? <GoChevronUp /> : <GoChevronDown />}
                                </button>
                                {showGenreDropdown && (
                                    <div className="mt-2 p-3 border border-gray-200 rounded-lg max-h-40 overflow-y-auto bg-white shadow-inner">
                                        <div className="flex flex-wrap gap-2">
                                            {uniqueGenres.map(genre => (
                                                <button
                                                    key={genre.id}
                                                    onClick={() => toggleGenreFilter(genre.name)}
                                                    className={`px-3 py-1 text-xs rounded-full transition ${
                                                        selectedGenres.includes(genre.id)
                                                            ? 'bg-purple-600 text-white shadow-md'
                                                            : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-600'
                                                    }`}
                                                >
                                                    {genre.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Books Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {displayBooks.length === 0 && (
                    <p className="col-span-full text-center text-gray-500 p-10 bg-white rounded-xl shadow-inner">
                        {searchTerm.trim() || hasActiveFilters ? 'Tidak ada buku yang sesuai dengan kriteria.' : 'Memuat buku atau belum ada buku...'}
                    </p>
                )}
                
                {displayBooks.map((book) => (
                <div 
                    key={book.id}
                    className="bg-white shadow-lg rounded-xl transition duration-300 hover:shadow-xl hover:-translate-y-0.5 border border-gray-100"
                >
                    {/* ... (Thumbnail & Cover) ... */}
                    <div className="relative w-full h-[250px] bg-gray-200 rounded-t-xl mb-3 overflow-hidden">
                        
                        {book.cover_image_url ? (
                            <img
                                src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${book.cover_image_url}`} 
                                alt={`Cover buku ${book.title}`}
                                className="w-full h-full object-cover transition duration-300 hover:scale-[1.03]"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                <FiBook className="text-5xl text-gray-400" />
                                <span className="mt-2 text-xs text-gray-500">Cover Tidak Tersedia</span>
                            </div>
                        )}
                        
                        {/* Icon Favorit (Hanya tampil jika ada token) */}
                        {authToken && (
                            <button
                                className="absolute top-3 right-3 p-1.5 rounded-full bg-white bg-opacity-95 hover:bg-opacity-100 transition shadow-lg z-10 border border-gray-200"
                                onClick={(e) => {
                                    e.stopPropagation(); 
                                    toggleFavorite(book.id, book.is_favorite);
                                }}
                                aria-label="Tambahkan ke Favorit"
                            >
                                <FiHeart 
                                    className={`text-xl transition-colors ${
                                        book.is_favorite 
                                        ? 'text-red-600 fill-red-600 animate-pulse' 
                                        : 'text-gray-400 hover:text-red-500' 
                                    }`} 
                                />
                            </button>
                        )}
                    </div>

                    {/* Info Buku - klik untuk detail/baca */}
                    <div 
                        className="cursor-pointer p-4 pb-3" 
                        // Tambahkan trackLastRead saat mengklik area info (opsional, jika ingin dianggap dibaca saat klik)
                        onClick={() => {
                            trackLastRead(book.id); 
                            router.push(`/buku/${book.id}`);
                        }}
                    >
                        <h3 className="text-lg font-extrabold text-gray-900 truncate">{book.title}</h3>
                        <p className="text-sm text-gray-500 truncate">Oleh: {book.author}</p>

                        <div className="mt-3 flex items-center justify-between text-xs">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">
                                {book.category?.name || "Kategori"}
                            </span>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">
                                {book.genre?.name || "Genre"}
                            </span>
                        </div>
                    </div>
                    
                    {/* TOMBOL BACA BUKU */}
                    <div className="p-4 pt-0">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation(); 
                                
                                // Cek apakah user sudah login
                                if (!authToken) {
                                    // Jika belum login, redirect ke login page
                                    router.push('/login');
                                    return;
                                }
                                
                                // PENTING: Panggil trackLastRead di sini saat tombol Baca Buku diklik
                                trackLastRead(book.id); 
                                router.push(`/buku/${book.id}`);
                            }}
                            className="mt-1 text-sm text-white bg-blue-600 w-full py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
                        >
                            {authToken ? 'Baca Buku' : 'Login untuk Membaca'}
                        </button>
                    </div>

                </div>
                ))}
            </div>
        </div>
    )
}

export default BookCard
// app/components/FavoriteBookList.tsx
"use client"

import { useRouter } from 'next/navigation'
import React, { useEffect, useState, useMemo } from 'react' // Tambahkan useMemo
import { FiBook, FiHeart, FiFilter, FiX } from 'react-icons/fi'; // Tambahkan FiX, FiFilter
import { GoChevronDown, GoChevronUp } from 'react-icons/go'; // Ikon dropdown/toggle

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

interface FavoriteBookListProps {
    searchTerm?: string;
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
// ----------------------------------------------------


const FavoriteBookList: React.FC<FavoriteBookListProps> = ({ searchTerm = '' }) => {
    const router = useRouter();
    const [favoriteBooks, setFavoriteBooks] = useState<Book[]>([]); 
    const [displayBooks, setDisplayBooks] = useState<Book[]>([]);
    const [authToken, setAuthToken] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    
    // Gunakan array of string untuk kemudahan filter
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    
    // Filter State
    const [showFilters, setShowFilters] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showGenreDropdown, setShowGenreDropdown] = useState(false);

    useEffect(() => {
        const token = getAuthTokenFromCookie();
        setAuthToken(token);
        
        if (token) {
            fetchFavorites(token);
        } else {
            setIsLoading(false); 
        }
    }, []);

    // Filter berdasarkan search term dan kategori/genre
    useEffect(() => {
        let filtered = favoriteBooks;

        // 1. Filter berdasarkan searchTerm
        if (searchTerm && searchTerm.trim()) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(book =>
                book.title.toLowerCase().includes(lowerSearchTerm) ||
                book.author.toLowerCase().includes(lowerSearchTerm) ||
                book.category?.name.toLowerCase().includes(lowerSearchTerm) ||
                book.genre?.name.toLowerCase().includes(lowerSearchTerm)
            );
        }

        // 2. Filter berdasarkan kategori
        if (selectedCategories.length > 0) {
            filtered = filtered.filter(book =>
                book.category?.name && selectedCategories.includes(book.category.name)
            );
        }

        // 3. Filter berdasarkan genre
        if (selectedGenres.length > 0) {
            filtered = filtered.filter(book =>
                book.genre?.name && selectedGenres.includes(book.genre.name)
            );
        }

        setDisplayBooks(filtered);
    }, [searchTerm, favoriteBooks, selectedCategories, selectedGenres]);

    // FUNGSI UNTUK MENDAPATKAN KATEGORI/GENRE UNIK (UseMemo agar efisien)
    const uniqueCategories = useMemo(() => {
        const categories = new Set<string>();
        favoriteBooks.forEach(book => {
            if (book.category?.name) {
                categories.add(book.category.name);
            }
        });
        return Array.from(categories).sort();
    }, [favoriteBooks]);

    const uniqueGenres = useMemo(() => {
        const genres = new Set<string>();
        favoriteBooks.forEach(book => {
            if (book.genre?.name) {
                genres.add(book.genre.name);
            }
        });
        return Array.from(genres).sort();
    }, [favoriteBooks]);

    const toggleCategoryFilter = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const toggleGenreFilter = (genre: string) => {
        setSelectedGenres(prev =>
            prev.includes(genre)
                ? prev.filter(g => g !== genre)
                : [...prev, genre]
        );
    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setSelectedGenres([]);
    };

    // FUNGSI KHUSUS UNTUK MENGAMBIL DAFTAR FAVORIT
    const fetchFavorites = async (token: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/favorites`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }); 
            
            if (res.status === 401) {
                router.push('/login');
                return;
            }
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const data: Book[] = await res.json();
            
            setFavoriteBooks(data.map(book => ({...book, is_favorite: true}))); 
        } catch (err) {
            console.error("Gagal memuat buku favorit:", err);
        } finally {
            setIsLoading(false);
        }
    };
    
    // FUNGSI UNTUK MENGHAPUS FAVORIT
    const removeFavorite = async (bookId: number) => {
        if (!authToken) return;
        
        // Optimistic UI Update: Hapus buku dari list sebelum API sukses
        const originalBook = favoriteBooks.find(b => b.id === bookId);
        setFavoriteBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/favorites/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({ bookId }), 
            });

            if (!res.ok) {
                throw new Error("Gagal menghapus favorit di server.");
            }

        } catch (err) {
            console.error(`Error removing favorite ID ${bookId}:`, err);
            // Rollback jika gagal
            if (originalBook) {
                setFavoriteBooks(prevBooks => [...prevBooks, originalBook].sort((a, b) => a.id - b.id));
                alert("Gagal menghapus favorit. Silakan coba lagi.");
            } else {
                 fetchFavorites(authToken); 
            }
        }
    };


    if (isLoading) {
        return <p className="col-span-full text-center text-blue-600 mt-10">Memuat daftar favorit...</p>;
    }

    if (!authToken) {
        return <p className="col-span-full text-center text-red-500 mt-10">
            Akses ditolak. Silakan <a href="/login" className="font-bold underline">login</a> untuk melihat daftar favorit Anda.
        </p>;
    }
    
    // Cek apakah ada filter yang aktif
    const hasActiveFilters = selectedCategories.length > 0 || selectedGenres.length > 0;

    return (
        <>
            {/* Filter Section - Modern & Compact */}
            <div className="mb-6 flex flex-col md:flex-row md:items-start md:justify-between p-3 bg-white shadow-md rounded-xl border border-gray-100">
                
                {/* 1. Tombol Toggle Filter Utama */}
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center justify-center md:justify-start px-4 py-2 mb-3 md:mb-0 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition text-sm font-medium w-full md:w-auto"
                >
                    <FiFilter className="mr-2 text-base" />
                    {showFilters ? 'Tutup Filter' : 'Buka Filter'}
                    {showFilters ? <GoChevronUp className="ml-2" /> : <GoChevronDown className="ml-2" />}
                </button>

                {/* 2. Chip Filter Aktif */}
                <div className="flex flex-wrap gap-2 items-center">
                    {hasActiveFilters && (
                        <span className="text-sm font-semibold text-gray-600 mr-2 hidden sm:inline-block">Filter Aktif:</span>
                    )}
                    
                    {/* Tampilkan Category Chips */}
                    {selectedCategories.map(categoryName => (
                        <button
                            key={categoryName}
                            onClick={() => toggleCategoryFilter(categoryName)}
                            className="flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full transition hover:bg-blue-200"
                        >
                            {categoryName} <FiX className="ml-1.5 text-sm" />
                        </button>
                    ))}
                    
                    {/* Tampilkan Genre Chips */}
                    {selectedGenres.map(genreName => (
                        <button
                            key={genreName}
                            onClick={() => toggleGenreFilter(genreName)}
                            className="flex items-center px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full transition hover:bg-purple-200"
                        >
                            {genreName} <FiX className="ml-1.5 text-sm" />
                        </button>
                    ))}
                    
                    {/* Tombol Hapus Filter */}
                    {hasActiveFilters && (
                        <button 
                            onClick={clearFilters}
                            className="px-3 py-1 text-xs bg-red-500 text-white rounded-full hover:bg-red-600 transition flex items-center"
                        >
                            Hapus Semua
                        </button>
                    )}
                </div>

                {/* 3. Panel Filter Dropdown/Expanded */}
                {showFilters && (
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
                                            {uniqueCategories.length > 0 ? (
                                                uniqueCategories.map(category => (
                                                    <button
                                                        key={category}
                                                        onClick={() => toggleCategoryFilter(category)}
                                                        className={`px-3 py-1 text-xs rounded-full transition ${
                                                            selectedCategories.includes(category)
                                                                ? 'bg-blue-600 text-white shadow-md'
                                                                : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-600'
                                                        }`}
                                                    >
                                                        {category}
                                                    </button>
                                                ))
                                            ) : (
                                                <p className="text-xs text-gray-500">Tidak ada kategori</p>
                                            )}
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
                                            {uniqueGenres.length > 0 ? (
                                                uniqueGenres.map(genre => (
                                                    <button
                                                        key={genre}
                                                        onClick={() => toggleGenreFilter(genre)}
                                                        className={`px-3 py-1 text-xs rounded-full transition ${
                                                            selectedGenres.includes(genre)
                                                                ? 'bg-purple-600 text-white shadow-md'
                                                                : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-600'
                                                        }`}
                                                    >
                                                        {genre}
                                                    </button>
                                                ))
                                            ) : (
                                                <p className="text-xs text-gray-500">Tidak ada genre</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* End of Filter Section */}


            {/* Grid Buku */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {displayBooks.length === 0 && (
                    <p className="col-span-full text-center text-gray-500 p-10 bg-white rounded-xl shadow-inner">
                        {searchTerm || hasActiveFilters ? 'Tidak ada buku yang cocok dengan kriteria filter di favorit Anda.' : 'Tidak ada buku di daftar favorit Anda. Tambahkan beberapa!'}
                    </p>
                )}
                
                {displayBooks.map((book) => (
                    <div 
                        key={book.id}
                        className="bg-white shadow-lg rounded-xl transition duration-300 hover:shadow-xl hover:-translate-y-0.5 border border-gray-100"
                    >
                        {/* 🖼️ Thumbnail Cover dengan Tombol HAPUS Favorit */}
                        <div className="relative w-full h-[250px] bg-gray-200 rounded-t-xl mb-3 overflow-hidden">
                            
                            {/* Logika Tampilan Cover */}
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
                            
                            {/* Tombol HAPUS Favorit */}
                            <button
                                className="absolute top-3 right-3 p-1.5 rounded-full bg-white bg-opacity-95 hover:bg-opacity-100 transition shadow-lg z-10 border border-gray-200"
                                onClick={(e) => {
                                    e.stopPropagation(); 
                                    removeFavorite(book.id); // Panggil fungsi penghapusan
                                }}
                                aria-label="Hapus dari Favorit"
                            >
                                {/* Ikon merah terisi yang menandakan HAPUS */}
                                <FiHeart className="text-xl text-red-600 fill-red-600 hover:text-red-800 transition" />
                            </button>
                        </div>

                        {/* Info Buku - klik untuk detail/baca */}
                        <div 
                            className="cursor-pointer p-4 pb-3" 
                            onClick={() => router.push(`/buku/${book.id}`)}
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
                                    router.push(`/buku/${book.id}`);
                                }}
                                className="mt-1 text-sm text-white bg-blue-600 w-full py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
                            >
                                Baca Buku
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}

export default FavoriteBookList;
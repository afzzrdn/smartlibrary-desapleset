// app/components/LastReadSection.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { FiBook, FiHeart } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

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

interface LastReadSectionProps {
    bookIds: number[];
}

// Utilitas untuk mengambil token (Salinan dari file Anda)
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

// --- Utilitas untuk Mencatat Buku Terakhir Dibaca ke LocalStorage (Diperlukan saat Baca Lagi) ---
const trackLastRead = (bookId: number) => {
    if (typeof window === 'undefined') return;

    interface LastReadItem { id: number; readAt: number; }
    const newReadItem: LastReadItem = { id: bookId, readAt: Date.now() };
    const maxItems = 10; 

    try {
        const storedItems = localStorage.getItem("last_read_books");
        let items: LastReadItem[] = storedItems ? JSON.parse(storedItems) : [];
        items = items.filter(item => item.id !== bookId);
        items.unshift(newReadItem);
        localStorage.setItem("last_read_books", JSON.stringify(items.slice(0, maxItems)));
    } catch (error) {
        console.error("Gagal menyimpan Last Read ke localStorage:", error);
    }
};


const LastReadSection: React.FC<LastReadSectionProps> = ({ bookIds }) => {
    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (bookIds.length > 0) {
            fetchLastReadBooks();
        } else {
            setBooks([]);
            setIsLoading(false); // Penting untuk menghentikan loading jika bookIds kosong
        }
    }, [bookIds]);

    const fetchLastReadBooks = async () => {
        setIsLoading(true);
        const token = getAuthTokenFromCookie();
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const idsQuery = bookIds.join(',');
            // Memanggil API dengan daftar ID
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/books/by-ids?ids=${idsQuery}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            
            if (res.ok) {
                const data: Book[] = await res.json();
                
                // Urutkan data yang diterima sesuai dengan urutan bookIds dari localStorage (terbaru ke terlama)
                const sortedData = bookIds
                    .map(id => data.find(book => book.id === id))
                    .filter((b): b is Book => !!b);
                    
                setBooks(sortedData);
            } else {
                 // Gagal fetch, set books kosong
                setBooks([]);
                console.error("Gagal mengambil detail buku terakhir dibaca:", res.statusText);
            }
        } catch (error) {
            setBooks([]);
            console.error("Error fetching last read books:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReadAgain = (bookId: number) => {
        // Catat sebagai "Terakhir Dibaca" terbaru
        trackLastRead(bookId); 
        // Arahkan ke halaman detail buku
        router.push(`/buku/${bookId}`);
    }


    if (isLoading) {
        // Tampilan loading modern
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {[...Array(bookIds.length || 4)].map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-xl shadow-md p-4 animate-pulse">
                        <div className="w-full h-[200px] bg-gray-200 rounded-lg mb-3"></div>
                        <div className="h-4 bg-gray-200 w-3/4 mb-2 rounded"></div>
                        <div className="h-3 bg-gray-200 w-1/2 mb-4 rounded"></div>
                        <div className="h-8 bg-blue-200 w-full rounded-lg"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (books.length === 0) {
        return (
            <p className="text-gray-500 mt-2 p-5 bg-gray-50 rounded-xl shadow-inner text-center border border-gray-200">
                Belum ada riwayat buku yang dibaca. Mulai baca buku sekarang!
            </p>
        );
    }

    // Tampilan Grid dengan desain yang konsisten
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {books.map((book) => (
                <div 
                    key={book.id}
                    className="bg-white shadow-lg rounded-xl transition duration-300 hover:shadow-xl hover:translate-y-[-2px] border border-gray-100"
                >
                    <div 
                        className="relative w-full h-[250px] bg-gray-200 rounded-t-xl mb-3 overflow-hidden cursor-pointer"
                        onClick={() => handleReadAgain(book.id)} // Klik cover juga Baca Lagi
                    >
                        {/* Tampilkan Cover */}
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
                        
                        {/* Tag Penanda "Terakhir Dibaca" */}
                        <span className="absolute top-3 left-3 px-3 py-1 text-xs bg-green-500 text-white font-semibold rounded-full shadow-md">
                            Terakhir Dibaca
                        </span>
                    </div>

                    {/* Info Buku - klik untuk detail/baca */}
                    <div 
                        className="cursor-pointer p-4 pb-3" 
                        onClick={() => handleReadAgain(book.id)}
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
                                handleReadAgain(book.id); // Panggil fungsi aksi
                            }}
                            className="mt-1 text-sm text-white bg-blue-600 w-full py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
                        >
                            Baca Lagi
                        </button>
                    </div>

                </div>
            ))}
        </div>
    );
};

export default LastReadSection;
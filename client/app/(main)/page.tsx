"use client";
import Image from "next/image";
import BookCard from "../components/BookCard";
import { useSearch } from "./layout";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import LastReadSection from "../components/LastReadSection";

// Definisikan tipe untuk item yang tersimpan di localStorage
interface LastReadItem {
  id: number;
  readAt: number; // Timestamp untuk pengurutan
}

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

export default function Home() {
  const { searchTerm } = useSearch();
  const { isLoggedIn } = useAuth(); // Ambil status login dari AuthContext
  const [lastReadBookIds, setLastReadBookIds] = useState<number[]>([]);

  // 1. Ambil ID Buku Terakhir Dibaca dari LocalStorage saat komponen dimuat
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const storedItems = localStorage.getItem("last_read_books");
        if (storedItems) {
          const items: LastReadItem[] = JSON.parse(storedItems);
          // Urutkan berdasarkan waktu terakhir dibaca (terbaru di depan)
          items.sort((a, b) => b.readAt - a.readAt); 
          // Ambil ID dari 4 buku terakhir
          setLastReadBookIds(items.slice(0, 4).map(item => item.id));
        }
      }
    } catch (error) {
      console.error("Gagal memuat Last Read dari localStorage:", error);
    }
  }, []);

  // Tentukan apakah bagian Last Read perlu ditampilkan
  // Hanya ditampilkan jika: user sudah login, tidak sedang mencari, dan ada buku yang pernah dibaca
  const shouldShowLastRead = isLoggedIn && !searchTerm && lastReadBookIds.length > 0;

  return (
        <main className="bg-white rounded-b-xl lg:h-[87.5vh] h-auto p-6 lg:p-10 overflow-y-auto">
          
          {shouldShowLastRead && (
            <>
              {/* 📗 Section: Terakhir Dibaca */}
              <h2 className="text-xl lg:text-2xl font-bold mb-5 text-gray-800">
                Terakhir Dibaca
              </h2>
              
              {/* Asumsi: LastReadSection akan mengambil detail buku berdasarkan lastReadBookIds. 
                Untuk menghindari fetch ganda, Anda bisa meneruskan BookCard, tapi 
                lebih bersih jika ini adalah komponen mandiri yang tahu cara menampilkan dirinya.
              */}
              <LastReadSection bookIds={lastReadBookIds} /> 
              
              <hr className="my-8 border-gray-200" />
            </>
          )}

          {/* 📚 Section: Semua Buku / Hasil Pencarian */}
          <h2 className="text-xl lg:text-2xl font-bold mb-5 text-gray-800">
            {searchTerm ? 'Hasil Pencarian' : 'Semua Buku'}
          </h2>
          
          <BookCard searchTerm={searchTerm} />
        </main>
  );
}
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
// Impor ikon yang diperlukan dari lucide-react
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"; 

// --- Impor Tipe PDF.js ---
// Impor tipe untuk objek dokumen PDF agar TypeScript tidak error 'implicitly has an any type'
import type { PDFDocumentProxy } from "pdfjs-dist"; 
// -------------------------

// Tipe untuk menampung referensi objek PDF yang dimuat
type PdfReference = PDFDocumentProxy | null;

export default function PDFViewer({ fileUrl }: { fileUrl: string }) {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  
  // State untuk melacak halaman saat ini, total halaman, dan status loading
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk menyimpan referensi dokumen PDF yang dimuat
  const [pdfDoc, setPdfDoc] = useState<PdfReference>(null);

  // Fungsi untuk merender halaman spesifik ke container
  const renderPage = useCallback(async (
    pdf: PDFDocumentProxy, 
    pageNum: number, 
    container: HTMLDivElement
  ) => {
    container.innerHTML = ""; // Bersihkan container
    setIsLoading(true);

    try {
      const page = await pdf.getPage(pageNum);
      
      // Menggunakan scale 1.0 (ukuran asli)
      const viewport = page.getViewport({ scale: 1.0 });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      
      // Dimensi rendering (sesuai viewport)
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Gaya tampilan (memastikan canvas mengisi lebar container)
      canvas.style.width = '55vw';
      canvas.style.height = 'auto';
      canvas.className = "shadow-xl mx-auto block"; 

      await page.render({
        canvasContext: context,
        canvas: canvas, // Perbaikan TypeScript
        viewport,
      }).promise;

      container.appendChild(canvas);
      container.scrollTop = 0; // Kembali ke atas halaman
      
    } catch (error) {
      console.error("Gagal merender halaman:", error);
    } finally {
      setIsLoading(false);
    }
  }, []); // Dependensi kosong

  
  // Efek 1: Memuat Dokumen PDF Awal
  useEffect(() => {
    // Keluar jika di server (SSR Guard)
    if (typeof window === "undefined") return;

    const loadPdf = async () => {
        setIsLoading(true);

        try {
            // Import pdfjs-dist secara dinamis (mengatasi DOMMatrix error)
            const pdfjsLib = await import("pdfjs-dist");
            // Mengatur WorkerSrc ke file lokal (mengatasi 404 error)
            pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf-workers/pdf.worker.min.mjs`;

            const loadingTask = pdfjsLib.getDocument(fileUrl);
            const loadedPdf = await loadingTask.promise;
            
            setPdfDoc(loadedPdf);
            setNumPages(loadedPdf.numPages);
            setCurrentPage(1); // Mulai dari halaman 1
            
        } catch (error) {
            console.error("Gagal memuat dokumen PDF:", error);
            setPdfDoc(null);
            setNumPages(0);
            setIsLoading(false);
        }
    };

    loadPdf();
    
    // Cleanup: Menghancurkan dokumen PDF jika komponen di-unmount
    return () => {
        if (pdfDoc) {
            pdfDoc.destroy();
        }
    };
  // Dependensi: Memuat ulang jika fileUrl berubah
  }, [fileUrl]); 

  
  // Efek 2: Merender Halaman Saat pdfDoc atau currentPage Berubah
  useEffect(() => {
    const container = viewerRef.current;
    
    // Hanya render jika dokumen dan container sudah siap, dan halaman ada
    if (!pdfDoc || !container || currentPage < 1 || currentPage > numPages) {
        return;
    }

    renderPage(pdfDoc, currentPage, container);

  // Dependensi: renderPage, pdfDoc, currentPage, numPages
  }, [pdfDoc, currentPage, numPages, renderPage]); 


  // --- Fungsi Navigasi ---
  const goToNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // --- Tampilan Komponen ---
  return (
    <div className="flex flex-col items-center">
      
      {/* Kontrol Navigasi */}
      <div className="flex justify-between items-center w-full max-w-[80vw] p-2 bg-white shadow-md rounded-t-lg">
        <button
          onClick={goToPrevPage}
          disabled={currentPage <= 1 || isLoading || numPages === 0}
          className="p-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <span className="text-sm font-medium flex items-center">
          {isLoading && numPages > 0 ? (
             <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span>Memuat Halaman {currentPage}...</span>
             </>
          ) : (
            <>Halaman {currentPage} dari {numPages}</>
          )}
        </span>
        
        <button
          onClick={goToNextPage}
          disabled={currentPage >= numPages || isLoading || numPages === 0}
          className="p-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Kontainer untuk Canvas Halaman Tunggal */}
      <div
        // Menggunakan max-w-4xl agar tampilan PDF terpusat dan memiliki lebar maksimum
        className="w-full max-w-[80vw] h-[81vh] overflow-auto bg-gray-100 p-4 shadow-2xl rounded-b-lg"
        ref={viewerRef}
      >
        {/* Pesan saat gagal memuat dokumen */}
        {numPages === 0 && !isLoading && (
          <p className="text-center text-gray-500 mt-10">Gagal memuat atau dokumen PDF kosong.</p>
        )}
      </div>
    </div>
  );
}
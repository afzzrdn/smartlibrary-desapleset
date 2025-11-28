"use client";

import { useEffect, useRef, useState, useCallback } from "react";
// Impor ikon yang diperlukan dari lucide-react
import { ChevronLeft, ChevronRight, Loader2, Download, ZoomIn, ZoomOut } from "lucide-react"; 

// --- Impor Tipe PDF.js ---
// Impor tipe untuk objek dokumen PDF agar TypeScript tidak error 'implicitly has an any type'
import type { PDFDocumentProxy } from "pdfjs-dist"; 
// -------------------------

// Tipe untuk menampung referensi objek PDF yang dimuat
type PdfReference = PDFDocumentProxy | null;

export default function PDFViewer({ fileUrl }: { fileUrl: string }) {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const pdfNameRef = useRef<string>("");
  
  // State untuk melacak halaman saat ini, total halaman, dan status loading
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1.0);
  const [jumpPageInput, setJumpPageInput] = useState<string>('');
  
  // State untuk menyimpan referensi dokumen PDF yang dimuat
  const [pdfDoc, setPdfDoc] = useState<PdfReference>(null);

  // Fungsi untuk merender halaman spesifik ke container dengan scale
  const renderPage = useCallback(async (
    pdf: PDFDocumentProxy, 
    pageNum: number, 
    container: HTMLDivElement,
    zoomScale: number
  ) => {
    container.innerHTML = ""; // Bersihkan container
    setIsLoading(true);

    try {
      const page = await pdf.getPage(pageNum);
      
      // Menggunakan scale yang diberikan (default 1.0)
      const viewport = page.getViewport({ scale: zoomScale });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      
      // Dimensi rendering (sesuai viewport)
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Gaya tampilan (memastikan canvas mengisi lebar container)
      canvas.style.width = 'auto';
      canvas.style.height = 'auto';
      canvas.style.maxWidth = '100%';
      canvas.className = "shadow-xl mx-auto block"; 

      await page.render({
        canvasContext: context,
        canvas: canvas,
        viewport,
      }).promise;

      container.appendChild(canvas);
      container.scrollTop = 0; // Kembali ke atas halaman
      
    } catch (error) {
      console.error("Gagal merender halaman:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  
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
            
            // Extract nama file dari URL
            const urlParts = fileUrl.split('/');
            const fileName = urlParts[urlParts.length - 1];
            pdfNameRef.current = fileName || 'document.pdf';
            
            setPdfDoc(loadedPdf);
            setNumPages(loadedPdf.numPages);
            setCurrentPage(1); // Mulai dari halaman 1
            setScale(1.0); // Reset zoom saat dokumen baru dimuat
            
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
  }, [fileUrl]); 

  
  // Efek 2: Merender Halaman Saat pdfDoc, currentPage, atau scale Berubah
  useEffect(() => {
    const container = viewerRef.current;
    
    // Hanya render jika dokumen dan container sudah siap, dan halaman ada
    if (!pdfDoc || !container || currentPage < 1 || currentPage > numPages) {
        return;
    }

    renderPage(pdfDoc, currentPage, container, scale);

  }, [pdfDoc, currentPage, numPages, renderPage, scale]); 


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

  // --- Fungsi Zoom ---
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 2.5)); // Max zoom 2.5x
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5)); // Min zoom 0.5x
  };

  const handleResetZoom = () => {
    setScale(1.0);
  };

  // --- Fungsi Jump Page ---
  const handleJumpPage = () => {
    const pageNum = parseInt(jumpPageInput, 10);
    if (isNaN(pageNum) || pageNum < 1 || pageNum > numPages) {
      alert(`Halaman harus antara 1 dan ${numPages}`);
      return;
    }
    setCurrentPage(pageNum);
    setJumpPageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJumpPage();
    }
  };

  // --- Fungsi Download ---
  const handleDownload = async () => {
    try {
      // Fetch file dari URL
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      
      // Buat URL download
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = pdfNameRef.current || 'document.pdf';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Gagal mengunduh file:", error);
      alert("Gagal mengunduh file. Silakan coba lagi.");
    }
  };
  
  // --- Tampilan Komponen ---
  return (
    <div className="flex flex-col items-center">
      
      {/* Kontrol Navigasi & Toolbar */}
      <div className="flex justify-between items-center w-full max-w-[90vw] p-2 bg-white shadow-md rounded-t-lg gap-2 flex-wrap">
        {/* Navigation Buttons */}
        <div className="flex gap-1">
          <button
            onClick={goToPrevPage}
            disabled={currentPage <= 1 || isLoading || numPages === 0}
            className="p-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 transition"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={goToNextPage}
            disabled={currentPage >= numPages || isLoading || numPages === 0}
            className="p-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 transition"
            title="Halaman Berikutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Page Info */}
        <span className="text-sm font-medium flex items-center min-w-fit gap-2">
          {isLoading && numPages > 0 ? (
             <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span>Memuat Halaman {currentPage}...</span>
             </>
          ) : (
            <>Halaman {currentPage} dari {numPages}</>
          )}
          
          {/* Jump Page Input */}
          {numPages > 0 && (
            <div className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-300">
              <input
                type="number"
                min="1"
                max={numPages}
                value={jumpPageInput}
                onChange={(e) => setJumpPageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Lompat..."
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Masukkan nomor halaman dan tekan Enter"
              />
              <button
                onClick={handleJumpPage}
                disabled={!jumpPageInput || isLoading}
                className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50 transition text-xs font-medium"
                title="Lompat ke halaman"
              >
                Go
              </button>
            </div>
          )}
        </span>

        {/* Zoom Controls */}
        <div className="flex gap-1 items-center">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.5 || isLoading || numPages === 0}
            className="p-2 bg-blue-200 hover:bg-blue-300 rounded disabled:opacity-50 transition"
            title="Perkecil (Zoom Out)"
          >
            <ZoomOut className="w-5 h-5 text-blue-600" />
          </button>

          <span className="text-sm font-medium w-12 text-center">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            disabled={scale >= 2.5 || isLoading || numPages === 0}
            className="p-2 bg-blue-200 hover:bg-blue-300 rounded disabled:opacity-50 transition"
            title="Perbesar (Zoom In)"
          >
            <ZoomIn className="w-5 h-5 text-blue-600" />
          </button>

          <button
            onClick={handleResetZoom}
            disabled={scale === 1.0 || isLoading || numPages === 0}
            className="p-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 transition text-xs"
            title="Reset Zoom ke 100%"
          >
            100%
          </button>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={isLoading || numPages === 0}
          className="p-2 bg-green-200 hover:bg-green-300 rounded disabled:opacity-50 transition flex items-center gap-2"
          title="Unduh PDF"
        >
          <Download className="w-5 h-5 text-green-600" />
          <span className="text-xs font-medium hidden sm:inline">Unduh</span>
        </button>
      </div>

      {/* Kontainer untuk Canvas Halaman Tunggal */}
      <div
        className="w-full max-w-[90vw] h-[81vh] overflow-auto bg-gray-100 p-4 shadow-2xl rounded-b-lg"
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
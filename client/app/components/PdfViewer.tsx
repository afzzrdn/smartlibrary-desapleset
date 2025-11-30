"use client";

import { useEffect, useRef, useState, useCallback } from "react";
// Impor ikon yang diperlukan dari lucide-react
import { ChevronLeft, ChevronRight, Loader2, Download, ZoomIn, ZoomOut, List, Grid3x3 } from "lucide-react"; 

// --- Impor Tipe PDF.js ---
// Impor tipe untuk objek dokumen PDF agar TypeScript tidak error 'implicitly has an any type'
import type { PDFDocumentProxy } from "pdfjs-dist"; 
// -------------------------

// Tipe untuk menampung referensi objek PDF yang dimuat
type PdfReference = PDFDocumentProxy | null;

// Tipe untuk cache halaman yang sudah di-render
type PageCache = {
  [key: string]: HTMLCanvasElement;
};

// Tipe mode tampilan
type ViewMode = 'slide' | 'scroll';

export default function PDFViewer({ fileUrl }: { fileUrl: string }) {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const pdfNameRef = useRef<string>("");
  const pageCacheRef = useRef<PageCache>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // State untuk melacak halaman saat ini, total halaman, dan status loading
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1.0);
  const [jumpPageInput, setJumpPageInput] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('slide');
  
  // State untuk menyimpan referensi dokumen PDF yang dimuat
  const [pdfDoc, setPdfDoc] = useState<PdfReference>(null);
  
  // Efek untuk deteksi mobile dan set default view mode
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // Breakpoint md
      setIsMobile(mobile);
      // Set view mode ke scroll otomatis jika mobile
      if (mobile && viewMode !== 'scroll') {
        setViewMode('scroll');
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [viewMode]);

  // Fungsi untuk merender halaman spesifik ke container dengan scale
  // Menggunakan cache untuk mencegah rendering ulang
  const renderPage = useCallback(async (
    pdf: PDFDocumentProxy, 
    pageNum: number, 
    container: HTMLDivElement,
    zoomScale: number
  ) => {
    container.innerHTML = ""; // Bersihkan container
    setIsLoading(true);

    try {
      // Cek cache terlebih dahulu
      const cacheKey = `${pageNum}-${Math.round(zoomScale * 100)}`;
      if (pageCacheRef.current[cacheKey]) {
        const cachedCanvas = pageCacheRef.current[cacheKey] as HTMLCanvasElement;
        // Append langsung canvas yang sudah di-cache
        container.appendChild(cachedCanvas);
        container.scrollTop = 0;
        setIsLoading(false);
        return;
      }

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

      // Simpan ke cache
      pageCacheRef.current[cacheKey] = canvas;

      container.appendChild(canvas);
      container.scrollTop = 0; // Kembali ke atas halaman
      
    } catch (error) {
      console.error("Gagal merender halaman:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fungsi untuk merender semua halaman dalam container scroll (dengan lazy loading)
  const renderAllPages = useCallback(async (
    pdf: PDFDocumentProxy,
    container: HTMLDivElement,
    zoomScale: number
  ) => {
    container.innerHTML = ""; // Bersihkan container
    setIsLoading(true);

    try {
      // Render 3 halaman pertama terlebih dahulu
      const initialPages = 3;
      const totalPages = pdf.numPages;
      
      for (let pageNum = 1; pageNum <= Math.min(initialPages, totalPages); pageNum++) {
        const cacheKey = `${pageNum}-${Math.round(zoomScale * 100)}`;
        
        // Buat container untuk setiap halaman
        const pageContainer = document.createElement('div');
        pageContainer.className = 'mb-4 pb-4 border-b border-gray-300';
        pageContainer.id = `page-${pageNum}`;
        
        // Cek cache terlebih dahulu
        if (pageCacheRef.current[cacheKey]) {
          const cachedCanvas = pageCacheRef.current[cacheKey] as HTMLCanvasElement;
          pageContainer.appendChild(cachedCanvas);
        } else {
          try {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: zoomScale });
            
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;
            
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            canvas.style.width = 'auto';
            canvas.style.height = 'auto';
            canvas.style.maxWidth = '100%';
            canvas.className = "shadow-lg mx-auto block";
            
            await page.render({
              canvasContext: context,
              canvas: canvas,
              viewport,
            }).promise;
            
            pageCacheRef.current[cacheKey] = canvas;
            pageContainer.appendChild(canvas);
          } catch (error) {
            console.error(`Gagal render halaman ${pageNum}:`, error);
          }
        }
        
        container.appendChild(pageContainer);
      }
      
      // Lazy load halaman berikutnya
      for (let pageNum = initialPages + 1; pageNum <= totalPages; pageNum++) {
        const cacheKey = `${pageNum}-${Math.round(zoomScale * 100)}`;
        
        const pageContainer = document.createElement('div');
        pageContainer.className = 'mb-4 pb-4 border-b border-gray-300';
        pageContainer.id = `page-${pageNum}`;
        pageContainer.setAttribute('data-page', String(pageNum));
        
        // Placeholder untuk lazy load
        const placeholder = document.createElement('div');
        placeholder.className = 'h-96 bg-gray-200 rounded flex items-center justify-center';
        placeholder.textContent = `Halaman ${pageNum}...`;
        pageContainer.appendChild(placeholder);
        
        container.appendChild(pageContainer);
      }
      
      setNumPages(pdf.numPages);
      setCurrentPage(1);
      
      // Cleanup observer sebelumnya jika ada
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      // Setup intersection observer untuk lazy load
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting) {
            const pageContainer = entry.target as HTMLDivElement;
            const pageNum = parseInt(pageContainer.getAttribute('data-page') || '0');
            
            if (pageNum > 0 && pageContainer.children.length === 1 && pageContainer.children[0].classList.contains('bg-gray-200')) {
              // Render halaman ini
              const cacheKey = `${pageNum}-${Math.round(zoomScale * 100)}`;
              
              try {
                const page = await pdf.getPage(pageNum);
                const viewport = page.getViewport({ scale: zoomScale });
                
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d")!;
                
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                
                canvas.style.width = 'auto';
                canvas.style.height = 'auto';
                canvas.style.maxWidth = '100%';
                canvas.className = "shadow-lg mx-auto block";
                
                await page.render({
                  canvasContext: context,
                  canvas: canvas,
                  viewport,
                }).promise;
                
                pageCacheRef.current[cacheKey] = canvas;
                pageContainer.innerHTML = '';
                pageContainer.appendChild(canvas);
                
                observer.unobserve(pageContainer);
              } catch (error) {
                console.error(`Gagal lazy load halaman ${pageNum}:`, error);
              }
            }
          }
        });
      }, { rootMargin: '500px' });
      
      // Store observer ref untuk cleanup nanti
      observerRef.current = observer;
      
      // Observe placeholder containers
      document.querySelectorAll('[data-page]').forEach(el => observer.observe(el));
      
    } catch (error) {
      console.error("Gagal merender semua halaman:", error);
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
        // Clear cache untuk menghemat memori
        pageCacheRef.current = {};
    };
  }, [fileUrl]); 

  
  // Efek 2: Merender Halaman Saat pdfDoc, currentPage, scale, atau viewMode Berubah
  useEffect(() => {
    const container = viewerRef.current;
    
    // Hanya render jika dokumen dan container sudah siap
    if (!pdfDoc || !container) {
        return;
    }

    if (viewMode === 'scroll') {
      // Mode scroll: render semua halaman
      renderAllPages(pdfDoc, container, scale);
    } else {
      // Mode slide: cleanup observer dan render halaman saat ini
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      
      if (currentPage < 1 || currentPage > numPages) {
        return;
      }
      renderPage(pdfDoc, currentPage, container, scale);
    }

    // Cleanup: Disconnect observers saat unmount atau mode berubah
    return () => {
      if (observerRef.current && viewMode === 'scroll') {
        observerRef.current.disconnect();
      }
    };

  }, [pdfDoc, currentPage, numPages, renderPage, renderAllPages, scale, viewMode]); 


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
      <div className="flex justify-between items-center w-full max-w-[90vw] p-2 bg-white shadow-md gap-2 flex-wrap">
        {/* Navigation Buttons - Hanya tampil saat Slide Mode */}
        {viewMode === 'slide' && (
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
        )}

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
            disabled={scale <= 0.5 || isLoading || numPages === 0 || viewMode === 'scroll'}
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
            disabled={scale >= 2.5 || isLoading || numPages === 0 || viewMode === 'scroll'}
            className="p-2 bg-blue-200 hover:bg-blue-300 rounded disabled:opacity-50 transition"
            title="Perbesar (Zoom In)"
          >
            <ZoomIn className="w-5 h-5 text-blue-600" />
          </button>

          <button
            onClick={handleResetZoom}
            disabled={scale === 1.0 || isLoading || numPages === 0 || viewMode === 'scroll'}
            className="p-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 transition text-xs"
            title="Reset Zoom ke 100%"
          >
            100%
          </button>
        </div>

        {/* View Mode Toggle - Tampil di semua mode */}
        <div className="flex gap-1 items-center border-l border-gray-300 pl-2 ml-2">
          <button
            onClick={() => setViewMode('slide')}
            disabled={isLoading || numPages === 0}
            className={`p-2 rounded transition ${
              viewMode === 'slide'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
            title="Slide Mode - Lihat satu halaman per satu"
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('scroll')}
            disabled={isLoading || numPages === 0}
            className={`p-2 rounded transition ${
              viewMode === 'scroll'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
            title="Scroll Mode - Lihat semua halaman dengan scroll"
          >
            <List className="w-5 h-5" />
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

      {/* Kontainer untuk Canvas */}
      <div
        className="w-full max-w-[90vw] bg-gray-100 p-4 shadow-2xl rounded-b-lg"
        ref={viewerRef}
        style={{
          height: viewMode === 'scroll' ? 'auto' : '81vh',
          maxHeight: viewMode === 'scroll' ? 'calc(100vh - 200px)' : '81vh',
          overflowY: 'auto'
        }}
      >
        {/* Pesan saat gagal memuat dokumen */}
        {numPages === 0 && !isLoading && (
          <p className="text-center text-gray-500 mt-10">Gagal memuat atau dokumen PDF kosong.</p>
        )}
      </div>
    </div>
  );
}
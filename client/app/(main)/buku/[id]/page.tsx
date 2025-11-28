import PDFViewer from "@/app/components/PdfViewer";

// app/buku/[id]/page.tsx
export default async function BookReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // ← WAJIB! Karena Next.js 15 params = Promise

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/books/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return <div className="p-10 text-red-600">Gagal mengambil detail buku.</div>;
  }

  const book = await res.json();

  return <PDFViewer fileUrl={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${book.file_url}`} />;
}

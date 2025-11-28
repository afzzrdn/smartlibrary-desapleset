"use client";
import React from 'react'
import BookCard from '../../components/BookCard'
import { useSearch } from '../layout'

const page = () => {
  const { searchTerm } = useSearch();

  return (
    <main className="bg-white rounded-b-xl h-[87.5vh] p-10 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-5">
        {searchTerm ? 'Hasil Pencarian - Daftar Buku' : 'Daftar Buku'}
      </h2>
      <BookCard searchTerm={searchTerm} />
    </main>
  )
}

export default page
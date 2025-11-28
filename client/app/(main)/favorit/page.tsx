"use client";
import FavoriteBookList from '@/app/components/FavoriteBook'
import React from 'react'
import { useSearch } from '../layout'

const FavoritPage = () => {
  const { searchTerm } = useSearch();

  return (
    <main className="bg-white rounded-b-xl h-[87.5vh] p-10 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-5">
        {searchTerm ? 'Hasil Pencarian - Buku Favorit' : 'Buku Favorit'}
      </h2>
      <FavoriteBookList searchTerm={searchTerm} /> 
    </main>
  )
}

export default FavoritPage
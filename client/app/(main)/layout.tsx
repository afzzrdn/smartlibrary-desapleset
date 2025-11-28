"use client";
import React, { createContext, useContext, useState } from 'react';
import Sidebar from "../components/Sidebar"; 
import Navbar from "../components/Navbar"; 

// Create SearchContext
export const SearchContext = createContext<{
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}>({
  searchTerm: '',
  setSearchTerm: () => {},
});

export const useSearch = () => useContext(SearchContext);

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSearch = (term: string) => {
    console.log('Search term from Navbar:', term);
    setSearchTerm(term);
  };

  return (
    // Struktur layout lama Anda yang memiliki sidebar dan navbar publik
    <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>
      <div className="grid grid-cols-[300px_1fr] gap-5 mx-[1vw] my-[1vw] max-h-screen max-w-screen">
        <Sidebar /> {/* Sidebar Publik */}
        <div className="grid grid-rows-[5vw_1fr] w-full">
          <Navbar onSearch={handleSearch} /> {/* Navbar Publik */}
          {children}
        </div>
      </div>
    </SearchContext.Provider>
  );
}
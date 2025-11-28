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

// Create FilterContext
export const FilterContext = createContext<{
  filterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
}>({
  filterOpen: false,
  setFilterOpen: () => {},
});

export const useSearch = () => useContext(SearchContext);
export const useFilter = () => useContext(FilterContext);

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const handleSearch = (term: string) => {
    console.log('Search term from Navbar:', term);
    setSearchTerm(term);
  };

  const handleFilterClick = () => {
    setFilterOpen(!filterOpen);
  };

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>
      <FilterContext.Provider value={{ filterOpen, setFilterOpen }}>
        {/* Desktop Layout */}
        <div className="hidden lg:grid grid-cols-[300px_1fr] gap-5 mx-[1vw] my-[1vw] max-h-screen max-w-screen">
          <Sidebar /> 
          <div className="grid grid-rows-[5vw_1fr] w-full">
            <Navbar onSearch={handleSearch} onFilterClick={handleFilterClick} /> 
            {children}
          </div>
        </div>

        {/* Tablet & Mobile Layout */}
        <div className="lg:hidden flex flex-col h-screen max-h-screen">
          <Navbar onSearch={handleSearch} onMenuClick={() => setSidebarOpen(!sidebarOpen)} onFilterClick={handleFilterClick} /> 
          <div className="flex flex-1 overflow-hidden">
            {/* Mobile Sidebar - Collapsible */}
            <div className={`fixed inset-y-0 left-0 w-64 transform transition-transform duration-300 z-40 lg:relative lg:w-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>
            
            {/* Overlay untuk mobile sidebar */}
            {sidebarOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}
            
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </div>
        </div>
      </FilterContext.Provider>
    </SearchContext.Provider>
  );
}
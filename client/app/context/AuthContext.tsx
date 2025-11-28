// src/context/AuthContext.tsx

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

// --- Tipe Data ---

// Sesuaikan dengan data user dari backend Anda
interface User {
  id: number;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isHydrated: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  api: AxiosInstance; // Instance Axios yang terautentikasi
}

// --- Inisialisasi ---

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// --- Provider ---

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Create api instance once - DON'T recreate it
  const apiRef = React.useRef<AxiosInstance | null>(null);

  if (!apiRef.current) {
    apiRef.current = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  const api = apiRef.current;

  // Load token dari cookie saat component mount (hanya di client)
  useEffect(() => {
    let storedToken = Cookies.get('auth_token');
    console.log('Loading token from cookie:', storedToken ? '✓ Token found' : '✗ No token');
    
    // Fallback: jika tidak ada di cookie, coba cek localStorage (untuk backward compatibility)
    if (!storedToken) {
      const localToken = localStorage.getItem('auth_token');
      if (localToken) {
        console.log('Found token in localStorage, syncing to cookie');
        storedToken = localToken;
        Cookies.set('auth_token', localToken, { expires: 7 });
      }
    }
    
    if (storedToken) {
      setToken(storedToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      console.log('Authorization header set:', api.defaults.headers.common['Authorization']);
    } else {
      console.log('No token found in cookie or localStorage');
    }
    
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        console.log('User loaded from localStorage');
      } catch (error) {
        console.error("Gagal parse data user dari localStorage:", error);
        localStorage.removeItem('user');
      }
    }
    
    setIsHydrated(true);
  }, [api]);

  // Update header saat token berubah
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token, api]);


  const login = (newToken: string, userData: User) => {
    console.log('Login called with token:', newToken);
    
    Cookies.set('auth_token', newToken, { expires: 7 });
    localStorage.setItem('auth_token', newToken); // Backup di localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Set authorization header immediately
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    console.log('Authorization header set immediately:', api.defaults.headers.common['Authorization']);
    
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    console.log('Logging out: Clearing cookies, localStorage, and authorization header');
    
    // 1. Hapus dari cookies
    Cookies.remove('auth_token');
    
    // 2. Hapus dari localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    
    // 3. Hapus Authorization header dari axios instance
    delete api.defaults.headers.common['Authorization'];
    
    // 4. Reset state
    setToken(null);
    setUser(null);
  };

  const isLoggedIn = !!token && !!user;

  // Return null saat SSR untuk menghindari hydration mismatch
  if (!isHydrated) {
    return (
      <AuthContext.Provider value={{ user: null, token: null, isLoggedIn: false, isHydrated, login, logout, api }}>
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn, isHydrated, login, logout, api }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Hook untuk Menggunakan Konteks ---

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// --- Contoh Penggunaan (opsional) ---
/* // Tempatkan ini di file App.tsx atau main.tsx
import { AuthProvider } from './context/AuthContext';
// ...
<AuthProvider>
  <App />
</AuthProvider>
*/
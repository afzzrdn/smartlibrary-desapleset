import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedAdminRoutes = '/admin';
const LOGIN_PATH = '/login';
const ADMIN_DASHBOARD_PATH = '/admin/dashboard';

export async function middleware(request: NextRequest) {
  const tokenCookie = request.cookies.get('auth_token');
  const token = tokenCookie ? tokenCookie.value : null;
  const { pathname } = request.nextUrl;

  // Cek apakah rute yang diakses adalah rute admin
  const isProtectedRoute = pathname.startsWith(protectedAdminRoutes);

  // Jika mengakses rute admin tanpa token, redirect ke login
  if (isProtectedRoute && !token) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    return NextResponse.redirect(url);
  }

  // Jika sudah login dan mengakses halaman login, redirect ke dashboard
  if (token && pathname === LOGIN_PATH) {
    const url = request.nextUrl.clone();
    url.pathname = ADMIN_DASHBOARD_PATH;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'], 
};
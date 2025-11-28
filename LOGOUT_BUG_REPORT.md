# Bug Report: Logout Feature Fixes

**Date:** November 28, 2024  
**Priority:** 🔴 CRITICAL (Security Issue)

---

## Summary

Ditemukan **3 bug kritis** pada fitur logout yang dapat menyebabkan **session leakage** dan **security bypass**:

1. **localStorage tidak dihapus** saat logout
2. **Authorization header tidak dihapus** dari axios instance  
3. **Tidak ada redirect** dari profile page saat logout

---

## Bug Details

### 🔴 Bug #1: localStorage Tidak Dihapus Saat Logout

**Files Affected:**
- `client/app/components/Navbar.tsx` (line 120)
- `client/app/(admin)/layout.tsx` (line 75)

**Problem:**
```tsx
// BEFORE - localStorage NOT cleared
const handleLogout = () => {
    deleteAuthCookie("auth_token");
    deleteAuthCookie("user_role"); 
    setIsLoggedIn(false); 
    router.push('/login'); 
    // ❌ localStorage.removeItem() MISSING!
};
```

**Impact:**
- User data tetap tersimpan di localStorage
- Token backup tetap ada di localStorage
- Jika attacker mendapat akses ke browser → bisa menggunakan token dari localStorage
- **Severity: HIGH**

**Fix Applied:** ✅
```tsx
// AFTER - localStorage properly cleared
const handleLogout = () => {
    console.log("Melakukan proses logout user...");
    
    // 1. Hapus dari cookies
    deleteAuthCookie("auth_token");
    deleteAuthCookie("user_role"); 
    
    // 2. Hapus dari localStorage (PENTING!)
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    // 3. Update state lokal
    setIsLoggedIn(false); 
    setIsAdmin(false); 
    
    // 4. Redirect
    router.push('/login'); 
};
```

---

### 🔴 Bug #2: Authorization Header Tidak Dihapus dari Axios

**File Affected:**
- `client/app/context/AuthContext.tsx` (line 117)

**Problem:**
```tsx
// BEFORE - Header NOT cleared
const logout = () => {
    Cookies.remove('auth_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    // ❌ Authorization header TIDAK dihapus!
    // axios instance masih memiliki: Authorization: Bearer {old_token}
};
```

**Impact:**
- Axios instance masih memiliki token di header setelah logout
- Request yang dikirim setelah logout tetap membawa token lama
- **Scenario Risiko:**
  ```
  1. User login (token: abc123)
  2. axios header = "Authorization: Bearer abc123"
  3. User logout
  4. axios header MASIH = "Authorization: Bearer abc123" ← BUG!
  5. User melakukan action baru (e.g., bookmark)
  6. Request masih terkirim dengan token lama → bisa berhasil!
  ```
- **Severity: CRITICAL**

**Fix Applied:** ✅
```tsx
// AFTER - Header properly cleared
const logout = () => {
    console.log('Logging out: Clearing cookies, localStorage, and authorization header');
    
    // 1. Hapus dari cookies
    Cookies.remove('auth_token');
    
    // 2. Hapus dari localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    
    // 3. Hapus Authorization header dari axios instance (PENTING!)
    delete api.defaults.headers.common['Authorization'];
    
    // 4. Reset state
    setToken(null);
    setUser(null);
};
```

---

### 🔴 Bug #3: Profile Page Logout Tidak Redirect

**File Affected:**
- `client/app/(main)/profile/page.tsx` (line 205)

**Problem:**
```tsx
// BEFORE - No redirect after logout
<button
  onClick={logout}  // ← Hanya memanggil logout(), tidak redirect!
  className="..."
>
  Keluar (Logout)
</button>
```

**Impact:**
- User klik logout
- User tetap berada di halaman `/profile`
- Tapi token sudah dihapus → halaman akan error
- User bingung & experience buruk
- **Severity: MEDIUM**

**Fix Applied:** ✅
```tsx
// AFTER - With proper redirect
<button
  onClick={() => {
    logout();              // Clear auth state
    router.push('/login'); // Redirect to login
  }}
  className="..."
>
  Keluar (Logout)
</button>
```

---

## Fixed Files Summary

| File | Bug | Fix |
|------|-----|-----|
| `Navbar.tsx` | localStorage not cleared | ✅ Added localStorage cleanup |
| `(admin)/layout.tsx` | localStorage not cleared | ✅ Added localStorage cleanup |
| `AuthContext.tsx` | Authorization header not cleared | ✅ Delete header from axios |
| `profile/page.tsx` | No redirect after logout | ✅ Added router.push('/login') |

---

## Test Cases

### Test 1: Logout Clears All Storage
```javascript
// Before logout
localStorage.getItem('auth_token') // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
localStorage.getItem('user') // {...user data...}
document.cookie // "auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// Click logout button
// ...

// After logout
localStorage.getItem('auth_token') // null ✅
localStorage.getItem('user') // null ✅
document.cookie // "auth_token=" (empty) ✅
```

### Test 2: Axios Header is Cleared
```javascript
// Before logout
axios.defaults.headers.common['Authorization'] 
// "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// Click logout button
// ...

// After logout
axios.defaults.headers.common['Authorization'] 
// undefined ✅
```

### Test 3: Profile Logout Redirects
```
1. Go to /profile (logged in)
2. Click "Keluar (Logout)" button
3. Should see redirect to /login page ✅
4. Profile page should NOT be visible anymore ✅
5. Should see login form ✅
```

### Test 4: Navbar Logout Works
```
1. Click user icon → dropdown menu
2. Click "Logout"
3. Should redirect to /login ✅
4. All storage cleared ✅
5. Next login requires fresh credentials ✅
```

### Test 5: Admin Logout Works
```
1. Go to /dashboard (admin panel)
2. Click user avatar → dropdown
3. Click "Logout"
4. Should redirect to /login ✅
5. Dashboard NOT accessible (401) ✅
```

### Test 6: No Token Leakage After Logout
```
1. Login → Copy any request Authorization header
2. Logout
3. Make new API request (e.g., GET /api/books)
4. Check Authorization header
5. Should be empty/undefined, NOT the old token ✅
6. Logout should be irreversible without re-login ✅
```

---

## Security Implications

**Before Fix:**
- ❌ Session not fully terminated
- ❌ Token available in localStorage for hijacking
- ❌ Authorization header sent on post-logout requests
- ❌ Poor user experience with broken profile page

**After Fix:**
- ✅ Complete session termination
- ✅ All traces of authentication removed
- ✅ No token sent after logout
- ✅ Clean redirect to login page
- ✅ Proper security boundaries

---

## Deployment Notes

1. **No database migration needed** - All changes are frontend-only
2. **Browser restart recommended** - Clear any cached localStorage
3. **Backward compatible** - Existing logins still work
4. **Immediate effect** - No restart needed

---

**Status:** ✅ All logout bugs FIXED and tested

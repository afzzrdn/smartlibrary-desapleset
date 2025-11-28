# Feature Update: Guest User Access to Book List

**Date:** November 28, 2024  
**Feature:** Allow guest (non-authenticated) users to view all books, hide "Last Read" section

---

## Summary

Diubah akses halaman utama agar:
- ✅ **Guest users (belum login)** dapat melihat **semua daftar buku**
- ✅ **Hanya user yang login** yang bisa melihat section **"Terakhir Dibaca"**
- ✅ Tetap maintain authentication untuk fitur favorit & reading history

---

## Changes Made

### 1. Updated: `client/app/(main)/page.tsx`

**Change:** Added authentication check before showing "Last Read" section

```tsx
// BEFORE
const shouldShowLastRead = !searchTerm && lastReadBookIds.length > 0;

// AFTER
import { useAuth } from "@/app/context/AuthContext"; // Added

export default function Home() {
  const { searchTerm } = useSearch();
  const { isLoggedIn } = useAuth(); // NEW: Get login status
  
  // Only show Last Read if: logged in + not searching + has read books
  const shouldShowLastRead = isLoggedIn && !searchTerm && lastReadBookIds.length > 0;
```

**Impact:**
- "Terakhir Dibaca" section only appears when user is logged in
- Guest users won't see the section at all
- No auth errors for guest users

---

### 2. Updated: `client/app/components/BookCard.tsx`

**Change:** Modified `fetchBooks` to work with or without authentication token

**Before:**
```tsx
useEffect(() => {
    if (authToken && !hasFetched && initialBooks.length === 0) {
        fetchBooks(authToken); // ❌ Only fetches if token exists
        setHasFetched(true);
    }
    // ...
}, [authToken, hasFetched, initialBooks]);

const fetchBooks = async (token: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/books`, {
        headers: {
            'Authorization': `Bearer ${token}`, // ❌ Requires token
        },
    });
    // ...
};
```

**After:**
```tsx
useEffect(() => {
    if (initialBooks.length > 0) {
        setAllBooks(initialBooks);
        setDisplayBooks(initialBooks);
    } 
    else if (!hasFetched) {
        fetchBooks(authToken); // ✅ Fetches even if authToken is undefined
        setHasFetched(true);
    }
}, [authToken, hasFetched, initialBooks]);

const fetchBooks = async (token: string | undefined) => {
    const headers: HeadersInit = {};
    
    // ✅ Only add Authorization header if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/books`, {
        headers,
    });
    // ...
};
```

**Impact:**
- API call works with or without authentication
- Guest users get all books (no favorite status)
- Logged-in users get favorite status included
- No token = no Authorization header sent

---

## How It Works

### Flow for Guest User:
```
1. Visit home page
2. Component renders
3. Check: isLoggedIn = false
4. Skip "Terakhir Dibaca" section
5. BookCard component:
   - authToken = undefined
   - fetchBooks(undefined)
   - Fetch /api/books without Authorization header
   - API returns all books with is_favorite: false
6. Display all books in grid
7. "Login untuk Membaca" button shown (from BookCard)
```

### Flow for Logged-in User:
```
1. Visit home page (already logged in)
2. Component renders
3. Check: isLoggedIn = true
4. Load lastReadBookIds from localStorage
5. If lastReadBookIds exists: Show "Terakhir Dibaca" section
6. BookCard component:
   - authToken = "eyJ..."
   - fetchBooks("eyJ...")
   - Fetch /api/books with Authorization header
   - API returns all books with is_favorite: true/false based on user's favorites
7. Display all books with accurate favorite status
8. "Baca Buku" button shown (from BookCard)
```

---

## Backend Behavior

The `/api/books` endpoint already supports optional authentication:

```javascript
// server/routes/book.js
router.get('/', optionalProtect, getAllBooks);

// server/middlewares/authMiddleware.js
const optionalProtect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        } catch (error) {
            req.user = null; // Token invalid, continue as guest
        }
    } else {
        req.user = null; // No token, continue as guest
    }
    
    next();
};

// server/controllers/bookController.js
const getAllBooks = async (req, res) => {
    const userId = req.user ? req.user.id : null;
    
    // Get all books
    const books = await prisma.book.findMany({...});
    
    // If user logged in, check which are their favorites
    let favoriteBookIds = new Set();
    if (userId) {
        const favorites = await prisma.favorite.findMany({
            where: { userId: userId },
            select: { bookId: true },
        });
        favoriteBookIds = new Set(favorites.map(f => f.bookId));
    }
    
    // Inject is_favorite status
    const booksWithFavoriteStatus = books.map(book => ({
        ...book,
        is_favorite: userId ? favoriteBookIds.has(book.id) : false,
    }));
    
    res.json(booksWithFavoriteStatus);
};
```

---

## User Experience

### Before This Change:
```
Guest User:
- Could NOT see any books on home page
- Had to login to see book list
- Poor UX for discovery

Logged-in User:
- Could see all books
- Could see "Terakhir Dibaca" section
```

### After This Change:
```
Guest User:
- ✅ Can see all books immediately
- ✅ Can search & filter books
- ✅ Can see book details
- ⚠️ Can't mark favorites (shows "Login untuk Membaca")
- ⚠️ Can't read books (redirected to /login)
- Better discovery & conversion to login

Logged-in User:
- ✅ Can see all books
- ✅ Can see "Terakhir Dibaca" section (if has read books)
- ✅ Can toggle favorites
- ✅ Can read books
- ✅ Reading history tracked
```

---

## Testing Checklist

- [ ] **Guest User - View Books:**
  1. Clear cookies & localStorage
  2. Visit home page (without logging in)
  3. Should see "Semua Buku" section with books ✅
  4. Should NOT see "Terakhir Dibaca" section
  5. Can search & filter books

- [ ] **Guest User - Interact with Books:**
  1. Click on book card → should see book details
  2. Click "Login untuk Membaca" → redirect to /login ✅
  3. Click favorite heart → alert "Anda harus login" ✅

- [ ] **Guest to Login Conversion:**
  1. Browse books as guest
  2. Click login button
  3. Login with credentials
  4. Redirect to home page
  5. Should now see "Terakhir Dibaca" section (if applicable)
  6. Favorite status should update

- [ ] **Logged-in User:**
  1. Login & visit home page
  2. Should see "Terakhir Dibaca" with 4 most recent books
  3. Can toggle favorites ✅
  4. Can read books ✅
  5. Reading history saved

- [ ] **Search & Filter:**
  1. As guest: Search for book → results shown ✅
  2. As guest: Apply category filter → results shown ✅
  3. As guest: Apply genre filter → results shown ✅
  4. As logged-in: Filters still work ✅

- [ ] **API Calls:**
  1. Inspect network tab as guest:
     - GET /api/books should NOT have Authorization header ✅
     - Books returned with is_favorite: false ✅
  2. Inspect network tab as logged-in:
     - GET /api/books should have Authorization header ✅
     - Books returned with correct is_favorite status ✅

---

## Files Modified

| File | Changes |
|------|---------|
| `client/app/(main)/page.tsx` | Added `useAuth()` hook, conditional rendering for "Last Read" |
| `client/app/components/BookCard.tsx` | Updated `fetchBooks` to work without token, improved useEffect logic |

---

## Backward Compatibility

✅ **Fully backward compatible:**
- Existing logged-in sessions still work
- Favorite bookmarks preserved
- Reading history preserved
- No database changes required

---

## Performance Notes

- Guest users: Fetch all books without database query for favorites (faster)
- Logged-in users: Single database query + favorite check (same as before)
- No additional API calls
- No caching changes needed

---

**Status:** ✅ Feature implemented and ready for testing

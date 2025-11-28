"use client"
import { useRouter } from 'next/navigation';
import { FiHome, FiBook, FiHeart } from 'react-icons/fi'

const Sidebar = () => {
    const router = useRouter();
  

  const goToHome = () => router.push("/");
  const goToBook = () => router.push("/daftar-buku");
  const goToFavorit = () => router.push("/favorit");
  return (
    <aside className="flex px-5 py-4 flex-col h-[96vh] rounded-xl bg-white justify-between shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-5 px-3">
            <img src={"/Logo Plasma.png"} width={30} height={30} />
            <h1 className="pt-2 text-xl font-bold">SmartLibrary</h1>
          </div>

          <nav className="flex flex-col gap-4 text-gray-700">
            <button 
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition" 
              onClick={goToHome}
            >
              <FiHome className="text-xl" />
              <span className="font-medium">Home</span>
            </button>

            <button 
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition" 
              onClick={goToBook}
            >
              <FiBook className="text-xl" />
              <span className="font-medium">Daftar Buku</span>
            </button>

            <button 
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition" 
              onClick={goToFavorit}
            >
              <FiHeart className="text-xl" />
              <span className="font-medium">Favorit</span>
            </button>
          </nav>
        </div>
      </aside>
  )
}

export default Sidebar
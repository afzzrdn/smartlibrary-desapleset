"use client"
import { useRouter } from 'next/navigation';
import { FiHome, FiBook, FiHeart, FiX } from 'react-icons/fi'
import { useAuth } from '@/app/context/AuthContext';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
    const router = useRouter();
    const { isLoggedIn } = useAuth();
  

  const goToHome = () => {
    router.push("/");
    onClose?.();
  };
  
  const goToBook = () => {
    router.push("/daftar-buku");
    onClose?.();
  };
  
  const goToFavorit = () => {
    router.push("/favorit");
    onClose?.();
  };
  
  return (
    <aside className="flex px-5 py-4 flex-col h-full lg:h-[96vh] rounded-xl bg-white justify-between shadow-sm">
        {/* Close button for mobile */}
        {onClose && (
          <button onClick={onClose} className="lg:hidden absolute top-4 right-4">
            <FiX className="text-2xl text-gray-600" />
          </button>
        )}
        
        <div>
          <div className="flex items-center gap-2 mb-5 px-3 mt-8 lg:mt-0">
            <img src={"/Logo Plasma.png"} width={30} height={30} alt="Logo" />
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

            {isLoggedIn && (
              <button 
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition" 
                onClick={goToBook}
              >
                <FiBook className="text-xl" />
                <span className="font-medium">Daftar Buku</span>
              </button>
            )}

            {isLoggedIn && (
              <button 
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition" 
                onClick={goToFavorit}
              >
                <FiHeart className="text-xl" />
                <span className="font-medium">Favorit</span>
              </button>
            )}
          </nav>
        </div>
      </aside>
  )
}

export default Sidebar
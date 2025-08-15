import { Menu } from "lucide-react";
import { useAuthStore } from "../store/useauthStore";
import { toast } from "react-hot-toast";

export default function Header({ title, onMenuClick }) {
  const { authUser, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Déconnexion réussie");
    } catch (error) {
      toast.error("Erreur lors de la déconnexion");
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="bg-white shadow p-4 flex items-center justify-between border border-1 border-gray-200">
      <button 
        onClick={onMenuClick} 
        className="md:hidden text-gray-700 hover:text-gray-900"
        aria-label="Toggle menu"
      >
        <Menu size={24} />
      </button>
      <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
      <div className="flex items-center space-x-4">
        {authUser && (
          <>
            <span className="text-gray-600">
              Bonjour, {authUser.username || 'Admin'}
            </span>
            <button 
              onClick={handleLogout}
              className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded transition-colors"
            >
              Déconnexion
            </button>
          </>
        )}
      </div>
    </header>
  );
}
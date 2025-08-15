// src/App.jsx
import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import DashboardChart from "../components/DashboardChart";
import EmployeTable from "../components/EmployeTable";
import BureauTable from "../components/BureauTable";
import Statistiques from "../components/Statistiques";
import Affectation from "../components/Affectation";
import ProfileAdmin from "../components/ProfileAdmin";

const menuItems = [
  { name: "Dashboard", path: "/" },
  { name: "Employés", path: "/employes" },
  { name: "Bureaux", path: "/bureaux" },
  { name: "Affectations", path: "/affectations" },
  { name: "Statistiques", path: "/statistiques"
   },
  { name: "Mon Profil", path: "/profile" }
];

function Home() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [title, setTitle] = useState("Dashboard");

  useEffect(() => {
    // Update title when route changes
    const currentItem = menuItems.find(item => location.pathname === item.path);
    setTitle(currentItem?.name || "Dashboard");
  }, [location]);

  return (
    <div className="flex h-screen">
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#374151',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          },
        }} 
      />
      
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        menuItems={menuItems} 
        currentPath={location.pathname}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={title} 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        
        <main className="p-4 md:p-6 overflow-y-auto bg-gray-50 flex-1">
          <Routes>
            <Route path="/" element={
              <>
                <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm mb-6">
                  <h2 className="text-xl font-semibold mb-2 text-gray-900">Bienvenue sur le système de gestion</h2>
                  <p className="text-gray-600">Gérez efficacement vos employés, bureaux et affectations.</p>
                </div>
                <DashboardChart />
              </>
            } />
            <Route path="/employes" element={<EmployeTable />} />
            <Route path="/bureaux" element={<BureauTable />} />
            <Route path="/statistiques" element={<Statistiques />} />
            <Route path="/affectations" element={<Affectation />} />
            <Route path="/profile" element={<ProfileAdmin />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default Home;
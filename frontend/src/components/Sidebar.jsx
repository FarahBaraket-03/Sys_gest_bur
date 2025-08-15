// Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UsersRound,
  ChartPie,
  Building2,
  ClipboardList,
  Plane,
  Menu,
  X,
  UserCircle
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Employés", path: "/employes", icon: UsersRound },
  { name: "Bureaux", path: "/bureaux", icon: Building2 },
  { name: "Affectations", path: "/affectations", icon: ClipboardList },
  { name: "Statistiques", path: "/statistiques", icon: ChartPie },
  { name: "Profile", path: "/profile", icon: UserCircle },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm hidden md:block h-screen sticky top-0 z-10">
        <div className="p-4 text-2xl font-semibold border-b-2 text-red-800">
          <Plane className="inline-block mr-2" /> Tunisair
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`block px-4 py-2 rounded text-gray-700 ${
                      isActive ? "bg-gray-100 font-medium text-black" : "hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="inline-block mr-2" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 md:hidden">
          <div className="w-64 bg-white h-full shadow-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-red-800 flex items-center">
                <Plane className="mr-2" /> Tunisair
              </h2>
              <button onClick={onClose}>
                <X className="text-gray-700" />
              </button>
            </div>
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className={`block px-4 py-2 rounded text-gray-700 ${
                        isActive ? "bg-gray-100 font-medium text-black" : "hover:bg-gray-100"
                      }`}
                    >
                      <item.icon className="inline-block mr-2" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

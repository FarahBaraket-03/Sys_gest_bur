// src/App.jsx
import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginForm from './pages/LoginForm.jsx';
import Home from './pages/Home.jsx';
import { useAuthStore } from './store/useauthStore.js';
import { Loader } from 'lucide-react';

function App() {
   const authUser = useAuthStore(state => state.authUser);
  const isCheckingAuth = useAuthStore(state => state.isCheckingAuth);
  const checkAuth = useAuthStore(state => state.checkAuth);
  const location = useLocation();

  useEffect(() => {
  const initializeAuth = async () => {
    try {
      if (!authUser) {
        await checkAuth();
      }
    } catch (error) {
      console.error("Auth initialization failed:", error);
    }
  };

  initializeAuth();
}, [authUser, checkAuth]); // Ensure checkAuth is called only once

// Empty dependency array to run only once
  if (isCheckingAuth) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-2">
        <Loader className="size-10 animate-spin text-gray-600" />
        <span className="text-gray-600">Initializing application...</span>
      </div>
    );
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <Routes location={location} key={location.key}>
        {/* Public route */}
        <Route path="/login" element={!authUser ? <LoginForm /> : <Navigate to="/" replace />} />
        
        {/* Protected routes */}
        <Route path="/*" element={authUser ? <Home /> : <Navigate to="/login" state={{ from: location }} replace />} />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to={authUser ? "/" : "/login"} replace />} />
      </Routes>
    </>
  );
}

export default App;
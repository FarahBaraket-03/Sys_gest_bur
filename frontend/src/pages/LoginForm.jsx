import { useState, useEffect } from 'react';
import Otp4 from '../components/otp4';
import { useAuthStore } from '../store/useauthStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { 
    login, 
    requires2FA, 
    verify2FA, 
    authUser,
    loading,
    error
  } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already authenticated
    if (authUser) {
      navigate('/dashboard');
    }
  }, [authUser, navigate]);

  useEffect(() => {
    // Show error messages from store
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!username || !email || !password) {
    toast.error('All fields are required');
    return false; // Explicit return
  }
  
  if (!validateEmail(email)) {
    toast.error('Please enter a valid email address');
    return false;
  }

  try {
    await login({ username, email, password });
    return true;
  } catch (error) {
    return false;
  }
};

  const handle2FASuccess = async (code) => {
    try {
      await verify2FA(code);
    } catch (error) {
      // Error handled in store
    }
  };

  if (requires2FA) {
    return (
      <div className="bg-white h-screen flex items-center justify-center">
        <Otp4 onComplete={handle2FASuccess} />
      </div>
    );
  }

  return (
    <div className="bg-white h-screen flex items-center justify-center">
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
      <div className="w-full max-w-md p-8 space-y-8 rounded-lg shadow-md">
        <div className="text-center">
          <img
            alt="Company Logo"
            src="/image.png"
            className="mx-auto h-20 w-auto"
          />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-red-800 focus:outline-none focus:ring-red-800"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-red-800 focus:outline-none focus:ring-red-800"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border text-gray-900 border-gray-300 px-3 py-2 shadow-sm focus:border-red-800 focus:outline-none focus:ring-red-800"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-800 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-800 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
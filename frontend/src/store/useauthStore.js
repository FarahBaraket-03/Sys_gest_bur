import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { toast } from 'react-toastify';

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: false,
  loading: false,
  error: null,
  requires2FA: false,
  tempCredentials: null,
  admins: [],

checkAuth: async () => {
  set({ isCheckingAuth: true, error: null });
  try {
    const response = await axiosInstance.get("/auth/check", {
      withCredentials: true
    });
    set({ 
      authUser: response.data.user || null, // Ensure null if no user
      isCheckingAuth: false
    });
    return response.data;
  } catch (error) {
    set({ 
      authUser: null,
      isCheckingAuth: false,
    });
    return null;
  }
},
  
login: async (credentials) => {
  set({ loading: true, error: null });
  try {
    const response = await axiosInstance.post("/auth/login", credentials);
    if (response.data.status) {
      set({ 
        requires2FA: true,
        tempCredentials: credentials,
        loading: false
      });
      toast.info("Verification code sent to your email");
    }
    return response.data;
  } catch (error) {
    const errorMsg = "Login failed";
    set({ loading: false, error: errorMsg });
    toast.error(errorMsg);
    throw error; // Ensure error is properly propagated
  }
},

  verify2FA: async (code) => {
    const { tempCredentials } = get();
    if (!tempCredentials) {
      throw new Error("No pending verification");
    }
    
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.post("/auth/verify-2fa", {
        ...tempCredentials,
        code
      });
      
      set({ 
        authUser: response.data.user,
        requires2FA: false,
        tempCredentials: null,
        loading: false
      });
      
      return response.data;
    } catch (error) {
      console.error("2FA verification error:", error);
      const errorMsg = "Invalid verification code";
      set({ loading: false, error: errorMsg });
      toast.error(errorMsg);
      throw error;
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ 
        authUser: null,
        requires2FA: false,
        tempCredentials: null
      });
    } catch (error) {
      
      toast.error("Logout failed");
    } finally {
      window.location.href = "/login";
    }
  },

 updateProfile: async (profileData) => {
  set({ loading: true });
  try {
    const { authUser } = get();
    const response = await axiosInstance.put("/auth/profile", 
      {
        ...profileData,
        // Only include isAdmin if current user is admin
        isAdmin: authUser?.isAdmin ? profileData.isAdmin : undefined
      }
    );
    if (profileData.id === authUser?.id) {
      set({ authUser: response.data.user });
    }
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Update failed");
  } finally {
    set({ loading: false });
  }
},
addAdmin: async (adminData) => {
  set({ loading: true });
  try {
    const response = await axiosInstance.post("/auth/register", adminData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Add admin failed");
  } finally {
    set({ loading: false });
  }
},

fetchAdmins: async () => {
  set({ loading: true });
  try {
    const response = await axiosInstance.get("/auth/admins", {
      withCredentials: true // Ensure cookies are sent
    });
    set({ admins: response.data.admins });
  } catch (error) {
    throw new Error("Failed to fetch admins");
  } finally {
    set({ loading: false });
  }
},

deleteAdmin: async (adminId) => {
  set({ loading: true });
  try {
    const response = await axiosInstance.delete(`/auth/del/${adminId}`);
    toast.success("Admin deleted successfully");
    return response.data;
  } catch (error) {
    throw new Error( "Delete admin failed");
  } finally {
    set({ loading: false });
  }
},

}));
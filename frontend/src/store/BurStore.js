import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";


export const useBurStore = create((set) => ({
  bureaux: [],
  bureauxGrouped: [],
  loading: false,
    fetchBureaux: async () => {
        set({ loading: true });
        try {
            const response = await axiosInstance.get("/bureau");
            set({ bureaux: response.data });
        } catch (error) {
            console.error("Error fetching bureaux:", error);
            toast.error("Failed to fetch bureaux");
        }
        set({ loading: false });
    },
    addBureau: async (bureau) => {
        set({ loading: true });
        try {
            const response = await axiosInstance.post("/bureau/add", bureau);
            set((state) => ({
                bureaux: [...state.bureaux, response.data],
            }));
        } catch (error) {
            console.error("Error adding bureau:", error);
            toast.error("Failed to add bureau");
        }
        set({ loading: false });
    },
    updateBureau: async (updatedData) => {
        set({ loading: true });
        try {
            const response = await axiosInstance.put(`/bureau/maj`, updatedData);
            set((state) => ({
                bureaux: state.bureaux.map((bur) =>
                    bur.id === updatedData.id ? response.data : bur
                ),
            }));
        } catch (error) {
            console.error("Error updating bureau:", error);
            toast.error("Failed to update bureau");
        }
        set({ loading: false });
    }, 
    deleteBureau: async (id) => {
        set({ loading: true });
        try {
            await axiosInstance.delete(`/bureau/del/${id}`);
            set((state) => ({
                bureaux: state.bureaux.filter((bur) => bur.id !== id),
            }));
        } catch (error) {
            console.error("Error deleting bureau:", error);
            toast.error("Failed to delete bureau");
        }
        set({ loading: false });
    },
    getBureauGrouped: async () => {
        try {
            const response = await axiosInstance.get("/bureau/grouped");
            set({ bureauxGrouped: response.data });
        } catch (error) {
            console.error("Error fetching bureaux:", error);
            toast.error("Failed to fetch bureaux");
        }
    }
}));
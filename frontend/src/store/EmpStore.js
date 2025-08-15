import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useEmpStore = create((set) => ({
  employees: [],
  loading: false,
  
  
  fetchEmployees: async () => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get("/employees");
      set({ employees: response.data });
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to fetch employees");
    }
    set({ loading: false });
  },
  
  addEmployee: async (employee) => {
        set({ loading: true });
        try {
        const response = await axiosInstance.post("/employees/add", employee);
        set((state) => ({
            employees: [...state.employees, response.data],
        }));
        } catch (error) {
        console.error("Error adding employee:", error);
        toast.error("Failed to add employee");
        }
        set({ loading: false });
    },
    
    updateEmployee: async (updatedData) => {
        set({ loading: true });
        try {
            const response = await axiosInstance.put(`/employees/maj`, updatedData);
            set((state) => ({
                employees: state.employees.map((emp) =>
                    emp.matricule === updatedData.matricule ? response.data : emp
                ),
            }));
           
        } catch (error) {
            console.error("Error updating employee:", error);
            toast.error("Failed to update employee");
        }
        set({ loading: false });
    },
    
    
    deleteEmployee: async (matricule) => {
        set({ loading: true });
        try {
            await axiosInstance.delete(`/employees/del/${matricule}`);
            set((state) => ({
                employees: state.employees.filter((emp) => emp.matricule !== matricule),
            }));
        } catch (error) {
            console.error("Error deleting employee:", error);
            toast.error("Failed to delete employee");
        }
        set({ loading: false });
    },
}));
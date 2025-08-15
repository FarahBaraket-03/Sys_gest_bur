import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

export const useAffectationStore = create((set,get) => ({
  affectations: [],

  // Récupérer toutes les affectations
  fetchAffectations: async () => {
    try {
      const response = await axiosInstance.get("/affectations");
      set({ affectations: response.data });
    } catch (error) {
      console.error("Erreur fetchAffectations:", error);
    }
  },

  // Ajouter une affectation
  addAffectation: async (newAffectation) => {
    try {
      const response = await axiosInstance.post("/affectations/add", newAffectation);
      set((state) => ({
        affectations: [...state.affectations, response.data],
      }));
    } catch (error) {
      console.error("Erreur addAffectation:", error);
    }
  },

  // Mettre à jour une affectation
  updateAffectation: async (updatedAffectation) => {
    try {
      const { matricule, numero , date_affectation , decision } = updatedAffectation;
      await axiosInstance.put(`/affectations/maj/${matricule}/${numero}`, updatedAffectation);
      set((state) => ({
        affectations: state.affectations.map((aff) =>
          aff.matricule === matricule && aff.numero === numero ? updatedAffectation : aff
        ),
      }));
    } catch (error) {
      console.error("Erreur updateAffectation:", error);
    }
  },

  // Supprimer une affectation
  deleteAffectation: async (matricule, numero) => {
    try {
      await axiosInstance.delete(`/affectations/del/${matricule}/${numero}`);
      set((state) => ({
        affectations: state.affectations.filter(
          (aff) => !(aff.matricule === matricule && aff.numero === numero)
        ),
      }));
    } catch (error) {
      console.error("Erreur deleteAffectation:", error);
    }
  },

  getAssignmentStatsOverTime: () => {
  const { affectations } = get();
  const counts = {};

  affectations.forEach((a) => {
    const date = new Date(a.date_affectation).toISOString().split('T')[0];
    counts[date] = (counts[date] || 0) + 1;
  });

  return {
    labels: Object.keys(counts),
    datasets: [{
      label: "Affectations",
      data: Object.values(counts),
      borderColor: "#4f46e5",
      backgroundColor: "#c7d2fe",
    }]
  };
},

}));


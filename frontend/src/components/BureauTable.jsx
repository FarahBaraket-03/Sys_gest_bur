import React, { useEffect, useState } from "react";
import {
  BadgePlus,
  Building2,
  Ruler,
  Layers3,
  Edit,
  Trash2,
  Search
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useBurStore } from "../store/BurStore";

const PAGE_SIZE = 5;

export default function BureauTable() {
  
  const [currentPage, setCurrentPage] = useState(1);
  const [editingBureau, setEditingBureau] = useState(null);
  const [formData, setFormData] = useState({ numero: "", niveau: "", superficie: "" });

  const { fetchBureaux, addBureau, updateBureau, deleteBureau ,bureaux} = useBurStore();

  useEffect(() => {
    const loadBureaux = async () => {
      const data = await fetchBureaux();
    };
    loadBureaux();
  }, [fetchBureaux,bureaux]);

  const [searchTerm, setSearchTerm] = useState("");
    
    //* Filter employees based on search term
   const filteredBureaux = bureaux.filter(bur => {
  const searchLower = searchTerm.toLowerCase();
  return (
    (bur.numero && bur.numero.toString().toLowerCase().includes(searchLower)) ||
    (bur.niveau && bur.niveau.toString().toLowerCase().includes(searchLower))
  );
});
    const handleSearchChange = (e) => {
      setSearchTerm(e.target.value);
      setCurrentPage(1); // Reset to first page when searching
    };
  
  const totalPages = Math.ceil(filteredBureaux.length / PAGE_SIZE);
  const paginatedBureaux = filteredBureaux.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddClick = () => {
    setEditingBureau(null);
    setFormData({ numero: "", niveau: "", superficie: "" });
  };

  const handleEditClick = (b) => {
    setEditingBureau(b.numero);
    setFormData(b);
  };

  const handleDeleteClick = async (numero) => {
    if (confirm("Supprimer ce bureau ?")) {
      await deleteBureau(numero);
      toast.success("Bureau supprimé !");
      const updated = bureaux.filter((b) => b.numero !== numero);
      if (updated.length <= (currentPage - 1) * PAGE_SIZE && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.numero || !formData.niveau || !formData.superficie)
      return alert("Champs requis.");

    try {
      if (editingBureau) {
        await updateBureau(formData);
        toast.success("Bureau mis à jour !");
      } else {
        if (bureaux.find((b) => b.numero === formData.numero))
          return alert("Numéro déjà existant !");
        await addBureau(formData);
        toast.success("Bureau ajouté !");
        
      }
      setEditingBureau(null);
      setFormData({ numero: "", niveau: "", superficie: "" });
    } catch (err) {
      toast.error("Une erreur est survenue.");
    }
  };

  return (
    <>
    <div className="p-6 bg-white rounded shadow m-5 relative text-gray-600 ">
        <div className="absolute inset-y-0 left-4 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
            />
      </div>
    <div className="p-6 bg-white rounded shadow">
      {/* Header & Form */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Liste des Bureaux</h2>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 btn btn-primary text-white px-4 py-2 rounded "
        >
          <BadgePlus size={18} /> Ajouter un Bureau
        </button>
      </div>

      <form onSubmit={handleFormSubmit} className="mb-6 bg-gray-50 p-4 rounded border text-gray-950">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Building2 size={18} />
            <input
              type="text"
              name="numero"
              placeholder="Numéro"
              value={formData.numero}
              onChange={handleInputChange}
              disabled={!!editingBureau}
              className="border p-2 rounded w-full"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <Layers3 size={18} />
            <input
              type="text"
              name="niveau"
              placeholder="Niveau"
              value={formData.niveau}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <Ruler size={18} />
            <input
              type="text"
              name="superficie"
              placeholder="Superficie"
              value={formData.superficie}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
              required
            />
          </div>
        </div>
        <div className="mt-3 flex gap-3">
          <button type="submit" className="btn btn-success text-white px-4 py-2 rounded">
            {editingBureau ? "Modifier" : "Ajouter"}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingBureau(null);
              setFormData({ numero: "", niveau: "", superficie: "" });
            }}
            className="btn btn-soft px-4 py-2 rounded"
          >
            Annuler
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="overflow-x-auto border-gray-300">
        <table className="min-w-full table-auto border-collapse border-gray-300">
          <thead className="bg-gray-200 sticky top-0 z-10">
            <tr>
              {["Numéro", "Niveau", "Superficie", "Actions"].map((h) => (
                <th key={h} className="border px-4 py-2 text-center border-gray-300 text-rose-950">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="border-gray-300 text-gray-700">
            {paginatedBureaux.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-6 text-gray-950">
                 {searchTerm ? "Aucun bureau trouvé pour votre recherche." : "Aucun bureau à afficher."}.</td></tr>
            ) : (
              paginatedBureaux.map((b, i) => (
                <tr key={b.numero} className={i % 2 ? "bg-gray-50 border-gray-300" : "bg-white border-gray-300"}>
                  <td className="border border-gray-300 px-4 py-2">{b.numero}</td>
                  <td className="border border-gray-300 px-4 py-2">{b.niveau}</td>
                  <td className="border border-gray-300 px-4 py-2">{b.superficie} m²</td>
                  <td className="border border-gray-300 px-4 py-2 space-x-2">
                    <button onClick={() => handleEditClick(b)} className="text-yellow-600 hover:underline">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteClick(b.numero)} className="text-red-600 hover:underline">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
            <span className="text-gray-600">
            Page {currentPage} sur {totalPages}
            </span>
            <div className="btn-group">
            <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn me-1"
            >
                Précédent
            </button>
            <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="btn"
            >
                Suivant
            </button>
            </div>
        </div>
    </div></>
  );
}

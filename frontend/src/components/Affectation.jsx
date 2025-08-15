import React, { useEffect, useState } from "react";
import {
  BadgePlus,
  Building2,
  User,
  Calendar,
  FileText,
  Edit,
  Trash2,
  Search
} from "lucide-react";
import { toast } from "react-hot-toast";


import {useAffectationStore} from "../store/affectStore";


const PAGE_SIZE = 5;

export default function AffectationTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingAffectation, setEditingAffectation] = useState(null);
  const [formData, setFormData] = useState({ matricule: "", numero: "", date_affectation: "", decision: "" });

  const { fetchAffectations, addAffectation, updateAffectation, deleteAffectation, affectations } = useAffectationStore();

  useEffect(() => {
    const loadAffectations = async () => {
      await fetchAffectations();
    };
    loadAffectations();
  }, [fetchAffectations,affectations]);
  const [searchTerm, setSearchTerm] = useState("");
  const filteredaffectations = affectations.filter(aff => {
  const searchLower = searchTerm.toLowerCase();
 // Format date to string for searching (YYYY-MM-DD format)
  const formattedDate = aff.date_affectation 
    ? new Date(aff.date_affectation).toISOString().split('T')[0]
    : '';
  
  return (
    (aff.numero && aff.numero.toString().toLowerCase().includes(searchLower)) ||
    (aff.matricule && aff.matricule.toString().toLowerCase().includes(searchLower)) ||
    (aff.decision && aff.decision.toString().toLowerCase().includes(searchLower)) ||
    formattedDate.includes(searchLower)
  );
});
    const handleSearchChange = (e) => {
      setSearchTerm(e.target.value);
      setCurrentPage(1); // Reset to first page when searching
    };
  const totalPages = Math.ceil(filteredaffectations.length / PAGE_SIZE);
  const paginatedAffectations = filteredaffectations.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddClick = () => {
    setEditingAffectation(null);
    setFormData({ matricule: "", numero: "", date_affectation: "", decision: "" });
  };

  const handleEditClick = (a) => {
    setEditingAffectation(a.id);
    setFormData(a);
  };

  const handleDeleteClick = async (matricule,numero) => {
    if (confirm("Supprimer cette affectation ?")) {
      await deleteAffectation(matricule, numero);
      toast.success("Affectation supprimée !");
      const updated = affectations.filter((a) => a.id !== id);
      if (updated.length <= (currentPage - 1) * PAGE_SIZE && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.matricule || !formData.numero || !formData.date_affectation || !formData.decision
)
      return alert("Veuillez remplir tous les champs !");
    
    if (editingAffectation) {
      await updateAffectation(formData);
      toast.success("Affectation mise à jour !");
    } else {
      await addAffectation(formData);
      toast.success("Affectation ajoutée !");
    }
    
    setEditingAffectation(null);
    setFormData({ matricule: "", numero: "", date_affectation: "", decision: "" });
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
            <div className=" grid grid-cols-1 lg:grid-cols-2 gap-x-150 mb-3 ">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Gestion des Affectations</h2>
                <div className="mb-4 flex justify-between items-center">
                    <button onClick={handleAddClick} className="btn btn-primary">
                        <BadgePlus size={16} className="mr-2" />Ajouter une affectation
                    </button>
                </div>
            </div>
            <form onSubmit={handleFormSubmit} className="mb-6 bg-gray-50 p-4 rounded border border-gray-950">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 ">
                <div className="flex items-center gap-2">
                    <Building2 size={18} className="text-gray-500" />
                    <input type="text" name="numero" value={formData.numero} onChange={handleInputChange} placeholder="Bureau" className="input input-bordered w-full"/>
                </div>
                <div className="flex items-center gap-2">
                    <User size={18} className="text-gray-500" />
                    <input type="text" name="matricule" value={formData.matricule} onChange={handleInputChange} placeholder="Employé" className="input input-bordered w-full"/>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-gray-500" />
                    <input type="date" name="date_affectation" value={formData.date_affectation} onChange={handleInputChange} placeholder="Date d'affectation" className="input input-bordered w-full"/>
                </div>
                <div className="flex items-center gap-2">
                    <FileText size={18} className="text-gray-500" />
                    <input type="text" name="decision" value={formData.decision} onChange={handleInputChange} placeholder="Decision" className="input input-bordered w-full"/>
                </div>
            </div>
            <div className="mt-3 flex gap-3">
                <button type="submit" className="btn btn-success px-4 py-2 rounded">
            {editingAffectation ? "Modifier" : "Ajouter"}
            </button>
            <button
            type="button"
            onClick={() => {
              setEditingAffectation(null);
              setFormData({ matricule: "", numero: "", date_affectation: "", decision: "" });
            }}
            className="btn btn-soft px-4 py-2 rounded"
          >
            Annuler
          </button>
            </div>
            
        </form>
        <div className="overflow-x-auto">
            <table className="min-w-full table-auto  border-collapse ">
            <thead className="bg-gray-200 sticky top-0 z-10  text-rose-950">
            <tr>
                <th className="border border-gray-300 px-4 py-2">Bureau</th>
                <th className="border border-gray-300 px-4 py-2">Employé</th>
                <th className="border border-gray-300 px-4 py-2">Date d'affectation</th>
                <th className="border border-gray-300 px-4 py-2">Decision</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
            </thead>
            <tbody className="border-gray-300 text-gray-700">
            {paginatedAffectations.length === 0 ? (
                <tr>
                <td colSpan="5" className="text-center py-4 ">{searchTerm ? "Aucun affectation trouvé pour votre recherche." : "Aucun affectation à afficher."}</td>
                </tr>
            ) : (
                paginatedAffectations.map((a,i) => (
                <tr key={a.id}  className={i % 2 ? "bg-gray-50 border-gray-300" : "bg-white border-gray-300"}>
                    <td className="border px-4 py-2 border-gray-300">{a.numero}</td>
                    <td className="border px-4 py-2 border-gray-300">{a.matricule}</td>
                    <td className="border px-4 py-2 border-gray-300">{new Date(a.date_affectation).toLocaleDateString()}</td>
                    <td className="border px-4 py-2 border-gray-300">{a.decision}</td>
                    <td className="border px-4 py-2 space-x-2 border-gray-300">
                    <button onClick={() => handleEditClick(a)} className="text-yellow-600 hover:underline">
                        <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteClick(a.matricule,a.numero)} className="text-red-600 hover:underline">
                        <Trash2 size={16} />
                    </button>
                    </td>
                </tr>
                ))
            )}
            </tbody>
        </table>
        </div>
        
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
        </div>
      </>
    )
}
        

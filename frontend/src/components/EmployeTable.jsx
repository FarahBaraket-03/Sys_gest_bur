import React, { useState, useEffect } from "react";
import { useEmpStore } from "../store/EmpStore";
import { toast } from "react-hot-toast";
import {
  IdCardLanyard,
  BadgePlus,
  User,
  Building2,
  BriefcaseBusiness,
  ClipboardSignature,
  Edit,
  Trash2,
  Search
} from "lucide-react";

const PAGE_SIZE = 5;

export default function EmployeTable() {
  const {
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    employees,
    loading,
  } = useEmpStore();

  const [formData, setFormData] = useState({
    matricule: "",
    nom: "",
    affectation: "",
    emploi: "",
    fonction: "",
  });
  const [editingEmploye, setEditingEmploye] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Synchroniser avec le store
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees,employees]);

  const [searchTerm, setSearchTerm] = useState("");
  
  //* Filter employees based on search term
  const filteredEmployes = employees.filter(emp => {
  const searchLower = searchTerm.toLowerCase();
    return (
      emp.matricule.toLowerCase().includes(searchLower) ||
      emp.nom.toLowerCase().includes(searchLower) ||
      (emp.affectation && emp.affectation.toLowerCase().includes(searchLower)) ||
      (emp.emploi && emp.emploi.toLowerCase().includes(searchLower)) ||
      (emp.fonction && emp.fonction.toLowerCase().includes(searchLower))
    );
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const totalPages = Math.ceil(filteredEmployes.length / PAGE_SIZE);
  const paginatedEmployes = filteredEmployes.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );


  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddClick = () => {
    setEditingEmploye(null);
    setFormData({
      matricule: "",
      nom: "",
      affectation: "",
      emploi: "",
      fonction: "",
    });
  };

  const handleEditClick = (emp) => {
    setEditingEmploye(emp.matricule);
    setFormData(emp);
  };

  const handleDeleteClick = async (matricule) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet employé ?")) {
      await deleteEmployee(matricule);
      toast.success("Employé supprimé");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.matricule || !formData.nom) {
      toast.error("Matricule et nom sont obligatoires !");
      return;
    }

    try {
      if (editingEmploye) {
        await updateEmployee(formData);
        toast.success("Employé mis à jour !");
        
      } 
      else {
        if (employees.some((e) => e.matricule === formData.matricule)) {
          toast.error("Matricule déjà utilisé !");
          return;
        }
        await addEmployee(formData);
        toast.success("Employé ajouté !");
      }
      setEditingEmploye(null);
      setFormData({
        matricule: "",
        nom: "",
        affectation: "",
        emploi: "",
        fonction: "",
      });
    } catch (error) {
      toast.error("Erreur lors de la soumission.");
      console.error(error);
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
      <div className="p-6 bg-white rounded shadow text-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Liste des Employés
        </h2>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 btn btn-primary text-white px-3 py-2 rounded"
        >
         <BadgePlus size={18} /> Ajouter un employé
        </button>
      </div>
      

      {/* Formulaire */}
      <form
        onSubmit={handleFormSubmit}
        className="mb-6 bg-gray-50 p-4 rounded border"
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
           <div className="flex items-center gap-2">
            <IdCardLanyard size={18} />
            <input
              type="text"
              name="matricule"
              placeholder="Matricule"
              value={formData.matricule}
              onChange={handleInputChange}
              disabled={!!editingEmploye}
              className="border p-2 rounded w-full"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <User size={18} />
            <input
              type="text"
              name="nom"
              placeholder="Nom"
              value={formData.nom}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <Building2 size={18} />
            <input
              type="text"
              name="affectation"
              placeholder="Affectation"
              value={formData.affectation}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <BriefcaseBusiness size={18} />
            <input
              type="text"
              name="emploi"
              placeholder="Emploi"
              value={formData.emploi}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <ClipboardSignature size={18} />
            <input
              type="text"
              name="fonction"
              placeholder="Fonction"
              value={formData.fonction}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
            />
          </div>
        </div>
        <div className="mt-3 flex gap-3">
          <button
            type="submit"
            className="btn btn-success text-white px-4 py-2 rounded "
          >
            {editingEmploye ? "Mettre à jour" : "Ajouter"}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingEmploye(null);
              setFormData({
                matricule: "",
                nom: "",
                affectation: "",
                emploi: "",
                fonction: "",
              });
            }}
            className=" btn btn-soft px-4 py-2 rounded"
          >
            Annuler
          </button>
        </div>
      </form>

      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-200 sticky top-0 z-10">
            <tr>
              {[
                "Matricule",
                "Nom",
                "Affectation",
                "Emploi",
                "Fonction",
                "Actions",
              ].map((head) => (
                <th
                  key={head}
                  className="border border-gray-300 text-center text-rose-950 px-4 py-2"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedEmployes.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-900">
                  {searchTerm ? "Aucun employé trouvé pour votre recherche." : "Aucun employé à afficher."}
                </td>
              </tr>
            ) : (
              paginatedEmployes.map((emp, i) => (
                <tr
                  key={emp.matricule}
                  className={
                    i % 2 === 0
                      ? "bg-white text-gray-800"
                      : "bg-gray-50 text-zinc-900"
                  }
                >
                  <td className="border border-gray-300 px-4 py-2">{emp.matricule}</td>
                  <td className="border border-gray-300 px-4 py-2">{emp.nom}</td>
                  <td className="border border-gray-300 px-4 py-2">{emp.affectation}</td>
                  <td className="border border-gray-300 px-4 py-2">{emp.emploi}</td>
                  <td className="border border-gray-300 px-4 py-2">{emp.fonction}</td>
                  <td className="border border-gray-300 px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleEditClick(emp)}
                      className="text-yellow-600 hover:underline"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(emp.matricule)}
                      className="text-red-600 hover:underline"
                    >
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
            <div className="btn-group ">
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
    
  );
}

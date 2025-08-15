// src/components/DashboardChart.jsx
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  DoughnutController
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useEmpStore } from "../store/empStore";
import { useBurStore } from "../store/burStore";
import { useAffectationStore } from "../store/affectStore";
import { useEffect, useState } from "react";
import { Users, Home, ChevronLeft, ChevronRight , MonitorSmartphone } from 'lucide-react';

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  DoughnutController
);

const DashboardChart = () => {
  const { employees, fetchEmployees } = useEmpStore();
  const { bureaux, fetchBureaux, bureauxGrouped } = useBurStore();
  const { affectations, fetchAffectations } = useAffectationStore();
  
  const [employesSansBureau, setEmployesSansBureau] = useState([]);
  const [bureauxOccupes, setBureauxOccupes] = useState([]);
  const [bureauxDisponibles, setBureauxDisponibles] = useState([]);

  // Pagination state for employees table
  const [empCurrentPage, setEmpCurrentPage] = useState(1);
  const [empRowsPerPage] = useState(5);

  // Pagination state for offices table
  const [officeCurrentPage, setOfficeCurrentPage] = useState(1);
  const [officeRowsPerPage] = useState(5);

  useEffect(() => {
    fetchEmployees();
    fetchBureaux();
    fetchAffectations();
  }, []);

  useEffect(() => {
    if (employees.length && affectations.length && bureaux.length) {
      const affMatricules = new Set(affectations.map((a) => a.matricule));
      setEmployesSansBureau(employees.filter((e) => !affMatricules.has(e.matricule)));

      const numsOccupes = new Set(affectations.map((a) => a.numero));
      setBureauxOccupes(bureaux.filter((b) => numsOccupes.has(b.numero)));
      setBureauxDisponibles(bureaux.filter((b) => !numsOccupes.has(b.numero)));
    }
  }, [employees, bureaux, affectations]);

  // Get current employees for pagination
  const indexOfLastEmp = empCurrentPage * empRowsPerPage;
  const indexOfFirstEmp = indexOfLastEmp - empRowsPerPage;
  const currentEmps = employesSansBureau.slice(indexOfFirstEmp, indexOfLastEmp);
  const totalEmpPages = Math.ceil(employesSansBureau.length / empRowsPerPage);

  // Get current offices for pagination
  const indexOfLastOffice = officeCurrentPage * officeRowsPerPage;
  const indexOfFirstOffice = indexOfLastOffice - officeRowsPerPage;
  const currentOffices = bureauxDisponibles.slice(indexOfFirstOffice, indexOfLastOffice);
  const totalOfficePages = Math.ceil(bureauxDisponibles.length / officeRowsPerPage);

  // Change employee page
  const paginateEmps = (pageNumber) => setEmpCurrentPage(pageNumber);

  // Change office page
  const paginateOffices = (pageNumber) => setOfficeCurrentPage(pageNumber);

  // Doughnut chart data for employees with/without office
  const employeeOfficeData = {
    labels: ['Avec bureau', 'Sans bureau'],
    datasets: [{
      data: [employees.length - employesSansBureau.length, employesSansBureau.length],
      backgroundColor: ['#4ade80', '#f87171'],
      borderColor: ['#fff', '#fff'],
      borderWidth: 1
    }]
  };

  // Doughnut chart data for office status
  const officeStatusData = {
    labels: ['Occupés', 'Disponibles'],
    datasets: [{
      data: [bureauxOccupes.length, bureauxDisponibles.length],
      backgroundColor: ['#60a5fa', '#a78bfa'],
      borderColor: ['#fff', '#fff'],
      borderWidth: 1
    }]
  };

  return (
    <div className="space-y-6 p-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Employees Card */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Employés</h3>
              <p className="text-2xl font-bold text-blue-800">{employees.length}</p>
            </div>
          </div>
        </div>

        {/* Offices Card */}
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <MonitorSmartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Bureaux</h3>
              <p className="text-2xl font-bold text-purple-800">{bureaux.length}</p>
            </div>
          </div>
        </div>

        {/* Assignments Card */}
        <div className="bg-green-50 border border-green-100 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Affectations</h3>
              <p className="text-2xl font-bold text-green-800">{affectations.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Doughnut Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employees with/without office */}
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Répartition des employés
          </h3>
          <div className="h-64">
            <Doughnut 
              data={employeeOfficeData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (ctx) => {
                        const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((ctx.raw * 100) / total).toFixed(1);
                        return `${ctx.label}: ${ctx.raw} (${percentage}%)`;
                      }
                    }
                  },
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Office status */}
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Statut des bureaux
          </h3>
          <div className="h-64">
            <Doughnut 
              data={officeStatusData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (ctx) => {
                        const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((ctx.raw * 100) / total).toFixed(1);
                        return `${ctx.label}: ${ctx.raw} (${percentage}%)`;
                      }
                    }
                  },
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Employees without office table */}
      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Employés sans bureau ({employesSansBureau.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matricule</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fonction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emploi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEmps.map((emp) => (
                <tr key={emp.matricule}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.matricule}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.fonction}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.emploi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination for employees table */}
        {employesSansBureau.length > empRowsPerPage && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => paginateEmps(empCurrentPage - 1)}
                disabled={empCurrentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <button
                onClick={() => paginateEmps(empCurrentPage + 1)}
                disabled={empCurrentPage === totalEmpPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage de <span className="font-medium">{indexOfFirstEmp + 1}</span> à{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastEmp, employesSansBureau.length)}
                  </span>{' '}
                  sur <span className="font-medium">{employesSansBureau.length}</span> résultats
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => paginateEmps(empCurrentPage - 1)}
                    disabled={empCurrentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Précédent</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  {Array.from({ length: totalEmpPages }, (_, i) => i + 1).map((number) => (
                    <button
                      key={number}
                      onClick={() => paginateEmps(number)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        empCurrentPage === number
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                  <button
                    onClick={() => paginateEmps(empCurrentPage + 1)}
                    disabled={empCurrentPage === totalEmpPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Suivant</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Available offices table */}
      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden mt-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Bureaux disponibles ({bureauxDisponibles.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niveau</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Superficie (m²)</th>
               
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentOffices.map((bur) => (
                <tr key={bur.numero}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bur.numero}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Niveau {bur.niveau}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bur.superficie}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination for offices table */}
        {bureauxDisponibles.length > officeRowsPerPage && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => paginateOffices(officeCurrentPage - 1)}
                disabled={officeCurrentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <button
                onClick={() => paginateOffices(officeCurrentPage + 1)}
                disabled={officeCurrentPage === totalOfficePages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage de <span className="font-medium">{indexOfFirstOffice + 1}</span> à{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastOffice, bureauxDisponibles.length)}
                  </span>{' '}
                  sur <span className="font-medium">{bureauxDisponibles.length}</span> résultats
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => paginateOffices(officeCurrentPage - 1)}
                    disabled={officeCurrentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Précédent</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  {Array.from({ length: totalOfficePages }, (_, i) => i + 1).map((number) => (
                    <button
                      key={number}
                      onClick={() => paginateOffices(number)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        officeCurrentPage === number
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                  <button
                    onClick={() => paginateOffices(officeCurrentPage + 1)}
                    disabled={officeCurrentPage === totalOfficePages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Suivant</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardChart;
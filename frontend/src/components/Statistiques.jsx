import { useEffect, useState ,PureComponent } from "react";
import { useEmpStore } from "../store/empStore";
import { useBurStore } from "../store/burStore";
import { useAffectationStore } from "../store/affectStore";
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import { SlidersHorizontal, Users ,  MonitorSmartphone ,Briefcase  } from 'lucide-react';
import {
  Chart,
  Pie,
  Bar,
  Line,
  Doughnut,
  Scatter
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  TimeScale,
} from "chart.js";
import { TreemapController, TreemapElement } from "chartjs-chart-treemap";
import { Treemap, ResponsiveContainer } from 'recharts';
// Register all ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  TimeScale,
  TreemapController,
  TreemapElement
);

export default function Statistique() {
  const { employees, fetchEmployees } = useEmpStore();
  const { bureaux, bureauxGrouped, fetchBureaux , getBureauGrouped  } = useBurStore();
  const { affectations, fetchAffectations, getAssignmentStatsOverTime } = useAffectationStore();

  const [employesSansBureau, setEmployesSansBureau] = useState([]);
  const [bureauxOccupes, setBureauxOccupes] = useState([]);
  const [bureauxDisponibles, setBureauxDisponibles] = useState([]);

  useEffect(() => {
    fetchEmployees();
    fetchBureaux();
    getBureauGrouped();
    fetchAffectations();
    
  }, []);

  useEffect(() => {
    const affs = Array.isArray(affectations) ? affectations : [];
    const affMatricules = new Set(affs.map((a) => a.matricule));
    setEmployesSansBureau(employees.filter((e) => !affMatricules.has(e.matricule)));

    const numsOccupes = new Set(affs.map((a) => a.numero));
    setBureauxOccupes(bureaux.filter((b) => numsOccupes.has(b.numero)));
    setBureauxDisponibles(bureaux.filter((b) => !numsOccupes.has(b.numero)));
  }, [employees, bureaux, affectations]);

  // 1️⃣ Employees by Function (Doughnut)
  const [groupBy, setGroupBy] = useState('emploi'); // Default to 'emploi'

const empGroupStats = employees.reduce((acc, emp) => {
  const key = groupBy === 'fonction' ? emp.fonction : 
              groupBy === 'emploi' ? emp.emploi : 
              emp.affectation;
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});

const pieData = {
  labels: Object.keys(empGroupStats).map(
    (group) => `${group} (${empGroupStats[group]})`
  ),
  datasets: [{
    data: Object.values(empGroupStats),
    backgroundColor: [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#8AC24A', '#EA3546', '#662E9B', '#F86624',
      '#1d4ed8', '#16a34a', '#eab308', '#ef4444', '#8b5cf6',
      '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#64b5f6'
    ],
    borderWidth: 1,
    borderColor: "#fff",
  }],
};
  // 2️⃣ Bureaux by Level (Bar + Line)
  const burByLevel = bureaux.reduce((acc, b) => {
    if (!acc[b.niveau]) {
      acc[b.niveau] = { count: 0, totalArea: 0, avgArea: 0 };
    }
    acc[b.niveau].count += 1;
    acc[b.niveau].totalArea += b.superficie;
    acc[b.niveau].avgArea = acc[b.niveau].totalArea / acc[b.niveau].count;
    return acc;
  }, {});

  const barData = {
    labels: Object.keys(burByLevel).map((n) => `Niveau ${n}`),
    datasets: [
      {
        label: "Nombre de bureaux",
        data: Object.values(burByLevel).map((v) => v.count),
        backgroundColor: "#3b82f6",
        yAxisID: "y",
      },
      {
        label: "Superficie moyenne (m²)",
        data: Object.values(burByLevel).map((v) => v.avgArea),
        backgroundColor: "#10b981",
        yAxisID: "y1",
        type: "line",
      },
    ],
    borderWidth:2,
  };

  // 3️⃣ Employee Distribution by Bureau (Horizontal Bar)
  const employeesPerBureau = bureaux.map((bureau) => {
    const assignedEmployees = affectations.filter(a => a.numero === bureau.numero);
    return {
      bureau: `Bureau ${bureau.numero} (N${bureau.niveau})`,
      count: assignedEmployees.length,
      employees: assignedEmployees.map(a => 
        employees.find(e => e.matricule === a.matricule)?.nom || "Inconnu"
      ),
      superficie: bureau.superficie
    };
  }).sort((a, b) => b.count - a.count);

  const bureauDistributionData = {
    labels: employeesPerBureau.map(b => b.bureau),
    datasets: [{
      label: "Nombre d'employés",
      data: employeesPerBureau.map(b => b.count),
      backgroundColor: 'rgba(153, 102, 255, 0.3)',
      borderWidth: 1,
      
      borderColor:'rgb(153, 102, 255)'
    }],
  };

  // 4️⃣ Affectations Over Time (Line)
  const lineChartData = getAssignmentStatsOverTime();

  // 5️⃣ Niveau vs Superficie (Scatter)
  const scatterData = bureaux.map((b) => ({
    x: b.niveau,
    y: b.superficie,
    bureauNum: b.numero,
  }));


const COLORS = ['#8889DD', '#9067E4', '#8DC77B', '#A5D297', '#E2CF45', '#F8C12D'];

class CustomizedContent extends PureComponent {
  render() {
    const { root, depth, x, y, width, height, index, payload, colors, rank, name } = this.props;

    // Add null checks for root and its children
    if (!root || !root.children) {
      return null;
    }

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: depth < 2 ? colors[Math.floor((index / root.children.length) * 6)] : '#ffffff00',
            stroke: '#fff',
            strokeWidth: 2 / (depth + 1e-10),
            strokeOpacity: 1 / (depth + 1e-10),
          }}
        />
        {depth === 1 ? (
          <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={14}>
            {name}
          </text>
        ) : null}
        {depth === 1 ? (
          <text x={x + 4} y={y + 18} fill="#fff" fontSize={16} fillOpacity={0.9}>
            {index + 1}
          </text>
        ) : null}
      </g>
    );
  }
}


  return (
    <div className="space-y-8 p-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Employees without office card */}
  <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex items-start">
    <div className="p-2 rounded-lg bg-red-100 text-red-600 mr-4">
      <Users className="w-5 h-5" />
    </div>
    <div>
      <h3 className="text-sm font-medium text-red-700 uppercase tracking-wider">Employés sans bureau</h3>
      <p className="text-2xl font-bold text-red-800 mt-1">
        {employesSansBureau.length}
        <span className="text-sm font-normal ml-2 text-red-600">
          ({employees.length > 0 ? Math.round((employesSansBureau.length / employees.length) * 100) : 0}%)
        </span>
      </p>
    </div>
  </div>

  {/* Occupied offices card */}
  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex items-start">
    <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600 mr-4">
      <LocalLibraryIcon className="w-5 h-5" />
    </div>
    <div>
      <h3 className="text-sm font-medium text-yellow-700 uppercase tracking-wider">Bureaux occupés</h3>
      <p className="text-2xl font-bold text-yellow-800 mt-1">
        {bureauxOccupes.length}
        <span className="text-sm font-normal ml-2 text-yellow-600">
          ({bureaux.length > 0 ? Math.round((bureauxOccupes.length / bureaux.length) * 100) : 0}%)
        </span>
      </p>
    </div>
  </div>

  {/* Available offices card */}
  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex items-start">
    <div className="p-2 rounded-lg bg-green-100 text-green-600 mr-4">
      <MonitorSmartphone className="w-5 h-5" />
    </div>
    <div>
      <h3 className="text-sm font-medium text-green-700 uppercase tracking-wider">Bureaux disponibles</h3>
      <p className="text-2xl font-bold text-green-800 mt-1">
        {bureauxDisponibles.length}
        <span className="text-sm font-normal ml-2 text-green-600">
          ({bureaux.length > 0 ? Math.round((bureauxDisponibles.length / bureaux.length) * 100) : 0}%)
        </span>
      </p>
    </div>
  </div>
</div>
      {/* Charts Grid */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 p-2 md:p-0">
  {/* 1️⃣ Employees by Function */}
  <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm md:shadow">
    <div className="flex flex-col smd:flex-row justify-between items-start sm:items-center gap-2 mb-3">
      <h2 className="text-lg md:text-xl font-semibold text-blue-950 whitespace-nowrap">
        👥 Employés par {groupBy} (Total : {employees.length})
      </h2>
      <select 
        onChange={(e) => setGroupBy(e.target.value)} 
        className="bg-white text-sm md:text-base text-gray-900 border border-accent rounded-md px-2 py-1 w-full sm:w-40"
        defaultValue="🔍 Filter"
      >
        <option disabled>🔍 Filter</option>
        <option value="fonction">🛠️ Fonction</option>
        <option value="emploi">💼 Emploi</option>
        <option value="affectation">🗂️ Affectation</option>
      </select>
    </div>
    <div className="h-64 md:h-72">
      <Doughnut 
        data={pieData}
        options={{
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.label}: ${ctx.raw} (${((ctx.raw * 100) / employees.length).toFixed(1)}%)`
              }
            }
          }
        }}
      />
    </div>
  </div>

  {/* 2️⃣ Bureaux by Level */}
  <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm md:shadow">
    <h2 className="text-lg md:text-xl font-semibold mb-3 text-blue-950">
      🏢 Bureaux par niveau (Total: {bureaux.length})
    </h2>
    <div className="h-64 md:h-72">
      <Bar 
        data={barData}
        options={{
          maintainAspectRatio: false,
          responsive: true,
          scales: {
            y: { 
              title: { display: true, text: "Nombre de bureaux" },
              beginAtZero: true
            },
            y1: { 
              title: { display: true, text: "Superficie moyenne (m²)" },
              position: "right",
              grid: { drawOnChartArea: false },
              beginAtZero: true
            }
          }
        }}
      />
    </div>
  </div>

  {/* 3️⃣ Employee Distribution by Bureau */}
  <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm md:shadow lg:col-span-2">
    <h2 className="text-lg md:text-xl font-semibold mb-3 text-blue-950">
      🏢 Répartition des employés par bureau
    </h2>
    <div className="h-80 md:h-96">
      <Bar
        data={bureauDistributionData}
        options={{
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: {
            tooltip: {
              callbacks: {
                afterBody: (context) => {
                  const bureau = employeesPerBureau[context[0].dataIndex];
                  return [
                    `Superficie: ${bureau.superficie}m²`,
                    `Employés: ${bureau.employees.join(", ")}`
                  ];
                }
              }
            }
          },
          scales: {
            x: { 
              beginAtZero: true, 
              title: { display: true, text: "Nombre d'employés" } 
            }
          }
        }}
      />
    </div>
  </div>

  {/* 5️⃣ Niveau vs Superficie */}
  <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm md:shadow">
    <h2 className="text-lg md:text-xl font-semibold mb-3 text-blue-950">
      📊 Niveau vs Superficie des bureaux
    </h2>
    <div className="h-64 md:h-72">
      <Scatter
        data={{
          datasets: [{
            label: "Bureaux",
            data: scatterData,
            backgroundColor: "#f97316",
          }],
        }}
        options={{
          maintainAspectRatio: false,
          scales: {
            x: { 
              title: { display: true, text: "Niveau" }, 
              ticks: { stepSize: 1 } 
            },
            y: { 
              title: { display: true, text: "Superficie (m²)" } 
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const point = scatterData[ctx.dataIndex];
                  return `Bureau ${point.bureauNum}: ${point.y}m²`;
                }
              }
            }
          }
        }}
      />
    </div>
  </div>

  {/* 6️⃣ Treemap */}
  <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm md:shadow">
    <h2 className="text-lg md:text-xl font-semibold mb-3 text-blue-950">
      🗂 Répartition des bureaux (Taille = Superficie)
    </h2>
    <div className="h-64 md:h-72 lg:h-80">
      {bureauxGrouped ? (
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={bureauxGrouped}
            dataKey="size"
            stroke="#fff"
            fill="#8884d8"
            content={<CustomizedContent colors={COLORS} />}
          />
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p>Chargement des données...</p>
        </div>
      )}
    </div>
  </div>

  {/* 4️⃣ Affectations Over Time */}
  <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm md:shadow lg:col-span-2">
    <h2 className="text-lg md:text-xl font-semibold mb-3 text-blue-950">
      📅 Évolution des affectations
    </h2>
    <div className="h-64 md:h-72">
      <Line 
        data={lineChartData} 
        options={{ maintainAspectRatio: false }}
      />
    </div>
  </div>
</div>
    </div>
  );
}
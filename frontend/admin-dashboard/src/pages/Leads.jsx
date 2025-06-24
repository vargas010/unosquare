import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { FaRegEdit, FaTrashAlt, FaEye } from 'react-icons/fa'; // Importamos los iconos
import { FaPlus } from 'react-icons/fa';
import UtcClock from "../components/UtcClock";
import { FaCaretDown } from 'react-icons/fa'; // Agregar esta línea para importar FaCaretDown

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda
  const [showColumns, setShowColumns] = useState({
    name: true,
    last_name: true,
    phone: true,
    personal_email: true,
    work_email: true,
  }); // Estado para las columnas a mostrar
  const [showDropdown, setShowDropdown] = useState(false); // Para mostrar/ocultar el dropdown de columnas
  const [orderBy, setOrderBy] = useState('asc'); // Para controlar el orden (ascendente o descendente)
  const navigate = useNavigate();

  const fetchLeads = () => {
    api.get('/leads')
      .then(res => {
        setLeads(res.data.items || []);
      })
      .catch(err => {
        console.error('Error al obtener leads:', err);
      });
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Función para eliminar un lead
  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este lead?")) {
      api.delete(`/leads/${id}`)
        .then(() => {
          fetchLeads();
        })
        .catch(err => {
          console.error("Error al eliminar lead:", err);
        });
    }
  };

  // Función para manejar la búsqueda
  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.personal_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.work_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para manejar el orden de la tabla
  const handleDateOrder = (order) => {
    setOrderBy(order); // 'asc' o 'desc'
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Leads Registrados</h1>
        <button
          onClick={() => navigate('/leads/create')}
          className="border-2 border-green-600 text-green-600 px-4 py-2 rounded hover:bg-green-600 hover:text-white transition duration-200 flex items-center"
        >
          <FaPlus className="mr-2" />
          New Lead
        </button>
      </div>

      <UtcClock />

      {/* Campo de búsqueda con un diseño más pequeño */}
      <div className="mb-4 w-full max-w-xs">
        <input
          type="text"
          placeholder="Buscar..."
          className="border-2 border-gray-300 px-3 py-2 rounded w-full focus:outline-none focus:border-blue-500 transition duration-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Actualizamos el término de búsqueda
        />
      </div>

      {/* Botón de Selección de Columnas */}
      <button
        onClick={() => setShowDropdown(!showDropdown)} // Toggle para mostrar el dropdown
        className="border-2 border-blue-600 text-blue-600 px-3 py-1 rounded flex items-center mb-4"
      >
        <FaCaretDown className="mr-2" />
        Seleccionar Columnas
      </button>

      {/* Dropdown para selección de columnas */}
      {showDropdown && (
        <div className="p-4 border-2 border-blue-600 rounded w-48 bg-white shadow-lg">
          <div className="mb-3">
            <label className="block font-semibold text-gray-700 mb-1">
              <input
                type="checkbox"
                value="name"
                checked={showColumns.name}
                onChange={(e) => setShowColumns({ ...showColumns, name: e.target.checked })}
                className="mr-2"
              />
              Nombre
            </label>
            <label className="block font-semibold text-gray-700 mb-1">
              <input
                type="checkbox"
                value="last_name"
                checked={showColumns.last_name}
                onChange={(e) => setShowColumns({ ...showColumns, last_name: e.target.checked })}
                className="mr-2"
              />
              Apellido
            </label>
            <label className="block font-semibold text-gray-700 mb-1">
              <input
                type="checkbox"
                value="phone"
                checked={showColumns.phone}
                onChange={(e) => setShowColumns({ ...showColumns, phone: e.target.checked })}
                className="mr-2"
              />
              Teléfono
            </label>
            <label className="block font-semibold text-gray-700 mb-1">
              <input
                type="checkbox"
                value="personal_email"
                checked={showColumns.personal_email}
                onChange={(e) => setShowColumns({ ...showColumns, personal_email: e.target.checked })}
                className="mr-2"
              />
              Correo Personal
            </label>
            <label className="block font-semibold text-gray-700 mb-1">
              <input
                type="checkbox"
                value="work_email"
                checked={showColumns.work_email}
                onChange={(e) => setShowColumns({ ...showColumns, work_email: e.target.checked })}
                className="mr-2"
              />
              Correo Laboral
            </label>
          </div>
        </div>
      )}

      <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
        <thead className="bg-blue-900 text-white">
          <tr>
            {showColumns.name && <th className="py-2 px-4 text-left cursor-pointer">Nombre</th>}
            {showColumns.last_name && <th className="py-2 px-4 text-left cursor-pointer">Apellido</th>}
            {showColumns.phone && <th className="py-2 px-4 text-left cursor-pointer">Teléfono</th>}
            {showColumns.personal_email && <th className="py-2 px-4 text-left cursor-pointer">Correo Personal</th>}
            {showColumns.work_email && <th className="py-2 px-4 text-left cursor-pointer">Correo Laboral</th>}
            <th className="py-2 px-4 text-left">Acciones</th>
            <th className="py-2 px-4 text-left">
              {/* Botón para ordenar por más recientes o más antiguos */}
              <button
                onClick={() => handleDateOrder(orderBy === 'asc' ? 'desc' : 'asc')}
                className="border-2 border-blue-600 text-blue-600 px-4 py-2 rounded"
              >
                {orderBy === 'asc' ? 'Más antiguos' : 'Más recientes'}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredLeads.map((lead) => (
            <tr key={lead.id} className="border-b">
              {showColumns.name && <td className="py-2 px-4">{lead.name}</td>}
              {showColumns.last_name && <td className="py-2 px-4">{lead.last_name}</td>}
              {showColumns.phone && <td className="py-2 px-4">{lead.phone}</td>}
              {showColumns.personal_email && <td className="py-2 px-4">{lead.personal_email}</td>}
              {showColumns.work_email && <td className="py-2 px-4">{lead.work_email}</td>}
              <td className="py-2 px-4 space-x-2">
                <button
                  onClick={() => navigate(`/leads/edit/${lead.id}`)}
                  className="border-2 border-yellow-500 text-yellow-500 px-3 py-1 rounded hover:bg-yellow-500 hover:text-white transition duration-200"
                >
                  <FaRegEdit />
                </button>
                <button
                  onClick={() => handleDelete(lead.id)}
                  className="border-2 border-red-500 text-red-500 px-3 py-1 rounded hover:bg-red-500 hover:text-white transition duration-200"
                >
                  <FaTrashAlt />
                </button>
                <button
                  onClick={() => navigate(`/leads/view/${lead.id}`)}
                  className="border-2 border-blue-600 text-blue-600 px-3 py-1 rounded hover:bg-blue-600 hover:text-white transition duration-200"
                >
                  <FaEye />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leads;

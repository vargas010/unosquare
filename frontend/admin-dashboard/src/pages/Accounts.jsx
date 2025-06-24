import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { FaPlus, FaEye, FaCaretDown } from 'react-icons/fa'; // Iconos necesarios
import UtcClock from "../components/UtcClock";

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' }); // Configuración de orden
  const [showOptions, setShowOptions] = useState(5); // Número de registros a mostrar
  const [showColumns, setShowColumns] = useState({
    id: true,
    name: true,
    phone: true,
    website: true,
  }); // Estado para las columnas a mostrar
  const [showDropdown, setShowDropdown] = useState(false); // Para mostrar/ocultar el dropdown de columnas
  const [orderBy, setOrderBy] = useState('asc'); // Para controlar el orden (ascendente o descendente)
  const navigate = useNavigate();

  const fetchAccounts = () => {
    api.get('/accounts')
      .then(res => {
        setAccounts(res.data.items || []);
      })
      .catch(err => {
        console.error('Error al obtener cuentas:', err);
      });
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Función para manejar el orden
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Función para ordenar los registros por fecha
  const handleDateOrder = (order) => {
    setOrderBy(order); // 'asc' o 'desc'
  };

  // Ordenar las cuentas según el orden seleccionado (nombre o fecha)
  const sortedAccounts = [...accounts].sort((a, b) => {
    if (orderBy === 'asc') {
      return new Date(a.createdAt) - new Date(b.createdAt); // Más antiguos
    } else {
      return new Date(b.createdAt) - new Date(a.createdAt); // Más recientes
    }
  });

  // Filtrar las cuentas con base en el término de búsqueda
  const filteredAccounts = sortedAccounts.filter(account =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mostrar solo los primeros "n" registros
  const displayedAccounts = filteredAccounts.slice(0, showOptions);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Cuentas Registradas</h1>
        <button
          onClick={() => navigate('/accounts/create')}
          className="border-2 border-green-600 text-green-600 px-4 py-2 rounded hover:bg-green-600 hover:text-white transition duration-200 flex items-center"
        >
          <FaPlus className="mr-2" />
          New Account
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
                value="id"
                checked={showColumns.id}
                onChange={(e) => setShowColumns({ ...showColumns, id: e.target.checked })}
                className="mr-2"
              />
              ID
            </label>
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
                value="website"
                checked={showColumns.website}
                onChange={(e) => setShowColumns({ ...showColumns, website: e.target.checked })}
                className="mr-2"
              />
              Sitio Web
            </label>
          </div>
        </div>
      )}

      <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
        <thead className="bg-blue-900 text-white">
          <tr>
            {showColumns.id && <th className="py-2 px-4 text-left cursor-pointer" onClick={() => handleSort('id')}>ID</th>}
            {showColumns.name && <th className="py-2 px-4 text-left cursor-pointer" onClick={() => handleSort('name')}>Nombre</th>}
            {showColumns.website && <th className="py-2 px-4 text-left cursor-pointer" onClick={() => handleSort('website')}>Sitio Web</th>}
            {showColumns.phone && <th className="py-2 px-4 text-left cursor-pointer" onClick={() => handleSort('phone')}>Teléfono</th>}
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
          {displayedAccounts.map((account) => (
            <tr key={account.id} className="border-b">
              {showColumns.id && <td className="py-2 px-4">{account.id}</td>}
              {showColumns.name && <td className="py-2 px-4">{account.name}</td>}
              {showColumns.website && <td className="py-2 px-4">{account.website}</td>}
              {showColumns.phone && <td className="py-2 px-4">{account.phone}</td>}
              <td className="py-2 px-4">
                <button
                  onClick={() => navigate(`/accounts/view/${account.id}`)}
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

export default Accounts;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { FaPlus, FaEye, FaChevronLeft, FaChevronRight, FaRedoAlt, FaUndoAlt, FaCaretDown, FaChevronUp, FaChevronDown } from 'react-icons/fa'; // Iconos necesarios
import UtcClock from "../../components/UtcClock";

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda
  const [orderBy, setOrderBy] = useState('asc'); // Para controlar el orden (ascendente o descendente)
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5); // Filas por página
  const [showAllRecords, setShowAllRecords] = useState(false); // Estado para mostrar todos los registros
  const [showColumns, setShowColumns] = useState({
    id: true,
    name: true,
    phone: true,
    website: true,
  }); // Estado para las columnas a mostrar
  const [showDropdown, setShowDropdown] = useState(false); // Para mostrar/ocultar el dropdown de columnas
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
  const handleDateOrder = () => {
    // Cambia el estado de orden cuando el usuario haga clic en el botón
    setOrderBy(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  // Ordenar las cuentas según el orden seleccionado (por fecha)
  const sortedAccounts = [...accounts].sort((a, b) => {
    // Asegurarse de que `createdAt` sea una fecha válida antes de compararla
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);

    // Verificar si las fechas son válidas
    if (isNaN(dateA) || isNaN(dateB)) {
      return 0; // Si no es una fecha válida, no se ordena
    }

    if (orderBy === 'asc') {
      return dateA - dateB; // Más antiguos primero
    } else {
      return dateB - dateA; // Más recientes primero
    }
  });

  // Filtrar las cuentas con base en el término de búsqueda
  const filteredAccounts = sortedAccounts.filter(account =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mostrar solo los primeros "n" registros
  const displayedAccounts = showAllRecords
    ? filteredAccounts // Mostrar todos los registros si showAllRecords es true
    : filteredAccounts.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredAccounts.length / rowsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const showAll = () => {
    setShowAllRecords(true); // Muestra todos los registros
    setCurrentPage(1); // Reinicia la página a la 1
  };

  const showSome = () => {
    setShowAllRecords(false); // Muestra solo 5 registros
    setCurrentPage(1); // Reinicia la página a la 1
  };

  if (!accounts) return <div className="p-6">Cargando cuentas...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Cuentas Registradas</h1>
        <button
          onClick={() => navigate('/accounts/create')}
          className="border-2 border-green-600 text-green-600 px-4 py-2 rounded hover:bg-green-600 hover:text-white transition duration-200 flex items-center"
        >
          <FaPlus className="mr-2" />
          Nueva Cuenta
        </button>
      </div>

      <UtcClock />

      {/* Campo de búsqueda */}
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

      {/* Contenedor azul para los botones */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={handleDateOrder}
            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            title="Ordenar por más recientes/más antiguos"
          >
            {orderBy === 'asc' ? <FaRedoAlt /> : <FaUndoAlt />}
          </button>
          <button
            onClick={prevPage}
            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            title="Página anterior"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={nextPage}
            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            title="Página siguiente"
          >
            <FaChevronRight />
          </button>
          <button
            onClick={showAllRecords ? showSome : showAll} // Alterna entre mostrar todos los datos o solo 5 registros
            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            title={showAllRecords ? "Mostrar 5 registros" : "Mostrar todos los datos"}
          >
            {showAllRecords ? <FaChevronDown /> : <FaChevronUp />}
          </button>
        </div>
      </div>

      <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
        <thead className="bg-blue-900 text-white">
          <tr>
            {showColumns.id && <th className="py-2 px-4 text-left cursor-pointer">ID</th>}
            {showColumns.name && <th className="py-2 px-4 text-left cursor-pointer">Nombre</th>}
            {showColumns.website && <th className="py-2 px-4 text-left cursor-pointer">Sitio Web</th>}
            {showColumns.phone && <th className="py-2 px-4 text-left cursor-pointer">Teléfono</th>}
            <th className="py-2 px-4 text-left">Acciones</th>
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

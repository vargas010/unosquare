import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import {
  FaPlus,
  FaEye,
  FaRegEdit,
  FaChevronLeft,
  FaChevronRight,
  FaSortAmountUp,
  FaSortAmountDown,
  FaChevronUp,
  FaChevronDown
} from 'react-icons/fa';
import UtcClock from "../../components/UtcClock";

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [showAllRecords, setShowAllRecords] = useState(false);
  const [showColumns, setShowColumns] = useState({
    id: true,
    name: true,
    phone: true,
    website: true,
  });
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

  const sortedAccounts = useMemo(() => {
    const sorted = [...accounts].sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return orderBy === 'asc'
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });
    return sorted.filter(account =>
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.phone.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [accounts, searchTerm, orderBy]);

  const totalPages = Math.ceil(sortedAccounts.length / rowsPerPage);
  const displayedAccounts = showAllRecords
    ? sortedAccounts
    : sortedAccounts.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const showAll = () => {
    setShowAllRecords(true);
    setCurrentPage(1);
  };

  const showSome = () => {
    setShowAllRecords(false);
    setCurrentPage(1);
  };

  const handleOrderChange = () => {
    setOrderBy(orderBy === 'asc' ? 'desc' : 'asc');
  };

  if (!accounts) return <div className="p-6">Cargando cuentas...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Accounts</h1>
        <button
          onClick={() => navigate('/accounts/create')}
          className="px-4 py-2 border-2 border-green-600 text-green-600 rounded hover:bg-green-600 hover:text-white transition-colors"
        >
          <FaPlus className="mr-2" />
          Nueva Cuenta
        </button>
      </div>

      <UtcClock />

      {/* Búsqueda y paginación */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 w-full max-w-xs">
          <input
            type="text"
            placeholder="Buscar leads..."
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={prevPage}
              className="px-3 py-1 text-gray-700 hover:text-blue-600 rounded-md hover:bg-gray-100 bg-blue-100 transition-colors"
              title="Página anterior"
              disabled={currentPage === 1}
            >
              <FaChevronLeft />
            </button>
            <span className="text-sm text-gray-600">
              {currentPage}/{totalPages}
            </span>
            <button
              onClick={nextPage}
              className="px-3 py-1 text-gray-700 hover:text-blue-600 rounded-md hover:bg-gray-100 bg-blue-100 transition-colors"
              title="Página siguiente"
              disabled={currentPage === totalPages}
            >
              <FaChevronRight />
            </button>
          </div>

          <button
            onClick={showAllRecords ? showSome : showAll}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
            title={showAllRecords ? "Mostrar 5 registros" : "Mostrar todos los datos"}
          >
            {showAllRecords ? <FaChevronDown /> : <FaChevronUp />}
            {showAllRecords ? "Contraer" : "Expandir"}
          </button>
        </div>
      </div>

      {/* Ordenar y resumen */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4 items-center">
          <button
            onClick={handleOrderChange}
            className="flex items-center gap-1 px-3 py-1 text-gray-700 hover:text-blue-600 rounded-md hover:bg-gray-100 bg-blue-100 transition-colors"
            title="Ordenar por nombre"
          >
            {orderBy === 'asc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
            Ordenar
          </button>
          <span className="text-sm text-gray-600">
            Mostrando {displayedAccounts.length} de {sortedAccounts.length}
          </span>
        </div>
      </div>

      {/* Tabla */}
      <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
        <thead className="bg-blue-100 text-gray-800">
          <tr>
            {showColumns.id && <th className="py-2 px-4 text-left">ID</th>}
            {showColumns.name && <th className="py-2 px-4 text-left">Nombre</th>}
            {showColumns.website && <th className="py-2 px-4 text-left">Sitio Web</th>}
            {showColumns.phone && <th className="py-2 px-4 text-left">Teléfono</th>}
            <th className="py-2 px-4 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {displayedAccounts.map((account) => (
            <tr key={account.id} className="border-b hover:bg-gray-50">
              {showColumns.id && <td className="py-2 px-4">{account.id}</td>}
              {showColumns.name && <td className="py-2 px-4">{account.name}</td>}
              {showColumns.website && <td className="py-2 px-4">{account.website}</td>}
              {showColumns.phone && <td className="py-2 px-4">{account.phone}</td>}
              <td className="py-2 px-4 space-x-2">
                <button
                  onClick={() => navigate(`/accounts/view/${account.id}`)}
                  className="border-2 border-blue-600 text-blue-600 px-3 py-1 rounded hover:bg-blue-600 hover:text-white transition duration-200"
                  title="Ver cuenta"
                >
                  <FaEye />
                </button>
                <button
                  onClick={() => navigate(`/accounts/edit/${account.id}`)}
                  className="border-2 border-yellow-500 text-yellow-500 px-3 py-1 rounded hover:bg-yellow-500 hover:text-white transition duration-200"
                  title="Editar cuenta"
                >
                  <FaRegEdit />
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

import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { FaPlus, FaEye, FaRegEdit, FaTrashAlt, FaChevronLeft, FaChevronRight, FaSortAmountUp, FaSortAmountDown, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import UtcClock from "../components/UtcClock";

const handleDelete = (leadId) => {
  const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este lead?");
  if (confirmDelete) {
    api.delete(`/leads/${leadId}`)
      .then(res => {
        setLeads((prevLeads) => prevLeads.filter(lead => lead.id !== leadId));
        console.log("Lead eliminado correctamente");
      })
      .catch(err => {
        console.error("Error al eliminar el lead:", err);
      });
  }
};

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [showAllRecords, setShowAllRecords] = useState(false);
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

  const sortedLeads = useMemo(() => {
    const sorted = [...leads].sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return orderBy === 'asc'
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });

    return sorted.filter(lead =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.personal_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.work_email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [leads, searchTerm, orderBy]);

  const totalPages = Math.ceil(sortedLeads.length / rowsPerPage);
  const displayedLeads = showAllRecords
    ? sortedLeads
    : sortedLeads.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

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
    setOrderBy(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  if (!leads) return <div className="p-6">Cargando leads...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Historial de Leads</h1>
        <button
          onClick={() => navigate('/leads/create')}
          className="px-4 py-2 border-2 border-green-600 text-green-600 rounded hover:bg-green-600 hover:text-white transition-colors"
        >
          <FaPlus className="mr-2" />
          Nuevo Lead
        </button>
      </div>

      <UtcClock />

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
          {!showAllRecords && (
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
          )}

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

      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4 items-center">
          <button
            onClick={handleOrderChange}
            className="flex items-center gap-1 px-3 py-1 text-gray-700 hover:text-blue-600 rounded-md hover:bg-gray-100 bg-blue-100 transition-colors"
            title="Ordenar por más recientes/más antiguos"
          >
            {orderBy === 'asc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
            Ordenar
          </button>

          <span className="text-sm text-gray-600">
            Mostrando {displayedLeads.length} de {sortedLeads.length}
          </span>
        </div>
      </div>

      <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
        <thead className="bg-blue-100 text-gray-800">
          <tr>
            <th className="py-2 px-4 text-left cursor-pointer">Nombre</th>
            <th className="py-2 px-4 text-left cursor-pointer">Apellido</th>
            <th className="py-2 px-4 text-left cursor-pointer">Teléfono</th>
            <th className="py-2 px-4 text-left cursor-pointer">Correo Personal</th>
            <th className="py-2 px-4 text-left cursor-pointer">Correo Laboral</th>
            <th className="py-2 px-4 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {displayedLeads.map((lead) => (
            <tr key={lead.id} className="border-b hover:bg-gray-50">
              <td className="py-2 px-4">{lead.name}</td>
              <td className="py-2 px-4">{lead.last_name}</td>
              <td className="py-2 px-4">{lead.phone}</td>
              <td className="py-2 px-4">{lead.personal_email}</td>
              <td className="py-2 px-4">{lead.work_email}</td>
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
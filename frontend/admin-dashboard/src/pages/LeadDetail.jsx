import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { FaChevronUp, FaChevronDown, FaUndoAlt, FaRedoAlt } from 'react-icons/fa';

const LeadsDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [relations, setRelations] = useState([]);
  const [currentRelations, setCurrentRelations] = useState([]);
  const [pastRelations, setPastRelations] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda
  const [showColumns, setShowColumns] = useState({
    account_name: true,
    website: true,
    start_date: true,
    end_date: true,
    notes: true,
  }); // Estado para las columnas a mostrar
  const [showDropdown, setShowDropdown] = useState(false); // Para mostrar/ocultar el dropdown de columnas
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5); // Filas por página
  const [orderBy, setOrderBy] = useState('desc'); // Orden de las cuentas

  useEffect(() => {
    api.get(`/leads/${id}`)
      .then(res => setLead(res.data))
      .catch(err => console.error("Error al obtener lead:", err));

    api.get(`/account-leads?expand=account_id`)
      .then(res => {
        const relacionados = (res.data.items || []).filter(rel => String(rel.lead_id) === String(id));
        setRelations(relacionados);

        const actuales = relacionados.filter(rel => !rel.end_date || new Date(rel.end_date) > new Date());
        const pasadas = relacionados.filter(rel => rel.end_date && new Date(rel.end_date) <= new Date());

        setCurrentRelations(actuales);
        setPastRelations(pasadas);
      })
      .catch(err => console.error("Error al obtener relaciones:", err));
  }, [id]);

  // Filtrado de cuentas actuales
  const filteredCurrentRelations = currentRelations.filter(rel =>
    rel.expand?.account_id?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rel.expand?.account_id?.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rel.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtrado de historial de cuentas
  const filteredPastRelations = pastRelations.filter(rel =>
    rel.expand?.account_id?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rel.expand?.account_id?.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rel.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación de datos
  const paginateData = (data) => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return data.slice(startIndex, endIndex);
  };

  // Manejo del cambio de página
  const nextPage = () => {
    if (currentPage < Math.ceil(filteredCurrentRelations.length / rowsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const showAll = () => {
    setCurrentPage(1);
    setRowsPerPage(filteredCurrentRelations.length);
  };

  // Ordenar por más recientes o más antiguos
  const handleDateOrder = () => {
    const newOrder = orderBy === 'asc' ? 'desc' : 'asc';
    setOrderBy(newOrder);
    const sortedData = [...filteredCurrentRelations].sort((a, b) => {
      const dateA = new Date(a.start_date);
      const dateB = new Date(b.start_date);
      return newOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    setCurrentRelations(sortedData);
  };

  if (!lead) return <div className="p-6">Cargando detalles del lead...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Volver
        </button>

        <button
          onClick={() => navigate(`/leads/edit/${lead.id}`)}
          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded"
        >
          Editar Lead
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-2">
        <h1 className="text-2xl font-bold text-gray-800">Detalle del Lead</h1>
        <p><strong>ID:</strong> {lead.id}</p>
        <p><strong>Nombre:</strong> {lead.name} {lead.last_name}</p>
        <p><strong>Teléfono:</strong> {lead.phone || '—'}</p>
        <p><strong>Correo Personal:</strong> {lead.personal_email || '—'}</p>
        <p><strong>Correo Laboral:</strong> {lead.work_email || '—'}</p>
        <p><strong>Cargo:</strong> {lead.position || '—'}</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Cuentas Actuales</h2>
        
        {/* Campo de búsqueda para Cuentas Actuales */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar Cuenta..."
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
          Seleccionar Columnas
        </button>

        {/* Dropdown para selección de columnas */}
        {showDropdown && (
          <div className="p-4 border-2 border-blue-600 rounded w-48 bg-white shadow-lg">
            <div className="mb-3">
              <label className="block font-semibold text-gray-700 mb-1">
                <input
                  type="checkbox"
                  value="account_name"
                  checked={showColumns.account_name}
                  onChange={(e) => setShowColumns({ ...showColumns, account_name: e.target.checked })}
                  className="mr-2"
                />
                Nombre de la Cuenta
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
              <label className="block font-semibold text-gray-700 mb-1">
                <input
                  type="checkbox"
                  value="start_date"
                  checked={showColumns.start_date}
                  onChange={(e) => setShowColumns({ ...showColumns, start_date: e.target.checked })}
                  className="mr-2"
                />
                Fecha Inicio
              </label>
              <label className="block font-semibold text-gray-700 mb-1">
                <input
                  type="checkbox"
                  value="end_date"
                  checked={showColumns.end_date}
                  onChange={(e) => setShowColumns({ ...showColumns, end_date: e.target.checked })}
                  className="mr-2"
                />
                Fecha Fin
              </label>
              <label className="block font-semibold text-gray-700 mb-1">
                <input
                  type="checkbox"
                  value="notes"
                  checked={showColumns.notes}
                  onChange={(e) => setShowColumns({ ...showColumns, notes: e.target.checked })}
                  className="mr-2"
                />
                Notas
              </label>
            </div>
          </div>
        )}

        {/* Tabla de Cuentas Actuales */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-900 text-white">
              <tr>
                {showColumns.account_name && <th className="py-3 px-4 text-left">Nombre de la Cuenta</th>}
                {showColumns.website && <th className="py-3 px-4 text-left">Sitio Web</th>}
                {showColumns.start_date && <th className="py-3 px-4 text-left">Fecha Inicio</th>}
                {showColumns.end_date && <th className="py-3 px-4 text-left">Fecha Fin</th>}
                {showColumns.notes && <th className="py-3 px-4 text-left">Notas</th>}
                {/* Botones de navegación dentro de la tabla */}
                <th className="py-3 px-4 text-left">
                  <div className="flex gap-1">
                    <button
                      onClick={prevPage}
                      className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      title="Página Anterior"
                    >
                      <FaChevronUp />
                    </button>
                    <button
                      onClick={nextPage}
                      className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      title="Página Siguiente"
                    >
                      <FaChevronDown />
                    </button>
                    <button
                      onClick={showAll}
                      className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      title="Mostrar Todos los Datos"
                    >
                      <FaChevronUp />
                      <FaChevronDown />
                    </button>
                    <button
                      onClick={handleDateOrder}
                      className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      title="Ordenar por Más Recientes/Más Antiguos"
                    >
                      {orderBy === 'asc' ? <FaRedoAlt /> : <FaUndoAlt />}
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCurrentRelations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-4 px-4 text-center text-gray-500">
                    No hay cuentas actuales.
                  </td>
                </tr>
              ) : (
                paginateData(filteredCurrentRelations).map(rel => (
                  <tr key={rel.id} className="border-b">
                    {showColumns.account_name && <td className="py-2 px-4">{rel.expand?.account_id?.name || '—'}</td>}
                    {showColumns.website && <td className="py-2 px-4">{rel.expand?.account_id?.website || '—'}</td>}
                    {showColumns.start_date && <td className="py-2 px-4">{rel.start_date || '—'}</td>}
                    {showColumns.end_date && <td className="py-2 px-4">{rel.end_date || '—'}</td>}
                    {showColumns.notes && <td className="py-2 px-4">{rel.notes || '—'}</td>}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Historial de Cuentas */}
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Historial de Cuentas</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-800 text-white">
              <tr>
                {showColumns.account_name && <th className="py-3 px-4 text-left">Nombre de la Cuenta</th>}
                {showColumns.website && <th className="py-3 px-4 text-left">Sitio Web</th>}
                {showColumns.start_date && <th className="py-3 px-4 text-left">Fecha Inicio</th>}
                {showColumns.end_date && <th className="py-3 px-4 text-left">Fecha Fin</th>}
                {showColumns.notes && <th className="py-3 px-4 text-left">Notas</th>}
                {/* Botones de navegación dentro del encabezado del Historial de Cuentas */}
                <th className="py-3 px-4 text-left">
                  <div className="flex gap-1">
                    <button
                      onClick={prevPage}
                      className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      title="Página Anterior"
                    >
                      <FaChevronUp />
                    </button>
                    <button
                      onClick={nextPage}
                      className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      title="Página Siguiente"
                    >
                      <FaChevronDown />
                    </button>
                    <button
                      onClick={showAll}
                      className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      title="Mostrar Todos los Datos"
                    >
                      <FaChevronUp />
                      <FaChevronDown />
                    </button>
                    <button
                      onClick={handleDateOrder}
                      className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      title="Ordenar por Más Recientes/Más Antiguos"
                    >
                      {orderBy === 'asc' ? <FaRedoAlt /> : <FaUndoAlt />}
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPastRelations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-4 px-4 text-center text-gray-500">
                    Sin historial de cuentas.
                  </td>
                </tr>
              ) : (
                filteredPastRelations.map(rel => (
                  <tr key={rel.id} className="border-b">
                    {showColumns.account_name && <td className="py-2 px-4">{rel.expand?.account_id?.name || '—'}</td>}
                    {showColumns.website && <td className="py-2 px-4">{rel.expand?.account_id?.website || '—'}</td>}
                    {showColumns.start_date && <td className="py-2 px-4">{rel.start_date || '—'}</td>}
                    {showColumns.end_date && <td className="py-2 px-4">{rel.end_date || '—'}</td>}
                    {showColumns.notes && <td className="py-2 px-4">{rel.notes || '—'}</td>}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeadsDetails;

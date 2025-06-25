import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { FaChevronUp, FaChevronDown, FaUndoAlt, FaRedoAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const LeadsDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [relations, setRelations] = useState([]);
  const [currentRelations, setCurrentRelations] = useState([]);
  const [pastRelations, setPastRelations] = useState([]);
  const [searchTermCurrent, setSearchTermCurrent] = useState(''); // Estado para el término de búsqueda de cuentas actuales
  const [searchTermPast, setSearchTermPast] = useState(''); // Estado para el término de búsqueda del historial de cuentas
  const [showColumns, setShowColumns] = useState({
    account_name: true,
    website: true,
    start_date: true,
    end_date: true,
    notes: true,
  }); // Estado para las columnas a mostrar
  const [showDropdown, setShowDropdown] = useState(false); // Para mostrar/ocultar el dropdown de columnas

  // Estados independientes para paginación y orden en cada tabla
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5); // Filas por página
  const [orderBy, setOrderBy] = useState('desc'); // Orden de las cuentas
  const [showAllRecords, setShowAllRecords] = useState(false); // Estado para mostrar todos los registros

  const [historyPage, setHistoryPage] = useState(1); // Página del historial
  const [historyOrderBy, setHistoryOrderBy] = useState('desc'); // Orden del historial
  const [showHistoryAllRecords, setShowHistoryAllRecords] = useState(false); // Mostrar todos los registros del historial

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
    rel.expand?.account_id?.name.toLowerCase().includes(searchTermCurrent.toLowerCase()) ||
    rel.expand?.account_id?.website.toLowerCase().includes(searchTermCurrent.toLowerCase()) ||
    rel.notes.toLowerCase().includes(searchTermCurrent.toLowerCase())
  );

  // Filtrado de historial de cuentas
  const filteredPastRelations = pastRelations.filter(rel =>
    rel.expand?.account_id?.name.toLowerCase().includes(searchTermPast.toLowerCase()) ||
    rel.expand?.account_id?.website.toLowerCase().includes(searchTermPast.toLowerCase()) ||
    rel.notes.toLowerCase().includes(searchTermPast.toLowerCase())
  );

  // Paginación de datos (Cuentas Actuales)
  const paginateData = (data, page) => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return data.slice(startIndex, endIndex);
  };

  // Manejo del cambio de página para las cuentas actuales
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
    setShowAllRecords(true); // Muestra todos los registros
    setCurrentPage(1); // Reinicia la página a la 1
  };

  const showSome = () => {
    setShowAllRecords(false); // Muestra solo 5 registros
    setCurrentPage(1); // Reinicia la página a la 1
  };

  // Ordenar por más recientes o más antiguos (Cuentas Actuales)
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

  // Paginación de datos (Historial de Cuentas)
  const paginateHistoryData = (data, page) => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return data.slice(startIndex, endIndex);
  };

  // Manejo del cambio de página para el historial
  const nextHistoryPage = () => {
    if (historyPage < Math.ceil(filteredPastRelations.length / rowsPerPage)) {
      setHistoryPage(historyPage + 1);
    }
  };

  const prevHistoryPage = () => {
    if (historyPage > 1) {
      setHistoryPage(historyPage - 1);
    }
  };

  const showHistoryAll = () => {
    setShowHistoryAllRecords(true); // Muestra todos los registros del historial
    setHistoryPage(1); // Reinicia la página a la 1
  };

  const showHistorySome = () => {
    setShowHistoryAllRecords(false); // Muestra solo 5 registros del historial
    setHistoryPage(1); // Reinicia la página a la 1
  };

  // Ordenar por más recientes o más antiguos (Historial de Cuentas)
  const handleHistoryDateOrder = () => {
    const newOrder = historyOrderBy === 'asc' ? 'desc' : 'asc';
    setHistoryOrderBy(newOrder);
    const sortedData = [...filteredPastRelations].sort((a, b) => {
      const dateA = new Date(a.start_date);
      const dateB = new Date(b.start_date);
      return newOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    setPastRelations(sortedData);
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
            value={searchTermCurrent}
            onChange={(e) => setSearchTermCurrent(e.target.value)} // Actualizamos el término de búsqueda
          />
        </div>

        {/* Contenedor de botones de paginación para Cuentas Actuales */}
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
                paginateData(filteredCurrentRelations, currentPage).map(rel => (
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

        <h2 className="text-xl font-semibold text-gray-800 mb-2">Historial de Cuentas</h2>

        {/* Campo de búsqueda para Historial de Cuentas */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar en Historial..."
            className="border-2 border-gray-300 px-3 py-2 rounded w-full focus:outline-none focus:border-blue-500 transition duration-200"
            value={searchTermPast}
            onChange={(e) => setSearchTermPast(e.target.value)} // Actualizamos el término de búsqueda para el historial
          />
        </div>

        {/* Contenedor de botones de paginación para Historial */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <button
              onClick={handleHistoryDateOrder}
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              title="Ordenar por más recientes/más antiguos"
            >
              {historyOrderBy === 'asc' ? <FaRedoAlt /> : <FaUndoAlt />}
            </button>
            <button
              onClick={prevHistoryPage}
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              title="Página anterior"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={nextHistoryPage}
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              title="Página siguiente"
            >
              <FaChevronRight />
            </button>
            <button
              onClick={showHistoryAllRecords ? showHistorySome : showHistoryAll} // Alterna entre mostrar todos los datos del historial o solo 5 registros
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              title={showHistoryAllRecords ? "Mostrar 5 registros" : "Mostrar todos los datos"}
            >
              {showHistoryAllRecords ? <FaChevronDown /> : <FaChevronUp />}
            </button>
          </div>
        </div>

        {/* Tabla de Historial de Cuentas */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-800 text-white">
              <tr>
                {showColumns.account_name && <th className="py-3 px-4 text-left">Nombre de la Cuenta</th>}
                {showColumns.website && <th className="py-3 px-4 text-left">Sitio Web</th>}
                {showColumns.start_date && <th className="py-3 px-4 text-left">Fecha Inicio</th>}
                {showColumns.end_date && <th className="py-3 px-4 text-left">Fecha Fin</th>}
                {showColumns.notes && <th className="py-3 px-4 text-left">Notas</th>}
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
                paginateHistoryData(filteredPastRelations, historyPage).map(rel => (
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

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { FaChevronUp, FaChevronDown, FaUndoAlt, FaRedoAlt, FaChevronLeft, FaChevronRight, FaSortAmountUp, FaSortAmountDown } from 'react-icons/fa';

const LeadsDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [relations, setRelations] = useState([]);
  const [currentRelations, setCurrentRelations] = useState([]);
  const [pastRelations, setPastRelations] = useState([]);
  const [searchTermCurrent, setSearchTermCurrent] = useState('');
  const [searchTermPast, setSearchTermPast] = useState('');
  const [showColumns, setShowColumns] = useState({
    account_name: true,
    website: true,
    start_date: true,
    end_date: true,
    notes: true,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState('desc');
  const [showAllRecords, setShowAllRecords] = useState(false);

  const [historyPage, setHistoryPage] = useState(1);
  const [historyOrderBy, setHistoryOrderBy] = useState('desc');
  const [showHistoryAllRecords, setShowHistoryAllRecords] = useState(false);

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

  const filteredCurrentRelations = currentRelations.filter(rel =>
    rel.expand?.account_id?.name.toLowerCase().includes(searchTermCurrent.toLowerCase()) ||
    rel.expand?.account_id?.website.toLowerCase().includes(searchTermCurrent.toLowerCase()) ||
    rel.notes.toLowerCase().includes(searchTermCurrent.toLowerCase())
  );

  const filteredPastRelations = pastRelations.filter(rel =>
    rel.expand?.account_id?.name.toLowerCase().includes(searchTermPast.toLowerCase()) ||
    rel.expand?.account_id?.website.toLowerCase().includes(searchTermPast.toLowerCase()) ||
    rel.notes.toLowerCase().includes(searchTermPast.toLowerCase())
  );

  const paginateData = (data, page) => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return data.slice(startIndex, endIndex);
  };

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
    setShowAllRecords(true);
    setCurrentPage(1);
  };

  const showSome = () => {
    setShowAllRecords(false);
    setCurrentPage(1);
  };

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

  const paginateHistoryData = (data, page) => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return data.slice(startIndex, endIndex);
  };

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
    setShowHistoryAllRecords(true);
    setHistoryPage(1);
  };

  const showHistorySome = () => {
    setShowHistoryAllRecords(false);
    setHistoryPage(1);
  };

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
          className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded"
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
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar Cuenta..."
            value={searchTermCurrent}
            onChange={(e) => setSearchTermCurrent(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-100"
          />
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4 items-center">
            <button
              onClick={handleDateOrder}
              className="flex items-center gap-1 px-3 py-1 text-gray-700 hover:text-blue-600 rounded-md hover:bg-gray-100 bg-blue-100 transition-colors"
              title="Ordenar por más recientes/más antiguos"
            >
              {orderBy === 'asc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
              Ordenar
            </button>
            <span className="text-sm text-gray-600">
              Mostrando {showAllRecords ? filteredCurrentRelations.length : paginateData(filteredCurrentRelations, currentPage).length} de {filteredCurrentRelations.length} registros
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!showAllRecords && (
              <>
                <button
                  onClick={prevPage}
                  className="px-3 py-1 text-gray-700 hover:text-blue-600 rounded-md hover:bg-gray-100 bg-blue-100 transition-colors"
                  title="Página anterior"
                  disabled={currentPage === 1}
                >
                  <FaChevronLeft />
                </button>
                <span className="text-sm text-gray-600">
                  {currentPage}/{Math.ceil(filteredCurrentRelations.length / rowsPerPage)}
                </span>
                <button
                  onClick={nextPage}
                  className="px-3 py-1 text-gray-700 hover:text-blue-600 rounded-md hover:bg-gray-100 bg-blue-100 transition-colors"
                  title="Página siguiente"
                  disabled={currentPage === Math.ceil(filteredCurrentRelations.length / rowsPerPage)}
                >
                  <FaChevronRight />
                </button>
              </>
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

        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-100 text-gray-800">
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
                (showAllRecords ? filteredCurrentRelations : paginateData(filteredCurrentRelations, currentPage)).map(rel => (
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

      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Historial de Cuentas</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar en Historial..."
            value={searchTermPast}
            onChange={(e) => setSearchTermPast(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-100"
          />
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4 items-center">
            <button
              onClick={handleHistoryDateOrder}
              className="flex items-center gap-1 px-3 py-1 text-gray-700 hover:text-blue-600 rounded-md hover:bg-gray-100 bg-blue-100 transition-colors"
              title="Ordenar por más recientes/más antiguos"
            >
              {orderBy === 'asc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
              Ordenar
            </button>
            <span className="text-sm text-gray-600">
              Mostrando {showHistoryAllRecords ? filteredPastRelations.length : paginateHistoryData(filteredPastRelations, historyPage).length} de {filteredPastRelations.length} registros
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!showHistoryAllRecords && (
              <>
                <button
                  onClick={prevHistoryPage}
                  className="px-3 py-1 text-gray-700 hover:text-blue-600 rounded-md hover:bg-gray-100 bg-blue-100 transition-colors"
                  title="Página anterior"
                  disabled={historyPage === 1}
                >
                  <FaChevronLeft />
                </button>
                <span className="text-sm text-gray-600">
                  {historyPage}/{Math.ceil(filteredPastRelations.length / rowsPerPage)}
                </span>
                <button
                  onClick={nextHistoryPage}
                  className="px-3 py-1 text-gray-700 hover:text-blue-600 rounded-md hover:bg-gray-100 bg-blue-100 transition-colors"
                  title="Página siguiente"
                  disabled={historyPage === Math.ceil(filteredPastRelations.length / rowsPerPage)}
                >
                  <FaChevronRight />
                </button>
              </>
            )}
            <button
              onClick={showHistoryAllRecords ? showHistorySome : showHistoryAll}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
              title={showHistoryAllRecords ? "Mostrar 5 registros" : "Mostrar todos los datos"}
            >
              {showHistoryAllRecords ? <FaChevronDown /> : <FaChevronUp />}
              {showHistoryAllRecords ? "Contraer" : "Expandir"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-100 text-gray-800">
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
                (showHistoryAllRecords ? filteredPastRelations : paginateHistoryData(filteredPastRelations, historyPage)).map(rel => (
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
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { FaRegEdit, FaTrashAlt, FaEye, FaPlus } from 'react-icons/fa'; // Importamos los iconos
import { FaChevronLeft, FaChevronRight, FaRedoAlt, FaUndoAlt, FaChevronUp, FaChevronDown } from 'react-icons/fa';

const AccountView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [account, setAccount] = useState(null);
  const [currentLeads, setCurrentLeads] = useState([]);
  const [previousLeads, setPreviousLeads] = useState([]);
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [showColumns, setShowColumns] = useState({
    name: true,
    work_email: true,
    start_date: true,
    end_date: true,
  });
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Estados para paginación y ordenación
  const [orderByCurrentLeads, setOrderByCurrentLeads] = useState('asc');
  const [orderByPreviousLeads, setOrderByPreviousLeads] = useState('asc');
  
  const [currentPageCurrentLeads, setCurrentPageCurrentLeads] = useState(1);
  const [currentPagePreviousLeads, setCurrentPagePreviousLeads] = useState(1);
  const [rowsPerPage] = useState(5);
  
  const [showAllRecordsCurrentLeads, setShowAllRecordsCurrentLeads] = useState(false);
  const [showAllRecordsPreviousLeads, setShowAllRecordsPreviousLeads] = useState(false);

  useEffect(() => {
    api.get(`/accounts/${id}`)
      .then(res => setAccount(res.data))
      .catch(err => console.error("Error al cargar la cuenta:", err));

    fetchRelations();
    fetchLeads();
  }, [id]);

  const fetchRelations = () => {
    api.get('/account-leads?expand=lead_id')
      .then(res => {
        const relaciones = res.data.items || [];
        const actuales = relaciones.filter(r => r.account_id === id && !r.end_date);
        const anteriores = relaciones.filter(r => r.account_id === id && r.end_date);
        setCurrentLeads(actuales);
        setPreviousLeads(anteriores);
      })
      .catch(err => console.error("Error al cargar relaciones:", err));
  };

  const fetchLeads = () => {
    api.get('/leads')
      .then(res => setLeads(res.data.items || []))
      .catch(err => console.error("Error al obtener leads:", err));
  };

  const handleSortCurrentLeads = () => {
    setOrderByCurrentLeads(orderByCurrentLeads === 'asc' ? 'desc' : 'asc');
  };

  const handleSortPreviousLeads = () => {
    setOrderByPreviousLeads(orderByPreviousLeads === 'asc' ? 'desc' : 'asc');
  };

  const nextPageCurrentLeads = () => {
    if (currentPageCurrentLeads < Math.ceil(filteredCurrentLeads.length / rowsPerPage)) {
      setCurrentPageCurrentLeads(currentPageCurrentLeads + 1);
    }
  };

  const prevPageCurrentLeads = () => {
    if (currentPageCurrentLeads > 1) {
      setCurrentPageCurrentLeads(currentPageCurrentLeads - 1);
    }
  };

  const nextPagePreviousLeads = () => {
    if (currentPagePreviousLeads < Math.ceil(filteredPreviousLeads.length / rowsPerPage)) {
      setCurrentPagePreviousLeads(currentPagePreviousLeads + 1);
    }
  };

  const prevPagePreviousLeads = () => {
    if (currentPagePreviousLeads > 1) {
      setCurrentPagePreviousLeads(currentPagePreviousLeads - 1);
    }
  };

  const toggleShowAllCurrentLeads = () => {
    setShowAllRecordsCurrentLeads(!showAllRecordsCurrentLeads);
    setCurrentPageCurrentLeads(1);
  };

  const toggleShowAllPreviousLeads = () => {
    setShowAllRecordsPreviousLeads(!showAllRecordsPreviousLeads);
    setCurrentPagePreviousLeads(1);
  };

  const filteredCurrentLeads = currentLeads.filter(rel =>
    rel.lead_id && (leads.find(lead => lead.id === rel.lead_id)?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leads.find(lead => lead.id === rel.lead_id)?.work_email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredPreviousLeads = previousLeads.filter(rel =>
    rel.lead_id && (leads.find(lead => lead.id === rel.lead_id)?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leads.find(lead => lead.id === rel.lead_id)?.work_email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedLeads = (leads, orderBy) => {
    return leads.sort((a, b) => {
      const dateA = new Date(a.start_date);
      const dateB = new Date(b.start_date);
      return orderBy === 'asc' ? dateA - dateB : dateB - dateA;
    });
  };

  const displayedCurrentLeads = showAllRecordsCurrentLeads ? filteredCurrentLeads : sortedLeads(filteredCurrentLeads, orderByCurrentLeads).slice((currentPageCurrentLeads - 1) * rowsPerPage, currentPageCurrentLeads * rowsPerPage);
  const displayedPreviousLeads = showAllRecordsPreviousLeads ? filteredPreviousLeads : sortedLeads(filteredPreviousLeads, orderByPreviousLeads).slice((currentPagePreviousLeads - 1) * rowsPerPage, currentPagePreviousLeads * rowsPerPage);

  if (!account) return <div className="p-6">Cargando detalles de la cuenta...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Detalle de la Cuenta</h1>
      <div className="bg-white shadow rounded-lg p-6 space-y-2">
        <p><strong>ID:</strong> {account.id}</p>
        <p><strong>Nombre:</strong> {account.name}</p>
        <p><strong>Sitio Web:</strong> {account.website}</p>
        <p><strong>Dirección:</strong> {account.address}</p>
        <p><strong>Teléfono:</strong> {account.phone}</p>
        <p><strong>NIT:</strong> {account.tax_id}</p>
      </div>

      {/* Sección de "Leads Actuales en esta Cuenta" */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Leads Actuales en esta Cuenta</h2>

        <div className="mb-4 w-full max-w-xs">
          <input
            type="text"
            placeholder="Buscar Lead..."
            className="border-2 border-gray-300 px-3 py-2 rounded w-full focus:outline-none focus:border-blue-500 transition duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <button
              onClick={handleSortCurrentLeads}
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              title="Ordenar por más recientes/más antiguos"
            >
              {orderByCurrentLeads === 'asc' ? <FaRedoAlt /> : <FaUndoAlt />}
            </button>
            <button
              onClick={prevPageCurrentLeads}
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              title="Página anterior"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={nextPageCurrentLeads}
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              title="Página siguiente"
            >
              <FaChevronRight />
            </button>
            <button
              onClick={toggleShowAllCurrentLeads}
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              title={showAllRecordsCurrentLeads ? "Mostrar menos registros" : "Mostrar todos los registros"}
            >
              {showAllRecordsCurrentLeads ? <FaChevronDown /> : <FaChevronUp />}
            </button>
          </div>
        </div>

        {displayedCurrentLeads.length > 0 ? (
          <table className="min-w-full table-auto">
            <thead className="bg-blue-900 text-white">
              <tr>
                {showColumns.name && <th className="py-2 px-4 text-left">Nombre</th>}
                {showColumns.work_email && <th className="py-2 px-4 text-left">Correo</th>}
                {showColumns.start_date && <th className="py-2 px-4 text-left">Inicio</th>}
                <th className="py-2 px-4 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {displayedCurrentLeads.map(rel => {
                const lead = leads.find(l => l.id === rel.lead_id);
                return (
                  <tr key={rel.id} className="border-b">
                    {showColumns.name && <td className="py-2 px-4">{lead ? `${lead.name} ${lead.last_name}` : '—'}</td>}
                    {showColumns.work_email && <td className="py-2 px-4">{lead?.work_email || lead?.personal_email || "—"}</td>}
                    {showColumns.start_date && <td className="py-2 px-4">{rel.start_date}</td>}
                    <td className="py-2 px-4">
                      <button
                        onClick={() => handleRemoveLead(rel.id)}
                        className="border-2 border-red-500 text-red-500 px-3 py-1 rounded hover:bg-red-500 hover:text-white transition duration-200"
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">No hay leads trabajando actualmente aquí.</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Crear Lead
            </button>
          </div>
        )}
      </div>

      {/* Sección de "Historial de Leads en esta Cuenta" */}
      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Historial de Leads en esta Cuenta</h2>

        <div className="mb-4 w-full max-w-xs">
          <input
            type="text"
            placeholder="Buscar Lead..."
            className="border-2 border-gray-300 px-3 py-2 rounded w-full focus:outline-none focus:border-blue-500 transition duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <button
              onClick={handleSortPreviousLeads}
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              title="Ordenar por más recientes/más antiguos"
            >
              {orderByPreviousLeads === 'asc' ? <FaRedoAlt /> : <FaUndoAlt />}
            </button>
            <button
              onClick={prevPagePreviousLeads}
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              title="Página anterior"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={nextPagePreviousLeads}
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              title="Página siguiente"
            >
              <FaChevronRight />
            </button>
            <button
              onClick={toggleShowAllPreviousLeads}
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              title={showAllRecordsPreviousLeads ? "Mostrar menos registros" : "Mostrar todos los registros"}
            >
              {showAllRecordsPreviousLeads ? <FaChevronDown /> : <FaChevronUp />}
            </button>
          </div>
        </div>

        {displayedPreviousLeads.length > 0 ? (
          <table className="min-w-full table-auto">
            <thead className="bg-blue-900 text-white">
              <tr>
                {showColumns.name && <th className="py-2 px-4 text-left">Nombre</th>}
                {showColumns.work_email && <th className="py-2 px-4 text-left">Correo</th>}
                {showColumns.start_date && <th className="py-2 px-4 text-left">Inicio</th>}
                {showColumns.end_date && <th className="py-2 px-4 text-left">Fin</th>}
                <th className="py-2 px-4 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {displayedPreviousLeads.map(rel => {
                const lead = leads.find(l => l.id === rel.lead_id);
                return (
                  <tr key={rel.id} className="border-b">
                    {showColumns.name && <td className="py-2 px-4">{lead ? `${lead.name} ${lead.last_name}` : '—'}</td>}
                    {showColumns.work_email && <td className="py-2 px-4">{lead?.work_email || lead?.personal_email || '—'}</td>}
                    {showColumns.start_date && <td className="py-2 px-4">{rel.start_date}</td>}
                    {showColumns.end_date && <td className="py-2 px-4">{rel.end_date}</td>}
                    <td className="py-2 px-4">
                      <button
                        onClick={() => handleRestoreLead(rel.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Restaurar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-600">No hay historial de leads anteriores.</p>
        )}
      </div>

    </div>
  );
};

export default AccountView;

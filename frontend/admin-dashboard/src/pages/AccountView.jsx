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

  const [quickLead, setQuickLead] = useState({
    name: '',
    last_name: '',
    work_email: ''
  });

  const handleQuickLeadChange = (e) => {
    setQuickLead({ ...quickLead, [e.target.name]: e.target.value });
  };

  const handleQuickLeadCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/leads', quickLead);
      const createdLead = res.data;

      const nowUTC = new Date().toISOString();
      await api.post('/account-leads', {
        account_id: account.id,
        lead_id: createdLead.id,
        start_date: nowUTC,
        end_date: null,
        notes: ''
      });

      setShowModal(false);
      setQuickLead({ name: '', last_name: '', work_email: '' });
      fetchRelations();
      api.get('/leads')
        .then(res => setLeads(res.data.items || []))
        .catch(err => console.error("Error al actualizar leads:", err));
    } catch (err) {
      console.error("Error al crear y asignar lead:", err);
    }
  };
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

  const handleRemoveLead = (relationId) => {
    if (window.confirm("¿Deseas marcar este lead como finalizado en esta cuenta?")) {
      const today = new Date().toISOString().split("T")[0];
      api.patch(`/account-leads/${relationId}`, {
        end_date: today
      })
        .then(() => fetchRelations())
        .catch(err => console.error("Error al finalizar la relación:", err));
    }
  };

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
                    <td className="py-2 px-4">{lead ? `${lead.name} ${lead.last_name}` : '—'}</td>
                    <td className="py-2 px-4">{lead?.work_email || lead?.personal_email || "—"}</td>
                    <td className="py-2 px-4">{rel.start_date}</td>
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
                    <td className="py-2 px-4">{lead ? `${lead.name} ${lead.last_name}` : '—'}</td>
                    <td className="py-2 px-4">{lead?.work_email || lead?.personal_email || '—'}</td>
                    <td className="py-2 px-4">{rel.start_date}</td>
                    <td className="py-2 px-4">{rel.end_date}</td>
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


      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Agregar Lead a esta Cuenta</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const today = new Date().toISOString().split("T")[0];

            const payload = {
              account_id: account.id,
              lead_id: selectedLead,
              start_date: today,
              end_date: null,
              notes: ""
            };

            api.post('/account-leads', payload)
              .then(() => {
                setSelectedLead('');
                fetchRelations();
              })
              .catch(err => console.error("Error al agregar lead:", err));
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <select
              className="p-2 border rounded"
              required
              value={selectedLead}
              onChange={(e) => setSelectedLead(e.target.value)}
            >
              <option value="">Selecciona un lead</option>
              {leads.map(lead => {
                const yaAsignado = currentLeads.some(rel => rel.lead_id === lead.id && !rel.end_date);
                return (
                  <option key={lead.id} value={lead.id} disabled={yaAsignado}>
                    {lead.name} {lead.last_name} {yaAsignado ? "(Ya asignado)" : ""}
                  </option>
                );
              })}
            </select>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Asignar Lead
          </button>
        </form>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => navigate(`/accounts/edit/${id}`)}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          Editar Cuenta
        </button>
        <button
          onClick={() => navigate('/accounts')}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
        >
          Volver
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Crear Nuevo Lead</h2>
            <form onSubmit={handleQuickLeadCreate} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Nombre"
                value={quickLead.name}
                onChange={handleQuickLeadChange}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                name="last_name"
                placeholder="Apellido"
                value={quickLead.last_name}
                onChange={handleQuickLeadChange}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="email"
                name="work_email"
                placeholder="Correo laboral"
                value={quickLead.work_email}
                onChange={handleQuickLeadChange}
                className="w-full p-2 border rounded"
              />
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountView;

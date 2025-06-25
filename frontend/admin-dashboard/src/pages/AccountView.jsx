import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { FaTrashAlt, FaChevronLeft, FaChevronRight, FaRedoAlt, FaUndoAlt, FaChevronUp, FaChevronDown } from 'react-icons/fa';

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
      .then(res => {
        setLeads(res.data.items || []);
      })
      .catch(err => console.error("Error al cargar leads:", err));
  };

  const handleSortCurrentLeads = () => {
    const newOrder = orderByCurrentLeads === 'asc' ? 'desc' : 'asc';
    setOrderByCurrentLeads(newOrder);

    const sortedLeads = [...currentLeads].sort((a, b) => {
      const nameA = a.name.toUpperCase(); 
      const nameB = b.name.toUpperCase(); 

      if (newOrder === 'asc') {
        return nameA > nameB ? 1 : nameA < nameB ? -1 : 0;
      } else {
        return nameA < nameB ? 1 : nameA > nameB ? -1 : 0;
      }
    });

    setCurrentLeads(sortedLeads);
  };

  // Funciones de paginación para los leads actuales
  const prevPageCurrentLeads = () => {
    if (currentPageCurrentLeads > 1) {
      setCurrentPageCurrentLeads(currentPageCurrentLeads - 1);
    }
  };

  const nextPageCurrentLeads = () => {
    const totalPages = Math.ceil(currentLeads.length / rowsPerPage);
    if (currentPageCurrentLeads < totalPages) {
      setCurrentPageCurrentLeads(currentPageCurrentLeads + 1);
    }
  };

  // Funciones de paginación para los leads anteriores
  const prevPagePreviousLeads = () => {
    if (currentPagePreviousLeads > 1) {
      setCurrentPagePreviousLeads(currentPagePreviousLeads - 1);
    }
  };

  const nextPagePreviousLeads = () => {
    const totalPages = Math.ceil(previousLeads.length / rowsPerPage);
    if (currentPagePreviousLeads < totalPages) {
      setCurrentPagePreviousLeads(currentPagePreviousLeads + 1);
    }
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

  const toggleShowAllCurrentLeads = () => {
    setShowAllRecordsCurrentLeads(!showAllRecordsCurrentLeads);
  };

  const toggleShowAllPreviousLeads = () => {
    setShowAllRecordsPreviousLeads(!showAllRecordsPreviousLeads);
  };

  // Función para restaurar un lead
  const handleRestoreLead = (relationId) => {
    const leadToRestore = previousLeads.find(rel => rel.id === relationId);
    if (leadToRestore) {
      const today = new Date().toISOString().split("T")[0];
      api.patch(`/account-leads/${relationId}`, { 
        end_date: null // Eliminar la fecha de fin
      })
        .then(() => {
          api.post('/account-leads', {
            account_id: account.id,
            lead_id: leadToRestore.lead_id,
            start_date: today,
            end_date: null,
            notes: ''
          });
          fetchRelations(); // Recargar las relaciones
        })
        .catch(err => console.error("Error al restaurar el lead:", err));
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

        {currentLeads.length > 0 ? (
          <table className="min-w-full table-auto">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="py-2 px-4 text-left">Nombre</th>
                <th className="py-2 px-4 text-left">Correo</th>
                <th className="py-2 px-4 text-left">Inicio</th>
                <th className="py-2 px-4 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentLeads.map((rel) => {
                const lead = leads.find((l) => l.id === rel.lead_id);
                return (
                  <tr key={rel.id} className="border-b">
                    <td className="py-2 px-4">{lead ? `${lead.name} ${lead.last_name}` : "—"}</td>
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
              onClick={() => setOrderByPreviousLeads(orderByPreviousLeads === 'asc' ? 'desc' : 'asc')}
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

        {previousLeads.length > 0 ? (
          <table className="min-w-full table-auto">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="py-2 px-4 text-left">Nombre</th>
                <th className="py-2 px-4 text-left">Correo</th>
                <th className="py-2 px-4 text-left">Inicio</th>
                <th className="py-2 px-4 text-left">Fin</th>
                <th className="py-2 px-4 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {previousLeads.map((rel) => {
                const lead = leads.find((l) => l.id === rel.lead_id);
                return (
                  <tr key={rel.id} className="border-b">
                    <td className="py-2 px-4">{lead ? `${lead.name} ${lead.last_name}` : "—"}</td>
                    <td className="py-2 px-4">{lead?.work_email || lead?.personal_email || "—"}</td>
                    <td className="py-2 px-4">{rel.start_date}</td>
                    <td className="py-2 px-4">{rel.end_date}</td>
                    <td className="py-2 px-4">
                      <button
                        onClick={() => handleRestoreLead(rel.id)}
                        className="border-2 border-green-500 text-green-500 px-3 py-1 rounded hover:bg-green-500 hover:text-white transition duration-200"
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

      {/* Sección de agregar lead a la cuenta */}
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

      {/* Botones para editar o volver */}
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
    </div>
  );
};

export default AccountView;

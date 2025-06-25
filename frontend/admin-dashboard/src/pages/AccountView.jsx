import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";

// Componentes modularizados
import AccountDetails from "../components/account/AccountDetails";
import CurrentLeadsTable from "../components/account/CurrentLeadsTable";
import PreviousLeadsTable from "../components/account/PreviousLeadsTable";
import AddLeadForm from "../components/account/AddLeadForm";
import CreateQuickLeadModal from "../components/account/CreateQuickLeadModal";

const AccountView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [leads, setLeads] = useState([]);
  const [currentLeads, setCurrentLeads] = useState([]);
  const [previousLeads, setPreviousLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState("");
  const [showModal, setShowModal] = useState(false);

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
      fetchLeads();
    } catch (err) {
      console.error("Error al crear y asignar lead:", err);
    }
  };

  const handleAssignLead = (e) => {
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
  };

  const [searchTerm, setSearchTerm] = useState('');
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
      .catch(err => console.error("Error al cargar leads:", err));
  };

  const handleSortCurrentLeads = () => {
    const newOrder = orderByCurrentLeads === 'asc' ? 'desc' : 'asc';
    setOrderByCurrentLeads(newOrder);

    const sortedLeads = [...currentLeads].sort((a, b) => {
      const nameA = a.name?.toUpperCase() || '';
      const nameB = b.name?.toUpperCase() || '';
      return newOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

    setCurrentLeads(sortedLeads);
  };

  const prevPageCurrentLeads = () => {
    if (currentPageCurrentLeads > 1) setCurrentPageCurrentLeads(currentPageCurrentLeads - 1);
  };

  const nextPageCurrentLeads = () => {
    const totalPages = Math.ceil(currentLeads.length / rowsPerPage);
    if (currentPageCurrentLeads < totalPages) setCurrentPageCurrentLeads(currentPageCurrentLeads + 1);
  };

  const prevPagePreviousLeads = () => {
    if (currentPagePreviousLeads > 1) setCurrentPagePreviousLeads(currentPagePreviousLeads - 1);
  };

  const nextPagePreviousLeads = () => {
    const totalPages = Math.ceil(previousLeads.length / rowsPerPage);
    if (currentPagePreviousLeads < totalPages) setCurrentPagePreviousLeads(currentPagePreviousLeads + 1);
  };

  const handleRemoveLead = (relationId) => {
    if (window.confirm("¿Deseas marcar este lead como finalizado en esta cuenta?")) {
      const today = new Date().toISOString().split("T")[0];
      api.patch(`/account-leads/${relationId}`, { end_date: today })
        .then(() => fetchRelations())
        .catch(err => console.error("Error al finalizar la relación:", err));
    }
  };

  const toggleShowAllCurrentLeads = () => setShowAllRecordsCurrentLeads(!showAllRecordsCurrentLeads);
  const toggleShowAllPreviousLeads = () => setShowAllRecordsPreviousLeads(!showAllRecordsPreviousLeads);

  const handleRestoreLead = (relationId) => {
    const leadToRestore = previousLeads.find(rel => rel.id === relationId);
    if (leadToRestore) {
      const today = new Date().toISOString().split("T")[0];
      api.patch(`/account-leads/${relationId}`, { end_date: null })
        .then(() => {
          api.post('/account-leads', {
            account_id: account.id,
            lead_id: leadToRestore.lead_id,
            start_date: today,
            end_date: null,
            notes: ''
          });
          fetchRelations();
        })
        .catch(err => console.error("Error al restaurar el lead:", err));
    }
  };

  if (!account) return <div className="p-6">Cargando detalles de la cuenta...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Detalle de la Cuenta</h1>

      <AccountDetails account={account} />

      <CurrentLeadsTable
        leads={leads}
        currentLeads={currentLeads}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        orderByCurrentLeads={orderByCurrentLeads}
        handleSortCurrentLeads={handleSortCurrentLeads}
        prevPageCurrentLeads={prevPageCurrentLeads}
        nextPageCurrentLeads={nextPageCurrentLeads}
        toggleShowAllCurrentLeads={toggleShowAllCurrentLeads}
        showAllRecordsCurrentLeads={showAllRecordsCurrentLeads}
        displayedCurrentLeads={showAllRecordsCurrentLeads
          ? currentLeads
          : currentLeads.slice(
              (currentPageCurrentLeads - 1) * rowsPerPage,
              currentPageCurrentLeads * rowsPerPage
            )}
        handleRemoveLead={handleRemoveLead}
        setShowModal={setShowModal}
      />

      <PreviousLeadsTable
        leads={leads}
        previousLeads={previousLeads}
        orderByPreviousLeads={orderByPreviousLeads}
        setOrderByPreviousLeads={setOrderByPreviousLeads}
        prevPagePreviousLeads={prevPagePreviousLeads}
        nextPagePreviousLeads={nextPagePreviousLeads}
        toggleShowAllPreviousLeads={toggleShowAllPreviousLeads}
        showAllRecordsPreviousLeads={showAllRecordsPreviousLeads}
        displayedPreviousLeads={showAllRecordsPreviousLeads
          ? previousLeads
          : previousLeads.slice(
              (currentPagePreviousLeads - 1) * rowsPerPage,
              currentPagePreviousLeads * rowsPerPage
            )}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleRestoreLead={handleRestoreLead}
      />

      <AddLeadForm
        leads={leads}
        currentLeads={currentLeads}
        selectedLead={selectedLead}
        setSelectedLead={setSelectedLead}
        handleAssignLead={handleAssignLead}
      />

      <CreateQuickLeadModal
        showModal={showModal}
        setShowModal={setShowModal}
        quickLead={quickLead}
        handleQuickLeadChange={handleQuickLeadChange}
        handleQuickLeadCreate={handleQuickLeadCreate}
      />

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

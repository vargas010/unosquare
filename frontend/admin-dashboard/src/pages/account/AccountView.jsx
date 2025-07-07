import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";

import AccountDetails from "./AccountDetails";
import CurrentLeadsTable from "./CurrentLeadsTable";
import PreviousLeadsTable from "./PreviousLeadsTable";
import AddLeadForm from "./AddLeadForm";
import CreateQuickLeadModal from "./CreateQuickLeadModal";

const AccountView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [leads, setLeads] = useState([]);
  const [currentLeads, setCurrentLeads] = useState([]);
  const [previousLeads, setPreviousLeads] = useState([]);
  const [displayedCurrentLeads, setDisplayedCurrentLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [orderByCurrentLeads, setOrderByCurrentLeads] = useState("asc");
  const [orderByPreviousLeads, setOrderByPreviousLeads] = useState("asc");
  const [currentPageCurrentLeads, setCurrentPageCurrentLeads] = useState(1);
  const [currentPagePreviousLeads, setCurrentPagePreviousLeads] = useState(1);
  const [rowsPerPage] = useState(5);
  const [showAllRecordsCurrentLeads, setShowAllRecordsCurrentLeads] = useState(false);
  const [showAllRecordsPreviousLeads, setShowAllRecordsPreviousLeads] = useState(false);

  const [quickLead, setQuickLead] = useState({
    name: '',
    last_name: '',
    work_email: ''
  });

  useEffect(() => {
    api.get(`/accounts/${id}`)
      .then(res => setAccount(res.data))
      .catch(err => console.error("Error al cargar la cuenta:", err));
    fetchRelations();
    fetchLeads();
  }, [id]);

  useEffect(() => {
    const leadsAMostrar = showAllRecordsCurrentLeads
      ? currentLeads
      : currentLeads.slice(
          (currentPageCurrentLeads - 1) * rowsPerPage,
          currentPageCurrentLeads * rowsPerPage
        );
    setDisplayedCurrentLeads(leadsAMostrar);
  }, [currentLeads, currentPageCurrentLeads, showAllRecordsCurrentLeads]);

  const fetchRelations = async () => {
  console.log("🔄 Paso 1: Iniciando fetchRelations...");

  try {
    const res = await api.get(`/account-leads/all`);
    console.log("🟢 Paso 2: Relaciones crudas obtenidas:", res.data);

    const relaciones = res.data || [];
    console.log("🔍 Paso 3: Total relaciones obtenidas:", relaciones.length);

    const relacionesConCuenta = relaciones.filter(
      (r) => String(r.account_id) === String(id)
    );
    console.log("🔗 Paso 4: Relaciones que coinciden con cuenta:", relacionesConCuenta.length);

    const relacionesConExpand = relacionesConCuenta.map((r) => ({
      ...r,
      lead: r.expand?.lead_id || null,
    }));

    const relacionesValidas = relacionesConExpand.filter((r) => r.lead !== null);

    const actuales = relacionesValidas.filter(
      (r) =>
        !r.end_date ||
        r.end_date === "" ||
        r.end_date === null ||
        r.end_date === "0001-01-01 00:00:00Z"
    );

    const anteriores = relacionesValidas.filter(
      (r) =>
        r.end_date &&
        r.end_date !== "" &&
        r.end_date !== null &&
        r.end_date !== "0001-01-01 00:00:00Z"
    );

    setCurrentLeads(actuales);
    setDisplayedCurrentLeads(actuales);
    setPreviousLeads(anteriores);

    console.log("✅ Paso 9: Leads asignados al estado. Fin de fetchRelations.");
  } catch (err) {
    console.error("❌ Error al cargar relaciones:", err);
  }
};


  const fetchLeads = () => {
    api.get('/leads')
      .then(res => setLeads(res.data.items || []))
      .catch(err => console.error("Error al cargar leads:", err));
  };

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

  const handleAssignLead = ({ leadId, startDate }) => {
    const payload = {
      account_id: account.id,
      lead_id: leadId,
      start_date: startDate,
      end_date: null,
      notes: ""
    };

    console.log("📦 Payload a enviar:", payload);

    api.post('/account-leads', payload)
      .then(() => {
        fetchRelations();
      })
      .catch(err => {
        if (err.response && err.response.status === 409) {
          alert("⚠️ Error: Este lead ya está asignado a esta cuenta.");
        } else {
          console.error("❌ Error al agregar lead:", err);
        }
      });
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

  const toggleShowAllCurrentLeads = () => setShowAllRecordsCurrentLeads(!showAllRecordsCurrentLeads);
  const toggleShowAllPreviousLeads = () => setShowAllRecordsPreviousLeads(!showAllRecordsPreviousLeads);

  const handleRemoveLead = (relationId) => {
    if (window.confirm("¿Deseas marcar este lead como finalizado en esta cuenta?")) {
      const today = new Date().toISOString().split("T")[0];
      api.patch(`/account-leads/${relationId}`, { end_date: today })
        .then(() => fetchRelations())
        .catch(err => console.error("Error al finalizar la relación:", err));
    }
  };

  const handleRestoreLead = async (relationId) => {
    try {
      const relation = previousLeads.find(rel => rel.id === relationId);
      if (!relation) return;

      // Quitar fecha de fin (marcar como activo)
      const today = new Date().toISOString().split("T")[0];
      await api.patch(`/account-leads/${relationId}`, { end_date: null });

      // Actualizar estados localmente sin esperar a refetch
      const updatedRelation = { ...relation, end_date: null };

      setPreviousLeads((prev) => prev.filter((r) => r.id !== relationId));
      setCurrentLeads((prev) => [...prev, updatedRelation]);
      setDisplayedCurrentLeads((prev) => [...prev, updatedRelation]);

    } catch (err) {
      console.error("Error al restaurar el lead:", err);
    }
  };


  if (!account) return <div className="p-6">Cargando detalles de la cuenta...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Detalle de la Cuenta</h1>

      <AccountDetails account={account} />

      <CurrentLeadsTable
        currentLeads={currentLeads}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        orderByCurrentLeads={orderByCurrentLeads}
        handleSortCurrentLeads={() => setOrderByCurrentLeads(orderByCurrentLeads === 'asc' ? 'desc' : 'asc')}
        prevPageCurrentLeads={prevPageCurrentLeads}
        nextPageCurrentLeads={nextPageCurrentLeads}
        toggleShowAllCurrentLeads={toggleShowAllCurrentLeads}
        showAllRecordsCurrentLeads={showAllRecordsCurrentLeads}
        displayedCurrentLeads={displayedCurrentLeads}
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

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";

const AccountView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [currentLeads, setCurrentLeads] = useState([]);
  const [previousLeads, setPreviousLeads] = useState([]); // ✅ agregado
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState("");

  useEffect(() => {
    api.get(`/accounts/${id}`)
      .then(res => setAccount(res.data))
      .catch(err => console.error("Error al cargar la cuenta:", err));

    fetchRelations();

    api.get('/leads')
      .then(res => setLeads(res.data.items || []))
      .catch(err => console.error("Error al obtener leads:", err));
  }, [id]);

  const fetchRelations = () => {
    api.get('/account-leads?expand=lead_id')
      .then(res => {
        const relaciones = res.data.items || [];
        const actuales = relaciones.filter(r => r.account_id === id && !r.end_date);
        const anteriores = relaciones.filter(r => r.account_id === id && r.end_date); // ✅ agregado
        setCurrentLeads(actuales);
        setPreviousLeads(anteriores); // ✅ agregado
      })
      .catch(err => console.error("Error al cargar relaciones:", err));
  };

  const handleRemoveLead = (relationId) => {
    if (window.confirm("¿Deseas marcar este lead como finalizado en esta cuenta?")) {
        const today = new Date().toISOString().split("T")[0];

        api.patch(`/account-leads/${relationId}`, {
        end_date: today
        })
        .then(() => {
        fetchRelations(); // Esto refresca currentLeads y previousLeads
        })
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

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Leads Actuales en esta Cuenta</h2>
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
              {currentLeads.map(rel => {
                const lead = leads.find(l => l.id === rel.lead_id);

                return (
                  <tr key={rel.id} className="border-b">
                    <td className="py-2 px-4">{lead ? `${lead.name} ${lead.last_name}` : '—'}</td>
                    <td className="py-2 px-4">{lead?.work_email || lead?.personal_email || "—"}</td>
                    <td className="py-2 px-4">{rel.start_date}</td>
                    <td className="py-2 px-4">
                      <button
                        onClick={() => handleRemoveLead(rel.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-600">No hay leads trabajando actualmente aquí.</p>
        )}
      </div>

      {/* ✅ Historial corregido para usar previousLeads */}
      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Historial de Leads en esta Cuenta</h2>
        {previousLeads.length > 0 ? (
          <table className="min-w-full table-auto">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="py-2 px-4 text-left">Nombre</th>
                <th className="py-2 px-4 text-left">Correo</th>
                <th className="py-2 px-4 text-left">Inicio</th>
                <th className="py-2 px-4 text-left">Fin</th>
                <th className="py-2 px-4 text-left">Notas</th>
              </tr>
            </thead>
            <tbody>
              {previousLeads.map(rel => {
                const lead = leads.find(l => l.id === rel.lead_id);
                return (
                  <tr key={rel.id} className="border-b">
                    <td className="py-2 px-4">{lead ? `${lead.name} ${lead.last_name}` : '—'}</td>
                    <td className="py-2 px-4">{lead?.work_email || lead?.personal_email || '—'}</td>
                    <td className="py-2 px-4">{rel.start_date}</td>
                    <td className="py-2 px-4">{rel.end_date}</td>
                    <td className="py-2 px-4">{rel.notes || '—'}</td>
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
    </div>
  );
};

export default AccountView;

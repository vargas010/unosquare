import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";

const LeadsDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [relations, setRelations] = useState([]);
  const [currentRelations, setCurrentRelations] = useState([]);
  const [pastRelations, setPastRelations] = useState([]);

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
          Editar22 Lead
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
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="py-3 px-4 text-left">Nombre de la Cuenta</th>
                <th className="py-3 px-4 text-left">Sitio Web</th>
                <th className="py-3 px-4 text-left">Fecha Inicio</th>
                <th className="py-3 px-4 text-left">Notas</th>
              </tr>
            </thead>
            <tbody>
              {currentRelations.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-4 px-4 text-center text-gray-500">
                    No hay cuentas actuales.
                  </td>
                </tr>
              ) : (
                currentRelations.map(rel => (
                  <tr key={rel.id} className="border-b">
                    <td className="py-2 px-4">{rel.expand?.account_id?.name || '—'}</td>
                    <td className="py-2 px-4">{rel.expand?.account_id?.website || '—'}</td>
                    <td className="py-2 px-4">{rel.start_date || '—'}</td>
                    <td className="py-2 px-4">{rel.notes || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-2">Historial de Cuentas</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-3 px-4 text-left">Nombre de la Cuenta</th>
                <th className="py-3 px-4 text-left">Sitio Web</th>
                <th className="py-3 px-4 text-left">Fecha Inicio</th>
                <th className="py-3 px-4 text-left">Fecha Fin</th>
                <th className="py-3 px-4 text-left">Notas</th>
              </tr>
            </thead>
            <tbody>
              {pastRelations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-4 px-4 text-center text-gray-500">
                    Sin historial de cuentas.
                  </td>
                </tr>
              ) : (
                pastRelations.map(rel => (
                  <tr key={rel.id} className="border-b">
                    <td className="py-2 px-4">{rel.expand?.account_id?.name || '—'}</td>
                    <td className="py-2 px-4">{rel.expand?.account_id?.website || '—'}</td>
                    <td className="py-2 px-4">{rel.start_date || '—'}</td>
                    <td className="py-2 px-4">{rel.end_date || '—'}</td>
                    <td className="py-2 px-4">{rel.notes || '—'}</td>
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

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

const AccountLeads = () => {
  const [relations, setRelations] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [leads, setLeads] = useState([]);
  const navigate = useNavigate();

  const fetchRelations = () => {
    api.get('/account-leads')
      .then(res => setRelations(res.data.items || []))
      .catch(err => console.error('Error al obtener relaciones:', err));
  };

  const fetchAccounts = () => {
    api.get('/accounts')
      .then(res => setAccounts(res.data.items || []))
      .catch(err => console.error('Error al obtener cuentas:', err));
  };

  const fetchLeads = () => {
    api.get('/leads')
      .then(res => setLeads(res.data.items || []))
      .catch(err => console.error('Error al obtener leads:', err));
  };

  useEffect(() => {
    fetchRelations();
    fetchAccounts();
    fetchLeads();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("¿Eliminar esta relación?")) {
      api.delete(`/account-leads/${id}`)
        .then(() => fetchRelations())
        .catch(err => console.error("Error al eliminar relación:", err));
    }
  };

  const getAccountName = (id) => {
    const acc = accounts.find(a => a.id === id);
    return acc ? acc.name : '—';
  };

  const getLeadName = (id) => {
    const lead = leads.find(l => l.id === id);
    return lead ? `${lead.name} ${lead.last_name}` : '—';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Relaciones entre Cuentas y Leads</h1>
        <button
          onClick={() => navigate('/account-leads/create')}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Crear Relación
        </button>
      </div>

      <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
        <thead className="bg-blue-900 text-white">
          <tr>
            <th className="py-2 px-4 text-left">Cuenta</th>
            <th className="py-2 px-4 text-left">Lead</th>
            <th className="py-2 px-4 text-left">Fecha Inicio</th>
            <th className="py-2 px-4 text-left">Fecha Fin</th>
            <th className="py-2 px-4 text-left">Notas</th>
            <th className="py-2 px-4 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {relations.map((rel) => (
            <tr key={rel.id} className="border-b">
              <td className="py-2 px-4">{getAccountName(rel.account_id)}</td>
              <td className="py-2 px-4">{getLeadName(rel.lead_id)}</td>
              <td className="py-2 px-4">{rel.start_date || '—'}</td>
              <td className="py-2 px-4">{rel.end_date || '—'}</td>
              <td className="py-2 px-4">{rel.notes || '—'}</td>
              <td className="py-2 px-4 space-x-2">
                <button
                  onClick={() => navigate(`/account-leads/edit/${rel.id}`)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(rel.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AccountLeads;

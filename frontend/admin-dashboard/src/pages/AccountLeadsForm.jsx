import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosConfig';

const AccountLeadsForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    account_id: '',
    lead_id: '',
    start_date: '',
    end_date: '',
    notes: ''
  });

  const [accounts, setAccounts] = useState([]);
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    api.get('/accounts').then(res => setAccounts(res.data.items || []));
    api.get('/leads').then(res => setLeads(res.data.items || []));

    if (isEdit) {
      api.get(`/account-leads/${id}`)
        .then(res => {
          const data = res.data;
          setForm({
            account_id: data.account_id || '',
            lead_id: data.lead_id || '',
            start_date: data.start_date || '',
            end_date: data.end_date || '',
            notes: data.notes || ''
          });
        })
        .catch(err => console.error("Error al cargar relación:", err));
    }
  }, [id, isEdit]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const request = isEdit
      ? api.put(`/account-leads/${id}`, form)
      : api.post('/account-leads', form);

    request
      .then(() => navigate('/account-leads'))
      .catch(err => console.error('Error al guardar relación:', err));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        {isEdit ? 'Editar Relación' : 'Crear Relación'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 shadow rounded-lg space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <select
            name="account_id"
            value={form.account_id}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          >
            <option value="">Selecciona una cuenta</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>

          <select
            name="lead_id"
            value={form.lead_id}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          >
            <option value="">Selecciona un lead</option>
            {leads.map(lead => (
              <option key={lead.id} value={lead.id}>{lead.name} {lead.last_name}</option>
            ))}
          </select>

          <input type="date" name="start_date" value={form.start_date} onChange={handleChange} className="p-2 border rounded" />
          <input type="date" name="end_date" value={form.end_date} onChange={handleChange} className="p-2 border rounded" />
          <input
            type="text"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Notas"
            className="p-2 border rounded col-span-2"
          />
        </div>

        <div className="flex gap-4 mt-4">
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            {isEdit ? 'Actualizar' : 'Crear'}
          </button>
          <button type="button" onClick={() => navigate('/account-leads')} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountLeadsForm;

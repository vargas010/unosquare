import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosConfig';

const LeadForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '',
    last_name: '',
    phone: '',
    personal_email: '',
    work_email: ''
  });

  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.get(`/leads/${id}`)
        .then(res => {
          const data = res.data;
          setForm({
            name: data.name || '',
            last_name: data.last_name || '',
            phone: data.phone || '',
            personal_email: data.personal_email || '',
            work_email: data.work_email || ''
          });
        })
        .catch(err => {
          console.error("Error al cargar los datos del lead:", err);
        });
    } else {
      // Solo cuando se crea
      api.get('/accounts')
        .then(res => setAccounts(res.data.items || []))
        .catch(err => console.error("Error al cargar cuentas:", err));
    }
  }, [id, isEdit]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      if (isEdit) {
        await api.put(`/leads/${id}`, form);
      } else {
        // Crear el lead
        const res = await api.post('/leads', form);
        const leadId = res.data.id;

        // Crear la relación con la cuenta
        if (selectedAccount) {
          const today = new Date().toISOString().split("T")[0];
          await api.post('/account-leads', {
            lead_id: leadId,
            account_id: selectedAccount,
            start_date: today,
            end_date: null,
            notes: ''
          });
        }
      }

      navigate('/leads');
    } catch (err) {
      console.error('Error al guardar el lead:', err);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        {isEdit ? 'Editar Lead' : 'Crear Lead'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 shadow rounded-lg space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Nombre" className="p-2 border rounded" required />
          <input type="text" name="last_name" value={form.last_name} onChange={handleChange} placeholder="Apellido" className="p-2 border rounded" required />
          <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="Teléfono" className="p-2 border rounded" />
          <input type="email" name="personal_email" value={form.personal_email} onChange={handleChange} placeholder="Correo personal" className="p-2 border rounded" />
          <input type="email" name="work_email" value={form.work_email} onChange={handleChange} placeholder="Correo laboral" className="p-2 border rounded" />
        </div>

        {!isEdit && (
          <div>
            <label className="block mb-2 font-medium">Cuenta donde trabajará:</label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              required
              className="w-full p-2 border rounded"
            >
              <option value="">Selecciona una cuenta</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name} - {account.website}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-4">
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            {isEdit ? 'Actualizar' : 'Crear'}
          </button>
          <button type="button" onClick={() => navigate('/leads')} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;

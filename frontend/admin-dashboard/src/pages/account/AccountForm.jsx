import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axiosConfig';

const AccountForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '',
    website: '',
    address: '',
    phone: '',
    tax_id: ''
  });

  useEffect(() => {
    if (isEdit) {
      api.get(`/accounts/${id}`)
        .then(res => {
          const data = res.data;
          setForm({
            name: data.name || '',
            website: data.website || '',
            address: data.address || '',
            phone: data.phone || '',
            tax_id: data.tax_id || ''
          });
        })
        .catch(err => {
          console.error("Error al cargar los datos de la cuenta:", err);
        });
    }
  }, [id, isEdit]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const request = isEdit ? api.put(`/accounts/${id}`, form) : api.post('/accounts', form);

    request
      .then(() => {
        navigate('/accounts');
      })
      .catch(err => {
        console.error('Error al guardar la cuenta:', err);
      });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        {isEdit ? 'Editar Cuenta' : 'Crear Cuenta'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 shadow rounded-lg space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Nombre" className="p-2 border rounded" required />
          <input type="text" name="website" value={form.website} onChange={handleChange} placeholder="Sitio web" className="p-2 border rounded" />
          <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="Dirección" className="p-2 border rounded" />
          <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="Teléfono" className="p-2 border rounded" />
          <input type="text" name="tax_id" value={form.tax_id} onChange={handleChange} placeholder="NIT" className="p-2 border rounded" />
        </div>
        <div className="flex gap-4">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            {isEdit ? 'Actualizar' : 'Crear'}
          </button>
          <button type="button" onClick={() => navigate('/accounts')} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountForm;

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
    }
  }, [id, isEdit]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const request = isEdit ? api.put(`/leads/${id}`, form) : api.post('/leads', form);

    request
      .then(() => {
        navigate('/leads');
      })
      .catch(err => {
        console.error('Error al guardar el lead:', err);
      });
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

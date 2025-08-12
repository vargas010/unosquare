import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axiosConfig';
import Select from 'react-select';

const AccountForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '',
    website: '',
    address: '',
    phone: '',
    tax_id: '',
    industry_type: ''
  });

  const [industries, setIndustries] = useState([]);
  const [newIndustryName, setNewIndustryName] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api.get('/types')
      .then(res => {
        setIndustries(res.data.items || []);
      })
      .catch(err => {
        console.error("Error al cargar los tipos de industria:", err);
      });

    if (isEdit) {
      api.get(`/accounts/${id}`)
        .then(res => {
          const data = res.data;
          setForm({
            name: data.name || '',
            website: data.website || '',
            address: data.address || '',
            phone: data.phone || '',
            tax_id: data.tax_id || '',
            industry_type: data.industry_type || ''
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
    const requestData = { 
      ...form, 
      industry_type: form.industry_type || ''
    };

    const request = isEdit ? api.put(`/accounts/${id}`, requestData) : api.post('/accounts', requestData);

    request
      .then(() => {
        navigate('/accounts');
      })
      .catch(err => {
        console.error('Error al guardar la cuenta:', err);
      });
  };

  const handleCreateIndustry = () => {
    api.post('/types', { name: newIndustryName })
      .then(() => {
        api.get('/types')
          .then(res => {
            setIndustries(res.data.items || []);
            setShowModal(false);
            setNewIndustryName('');
          })
          .catch(err => {
            console.error("Error al cargar los tipos de industria:", err);
          });
      })
      .catch(err => {
        console.error("Error al crear el tipo de industria:", err);
      });
  };

  const industryOptions = industries.map((industry) => ({
    value: industry.id,
    label: industry.name
  }));

  const handleIndustryChange = selectedOption => {
    setForm({
      ...form,
      industry_type: selectedOption ? selectedOption.value : ''
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        {isEdit ? 'Editar Cuenta' : 'Crear Cuenta'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 shadow rounded-lg space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Name" className="p-2 border rounded" required />
          <input type="text" name="website" value={form.website} onChange={handleChange} placeholder="Website" className="p-2 border rounded" />
          <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="Address" className="p-2 border rounded" />
          <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="p-2 border rounded" />
          <input type="text" name="tax_id" value={form.tax_id} onChange={handleChange} placeholder="NIT" className="p-2 border rounded" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="p-2">Type Account</label>
          <Select
            name="industry_type"
            value={industryOptions.find(option => option.value === form.industry_type)}
            onChange={handleIndustryChange}
            options={industryOptions}
            placeholder="Select or search for industry..."
            required
          />

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Create new Type
          </button>
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Nuevo Tipo de Cuenta</h2>
            <input
              type="text"
              value={newIndustryName}
              onChange={(e) => setNewIndustryName(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              placeholder="Nombre del nuevo tipo de industria"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateIndustry}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountForm;
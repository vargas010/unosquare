import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const navigate = useNavigate();

  const fetchAccounts = () => {
    api.get('/accounts')
      .then(res => {
        setAccounts(res.data.items || []);
      })
      .catch(err => {
        console.error('Error al obtener cuentas:', err);
      });
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta cuenta?")) {
      api.delete(`/accounts/${id}`)
        .then(() => {
          fetchAccounts();
        })
        .catch(err => {
          console.error("Error al eliminar cuenta:", err);
        });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Cuentas registradas</h1>
        <button
          onClick={() => navigate('/accounts/create')}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Crear Cuenta
        </button>
      </div>

      <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
        <thead className="bg-blue-900 text-white">
          <tr>
            <th className="py-2 px-4 text-left">Nombre</th>
            <th className="py-2 px-4 text-left">Sitio Web</th>
            <th className="py-2 px-4 text-left">Dirección</th>
            <th className="py-2 px-4 text-left">Teléfono</th>
            <th className="py-2 px-4 text-left">NIT</th>
            <th className="py-2 px-4 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account) => (
            <tr key={account.id} className="border-b">
              <td className="py-2 px-4">{account.name}</td>
              <td className="py-2 px-4">{account.website}</td>
              <td className="py-2 px-4">{account.address}</td>
              <td className="py-2 px-4">{account.phone}</td>
              <td className="py-2 px-4">{account.tax_id}</td>
              <td className="py-2 px-4 space-x-2">
                <button
                  onClick={() => navigate(`/accounts/edit/${account.id}`)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(account.id)}
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

export default Accounts;

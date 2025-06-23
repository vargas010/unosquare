import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { FaRegEdit, FaTrashAlt, FaEye } from 'react-icons/fa'; // Importamos los iconos
import { FaPlus } from 'react-icons/fa';

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Cuentas Registradas</h1>
        <button
          onClick={() => navigate('/accounts/create')}
           className="border-2 border-green-600 text-green-600 px-4 py-2 rounded hover:bg-green-600 hover:text-white transition duration-200 flex items-center"
          >
          <FaPlus className="mr-2" /> {/* Icono con un pequeño margen a la derecha */}
            New Account
        </button>
      </div>

      <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
        <thead className="bg-blue-900 text-white">
          <tr>
            <th className="py-2 px-4 text-left">ID</th>
            <th className="py-2 px-4 text-left">Nombre</th>
            <th className="py-2 px-4 text-left">Sitio Web</th>
            <th className="py-2 px-4 text-left">Teléfono</th>
            <th className="py-2 px-4 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account) => (
            <tr key={account.id} className="border-b">
              <td className="py-2 px-4">{account.id}</td>
              <td className="py-2 px-4">{account.name}</td>
              <td className="py-2 px-4">{account.website}</td>
              <td className="py-2 px-4">{account.phone}</td>
              <td className="py-2 px-4">
                <button
                  onClick={() => navigate(`/accounts/view/${account.id}`)}
                  className="border-2 border-blue-600 text-blue-600 px-3 py-1 rounded hover:bg-blue-600 hover:text-white transition duration-200"
                >
                  <FaEye />

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


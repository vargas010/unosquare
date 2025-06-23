import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { FaRegEdit, FaTrashAlt, FaEye } from 'react-icons/fa'; // Importamos los iconos
import UtcClock from "../components/UtcClock";


const Leads = () => {
  const [leads, setLeads] = useState([]);
  const navigate = useNavigate();

  const fetchLeads = () => {
    api.get('/leads')
      .then(res => {
        setLeads(res.data.items || []);
      })
      .catch(err => {
        console.error('Error al obtener leads:', err);
      });
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este lead?")) {
      api.delete(`/leads/${id}`)
        .then(() => {
          fetchLeads();
        })
        .catch(err => {
          console.error("Error al eliminar lead:", err);
        });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Leads Registrados</h1>
        <button
          onClick={() => navigate('/leads/create')}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Crear Lead
        </button>
      </div>

      <UtcClock />


      <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
        <thead className="bg-blue-900 text-white">
          <tr>
            <th className="py-2 px-4 text-left">Nombre</th>
            <th className="py-2 px-4 text-left">Apellido</th>
            <th className="py-2 px-4 text-left">Teléfono</th>
            <th className="py-2 px-4 text-left">Correo Personal</th>
            <th className="py-2 px-4 text-left">Correo Laboral</th>
            <th className="py-2 px-4 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b">
              <td className="py-2 px-4">{lead.name}</td>
              <td className="py-2 px-4">{lead.last_name}</td>
              <td className="py-2 px-4">{lead.phone}</td>
              <td className="py-2 px-4">{lead.personal_email}</td>
              <td className="py-2 px-4">{lead.work_email}</td>
              <td className="py-2 px-4 space-x-2">
                <button
                  onClick={() => navigate(`/leads/edit/${lead.id}`)}
                  className="border-2 border-yellow-500 text-yellow-500 px-3 py-1 rounded hover:bg-yellow-500 hover:text-white transition duration-200"
                >
                  <FaRegEdit />
                </button>
                <button
                  onClick={() => handleDelete(lead.id)}
                  className="border-2 border-red-500 text-red-500 px-3 py-1 rounded hover:bg-red-500 hover:text-white transition duration-200"
                >
                  <FaTrashAlt />
                </button>
                <button
                  onClick={() => navigate(`/leads/view/${lead.id}`)}
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

export default Leads;

import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { useParams, useNavigate } from 'react-router-dom'; // useParams para obtener el parámetro de la URL

const AccountDetailsView = () => {
  const { typeId } = useParams(); // Obtiene el ID del tipo desde la URL
  const navigate = useNavigate(); // Función para la navegación

  const [accounts, setAccounts] = useState([]);
  const [typeDetails, setTypeDetails] = useState(null); // Para almacenar los detalles del tipo

  useEffect(() => {
    // Obtener el tipo de cuenta
    const fetchTypeDetails = async () => {
      try {
        const res = await api.get(`/types/${typeId}`); // Obtenemos los detalles del tipo
        setTypeDetails(res.data); // Guardamos los detalles del tipo
      } catch (error) {
        console.error("Error al obtener el tipo:", error);
      }
    };

    // Obtener las cuentas asociadas a este tipo de cuenta
    const fetchAccounts = async () => {
      try {
        const res = await api.get(`/accounts?type_id=${typeId}`); // Filtramos las cuentas por el typeId
        setAccounts(res.data.items || []); // Guardamos las cuentas
      } catch (error) {
        console.error("Error al obtener las cuentas:", error);
      }
    };

    fetchTypeDetails();
    fetchAccounts();
  }, [typeId]);

  return (
    <div className="p-6">
      {/* Botón pequeño y en la parte superior */}
      <button
        onClick={() => navigate('/types')} // Asegúrate de que la ruta sea la correcta para "Tipos de Cuenta"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
      >
        Volver a Tipos de Cuenta
      </button>

      <div className="flex">
        <div className="flex-1">
          {/* Detalles del Tipo */}
          {typeDetails ? (
            <>
              <div className="mb-6">
                <h4 className="text-lg font-semibold">Detalles del Tipo</h4>
                <p><strong>Descripción:</strong> {typeDetails.description}</p>
                <p><strong>Fecha de Creación:</strong> {new Date(typeDetails.created).toLocaleDateString()}</p>
              </div>
            </>
          ) : (
            <p>Cargando detalles del tipo...</p>
          )}
        </div>

        <div className="w-1/3 ml-6">
          {/* Tabla de Cuentas */}
          <h3 className="text-xl font-semibold mb-4">Cuentas Designadas</h3>
          <table className="min-w-full bg-white shadow rounded-lg">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="py-2 px-4 text-left">Accounts asignados</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length > 0 ? (
                accounts.map((account) => (
                  // Aseguramos que solo mostramos las cuentas asignadas al tipo
                  account.type_id === typeId && (
                    <tr key={account.id} className="border-b">
                      <td className="py-2 px-4">{account.name}</td>
                    </tr>
                  )
                ))
              ) : (
                <tr>
                  <td colSpan="1" className="py-2 px-4 text-center">No hay cuentas para este tipo.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountDetailsView;
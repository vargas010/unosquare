import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import EditTypeModal from "./EditTypeModal";
import { FaPlus, FaEye, FaRegEdit, FaTrashAlt, FaChevronLeft, FaChevronRight, FaChevronUp, FaChevronDown } from 'react-icons/fa'; 
import UtcClock from "../components/UtcClock"; // Para la hora
import { useNavigate } from 'react-router-dom'; // Importamos useNavigate para la navegación

const TypesView = () => {
  const [types, setTypes] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newType, setNewType] = useState({ name: '', description: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editType, setEditType] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10); 
  const [showAll, setShowAll] = useState(false); 
  const [sortOrder, setSortOrder] = useState("asc"); 
  const navigate = useNavigate(); // Función para la navegación

  useEffect(() => {
    fetchTypes();
    fetchAccounts();
  }, [page, perPage, sortOrder]);

  const fetchTypes = async () => {
    const res = await api.get('/types');
    setTypes(res.data.items || []);
  };

  const fetchAccounts = async () => {
    const res = await api.get('/accounts?expand=type_id');
    setAccounts(res.data.items || []);
  };

  const getCountByType = (typeId) => {
    return accounts.filter(acc =>
      acc.type_id === typeId || acc.expand?.type_id?.id === typeId
    ).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newType.name || !newType.description) {
      alert("Por favor, complete todos los campos.");
      return;
    }
    try {
      await api.post('/types', {
        name: newType.name,
        description: newType.description,
      });
      setNewType({ name: '', description: '' });
      fetchTypes();
      setShowModal(false);
    } catch (err) {
      console.error("Error al guardar tipo:", err);
      alert("Hubo un error al guardar el tipo.");
    }
  };

  const handleDelete = async (typeId) => {
    const confirm = window.confirm("¿Estás seguro de que deseas eliminar este tipo de cuenta?");
    if (!confirm) return;

    try {
      await api.delete(`/types/${typeId}`);
      fetchTypes();
    } catch (err) {
      console.error("Error al eliminar tipo:", err);
      alert("No se pudo eliminar el tipo. Asegúrate de que no esté asignado a ninguna cuenta.");
    }
  };

  const openEditModal = (type) => {
    setEditType(type);
    setShowEditModal(true);
  };

  const handleViewData = (typeId) => {
    navigate(`/accounts/${typeId}`); // Redirige a la nueva vista con el typeId
  };

  const handleSortOrder = () => {
    setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
  };

  const filteredTypes = types.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedTypes = filteredTypes.sort((a, b) => {
    const dateA = new Date(a.created); 
    const dateB = new Date(b.created); 

    if (isNaN(dateA) || isNaN(dateB)) {
      console.warn("Fecha no válida", a, b);
      return 0; 
    }

    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  const totalPages = Math.ceil(filteredTypes.length / perPage);
  const currentTypes = showAll ? sortedTypes : sortedTypes.slice((page - 1) * perPage, page * perPage);

  const toggleShowAll = () => {
    setShowAll(prev => !prev);
    setPage(1);
  };

  return (
    <div className="p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tipos de Cuenta</h1>
      </div>

      <div className="mb-6">
        <UtcClock />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <input
          type="text"
          placeholder="Buscar Tipo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-2 border-gray-300 px-3 py-2 rounded w-full max-w-xs focus:outline-none focus:border-blue-500 transition"
        />
        <button
          onClick={() => setShowModal(true)}
          className="border-2 border-green-600 text-green-600 px-4 py-2 rounded hover:bg-green-600 hover:text-white transition duration-200 flex items-center"
        >
          <FaPlus className="mr-2" />
          Add type
        </button>
      </div>

      <div className="flex justify-start gap-2 mb-4">
        <button
          onClick={handleSortOrder}
          className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transform transition-transform duration-300"
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 512 512"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
            className={`${sortOrder === 'desc' ? 'rotate-180' : ''}`}
          >
            <path d="M255.545 8c-66.269.119-126.438 26.233-170.86 68.685L48.971 40.971C33.851 25.851 8 36.559 8 57.941V192c0 13.255 10.745 24 24 24h134.059c21.382 0 32.09-25.851 16.971-40.971l-41.75-41.75c30.864-28.899 70.801-44.907 113.23-45.273 92.398-.798 170.283 73.977 169.484 169.442C423.236 348.009 349.816 424 256 424c-41.127 0-79.997-14.678-110.63-41.556-4.743-4.161-11.906-3.908-16.368.553L89.34 422.659c-4.872 4.872-4.631 12.815.482 17.433C133.798 479.813 192.074 504 256 504c136.966 0 247.999-111.033 248-247.998C504.001 119.193 392.354 7.755 255.545 8z"></path>
          </svg>
        </button>

        <button
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
          className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <FaChevronLeft />
        </button>
        <button
          onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
          className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <FaChevronRight />
        </button>

        <button
          onClick={toggleShowAll}
          className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showAll ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      {currentTypes.length > 0 ? (
        <table className="min-w-full bg-white shadow rounded-lg">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="py-2 px-4 text-left">Tipo</th>
              <th className="py-2 px-4 text-left">Descripción</th>
              <th className="py-2 px-4 text-left">Cantidad de Cuentas</th>
              <th className="py-2 px-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentTypes.map((type) => (
              <tr key={type.id} className="border-b">
                <td className="py-2 px-4">{type.name}</td>
                <td className="py-2 px-4">{type.description || '—'}</td>
                <td className="py-2 px-4">{getCountByType(type.id)}</td>
                <td className="py-2 px-4 space-x-2">
                  {/* Botón Ver Datos */}
                  <button
                    onClick={() => handleViewData(type.id)} // Redirige a la nueva vista de cuentas
                    className="border-2 border-blue-500 text-blue-500 px-3 py-1 rounded hover:bg-blue-500 hover:text-white transition duration-200"
                  >
                    <FaEye />
                  </button>

                  <button
                    onClick={() => openEditModal(type)}
                    className="border-2 border-yellow-500 text-yellow-500 px-3 py-1 rounded hover:bg-yellow-500 hover:text-white transition duration-200"
                  >
                    <FaRegEdit />
                  </button>

                  <button
                    onClick={() => handleDelete(type.id)}
                    className="border-2 border-red-500 text-red-500 px-3 py-1 rounded hover:bg-red-500 hover:text-white transition duration-200"
                  >
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay tipos para mostrar.</p>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Nuevo Tipo de Cuenta</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={newType.name}
                  onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Descripción</label>
                <textarea
                  value={newType.description}
                  onChange={(e) => setNewType({ ...newType, description: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                  rows="3"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editType && (
        <EditTypeModal
          typeData={editType}
          setTypeData={setEditType}
          accounts={accounts}
          fetchAccounts={fetchAccounts}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            fetchTypes();
            fetchAccounts();
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
};

export default TypesView;

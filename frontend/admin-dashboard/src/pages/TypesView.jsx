import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import EditTypeModal from "./EditTypeModal";
import { FaChevronLeft, FaChevronRight, FaChevronUp, FaChevronDown } from 'react-icons/fa';

const TypesView = () => {
  const [types, setTypes] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newType, setNewType] = useState({ name: '', description: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editType, setEditType] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(5);  // Cambia el número de registros por página según necesites

  useEffect(() => {
    fetchTypes();
    fetchAccounts();
  }, [page]);

  const fetchTypes = async () => {
    const res = await api.get('/types');
    console.log(res.data.items);
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

  // Paginación
  const filteredTypes = types.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredTypes.length / perPage);
  const currentTypes = filteredTypes.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="p-6 relative">
      {/* Filtro de búsqueda */}
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
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          + Agregar Tipo
        </button>
      </div>

      {/* Paginación */}
      <div className="flex justify-start gap-2 mb-4">
        <button
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
          className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          title="Página anterior"
        >
          <FaChevronLeft />
        </button>
        <button
          onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
          className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          title="Página siguiente"
        >
          <FaChevronRight />
        </button>
        <button
          onClick={() => setPage(totalPages)}
          className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          title="Ir a última página"
        >
          <FaChevronDown />
        </button>
      </div>

      {/* Tabla de tipos de cuenta */}
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
                  <button
                    onClick={() => openEditModal(type)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(type.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay tipos para mostrar.</p>
      )}

      {/* Modal para agregar tipo */}
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

      {/* Modal para editar tipo */}
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

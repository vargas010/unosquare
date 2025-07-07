import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import EditTypeModal from "./EditTypeModal";


const TypesView = () => {
  const [types, setTypes] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [newType, setNewType] = useState({ name: '', description: '' });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editType, setEditType] = useState(null);


  useEffect(() => {
    fetchTypes();
    fetchAccounts();
  }, []);

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
    console.log("Submit triggered"); // <- Esto debe aparecer

    try {
      await api.put(`/types/${typeData.id}`, {
        name: typeData.name,
        description: typeData.description,
      });
      console.log("Type updated"); // <- Esto también
      await onSave();  // actualiza tabla y cierra modal
    } catch (err) {
      console.error("Error actualizando tipo:", err);
    }
  };

  const handleDelete = async (typeId) => {
    const confirm = window.confirm("¿Estás seguro de que deseas eliminar este tipo de cuenta?");
    if (!confirm) return;

    try {
      await api.delete(`/types/${typeId}`);
      fetchTypes(); // Refresca la lista después de eliminar
    } catch (err) {
      console.error("Error al eliminar tipo:", err);
      alert("No se pudo eliminar el tipo. Asegúrate de que no esté asignado a ninguna cuenta.");
    }
  };


  const openEditModal = (type) => {
    setEditType(type);
    setShowEditModal(true);
  };


  return (
    <div className="p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tipos de Cuenta</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          + Agregar Tipo
        </button>
      </div>

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
          {types.map((type) => (
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

      {/* MODAL */}
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

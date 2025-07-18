import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import EditTypeModal from "./EditTypeModal";
import { FaPlus, FaEye, FaRegEdit, FaTrashAlt, FaChevronLeft, FaChevronRight, FaChevronUp, FaChevronDown, FaSortAmountUp, FaSortAmountDown } from 'react-icons/fa'; 
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
    setPage(1); // Reinicia la página a 1 cuando se expande
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
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-100"
        />
        <button
          onClick={() => setShowModal(true)}
          className="border-2 border-green-600 text-green-600 px-4 py-2 rounded hover:bg-green-600 hover:text-white transition duration-200 flex items-center"
        >
          <FaPlus className="mr-2" />
          Add type
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        {/* Ordenar y Mostrando juntos */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSortOrder}
            className="flex items-center gap-1 px-3 py-1 text-gray-700 hover:text-blue-600 rounded-md hover:bg-gray-100 bg-blue-100"
            title={`Orden: ${sortOrder === 'desc' ? 'Más nuevos primero' : 'Más antiguos primero'}`}
          >
            {sortOrder === 'desc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
            <span className="text-sm">Ordenar</span>
          </button>

          <span className="text-sm text-gray-600">
            Mostrando {currentTypes.length} de {filteredTypes.length}
          </span>
        </div>

        {/* Paginación y Expandir juntos */}
        <div className="flex items-center gap-4">
          {!showAll && totalPages > 1 && (
            <div className="flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-md">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                className="p-1 text-gray-700 hover:text-blue-600"
                disabled={page === 1}
                title="Página anterior"
              >
                <FaChevronLeft />
              </button>
              
              <span className="text-sm">{page}/{totalPages}</span>
              
              <button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                className="p-1 text-gray-700 hover:text-blue-600"
                disabled={page === totalPages}
                title="Página siguiente"
              >
                <FaChevronRight />
              </button>
            </div>
          )}

          <button
            onClick={toggleShowAll}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
          >
            {showAll ? (
              <>
                <FaChevronDown /> Contraer
              </>
            ) : (
              <>
                <FaChevronUp /> Expandir
              </>
            )}
          </button>
        </div>
      </div>

      {currentTypes.length > 0 ? (
        <table className="min-w-full bg-white shadow rounded-lg">
          <thead className="bg-blue-100 text-gray-800">
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
                    onClick={() => handleViewData(type.id)} 
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

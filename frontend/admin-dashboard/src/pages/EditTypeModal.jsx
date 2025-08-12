import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";

const EditTypeModal = ({
  typeData,
  setTypeData,
  accounts,
  fetchAccounts,
  onClose,
  onSave
}) => {
  const [selectedAccountIds, setSelectedAccountIds] = useState([]);

  useEffect(() => {
    const assigned = accounts
      .filter(acc => acc.type_id === typeData.id)
      .map(acc => acc.id);
    setSelectedAccountIds(assigned);
  }, [typeData.id, accounts]);

  const toggleAccount = (accountId) => {
    setSelectedAccountIds(prev =>
      prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/types/${typeData.id}`, {
        name: typeData.name,
        description: typeData.description,
      });

      const updates = accounts.map(async (acc) => {
        const shouldBeAssigned = selectedAccountIds.includes(acc.id);
        const isCurrentlyAssigned = acc.type_id === typeData.id;

        if (shouldBeAssigned && !isCurrentlyAssigned) {
          return api.patch(`/accounts/${acc.id}`, {
            type_id: typeData.id,
            name: acc.name,
            website: acc.website,
            phone: acc.phone,
            tax_id: acc.tax_id,
          });
        } else if (!shouldBeAssigned && isCurrentlyAssigned) {
          return api.patch(`/accounts/${acc.id}`, {
            type_id: "",
            name: acc.name,
            website: acc.website,
            phone: acc.phone,
            tax_id: acc.tax_id,
          });
        }
        return null;
      });

      await Promise.all(updates);
      fetchAccounts();
      onSave();
    } catch (err) {
      console.error("Error al actualizar tipo:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Editar Tipo</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Nombre</label>
            <input
              type="text"
              value={typeData.name}
              onChange={(e) => setTypeData({ ...typeData, name: e.target.value })}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Descripción</label>
            <textarea
              value={typeData.description}
              onChange={(e) => setTypeData({ ...typeData, description: e.target.value })}
              className="w-full border px-3 py-2 rounded"
              rows="3"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Asignar cuentas</label>
            <div className="max-h-40 overflow-y-auto border rounded p-2">
              {accounts.map((acc) => (
                <label key={acc.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedAccountIds.includes(acc.id)}
                    onChange={() => toggleAccount(acc.id)}
                  />
                  <span>{acc.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTypeModal;
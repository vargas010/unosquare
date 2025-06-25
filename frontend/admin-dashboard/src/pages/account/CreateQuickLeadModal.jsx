// src/components/account/CreateQuickLeadModal.jsx
import React from "react";

const CreateQuickLeadModal = ({
  showModal,
  setShowModal,
  quickLead,
  handleQuickLeadChange,
  handleQuickLeadCreate,
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Crear Nuevo Lead</h2>
        <form onSubmit={handleQuickLeadCreate} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Nombre"
            value={quickLead.name}
            onChange={handleQuickLeadChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="last_name"
            placeholder="Apellido"
            value={quickLead.last_name}
            onChange={handleQuickLeadChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="email"
            name="work_email"
            placeholder="Correo laboral"
            value={quickLead.work_email}
            onChange={handleQuickLeadChange}
            className="w-full p-2 border rounded"
          />
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuickLeadModal;

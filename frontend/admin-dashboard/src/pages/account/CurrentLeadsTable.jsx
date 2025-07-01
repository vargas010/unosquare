import React from "react";
import { FaTrashAlt } from "react-icons/fa";

const CurrentLeadsTable = ({
  displayedCurrentLeads,
  searchTerm,
  setSearchTerm,
  orderByCurrentLeads,
  handleSortCurrentLeads,
  prevPageCurrentLeads,
  nextPageCurrentLeads,
  toggleShowAllCurrentLeads,
  showAllRecordsCurrentLeads,
  handleRemoveLead,
  setShowModal,
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Leads Actuales en esta Cuenta</h2>

      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Buscar Lead..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full max-w-xs"
        />
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded ml-4 hover:bg-green-700"
        >
          + Crear Lead
        </button>
      </div>

      <table className="min-w-full bg-white border rounded">
        <thead>
          <tr className="bg-blue-900 text-white">
            <th className="py-2 px-4 cursor-pointer" onClick={handleSortCurrentLeads}>
              Nombre {orderByCurrentLeads === "asc" ? "↑" : "↓"}
            </th>
            <th className="py-2 px-4">Correo</th>
            <th className="py-2 px-4">Inicio</th>
            <th className="py-2 px-4">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {displayedCurrentLeads.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center py-4 text-gray-500">
                No hay leads actuales para mostrar.
              </td>
            </tr>
          ) : (
            displayedCurrentLeads.map((rel) => (
              <tr key={rel.id} className="border-t">
                <td className="py-2 px-4">{rel.lead?.name} {rel.lead?.last_name}</td>
                <td className="py-2 px-4">{rel.lead?.work_email}</td>
                <td className="py-2 px-4">{new Date(rel.start_date).toLocaleDateString()}</td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => handleRemoveLead(rel.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-4">
        <div className="space-x-2">
          <button onClick={prevPageCurrentLeads} className="px-2 py-1 border rounded">{"<<"}</button>
          <button onClick={toggleShowAllCurrentLeads} className="px-2 py-1 border rounded">
            {showAllRecordsCurrentLeads ? "⬆️" : "⬇️"}
          </button>
          <button onClick={nextPageCurrentLeads} className="px-2 py-1 border rounded">{">>"}</button>
        </div>
      </div>
    </div>
  );
};

export default CurrentLeadsTable;

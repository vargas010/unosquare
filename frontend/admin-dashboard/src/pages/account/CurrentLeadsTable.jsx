import React from "react";
import {
  FaTrashAlt,
  FaChevronLeft,
  FaChevronRight,
  FaChevronUp,
  FaChevronDown,
} from "react-icons/fa";

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
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Leads Actuales en esta Cuenta
      </h2>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <input
          type="text"
          placeholder="Buscar Lead..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-2 border-gray-300 px-3 py-2 rounded w-full max-w-xs focus:outline-none focus:border-blue-500 transition"
        />

        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          + Crear Lead
        </button>
      </div>

      <div className="flex justify-start gap-2 mb-4">
        <button
          onClick={prevPageCurrentLeads}
          className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          title="Página anterior"
        >
          <FaChevronLeft />
        </button>
        <button
          onClick={nextPageCurrentLeads}
          className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          title="Página siguiente"
        >
          <FaChevronRight />
        </button>
        <button
          onClick={toggleShowAllCurrentLeads}
          className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          title={
            showAllRecordsCurrentLeads
              ? "Mostrar menos registros"
              : "Mostrar todos los registros"
          }
        >
          {showAllRecordsCurrentLeads ? <FaChevronDown /> : <FaChevronUp />}
        </button>
      </div>

      {displayedCurrentLeads.length > 0 ? (
        <table className="min-w-full table-auto">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th
                className="py-2 px-4 text-left cursor-pointer"
                onClick={handleSortCurrentLeads}
              >
                Nombre {orderByCurrentLeads === "asc" ? "↑" : "↓"}
              </th>
              <th className="py-2 px-4 text-left">Correo</th>
              <th className="py-2 px-4 text-left">Inicio</th>
              <th className="py-2 px-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {displayedCurrentLeads.map((rel) => (
              <tr key={rel.id} className="border-b">
                <td className="py-2 px-4">
                  {rel.lead?.name} {rel.lead?.last_name}
                </td>
                <td className="py-2 px-4">
                  {rel.lead?.work_email || rel.lead?.personal_email || "—"}
                </td>
                <td className="py-2 px-4">
                  {new Date(rel.start_date).toLocaleDateString()}
                </td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => handleRemoveLead(rel.id)}
                    className="border-2 border-red-500 text-red-500 px-3 py-1 rounded hover:bg-red-500 hover:text-white transition duration-200"
                    title="Finalizar relación con este lead"
                  >
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-600">No hay leads actuales para mostrar.</p>
      )}
    </div>
  );
};

export default CurrentLeadsTable;


// src/components/account/PreviousLeadsTable.jsx
import React from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaRedoAlt,
  FaUndoAlt,
  FaChevronUp,
  FaChevronDown,
} from "react-icons/fa";

const PreviousLeadsTable = ({
  leads,
  previousLeads,
  orderByPreviousLeads,
  setOrderByPreviousLeads,
  prevPagePreviousLeads,
  nextPagePreviousLeads,
  toggleShowAllPreviousLeads,
  showAllRecordsPreviousLeads,
  displayedPreviousLeads,
  searchTerm,
  setSearchTerm,
  handleRestoreLead,
}) => {
  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Historial de Leads en esta Cuenta
      </h2>

      <div className="mb-4 w-full max-w-xs">
        <input
          type="text"
          placeholder="Buscar Lead..."
          className="border-2 border-gray-300 px-3 py-2 rounded w-full focus:outline-none focus:border-blue-500 transition duration-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={() =>
              setOrderByPreviousLeads(orderByPreviousLeads === "asc" ? "desc" : "asc")
            }
            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            title="Ordenar por más recientes/más antiguos"
          >
            {orderByPreviousLeads === "asc" ? <FaRedoAlt /> : <FaUndoAlt />}
          </button>
          <button
            onClick={prevPagePreviousLeads}
            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            title="Página anterior"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={nextPagePreviousLeads}
            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            title="Página siguiente"
          >
            <FaChevronRight />
          </button>
          <button
            onClick={toggleShowAllPreviousLeads}
            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            title={
              showAllRecordsPreviousLeads
                ? "Mostrar menos registros"
                : "Mostrar todos los registros"
            }
          >
            {showAllRecordsPreviousLeads ? <FaChevronDown /> : <FaChevronUp />}
          </button>
        </div>
      </div>

      {displayedPreviousLeads.length > 0 ? (
        <table className="min-w-full table-auto">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="py-2 px-4 text-left">Nombre</th>
              <th className="py-2 px-4 text-left">Correo</th>
              <th className="py-2 px-4 text-left">Inicio</th>
              <th className="py-2 px-4 text-left">Fin</th>
              <th className="py-2 px-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {displayedPreviousLeads.map((rel) => {
              const lead = leads.find((l) => l.id === rel.lead_id);
              return (
                <tr key={rel.id} className="border-b">
                  <td className="py-2 px-4">
                    {lead ? `${lead.name} ${lead.last_name}` : "—"}
                  </td>
                  <td className="py-2 px-4">
                    {lead?.work_email || lead?.personal_email || "—"}
                  </td>
                  <td className="py-2 px-4">{rel.start_date}</td>
                  <td className="py-2 px-4">{rel.end_date}</td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleRestoreLead(rel.id)}
                      className="border-2 border-green-500 text-green-500 px-3 py-1 rounded hover:bg-green-500 hover:text-white transition duration-200"
                    >
                      Restaurar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-600">No hay historial de leads anteriores.</p>
      )}
    </div>
  );
};

export default PreviousLeadsTable;

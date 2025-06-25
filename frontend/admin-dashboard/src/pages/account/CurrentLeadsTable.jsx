import React, { useState } from "react";
import {
  FaTrashAlt,
  FaChevronLeft,
  FaChevronRight,
  FaRedoAlt,
  FaUndoAlt,
  FaChevronUp,
  FaChevronDown,
} from "react-icons/fa";

const CurrentLeadsTable = ({
  leads,
  currentLeads,
  searchTerm,
  setSearchTerm,
  orderByCurrentLeads,
  handleSortCurrentLeads,
  prevPageCurrentLeads,
  nextPageCurrentLeads,
  toggleShowAllCurrentLeads,
  showAllRecordsCurrentLeads,
  displayedCurrentLeads,
  handleRemoveLead,
  setShowModal,
}) => {
  // Función para manejar la ordenación por más recientes/más antiguos
  const handleSort = () => {
    handleSortCurrentLeads(orderByCurrentLeads === "asc" ? "desc" : "asc");
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Leads Actuales en esta Cuenta
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
            onClick={handleSort} // Modificado para llamar handleSort
            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            title="Ordenar por más recientes/más antiguos"
          >
            {orderByCurrentLeads === "asc" ? <FaRedoAlt /> : <FaUndoAlt />}
          </button>
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
      </div>

      {displayedCurrentLeads.length > 0 ? (
        <table className="min-w-full table-auto">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="py-2 px-4 text-left">Nombre</th>
              <th className="py-2 px-4 text-left">Correo</th>
              <th className="py-2 px-4 text-left">Inicio</th>
              <th className="py-2 px-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {displayedCurrentLeads.map((rel) => {
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
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleRemoveLead(rel.id)}
                      className="border-2 border-red-500 text-red-500 px-3 py-1 rounded hover:bg-red-500 hover:text-white transition duration-200"
                    >
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              );
            })}
            <tr>
              <td colSpan="4" className="pt-4">
                <button
                  onClick={() => setShowModal(true)}
                  className="border-2 border-green-600 text-green-600 px-4 py-2 rounded hover:bg-green-600 hover:text-white transition duration-200 flex items-center"
                >
                  + Crear Lead
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        <div>
          <p className="text-gray-600 mb-4">
            No hay leads trabajando actualmente aquí.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Crear Lead
          </button>
        </div>
      )}
    </div>
  );
};

export default CurrentLeadsTable;

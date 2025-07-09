import React, { useState, useEffect } from "react";
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
  toggleShowAllPreviousLeads,
  showAllRecordsPreviousLeads,
  searchTerm,
  setSearchTerm,
  handleRestoreLead,
}) => {
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const leadsPerPage = 5;
  const [searchTermLocal, setSearchTermLocal] = useState(""); // Búsqueda local solo para esta tabla

  // Filtra los leads con base en el término de búsqueda de manera segura
  const filteredLeads = searchTermLocal
    ? previousLeads.filter((lead) => {
        const leadName = lead.name ? lead.name.toLowerCase() : "";
        const leadEmail = lead.email ? lead.email.toLowerCase() : "";
        return (
          leadName.includes(searchTermLocal.toLowerCase()) ||
          leadEmail.includes(searchTermLocal.toLowerCase())
        );
      })
    : previousLeads; // Si no hay término de búsqueda, muestra todos los registros

  // Ordena los leads con base en la fecha
  const sortedLeads = filteredLeads.sort((a, b) => {
    const dateA = new Date(a.start_date);
    const dateB = new Date(b.start_date);

    if (isNaN(dateA) || isNaN(dateB)) return 0; // Si alguna de las fechas no es válida, no las ordenes

    return orderByPreviousLeads === "asc" ? dateA - dateB : dateB - dateA;
  });

  // Lógica de paginación: Calcula los registros que se deben mostrar
  const startIndex = (currentPage - 1) * leadsPerPage;
  const displayedLeads = showAllRecordsPreviousLeads
    ? sortedLeads
    : sortedLeads.slice(startIndex, startIndex + leadsPerPage);

  // Manejo de la siguiente página
  const nextPage = () => {
    if (currentPage < Math.ceil(filteredLeads.length / leadsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Manejo de la página anterior
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTermLocal(e.target.value); // Cambia el estado de búsqueda solo para esta tabla
    setCurrentPage(1); // Reinicia la página a la 1 cuando se realiza una búsqueda
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Historial de Leads en esta Cuenta
      </h2>

      {/* Campo de búsqueda */}
      <div className="mb-4 w-full max-w-xs">
        <input
          type="text"
          placeholder="Buscar Lead..."
          className="border-2 border-gray-300 px-3 py-2 rounded w-full focus:outline-none focus:border-blue-500 transition duration-200"
          value={searchTermLocal}
          onChange={handleSearchChange} // Actualiza el estado de búsqueda solo para esta tabla
        />
      </div>

      {/* Botones de ordenación, paginación y "Mostrar todo" */}
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
            onClick={prevPage}
            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            title="Página anterior"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={nextPage}
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

      {/* Tabla de historial de leads */}
      {filteredLeads.length > 0 ? (
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
            {displayedLeads.map((rel) => {
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
        <p className="text-gray-600">No se encontraron registros con ese término de búsqueda.</p>
      )}
    </div>
  );
};

export default PreviousLeadsTable;

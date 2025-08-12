import React, { useState, useMemo } from "react";
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaRedoAlt, 
  FaUndoAlt,
  FaChevronUp,
  FaChevronDown,
  FaSortAmountUp,
  FaSortAmountDown
} from "react-icons/fa";

const PreviousLeadsTable = ({
  leads,
  previousLeads,
  orderByPreviousLeads,
  setOrderByPreviousLeads,
  toggleShowAllPreviousLeads,
  showAllRecordsPreviousLeads,
  handleRestoreLead,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 5;

  const sortedLeads = useMemo(() => {
    const sorted = [...previousLeads].sort((a, b) => {
      const dateA = new Date(a.start_date);
      const dateB = new Date(b.start_date);
      if (isNaN(dateA) || isNaN(dateB)) return 0;
      return orderByPreviousLeads === "asc" ? dateA - dateB : dateB - dateA;
    });

    return sorted.filter(rel => {
      const name = `${leads.find(l => l.id === rel.lead_id)?.name || ""} ${leads.find(l => l.id === rel.lead_id)?.last_name || ""}`.toLowerCase();
      const email = `${leads.find(l => l.id === rel.lead_id)?.work_email || ""} ${leads.find(l => l.id === rel.lead_id)?.personal_email || ""}`.toLowerCase();
      const query = searchTerm.toLowerCase();
      return query ? name.includes(query) || email.includes(query) : true;
    });
  }, [previousLeads, orderByPreviousLeads, searchTerm, leads]);

  const startIndex = (currentPage - 1) * leadsPerPage;
  const displayedLeads = showAllRecordsPreviousLeads
    ? sortedLeads
    : sortedLeads.slice(startIndex, startIndex + leadsPerPage);

  const nextPage = () => {
    if (currentPage < Math.ceil(previousLeads.length / leadsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Historial de Leads en esta Cuenta
        </h2>
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Buscar leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-100"
          />
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              setOrderByPreviousLeads(orderByPreviousLeads === "asc" ? "desc" : "asc")
            }
            className="flex items-center gap-1 px-3 py-1 text-gray-700 hover:text-blue-600 rounded-md hover:bg-gray-100 bg-blue-100"
            title={`Ordenar por más recientes/más antiguos`}
          >
            {orderByPreviousLeads === "asc" ? <FaSortAmountDown /> : <FaSortAmountUp />}
            <span className="text-sm">Ordenar</span>
          </button>
          <span className="text-sm text-gray-600">
            Mostrando {displayedLeads.length} de {sortedLeads.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {!showAllRecordsPreviousLeads && previousLeads.length > leadsPerPage && (
            <div className="flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-md">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="p-1 text-gray-700 hover:text-blue-600 disabled:opacity-40"
                title="Página anterior"
              >
                <FaChevronLeft />
              </button>
              <span className="text-sm">
                {currentPage}/{Math.ceil(previousLeads.length / leadsPerPage)}
              </span>
              <button
                onClick={nextPage}
                disabled={currentPage === Math.ceil(previousLeads.length / leadsPerPage)}
                className="p-1 text-gray-700 hover:text-blue-600 disabled:opacity-40"
                title="Página siguiente"
              >
                <FaChevronRight />
              </button>
            </div>
          )}
          <button
            onClick={toggleShowAllPreviousLeads}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
          >
            {showAllRecordsPreviousLeads ? (
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

      {previousLeads.length > 0 ? (
        <table className="min-w-full table-auto">
          <thead className="bg-blue-100 text-gray-800">
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
        <p className="text-gray-600">No se encontraron registros.</p>
      )}
    </div>
  );
};

export default PreviousLeadsTable;
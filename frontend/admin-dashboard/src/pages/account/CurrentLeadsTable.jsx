import React, { useState, useEffect, useMemo } from "react";
import { 
  FaTrashAlt, 
  FaChevronLeft, 
  FaChevronRight, 
  FaSortAmountUp, 
  FaSortAmountDown,
  FaChevronUp,
  FaChevronDown
} from "react-icons/fa";

const CurrentLeadsTable = ({
  currentLeads,
  searchTerm,
  setSearchTerm,
  handleSortCurrentLeads,  // Si esto es pasado como prop, lo dejamos tal cual
  prevPageCurrentLeads,
  nextPageCurrentLeads,
  toggleShowAllCurrentLeads,
  showAllRecordsCurrentLeads,
  displayedCurrentLeads,
  handleRemoveLead,
  setShowModal,
}) => {
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 5;

  const processedLeads = useMemo(() => {
    const sorted = [...currentLeads].sort((a, b) => {
      const dateA = new Date(a.start_date);
      const dateB = new Date(b.start_date);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return sorted.filter(rel => {
      const name = `${rel.lead?.name || ""} ${rel.lead?.last_name || ""}`.toLowerCase();
      const email = `${rel.lead?.work_email || ""} ${rel.lead?.personal_email || ""}`.toLowerCase();
      const query = searchTerm.toLowerCase();
      return query ? name.includes(query) || email.includes(query) : true;
    });
  }, [currentLeads, searchTerm, sortOrder]);

  const totalPages = Math.max(Math.ceil(processedLeads.length / leadsPerPage), 1);
  const currentLeadsToShow = showAllRecordsCurrentLeads
    ? processedLeads
    : processedLeads.slice((currentPage - 1) * leadsPerPage, currentPage * leadsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Renombramos la función interna de 'handleSortCurrentLeads' a 'sortLeads'
  const sortLeads = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOrder, showAllRecordsCurrentLeads]);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Leads Activos</h2>
        
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Buscar leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-100"
          />
          
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            + Nuevo Lead
          </button>
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={sortLeads}  // Ahora usamos sortLeads
            className="flex items-center gap-1 px-3 py-1 text-gray-700 hover:text-blue-600 rounded-md hover:bg-gray-100 bg-blue-100"
            title={`Orden: ${sortOrder === 'desc' ? 'Más nuevos primero' : 'Más antiguos primero'}`}
          >
            {sortOrder === 'desc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
            <span className="text-sm">Ordenar</span>
          </button>
          
          <span className="text-sm text-gray-600">
            Mostrando {currentLeadsToShow.length} de {processedLeads.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {!showAllRecordsCurrentLeads && totalPages > 1 && (
            <div className="flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-md">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1 text-gray-700 hover:text-blue-600 disabled:opacity-40"
                title="Página anterior"
              >
                <FaChevronLeft />
              </button>
              
              <span className="text-sm">
                {currentPage}/{totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1 text-gray-700 hover:text-blue-600 disabled:opacity-40" 
                title="Página siguiente"
              >
                <FaChevronRight />
              </button>
            </div>
          )}

          <button
            onClick={() => toggleShowAllCurrentLeads(!showAllRecordsCurrentLeads)}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
          >
            {showAllRecordsCurrentLeads ? (
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

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-blue-100 text-gray-800">
            <tr>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Fecha Inicio</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {currentLeadsToShow.length > 0 ? currentLeadsToShow.map(rel => (
              <tr key={rel.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{rel.lead?.name} {rel.lead?.last_name}</td>
                <td className="px-4 py-3">{rel.lead?.work_email || rel.lead?.personal_email || '-'}</td>
                <td className="px-4 py-3">{new Date(rel.start_date).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleRemoveLead(rel.id)}
                    className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors"
                    title="Remover lead"
                  >
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                  No se encontraron resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CurrentLeadsTable;

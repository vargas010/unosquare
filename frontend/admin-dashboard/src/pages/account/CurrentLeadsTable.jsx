import React, { useState, useEffect } from "react";
import {
  FaTrashAlt,
  FaChevronLeft,
  FaChevronRight,
  FaChevronUp,
  FaChevronDown,
  FaRedoAlt,
  FaUndoAlt,
} from "react-icons/fa";

const CurrentLeadsTable = ({
  displayedCurrentLeads,
  setShowModal,
  handleRemoveLead,
  toggleShowAllCurrentLeads,
  showAllRecordsCurrentLeads,
}) => {
  const [sortOrder, setSortOrder] = useState("asc"); // Estado para el orden
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const leadsPerPage = 5; // Siempre mostramos 5 registros por página

  useEffect(() => {
    console.log("Datos cargados:", displayedCurrentLeads);
  }, [displayedCurrentLeads]);

  const handleSearchChange = (e) => {
    // Aquí iría la lógica de búsqueda si es necesario
  };

  const handleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    setCurrentPage(1); // Resetear a la primera página cuando se ordena
  };

  // Ordenamos todos los registros por fecha
  const sortedLeads = displayedCurrentLeads.sort((a, b) => {
    const dateA = new Date(a.start_date);
    const dateB = new Date(b.start_date);

    if (isNaN(dateA) || isNaN(dateB)) return 0; // Si alguna de las fechas no es válida, no las ordenamos

    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  // Paginación: calculamos la cantidad de páginas necesarias
  const totalPages = Math.ceil(sortedLeads.length / leadsPerPage); // Total de páginas
  const currentPageLeads = showAllRecordsCurrentLeads
    ? sortedLeads // Muestra todos los registros si "Mostrar Todo" está activado
    : sortedLeads.slice((currentPage - 1) * leadsPerPage, currentPage * leadsPerPage); // Solo muestra 5 si la paginación está activa

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const toggleShowAll = () => {
    toggleShowAllCurrentLeads(!showAllRecordsCurrentLeads); // Alternar entre mostrar todo o 5 registros
    setCurrentPage(1); // Resetea la página a la 1 cuando cambias la cantidad de registros
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Leads Actuales en esta Cuenta
      </h2>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <input
          type="text"
          placeholder="Buscar Lead..."
          value=""
          onChange={handleSearchChange}
          className="border-2 border-gray-300 px-3 py-2 rounded w-full max-w-xs focus:outline-none focus:border-blue-500 transition"
        />

        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          + Crear Lead
        </button>
      </div>

      {/* Botones de ordenación, paginación y "Mostrar todo" */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={handleSortOrder}
            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
            title="Ordenar por más recientes/más antiguos"
          >
            {sortOrder === "asc" ? <FaRedoAlt /> : <FaUndoAlt />}
          </button>

          {/* Solo mostramos botones de paginación si no estamos mostrando todos los registros */}
          {!showAllRecordsCurrentLeads && (
            <>
              <button
                onClick={handlePrevPage}
                className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                title="Página anterior"
                disabled={currentPage === 1} // Deshabilitar si estamos en la primera página
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={handleNextPage}
                className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                title="Página siguiente"
                disabled={currentPage === totalPages} // Deshabilitar si estamos en la última página
              >
                <FaChevronRight />
              </button>
            </>
          )}

          <button
            onClick={toggleShowAll}
            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
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

      {currentPageLeads.length > 0 ? (
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
            {currentPageLeads.map((rel) => (
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
                    className="border-2 border-red-500 text-red-500 px-3 py-1 rounded hover:bg-red-500 hover:text-white transition duration-200 cursor-pointer"
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

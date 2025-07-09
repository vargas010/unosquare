import React, { useState } from "react";
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
  const [sortOrder, setSortOrder] = useState("asc");
  const [rotate, setRotate] = useState(false);
  const [searchTermLocal, setSearchTermLocal] = useState(''); // Estado de búsqueda local para esta tabla
  const [currentPage, setCurrentPage] = useState(1); // Estado de la página actual
  const leadsPerPage = showAllRecordsCurrentLeads ? displayedCurrentLeads.length : 5; // Mostrar todos los registros o solo 5

  const handleSearchChange = (e) => {
    setSearchTermLocal(e.target.value); // Cambia el estado de la búsqueda solo para esta tabla
    setCurrentPage(1); // Reinicia la página a la 1 cuando se realiza una búsqueda
  };

  const handleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    setRotate(!rotate); // Cambia la dirección de la rotación al hacer clic
  };

  // Filtrar leads por el término de búsqueda local (en toda la lista de leads)
  const filteredLeads = displayedCurrentLeads.filter((lead) => {
    return (
      lead.lead?.name.toLowerCase().includes(searchTermLocal.toLowerCase()) ||
      lead.lead?.last_name.toLowerCase().includes(searchTermLocal.toLowerCase())
    );
  });

  // Ordenar leads por fecha de inicio
  const sortedLeads = filteredLeads.sort((a, b) => {
    const dateA = new Date(a.start_date);
    const dateB = new Date(b.start_date);

    // Si alguna de las fechas no es válida, no se ordenan
    if (isNaN(dateA) || isNaN(dateB)) return 0;

    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  // Paginación
  const totalPages = Math.ceil(sortedLeads.length / leadsPerPage); // Número total de páginas
  const currentPageLeads = sortedLeads.slice(
    (currentPage - 1) * leadsPerPage,
    currentPage * leadsPerPage
  ); // Obtener los leads correspondientes a la página actual

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const toggleShowAll = () => {
    toggleShowAllCurrentLeads(!showAllRecordsCurrentLeads); // Cambia entre mostrar todo o 5 registros
    setCurrentPage(1); // Resetea a la página 1
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Leads Actuales en esta Cuenta
      </h2>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        {/* Input de búsqueda solo afecta a esta tabla */}
        <input
          type="text"
          placeholder="Buscar Lead..."
          value={searchTermLocal}
          onChange={handleSearchChange} // Actualiza solo el estado de búsqueda local
          className="border-2 border-gray-300 px-3 py-2 rounded w-full max-w-xs focus:outline-none focus:border-blue-500 transition"
        />

        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          + Crear Lead
        </button>
      </div>

      {/* Ordenar por más recientes / más antiguos */}
      <div className="flex justify-start gap-2 mb-4">
        <button
          onClick={handleSortOrder}
          className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transform transition-transform duration-1000"
          title="Ordenar por más recientes/más antiguos"
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 512 512"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
            className={`${sortOrder === 'desc' ? 'rotate-180' : ''}`} // Aplica la rotación si el orden es descendente
          >
            <path d="M255.545 8c-66.269.119-126.438 26.233-170.86 68.685L48.971 40.971C33.851 25.851 8 36.559 8 57.941V192c0 13.255 10.745 24 24 24h134.059c21.382 0 32.09-25.851 16.971-40.971l-41.75-41.75c30.864-28.899 70.801-44.907 113.23-45.273 92.398-.798 170.283 73.977 169.484 169.442C423.236 348.009 349.816 424 256 424c-41.127 0-79.997-14.678-110.63-41.556-4.743-4.161-11.906-3.908-16.368.553L89.34 422.659c-4.872 4.872-4.631 12.815.482 17.433C133.798 479.813 192.074 504 256 504c136.966 0 247.999-111.033 248-247.998C504.001 119.193 392.354 7.755 255.545 8z"></path>
          </svg>
        </button>
        <button
          onClick={handlePrevPage}
          className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          title="Página anterior"
        >
          <FaChevronLeft />
        </button>
        <button
          onClick={handleNextPage}
          className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          title="Página siguiente"
        >
          <FaChevronRight />
        </button>

        {/* Botón para mostrar más o menos registros */}
        <button
          onClick={toggleShowAll}
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

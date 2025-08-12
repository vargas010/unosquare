import React, { useState, useEffect } from "react";

const AddLeadForm = ({
  leads,
  currentLeads,
  handleAssignLead
}) => {
  const [selectedLead, setSelectedLead] = useState('');
  const [startDate, setStartDate] = useState('');

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today);
  }, []);

  const availableLeads = leads.filter(
    (lead) => !currentLeads.some((rel) => rel.lead_id === lead.id)
  );

  const onSubmit = (e) => {
    e.preventDefault();
    if (!selectedLead || !startDate) return;

    handleAssignLead({ leadId: selectedLead, startDate });

    setSelectedLead('');
    setStartDate(new Date().toISOString().split("T")[0]);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Asignar Lead a esta Cuenta</h2>

      {availableLeads.length === 0 ? (
        <p className="text-gray-600">Todos los leads ya están asignados a esta cuenta.</p>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <select
            value={selectedLead}
            onChange={(e) => setSelectedLead(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded w-full md:max-w-xs"
            required
          >
            <option value="">Selecciona un lead</option>
            {availableLeads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.name} {lead.last_name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded"
            required
          />

          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Asignar Lead
          </button>
        </form>
      )}
    </div>
  );
};

export default AddLeadForm;

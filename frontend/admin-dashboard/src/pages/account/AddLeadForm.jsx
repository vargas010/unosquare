import React from "react";

const AddLeadForm = ({
  leads,
  currentLeads,
  selectedLead,
  setSelectedLead,
  handleAssignLead
}) => {
  const isLeadAlreadyAssigned = (leadId) => {
    return currentLeads.some(rel => rel.lead_id === leadId);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Asignar Lead a esta Cuenta</h2>
      <form onSubmit={handleAssignLead} className="flex gap-4 items-center">
        <select
          value={selectedLead}
          onChange={(e) => setSelectedLead(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded w-full max-w-xs"
          required
        >
          <option value="">Selecciona un lead</option>
          {leads.map((lead) => {
            const disabled = isLeadAlreadyAssigned(lead.id);
            return (
              <option
                key={lead.id}
                value={lead.id}
                disabled={disabled}
              >
                {lead.name} {lead.last_name} {disabled ? "(ya asignado)" : ""}
              </option>
            );
          })}
        </select>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Asignar Lead
        </button>
      </form>
    </div>
  );
};

export default AddLeadForm;

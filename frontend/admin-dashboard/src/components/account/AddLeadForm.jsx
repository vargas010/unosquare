// src/components/account/AddLeadForm.jsx
import React from "react";

const AddLeadForm = ({
  leads,
  currentLeads,
  selectedLead,
  setSelectedLead,
  handleAssignLead,
}) => {
  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Agregar Lead a esta Cuenta
      </h2>
      <form onSubmit={handleAssignLead} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <select
            className="p-2 border rounded"
            required
            value={selectedLead}
            onChange={(e) => setSelectedLead(e.target.value)}
          >
            <option value="">Selecciona un lead</option>
            {leads.map((lead) => {
              const yaAsignado = currentLeads.some(
                (rel) => rel.lead_id === lead.id && !rel.end_date
              );
              return (
                <option key={lead.id} value={lead.id} disabled={yaAsignado}>
                  {lead.name} {lead.last_name}{" "}
                  {yaAsignado ? "(Ya asignado)" : ""}
                </option>
              );
            })}
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Asignar Lead
        </button>
      </form>
    </div>
  );
};

export default AddLeadForm;

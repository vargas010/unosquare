// src/components/account/AccountDetails.jsx
import React from "react";

const AccountDetails = ({ account }) => {
  if (!account) return null;

  return (
    <div className="bg-white shadow rounded-lg p-6 space-y-2">
      <p><strong>ID:</strong> {account.id}</p>
      <p><strong>Nombre:</strong> {account.name}</p>
      <p><strong>Sitio Web:</strong> {account.website}</p>
      <p><strong>Dirección:</strong> {account.address}</p>
      <p><strong>Teléfono:</strong> {account.phone}</p>
      <p><strong>NIT:</strong> {account.tax_id}</p>
    </div>
  );
};

export default AccountDetails;

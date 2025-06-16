import React from 'react';
import { Link } from 'react-router-dom'; // ✅ Importar Link

const AdminLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white p-6">
        <h2 className="text-2xl font-bold mb-8">Unosquare Admin</h2>
        <nav className="space-y-4">
          <Link to="/" className="block hover:text-blue-300">Dashboard</Link>
          <Link to="/accounts" className="block hover:text-blue-300">accounts</Link>
          <Link to="/leads" className="block hover:text-blue-300">Leads</Link>
          <Link to="/account-leads" className="block hover:text-blue-300">account-leads</Link>
        </nav>
      </aside>

      {/* Contenido */}
      <main className="flex-1 bg-gray-100 p-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;

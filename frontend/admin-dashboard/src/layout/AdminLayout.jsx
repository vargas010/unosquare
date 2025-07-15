import React from 'react';
import { Link } from 'react-router-dom';
import UtcClock from "../components/UtcClock";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-blue-800 to-blue-600 text-white p-6 flex flex-col justify-between z-50 shadow-lg">
        <div>
          <h2 className="text-2xl font-bold mb-8 text-center">Unosquare</h2>
          <nav className="space-y-4">
            <Link to="/" className="block hover:bg-blue-700 p-2 rounded transition">Dashboard</Link>
            <Link to="/accounts" className="block hover:bg-blue-700 p-2 rounded transition">Accounts</Link>
            <Link to="/leads" className="block hover:bg-blue-700 p-2 rounded transition">Leads</Link>
            <Link to="/types" className="block hover:bg-blue-700 p-2 rounded transition">Tipos de Cuenta</Link>
          </nav>
        </div>
        
        {/* Reloj siempre visible al fondo del sidebar */}
        <div className="mt-10">
          <UtcClock />
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="ml-64 flex-1 bg-gray-100 p-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;

import React from 'react';
import { Link } from 'react-router-dom';
import UtcClock from "../components/UtcClock";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-64 bg-blue-900 text-white p-6 flex flex-col justify-between z-50">
        <div>
          <h2 className="text-2xl font-bold mb-8">Unosquare</h2>
          <nav className="space-y-4">
            <Link to="/" className="block hover:text-blue-300">Dashboard</Link>
            <Link to="/accounts" className="block hover:text-blue-300">Accounts</Link>
            <Link to="/leads" className="block hover:text-blue-300">Leads</Link>
            <Link to="/types" className="block hover:text-blue-300">Tipos de Cuenta</Link>
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

import { Routes, Route } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import Accounts from './pages/Accounts';
import Leads from './pages/Leads';
import AccountLeads from "./pages/AccountLeads";
import AccountForm from "./pages/AccountForm"; 
import LeadForm from "./pages/LeadForm"; 
import AccountLeadsForm from "./pages/AccountLeadsForm";
import AccountView from "./pages/AccountView";
import LeadDetail from "./pages/LeadDetail"; 

const Dashboard = () => (
  <>
    <h1 className="text-3xl font-semibold text-gray-800">Dashboard</h1>
    <p className="text-gray-600 mt-2">Resumen del administrador</p>
  </>
);

function App() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/leads/view/:id" element={<LeadDetail />} />
        <Route path="/accounts/view/:id" element={<AccountView />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/accounts/create" element={<AccountForm />} /> {/* NUEVO */}
        <Route path="/accounts/edit/:id" element={<AccountForm />} /> {/* NUEVO */}
        <Route path="/leads" element={<Leads />} />
        <Route path="/account-leads" element={<AccountLeads />} />
        <Route path="/leads/create" element={<LeadForm />} />
        <Route path="/leads/edit/:id" element={<LeadForm />} />
        <Route path="/account-leads/create" element={<AccountLeadsForm />} />
        <Route path="/account-leads/edit/:id" element={<AccountLeadsForm />} />

      </Routes>
    </AdminLayout>
  );
}

export default App;

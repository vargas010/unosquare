import { Routes, Route } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import Accounts from './pages/account/Accounts';
import Leads from './pages/Leads';
import AccountLeads from "./pages/AccountLeads";
import AccountForm from "./pages/account/AccountForm"; 
import LeadForm from "./pages/LeadForm"; 
import AccountLeadsForm from "./pages/AccountLeadsForm";
import AccountView from "./pages/account/AccountView";
import LeadDetail from "./pages/LeadDetail";
import TypesView from './pages/TypesView';
import AccountDetailsView from './pages/AccountDetailsView';
import Projects from './pages/Projects';
import BoardView from './pages/BoardView';

const Dashboard = () => (
  <>
    <h1 className="text-3xl font-semibold text-gray-800">Dashboard</h1>
    <p className="text-gray-600 mt-2">Bienvenido a la parte administrativa</p>
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
        <Route path="/accounts/create" element={<AccountForm />} />
        <Route path="/accounts/edit/:id" element={<AccountForm />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/account-leads" element={<AccountLeads />} />
        <Route path="/leads/create" element={<LeadForm />} />
        <Route path="/leads/edit/:id" element={<LeadForm />} />
        <Route path="/account-leads/create" element={<AccountLeadsForm />} />
        <Route path="/account-leads/edit/:id" element={<AccountLeadsForm />} />
        <Route path="/types" element={<TypesView />} />
        <Route path="/accounts/:typeId" element={<AccountDetailsView />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:projectId/view" element={<BoardView />} />
      </Routes>
    </AdminLayout>
  );
}
export default App;

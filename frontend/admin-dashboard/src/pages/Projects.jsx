import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import UtcClock from "../components/UtcClock";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editProjectId, setEditProjectId] = useState(null);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [accountId, setAccountId] = useState('');
  const [statusOptions] = useState(['solicitando', 'aceptado', 'en_proceso', 'terminado']);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectsResponse = await api.get('/projects');
        setProjects(projectsResponse.data.items || []);
        const accountsResponse = await api.get('/accounts');
        setAccounts(accountsResponse.data.items || []);
      } catch (err) {
        console.error('Error al obtener datos:', err);
      }
    };
    fetchData();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/projects', { name, status, account_id: accountId });
      setProjects(prevProjects => [...prevProjects, response.data]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error al crear el proyecto:', error.response ? error.response.data : error.message);
    }
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/projects/${editProjectId}`, { name, status, account_id: accountId });
      setProjects(prevProjects => prevProjects.map(project => project.id === editProjectId ? response.data : project));
      setIsModalOpen(false);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error al editar el proyecto:', error.response ? error.response.data : error.message);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
      try {
        await api.delete(`/projects/${projectId}`);
        setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
        console.log('Proyecto eliminado con éxito');
      } catch (error) {
        console.error('Error al eliminar el proyecto:', error.response ? error.response.data : error.message);
      }
    }
  };

  const openEditModal = (project) => {
    setEditProjectId(project.id);
    setName(project.name);
    setStatus(project.status);
    setAccountId(project.account_id);
    setIsModalOpen(true);
    setIsEditMode(true);
  };

  const handleViewProject = (projectId) => {
    window.location.href = `/projects/${projectId}/view`;
  };

  return (
    <div className="projects container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Lista de Proyectos</h1>

      <UtcClock />

      <div className="mb-6 text-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Crear Proyecto
        </button>
      </div>

      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="py-2 px-4 text-left">Nombre</th>
            <th className="py-2 px-4 text-left">Estado</th>
            <th className="py-2 px-4 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {projects.length > 0 ? (
            projects.map((project) => (
              <tr key={project.id} className="border-b hover:bg-gray-100">
                <td className="py-2 px-4">{project.name}</td>
                <td className="py-2 px-4">{project.status}</td>
                <td className="py-2 px-4 flex space-x-2">
                  <button
                    onClick={() => handleViewProject(project.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Ver Proyecto
                  </button>
                  <button
                    onClick={() => openEditModal(project)}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="py-2 px-4 text-center">No hay proyectos disponibles</td>
            </tr>
          )}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4 text-gray-800">{isEditMode ? 'Editar Proyecto' : 'Crear Proyecto'}</h2>
            <form onSubmit={isEditMode ? handleEditProject : handleCreateProject}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre del Proyecto</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado del Proyecto</label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecciona un estado</option>
                  {statusOptions.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="account" className="block text-sm font-medium text-gray-700">Cuenta Asociada</label>
                <select
                  id="account"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecciona una cuenta</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {isEditMode ? 'Guardar Cambios' : 'Crear Proyecto'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
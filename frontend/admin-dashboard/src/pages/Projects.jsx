import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig'; // Usamos la configuración de axios
import UtcClock from "../components/UtcClock"; // Si deseas mantener el reloj

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [accounts, setAccounts] = useState([]); // Para almacenar las cuentas
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar el modal
  const [isEditMode, setIsEditMode] = useState(false); // Para saber si estamos editando
  const [editProjectId, setEditProjectId] = useState(null); // Guardar el ID del proyecto a editar
  const [name, setName] = useState('');
  const [status, setStatus] = useState(''); // Estado inicial vacío
  const [accountId, setAccountId] = useState(''); // Para gestionar la cuenta seleccionada
  const [statusOptions] = useState(['solicitando', 'aceptado', 'en_proceso', 'terminado']); // Opciones de estado actuales

  // Obtener los proyectos y las cuentas cuando el componente se monte
  useEffect(() => {
    api.get('/projects') // Obtener los proyectos
      .then(res => {
        setProjects(res.data.items || []); // Asegúrate de que `items` exista en la respuesta
      })
      .catch(err => {
        console.error('Error al obtener proyectos:', err);
      });

    api.get('/accounts') // Obtener las cuentas
      .then(res => {
        setAccounts(res.data.items || []);
      })
      .catch(err => {
        console.error('Error al obtener las cuentas:', err);
      });
  }, []);

  // Función para manejar la creación del proyecto
  const handleCreateProject = (e) => {
    e.preventDefault();
    console.log("Enviando el proyecto con account_id:", accountId); // Verifica el valor de accountId
    api.post('/projects', {
      name,
      status,
      account_id: accountId, // Cambiar 'accountId' a 'account_id'
    })
    .then((response) => {
      console.log('Proyecto creado:', response.data);
      setProjects(prevProjects => [...prevProjects, response.data]); // Agregar el nuevo proyecto a la lista
      setIsModalOpen(false); // Cerrar el modal
    })
    .catch((error) => {
      console.error('Error al crear el proyecto:', error.response ? error.response.data : error.message);
    });
  };

  // Función para manejar la edición de un proyecto
  const handleEditProject = (e) => {
    e.preventDefault();
    console.log("Enviando el proyecto para editar con account_id:", accountId); // Verifica el valor de accountId
    api.put(`/projects/${editProjectId}`, {
      name,
      status,
      account_id: accountId, // Cambiar 'accountId' a 'account_id'
    })
    .then((response) => {
      const updatedProjects = projects.map((project) =>
        project.id === editProjectId ? response.data : project
      );
      setProjects(updatedProjects); // Actualizar el proyecto en la lista
      setIsModalOpen(false); // Cerrar el modal
      setIsEditMode(false); // Cambiar a modo de creación
    })
    .catch((error) => {
      console.error('Error al editar el proyecto:', error.response ? error.response.data : error.message);
    });
  };

  // Función para manejar la eliminación de un proyecto
  const handleDeleteProject = (projectId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
      api.delete(`/projects/${projectId}`)
        .then(() => {
          setProjects(projects.filter(project => project.id !== projectId)); // Eliminar el proyecto de la lista
          console.log('Proyecto eliminado con éxito');
        })
        .catch((error) => {
          console.error('Error al eliminar el proyecto:', error.response ? error.response.data : error.message);
        });
    }
  };

  // Función para abrir el formulario de edición con los valores del proyecto
  const openEditModal = (project) => {
    setEditProjectId(project.id);
    setName(project.name);
    setStatus(project.status);
    setAccountId(project.account_id); // Establecer la cuenta asociada
    setIsModalOpen(true);
    setIsEditMode(true); // Activar el modo de edición
  };

  // Función para redirigir al espacio de trabajo del proyecto
  const handleViewProject = (projectId) => {
    window.location.href = `/projects/${projectId}/view`; // Redirigir al espacio de trabajo
  };

  return (
    <div className="projects">
      <h1 className="text-2xl font-bold mb-6 text-center">Lista de Proyectos</h1>

      <UtcClock /> {/* Si quieres mantener el reloj, puedes dejar esta línea */}

      {/* Botón para abrir el modal */}
      <div className="mb-6 text-center">
        <button
          onClick={() => setIsModalOpen(true)} // Abrir el modal para crear proyecto
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Crear Proyecto
        </button>
      </div>

      {/* Tabla de Proyectos */}
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead>
          <tr className="border-b">
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
                <td className="py-2 px-4">
                  <button
                    onClick={() => handleViewProject(project.id)} // Ver Proyecto
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Ver Proyecto
                  </button>
                  <button
                    onClick={() => openEditModal(project)} // Abrir modal de edición
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)} // Llamar a la función de eliminar
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

      {/* Modal de Crear/Editar Proyecto */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">{isEditMode ? 'Editar Proyecto' : 'Crear Proyecto'}</h2>
            <form onSubmit={isEditMode ? handleEditProject : handleCreateProject}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre del Proyecto</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado del Proyecto</label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md"
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
                  value={accountId} // Valor de la cuenta seleccionada
                  onChange={(e) => setAccountId(e.target.value)} // Actualiza el estado de la cuenta
                  className="w-full px-4 py-2 border rounded-md"
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
                  onClick={() => setIsModalOpen(false)} // Cerrar el modal
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

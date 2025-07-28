import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axiosConfig'; // Usamos la configuración de axios

const BoardView = () => {
  const { projectId } = useParams();  // Obtener el ID del proyecto desde la URL
  const [boards, setBoards] = useState([]);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [loading, setLoading] = useState(false);  // Para mostrar un indicador de carga
  const [error, setError] = useState(null);  // Para manejar los errores de la API

  useEffect(() => {
    console.log('Obteniendo tableros para el proyecto:', projectId); // Verificar projectId
    setLoading(true); // Activar el estado de carga

    api.get(`/projects/${projectId}/boards`)
        .then(res => {
        console.log('Tableros recuperados:', res.data);  // Verifica la respuesta
        setBoards(res.data.items); // Acceder a los tableros dentro del campo "items"
        setLoading(false); // Desactivar el estado de carga
        })
        .catch(err => {
        console.error('Error al obtener tableros:', err);  // Verifica el error que viene del backend
        setError('Error al obtener los tableros');
        setLoading(false); // Desactivar el estado de carga
        });
    }, [projectId]);

  // Crear un nuevo tablero
  const handleCreateBoard = (e) => {
    e.preventDefault();
    setLoading(true); // Activar el estado de carga
    api.post('/boards', { title: newBoardTitle, project_id: projectId })
      .then(res => {
        console.log('Nuevo tablero creado:', res.data);  // Verificar la respuesta del POST
        setBoards(prevBoards => [...prevBoards, res.data]);  // Actualizar el estado con el nuevo tablero
        setNewBoardTitle('');  // Limpiar el campo de entrada
        setLoading(false);  // Desactivar el estado de carga
      })
      .catch(err => {
        console.error('Error al crear el tablero:', err);
        setError('Error al crear el tablero');
        setLoading(false);  // Desactivar el estado de carga
      });
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Título */}
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Espacio de Trabajo del Proyecto</h1>

      {/* Formulario para Crear Tablero */}
      <div className="mb-6 flex justify-between items-center">
        <form onSubmit={handleCreateBoard} className="flex w-2/3">
          <input
            type="text"
            placeholder="Título del nuevo tablero"
            value={newBoardTitle}  // Cambié 'newBoardName' por 'newBoardTitle'
            onChange={(e) => setNewBoardTitle(e.target.value)}  // Cambié 'setNewBoardName' por 'setNewBoardTitle'
            className="w-full p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-r-lg hover:bg-blue-700 transition-colors"
            disabled={loading}  // Deshabilitar el botón durante la carga
          >
            {loading ? 'Cargando...' : 'Crear Tablero'}
          </button>
        </form>
      </div>

      {/* Mostrar mensaje de error si lo hay */}
      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      {/* Mostrar los Tableros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boards.length > 0 ? (
          boards.map((board) => (
            <div key={board.id} className="bg-white shadow-md rounded-lg p-4 flex flex-col justify-between">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">{board.title}</h3>  {/* Cambié 'name' por 'title' */}
              <div className="flex justify-between">
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Ver Tareas
                </button>
                <button
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Editar
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center text-gray-500">
            <p>No hay tableros disponibles. Crea uno nuevo para comenzar.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardView;

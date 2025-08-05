import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import api from '../api/axiosConfig'; 

const BoardView = () => {
  const { projectId } = useParams();  // Obtener el ID del proyecto desde la URL
  const [boards, setBoards] = useState([]);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [loading, setLoading] = useState(false);  
  const [error, setError] = useState(null);  
  const navigate = useNavigate();  

  useEffect(() => {
    console.log('Obteniendo tableros para el proyecto:', projectId); 

    setLoading(true); 
    api.get(`/projects/${projectId}/boards`) 
        .then(res => {
            console.log('Tableros recuperados:', res.data);  
            setBoards(res.data.items); 
            setLoading(false); 
        })
        .catch(err => {
            console.error('Error al obtener tableros:', err);  
            setError('Error al obtener los tableros');
            setLoading(false);  
        });
  }, [projectId]); 

  const handleCreateBoard = (e) => {
    e.preventDefault();
    setLoading(true);
    api.post('/boards', { title: newBoardTitle, project_id: projectId })
      .then(res => {
        console.log('Nuevo tablero creado:', res.data);
        setBoards(prevBoards => [...prevBoards, res.data]);
        setNewBoardTitle('');
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al crear el tablero:', err);
        setError('Error al crear el tablero');
        setLoading(false);
      });
  };

  const handleViewTasks = (boardId) => {
    navigate(`/boards/${boardId}/tasks`); 
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Espacio de Trabajo del Proyecto</h1>

      <div className="mb-6 flex justify-between items-center">
        <form onSubmit={handleCreateBoard} className="flex w-2/3">
          <input
            type="text"
            placeholder="Título del nuevo tablero"
            value={newBoardTitle}
            onChange={(e) => setNewBoardTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-r-lg hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Crear Tablero'}
          </button>
        </form>
      </div>

      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boards.length > 0 ? (
          boards.map((board) => (
            <div key={board.id} className="bg-white shadow-md rounded-lg p-4 flex flex-col justify-between">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">{board.title}</h3>
              <div className="flex justify-between">
                <button
                  onClick={() => handleViewTasks(board.id)} 
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
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import api from '../api/axiosConfig'; 

const BoardView = () => {
  const { projectId } = useParams();
  const [boards, setBoards] = useState([]);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [loading, setLoading] = useState(false);  
  const [error, setError] = useState(null);  
  const navigate = useNavigate();  

  useEffect(() => {
    setLoading(true); 
    api.get(`/projects/${projectId}/boards`) 
        .then(res => {
            setBoards(res.data.items); 
            setLoading(false); 
        })
        .catch(() => {
            setError('Error al obtener los tableros');
            setLoading(false);  
        });
  }, [projectId]); 

  const handleCreateBoard = (e) => {
    e.preventDefault();
    setLoading(true);
    api.post('/boards', { title: newBoardTitle, project_id: projectId })
      .then(res => {
        setBoards(prevBoards => [...prevBoards, res.data]);
        setNewBoardTitle('');
        setLoading(false);
      })
      .catch(() => {
        setError('Error al crear el tablero');
        setLoading(false);
      });
  };

  const handleViewTasks = (boardId) => {
    navigate(`/boards/${boardId}/tasks`); 
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-indigo-900 to-sky-900">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-300 drop-shadow">
              Espacio de Trabajo del Proyecto
            </span>
          </h1>
        </div>

        <div className="mb-8">
          <div className="mx-auto max-w-3xl rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl p-2 sm:p-3">
            <form onSubmit={handleCreateBoard} className="flex gap-2">
              <input
                type="text"
                placeholder="Título del nuevo tablero"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/90 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-slate-800 placeholder-slate-400"
                required
              />
              <button
                type="submit"
                className="whitespace-nowrap px-5 py-2.5 rounded-xl font-medium bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg transition"
                disabled={loading}
              >
                {loading ? 'Cargando...' : 'Crear Tablero'}
              </button>
            </form>
          </div>
        </div>

        {error && (
          <p className="text-center mb-6 text-rose-200 bg-rose-900/40 border border-rose-700/50 rounded-xl px-4 py-2">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.length > 0 ? (
            boards.map((board) => (
              <div
                key={board.id}
                className="group rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md shadow-xl p-5 hover:bg-white/15 transition relative overflow-hidden"
              >
                <h3 className="text-xl font-semibold text-white drop-shadow mb-4 line-clamp-2">
                  {board.title}
                </h3>
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => handleViewTasks(board.id)}
                    className="flex-1 rounded-xl px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-md transition"
                  >
                    Ver Tareas
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-10 text-center text-sky-100">
                No hay tableros disponibles. Crea uno nuevo para comenzar.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardView;
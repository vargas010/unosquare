import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import DroppableColumn from './DroppableColumn';
import { SortableTask } from './SortableTask';

const TaskView = () => {
  const { boardId } = useParams();

  const [columns, setColumns] = useState({});
  const [newColumnName, setNewColumnName] = useState('');
  const [activeTask, setActiveTask] = useState(null);
  const [editingColId, setEditingColId] = useState(null);
  const [editingColName, setEditingColName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskColumnId, setTaskColumnId] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    const loadBoardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [colsRes, tasksRes] = await Promise.all([
          api.get(`/boards/${boardId}/columns`),
          api.get(`/boards/${boardId}/tasks`)
        ]);

        const boardColumns = colsRes.data || [];
        const tempColumns = Object.fromEntries(
          boardColumns
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map(c => [c.id, { name: c.name, tasks: [] }])
        );

        const taskList = tasksRes.data.items || [];
        taskList.forEach(task => {
          if (tempColumns[task.column_id]) {
            tempColumns[task.column_id].tasks.push(task);
          }
        });

        setColumns(tempColumns);
      } catch (err) {
        setError('Error al obtener datos del tablero');
      } finally {
        setLoading(false);
      }
    };

    loadBoardData();
  }, [boardId]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sourceColId = Object.keys(columns).find(columnId =>
      columns[columnId].tasks.some(task => task.id === active.id)
    );
    const destinationColId = over?.id;
    if (!sourceColId || !destinationColId || sourceColId === destinationColId) return;

    const sourceTasks = [...columns[sourceColId].tasks];
    const destinationTasks = [...columns[destinationColId].tasks];

    const taskIndex = sourceTasks.findIndex(task => task.id === active.id);
    const [movedTask] = sourceTasks.splice(taskIndex, 1);
    movedTask.column_id = destinationColId;
    destinationTasks.push(movedTask);

    setColumns(prev => ({
      ...prev,
      [sourceColId]: { ...prev[sourceColId], tasks: sourceTasks },
      [destinationColId]: { ...prev[destinationColId], tasks: destinationTasks },
    }));

    try {
      await api.put(`/tasks/${active.id}`, { column_id: destinationColId });
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      setError('No se pudo mover la tarea');
    }

    setActiveTask(null);
  };

  const openTaskModal = (colId) => {
    setTaskColumnId(colId);
    setTaskTitle('');
    setTaskDescription('');
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setTaskColumnId(null);
  };

  const handleCreateTaskForColumn = async (e) => {
    e?.preventDefault?.();
    if (!taskColumnId || !taskTitle.trim()) return;
    try {
      setLoading(true);
      const res = await api.post('/tasks', {
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        board_id: boardId,
        column_id: taskColumnId
      });
      const newTask = res.data;
      setColumns(prev => ({
        ...prev,
        [taskColumnId]: {
          ...prev[taskColumnId],
          tasks: [...prev[taskColumnId].tasks, newTask]
        }
      }));
      closeTaskModal();
    } catch {
      setError('Error al crear la tarea');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateColumn = async () => {
    if (!newColumnName.trim()) return;
    setError(null);
    try {
      const res = await api.post(`/boards/${boardId}/columns`, { name: newColumnName.trim() });
      const newCol = res.data;
      setColumns(prev => ({
        ...prev,
        [newCol.id]: { name: newCol.name, tasks: [] },
      }));
      setNewColumnName('');
    } catch (err) {
      setError('Error al crear la columna');
    }
  };

  const startEditColumn = (colId) => {
    setEditingColId(colId);
    setEditingColName(columns[colId]?.name || '');
  };

  const cancelEditColumn = () => {
    setEditingColId(null);
    setEditingColName('');
  };

  const saveEditColumn = async () => {
    if (!editingColId || !editingColName.trim()) return;
    setError(null);
    try {
      await api.put(`/boards/${boardId}/columns/${editingColId}`, {
        name: editingColName.trim()
      });
      setColumns(prev => ({
        ...prev,
        [editingColId]: { ...prev[editingColId], name: editingColName.trim() }
      }));
      cancelEditColumn();
    } catch {
      setError('No se pudo renombrar la columna');
    }
  };

  return (
    <div style={{ 
      backgroundImage: "url('https://placehold.co/1920x1080?text=Task+Manager&font=montserrat')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      minHeight: '100vh'
    }}>
      <div className="container mx-auto px-6 py-8 bg-white bg-opacity-90 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Tareas del Tablero</h1>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
        {loading && <p className="text-center text-gray-600">Cargando datos...</p>}

        <div className="flex gap-3 mb-6 items-center">
          <input
            type="text"
            placeholder="Nombre de la nueva columna"
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
          />
          <button
            onClick={handleCreateColumn}
            className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition duration-200"
          >
            Crear columna
          </button>
        </div>

        {Object.keys(columns).length === 0 ? (
          <p className="text-center text-gray-500">No hay columnas, crea una para comenzar</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragStart={e => {
              const activeId = e.active.id;
              const task = Object.values(columns).flatMap(c => c.tasks).find(t => t.id === activeId);
              setActiveTask(task);
            }}
          >
            <div className="flex gap-6 overflow-x-auto">
              {Object.entries(columns).map(([columnId, column]) => (
                <div key={columnId} className="bg-white p-4 rounded-lg shadow-md min-w-[320px] border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    {editingColId === columnId ? (
                      <input
                        autoFocus
                        className="p-2 border border-gray-300 rounded-md w-full mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editingColName}
                        onChange={(e) => setEditingColName(e.target.value)}
                      />
                    ) : (
                      <h2 className="text-lg font-semibold text-gray-700 truncate">{column.name}</h2>
                    )}

                    {editingColId === columnId ? (
                      <div className="flex gap-2">
                        <button
                          onClick={saveEditColumn}
                          className="text-xs bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700 transition"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={cancelEditColumn}
                          className="text-xs bg-gray-400 text-white px-2 py-1 rounded-md hover:bg-gray-500 transition"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openTaskModal(columnId)}
                          className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-md hover:bg-indigo-700 transition"
                          title="Crear tarea en esta columna"
                        >
                          + Nueva tarea
                        </button>
                        <button
                          onClick={() => startEditColumn(columnId)}
                          className="text-xs bg-gray-700 text-white px-2 py-1 rounded-md hover:bg-gray-800 transition"
                          title="Editar nombre"
                        >
                          Editar
                        </button>
                      </div>
                    )}
                  </div>

                  <DroppableColumn id={columnId} tasks={column.tasks}>
                    {column.tasks.map(task => (
                      <SortableTask key={task.id} task={task} />
                    ))}
                  </DroppableColumn>
                </div>
              ))}
            </div>

            <DragOverlay>
              {activeTask ? (
                <div className="p-4 bg-white rounded-lg shadow border w-[260px]">
                  <h4 className="font-semibold text-gray-800">{activeTask.title}</h4>
                  <p className="text-sm text-gray-600">{activeTask.description}</p>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-sm rounded-lg shadow-xl p-5">
            <h3 className="text-lg font-semibold mb-3">Nueva tarea</h3>
            <form onSubmit={handleCreateTaskForColumn} className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Título</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Descripción</label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeTaskModal}
                  className="px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskView;
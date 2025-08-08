// FRONTEND: TaskView.jsx — columnas persistentes + edición de nombre
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

  const [columns, setColumns] = useState({});         // { [colId]: { name, tasks: [] } }
  const [newColumnName, setNewColumnName] = useState('');
  const [activeTask, setActiveTask] = useState(null);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  const [editingColId, setEditingColId] = useState(null);
  const [editingColName, setEditingColName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Cargar columnas y tareas desde el backend
  useEffect(() => {
    const loadBoardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [colsRes, tasksRes] = await Promise.all([
          api.get(`/boards/${boardId}/columns`),
          api.get(`/boards/${boardId}/tasks`)
        ]);

        const boardColumns = colsRes.data || []; // puede ser []
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

  // ---- Drag & Drop de tareas ----
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

  // ---- Crear tarea ----
  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (Object.keys(columns).length === 0) {
      setError('Crea una columna antes de agregar tareas');
      return;
    }

    setLoading(true);
    setError(null);

    const firstColumnId = Object.keys(columns)[0];

    try {
      const res = await api.post('/tasks', {
        title: newTaskTitle,
        description: newTaskDescription,
        board_id: boardId,
        column_id: firstColumnId
      });
      const newTask = res.data;
      setColumns(prev => ({
        ...prev,
        [firstColumnId]: {
          ...prev[firstColumnId],
          tasks: [...prev[firstColumnId].tasks, newTask]
        }
      }));
      setNewTaskTitle('');
      setNewTaskDescription('');
    } catch {
      setError('Error al crear la tarea');
    } finally {
      setLoading(false);
    }
  };

  // ---- Crear columna ----
  const handleCreateColumn = async () => {
    if (!newColumnName.trim()) return;
    setError(null);
    try {
      const res = await api.post(`/boards/${boardId}/columns`, { name: newColumnName.trim() });
      const newCol = res.data; // { id, name, order? }
      setColumns(prev => ({
        ...prev,
        [newCol.id]: { name: newCol.name, tasks: [] },
      }));
      setNewColumnName('');
    } catch (err) {
      setError('Error al crear la columna');
    }
  };

  // ---- Renombrar columna ----
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
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Tareas del Tablero</h1>
      {error && <p className="text-red-600 text-center mb-4">{error}</p>}
      {loading && <p className="text-center">Cargando datos...</p>}

      {/* Crear tarea */}
      <form onSubmit={handleCreateTask} className="mb-6 flex flex-col gap-2 w-1/2 mx-auto">
        <input
          type="text"
          placeholder="Título de la tarea"
          className="p-2 border rounded"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Descripción"
          className="p-2 border rounded"
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Crear tarea
        </button>
      </form>

      {/* Crear columna */}
      <div className="flex gap-3 mb-6 items-center">
        <input
          type="text"
          placeholder="Nombre de la nueva columna"
          className="p-2 border rounded"
          value={newColumnName}
          onChange={(e) => setNewColumnName(e.target.value)}
        />
        <button onClick={handleCreateColumn} className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600">
          Crear columna
        </button>
      </div>

      {/* Listado de columnas */}
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
              <div key={columnId} className="bg-gray-200 p-4 rounded-lg shadow-md min-w-[300px]">
                <div className="flex items-center justify-between mb-4">
                  {editingColId === columnId ? (
                    <input
                      autoFocus
                      className="p-1 border rounded w-full mr-2"
                      value={editingColName}
                      onChange={(e) => setEditingColName(e.target.value)}
                    />
                  ) : (
                    <h2 className="text-xl font-semibold text-gray-700">{column.name}</h2>
                  )}

                  {editingColId === columnId ? (
                    <div className="flex gap-2">
                      <button
                        onClick={saveEditColumn}
                        className="text-sm bg-blue-600 text-white px-2 py-1 rounded"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={cancelEditColumn}
                        className="text-sm bg-gray-400 text-white px-2 py-1 rounded"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditColumn(columnId)}
                      className="text-sm bg-gray-700 text-white px-2 py-1 rounded"
                      title="Editar nombre"
                    >
                      Editar
                    </button>
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
              <div className="p-4 bg-white rounded shadow border w-[260px]">
                <h4 className="font-semibold text-gray-800">{activeTask.title}</h4>
                <p className="text-sm text-gray-600">{activeTask.description}</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
};

export default TaskView;
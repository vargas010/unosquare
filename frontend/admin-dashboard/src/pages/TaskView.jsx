// FRONTEND: TaskView.jsx mejorado con diseño de estilo Trello
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
  const [columns, setColumns] = useState({
    todo: { name: 'Por hacer', tasks: [] },
    inProgress: { name: 'En progreso', tasks: [] },
    done: { name: 'Hecho', tasks: [] },
  });
  const [activeTask, setActiveTask] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    setLoading(true);
    api.get(`/boards/${boardId}/tasks`)
      .then(res => {
        const taskList = res.data.items || [];
        const tempColumns = {
          todo: { name: 'Por hacer', tasks: [] },
          inProgress: { name: 'En progreso', tasks: [] },
          done: { name: 'Hecho', tasks: [] },
        };
        taskList.forEach(task => {
          if (tempColumns[task.column_id]) {
            tempColumns[task.column_id].tasks.push(task);
          }
        });
        setColumns(tempColumns);
        setLoading(false);
      })
      .catch(err => {
        setError('Error al obtener las tareas');
        setLoading(false);
      });
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
      await api.put(`/tasks/${active.id}`, {
        column_id: destinationColId,
      });
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
    }

    setActiveTask(null);
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    setLoading(true);
    api.post('/tasks', {
      title: newTaskTitle,
      description: newTaskDescription,
      board_id: boardId,
      column_id: 'todo'
    })
      .then(res => {
        const newTask = res.data;
        setColumns(prev => ({
          ...prev,
          todo: {
            ...prev.todo,
            tasks: [...prev.todo.tasks, newTask]
          }
        }));
        setNewTaskTitle('');
        setNewTaskDescription('');
        setLoading(false);
      })
      .catch(err => {
        setError('Error al crear la tarea');
        setLoading(false);
      });
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Tareas del Tablero</h1>
      {error && <p className="text-red-600 text-center mb-4">{error}</p>}
      {loading && <p className="text-center">Cargando tareas...</p>}

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

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} onDragStart={e => {
        const activeId = e.active.id;
        const task = Object.values(columns).flatMap(c => c.tasks).find(t => t.id === activeId);
        setActiveTask(task);
      }}>
        <div className="flex gap-6 overflow-x-auto">
          {Object.entries(columns).map(([columnId, column]) => (
            <div key={columnId} className="bg-gray-200 p-4 rounded-lg shadow-md w-[300px]">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">{column.name}</h2>
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
    </div>
  );
};

export default TaskView;

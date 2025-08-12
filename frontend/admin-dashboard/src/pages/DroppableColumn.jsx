import React from 'react';
import { useDroppable } from '@dnd-kit/core';

const DroppableColumn = ({ id, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[200px] transition-colors duration-200 p-2 rounded ${
        isOver ? 'bg-blue-100' : 'bg-white'
      }`}
    >
      {children}
    </div>
  );
};

export default DroppableColumn;

import "./TasksContainer.css";
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Task } from "./Task";

interface Props {
  id: string; // ID de la columna (ej: "todo")
  tasks: Array<{ id: any; name: string }>;
}

const TasksContainer = ({ id, tasks }: Props) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div 
      ref={setNodeRef} 
      className="tasks-container" 
      style={{ minHeight: "100px" }} // Importante para columnas vacías
    >
      <SortableContext 
        id={id} 
        items={tasks.map(t => t.id)} 
        strategy={verticalListSortingStrategy}
      >
        {tasks.map((task) => (
          <Task key={task.id} id={task.id} title={task.name} />
        ))}
      </SortableContext>
    </div>
  );
};

export default TasksContainer;
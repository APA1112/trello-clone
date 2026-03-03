import React from "react";
import "./Task.css";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TaskProps {
  id: number;
  title: string;
}

export const Task: React.FC<TaskProps> = ({ id, title }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.3 : 1, 
    border: isDragging ? "2px dashed #000" : "1px solid #000",
    backgroundColor: isDragging ? "transparent" : "#000000",
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="task"
    >
      {title}
    </div>
  );
};

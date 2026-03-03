import { useState } from "react";
import { DndContext, KeyboardSensor, TouchSensor, closestCorners, useSensor, useSensors } from "@dnd-kit/core";
import "./App.css";
import TasksContainer from "./components/TasksContainer";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { PointerSensor } from "@dnd-kit/core";

function App() {
  const [tasks, setTasks] = useState([
    { id: 1, name: "Task 1" },
    { id: 2, name: "Task 2" },
    { id: 3, name: "Task 3" },
  ]);

  const getTaskPos = (id: number) => tasks.findIndex((task) => task.id === id);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id === over.id) return;

    setTasks((tasks) => {
      const originalPos = getTaskPos(active.id);
      const newPos = getTaskPos(over.id);

      return arrayMove(tasks, originalPos, newPos);
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  return (
    <div className="App">
      <h1>Task Manager</h1>
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCorners}
      >
        <TasksContainer tasks={tasks} />
      </DndContext>
    </div>
  );
}

export default App;

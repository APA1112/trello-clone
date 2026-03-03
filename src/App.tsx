import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragOverEvent,
  type DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import TasksContainer from "./components/TasksContainer";
import { Board } from "./components/Board";
import { Task } from "./components/Task";

export default function App() {
  const [activeId, setActiveId] = useState<string | null>(null);
  // Estado con 3 conjuntos de tareas
  const [columns, setColumns] = useState<{ [key: string]: any[] }>({
    todo: [
      { id: 1, name: "Tarea 1" },
      { id: 2, name: "Tarea 2" },
    ],
    doing: [{ id: 3, name: "Tarea 3" }],
    done: [],
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Función para encontrar a qué columna pertenece un ID
  const findContainer = (id: any) => {
    if (id in columns) return id;
    return Object.keys(columns).find((key) =>
      columns[key].find((item) => item.id === id),
    );
  };

  // Se dispara mientras arrastras sobre otros elementos
  const handleDragOver = (event: DragOverEvent) => {
    setActiveId(event.active.id as string);
    const { active, over } = event;
    const overId = over?.id;

    if (!overId || active.id === overId) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer)
      return;

    setColumns((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const activeIndex = activeItems.findIndex((i) => i.id === active.id);
      const overIndex = overItems.findIndex((i) => i.id === overId);

      return {
        ...prev,
        [activeContainer]: activeItems.filter((i) => i.id !== active.id),
        [overContainer]: [
          ...overItems.slice(0, overIndex),
          activeItems[activeIndex],
          ...overItems.slice(overIndex),
        ],
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    
    const { active, over } = event;
    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over?.id);

    if (activeContainer && overContainer && activeContainer === overContainer) {
      const activeIndex = columns[activeContainer].findIndex(
        (i) => i.id === active.id,
      );
      const overIndex = columns[overContainer].findIndex(
        (i) => i.id === over?.id,
      );

      if (activeIndex !== overIndex) {
        setColumns((prev) => ({
          ...prev,
          [overContainer]: arrayMove(
            prev[overContainer],
            activeIndex,
            overIndex,
          ),
        }));
      }
    }
    setActiveId(null); // Limpiamos el ID al soltar
  };
  // Buscamos la tarea activa para mostrarla en el overlay
  const activeTask = activeId
    ? Object.values(columns)
        .flat()
        .find((task) => task.id === activeId)
    : null;

  return (
    <div className="App">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Board title="To Do">
          <TasksContainer id="todo" tasks={columns.todo} />
        </Board>

        <Board title="In Progress">
          <TasksContainer id="doing" tasks={columns.doing} />
        </Board>

        <Board title="Done">
          <TasksContainer id="done" tasks={columns.done} />
        </Board>
        {/* El Overlay es como un "fantasma" que vuela sobre todo */}
        <DragOverlay>
          {activeId && activeTask ? (
            <Task id={activeTask.id} title={activeTask.name} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

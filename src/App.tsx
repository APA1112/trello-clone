import { useState, useEffect } from "react";
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
import initialData from "./data/tasks-data.json";

/**
 * COMPONENTE PRINCIPAL: APP
 * Gestiona un tablero Kanban con 3 columnas (todo, doing, done).
 * Utiliza @dnd-kit para la lógica de arrastrar y soltar.
 */
export default function App() {
  // Guarda el ID del elemento que se está arrastrando actualmente (para el "fantasma" o DragOverlay)
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Diccionario de columnas. Cada clave es un ID de contenedor y el valor es un array de objetos tarea.
  // Estructura esperada: { todo: [...], doing: [...], done: [...] }
  const [columns, setColumns] = useState<{ [key: string]: any[] }>(initialData);

  // Efecto para inicialización o sincronización con APIs externas
  useEffect(() => {
    console.log("Cargando tareas desde el JSON inicial...");
  }, []);

  /**
   * CONFIGURACIÓN DE SENSORES
   * Define CÓMO el usuario puede interactuar: ratón/táctil o teclado.
   */
  const sensors = useSensors(
    useSensor(PointerSensor), // Para ratón y pantallas táctiles
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates, // Permite mover elementos con flechas del teclado
    }),
  );

  /**
   * UTILIDAD: findContainer
   * Dado el ID de una tarea o de una columna, devuelve la clave de la columna (todo/doing/done).
   * Es vital para saber de dónde sale una tarea y a dónde entra.
   */
  const findContainer = (id: any) => {
    if (id in columns) return id; // Si el ID ya es el de una columna
    return Object.keys(columns).find((key) =>
      columns[key].find((item) => item.id === id), // Busca en qué array de columna reside la tarea
    );
  };

  /**
   * EVENTO: handleDragOver
   * Se ejecuta constantemente MIENTRAS arrastras un elemento sobre otros.
   * AQUÍ ocurre la magia de mover una tarea de una columna a OTRA en tiempo real.
   */
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const overId = over?.id;

    if (!overId || active.id === overId) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(overId);

    // Si no hay contenedores válidos o estamos en la misma columna, no hacemos nada aquí
    if (!activeContainer || !overContainer || activeContainer === overContainer)
      return;

    setColumns((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];

      // Índices de origen y destino
      const activeIndex = activeItems.findIndex((i) => i.id === active.id);
      const overIndex = overItems.findIndex((i) => i.id === overId);

      return {
        ...prev,
        // Quitamos la tarea de la columna de origen
        [activeContainer]: activeItems.filter((i) => i.id !== active.id),
        // La insertamos en la columna de destino en la posición correcta
        [overContainer]: [
          ...overItems.slice(0, overIndex),
          activeItems[activeIndex],
          ...overItems.slice(overIndex),
        ],
      };
    });
  };

  /**
   * EVENTO: handleDragEnd
   * Se ejecuta cuando SUELTAS el elemento.
   * Se encarga principalmente de reordenar elementos dentro de la MISMA columna.
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over?.id);

    // Si soltamos dentro de la misma columna, reordenamos el array
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
          // arrayMove es una utilidad que mueve un elemento de un índice a otro sin mutar el original
          [overContainer]: arrayMove(
            prev[overContainer],
            activeIndex,
            overIndex,
          ),
        }));
      }
    }
    
    // Reset del estado visual
    setActiveId(null); 
  };

  /**
   * LÓGICA DEL OVERLAY
   * Buscamos la tarea que se está moviendo para que el "fantasma" que sigue al ratón
   * se vea exactamente igual que la tarjeta original.
   */
  const activeTask = activeId
    ? Object.values(columns)
        .flat()
        .find((task) => task.id === activeId)
    : null;

  return (
    <div className="App">
      {/* DndContext: El envoltorio principal. 
          collisionDetection: closestCorners es el algoritmo que decide sobre qué columna estás 
          (ideal para columnas grandes). 
      */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={(e) => setActiveId(e.active.id as string)}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Renderizado de las 3 columnas principales */}
        <Board title="To Do">
          <TasksContainer id="todo" tasks={columns.todo} />
        </Board>

        <Board title="In Progress">
          <TasksContainer id="doing" tasks={columns.doing} />
        </Board>

        <Board title="Done">
          <TasksContainer id="done" tasks={columns.done} />
        </Board>

        {/* DragOverlay: Es una capa superior que renderiza el elemento que "vuela".
          Evita problemas de z-index y mejora el rendimiento visual.
        */}
        <DragOverlay>
          {activeId && activeTask ? (
            <Task id={activeTask.id} title={activeTask.name} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
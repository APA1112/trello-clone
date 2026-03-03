import "./TasksContainer.css";
import {SortableContext, verticalListSortingStrategy} from '@dnd-kit/sortable';
import { Task } from "./Task";

const TasksContainer = ({ tasks }: { tasks: Array<{ id: number; name: string }> }) => {
  return (
    <div className="tasks-container">
      <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
        {tasks.map((task) => (
            <Task key={task.id} id={task.id} title={task.name} />
      ))}
      </SortableContext>
    </div>
  );
};

export default TasksContainer;

import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard.jsx';

const columns = [
  { id: 'todo', label: 'Todo' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
];

function DraggableTask({ task, disabled }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id, data: { task }, disabled });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  return (
    <div ref={setNodeRef} style={style} className={`${isDragging ? 'dragging' : ''} ${disabled ? 'opacity-75' : ''}`}>
      <TaskCard task={task} dragProps={disabled ? {} : { ...listeners, ...attributes }} />
    </div>
  );
}

function Column({ column, tasks, canMoveTask }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  return (
    <section ref={setNodeRef} className={`kanban-column ${isOver ? 'over' : ''}`}>
      <div className="kanban-column-head">
        <h3>{column.label}</h3>
        <span>{tasks.length}</span>
      </div>
      <div className="kanban-list">
        {tasks.map((task) => <DraggableTask key={task.id} task={task} disabled={!canMoveTask(task)} />)}
      </div>
    </section>
  );
}

export default function KanbanBoard({ tasks = [], onMove, canMoveTask = () => true }) {
  const handleDragEnd = ({ active, over }) => {
    if (!over) return;
    const task = active.data.current.task;
    if (task.status !== over.id) onMove(task, over.id);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="kanban-board">
        {columns.map((column) => (
          <Column key={column.id} column={column} tasks={tasks.filter((task) => task.status === column.id)} canMoveTask={canMoveTask} />
        ))}
      </div>
    </DndContext>
  );
}

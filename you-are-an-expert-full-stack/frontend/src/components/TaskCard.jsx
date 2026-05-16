import { Link } from 'react-router-dom';
import { relativeTime } from '../utils/relativeTime.js';

export default function TaskCard({ task, dragProps }) {
  return (
    <article className="task-card" {...dragProps}>
      <Link to={`/tasks/${task.id}`}>
        <div className="task-card-top">
          <h4>{task.title}</h4>
          <span className={`priority ${task.priority}`}>{task.priority}</span>
        </div>
        <p>{task.description || 'No description'}</p>
        <div className="task-meta">
          <span>{task.due_date ? `Due ${relativeTime(task.due_date)}` : 'No due date'}</span>
          <span className={`status-pill ${task.status}`}>{task.status.replace('_', ' ')}</span>
        </div>
      </Link>
    </article>
  );
}

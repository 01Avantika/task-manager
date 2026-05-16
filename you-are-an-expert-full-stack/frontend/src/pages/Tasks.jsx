import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useAllTasks } from '../hooks/useTasks.js';

export default function Tasks() {
  const { data: tasks = [], isLoading, isError, error, refetch } = useAllTasks();

  if (isLoading) return <LoadingSpinner label="Loading tasks..." />;

  if (isError) {
    return (
      <div className="page">
        <ErrorState title="Tasks could not load" message={error?.response?.data?.detail} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="mb-7">
        <span className="text-sm font-extrabold uppercase tracking-wide text-primary">All work</span>
        <h1 className="mt-2 text-4xl font-black text-gray-950">Tasks</h1>
        <p className="mt-2 max-w-2xl text-gray-500">Scan every task you can access across projects.</p>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          message="Open a project and create a task to start building your team board."
          actionLabel="Go to Projects"
          actionTo="/projects"
        />
      ) : (
        <div className="grid gap-3">
          {tasks.map((task) => (
            <Link key={task.id} to={`/tasks/${task.id}`} className="rounded-app border border-gray-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <strong className="text-gray-950">{task.title}</strong>
                  <p className="mb-0 mt-1 text-sm text-gray-500">{task.description || 'No description'}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`status-pill ${task.status}`}>{task.status.replace('_', ' ')}</span>
                  <span className={`priority ${task.priority}`}>{task.priority}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

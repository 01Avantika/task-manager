import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useDashboard } from '../hooks/useDashboard.js';

const STATUS_COLORS = {
  Completed: '#10B981',
  'In Progress': '#F59E0B',
  Pending: '#4F46E5',
};

function numberValue(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function SummaryCard({ label, value, helper }) {
  return (
    <article className="rounded-app border border-gray-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg">
      <span className="text-sm font-bold text-gray-500">{label}</span>
      <strong className="mt-3 block text-3xl font-black text-gray-950">{value}</strong>
      <p className="mb-0 mt-2 text-sm text-gray-500">{helper}</p>
    </article>
  );
}

function ChartPlaceholder({ type }) {
  if (type === 'pie') {
    return (
      <div className="flex h-72 flex-col items-center justify-center rounded-app bg-gray-50 p-6 text-center">
        <div className="relative h-36 w-36 rounded-full bg-[conic-gradient(#e0e7ff_0_45%,#fef3c7_45%_70%,#d1fae5_70%_100%)]">
          <div className="absolute inset-8 rounded-full bg-gray-50" />
        </div>
        <strong className="mt-5 text-gray-950">No task data yet</strong>
        <span className="mt-1 max-w-xs text-sm text-gray-500">Create tasks to populate status analytics.</span>
      </div>
    );
  }

  return (
    <div className="flex h-72 flex-col justify-end rounded-app bg-gray-50 p-6">
      <div className="flex h-44 items-end gap-4">
        {[42, 68, 52, 78, 60].map((height, index) => (
          <span
            key={height}
            className={`flex-1 rounded-t-app ${index % 2 ? 'bg-indigo-200' : 'bg-gray-200'}`}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <div className="mt-5 text-center">
        <strong className="text-gray-950">No distribution yet</strong>
        <p className="mb-0 mt-1 text-sm text-gray-500">Add tasks to projects to see workload distribution.</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading, isError, error, refetch } = useDashboard();

  if (isLoading) return <LoadingSpinner label="Loading dashboard..." />;

  if (isError) {
    return (
      <div className="page">
        <ErrorState
          title="Dashboard could not load"
          message={error?.response?.data?.detail || 'The API returned an error while loading dashboard data.'}
          onRetry={refetch}
        />
      </div>
    );
  }

  const dashboard = data || {};
  const totalProjects = numberValue(dashboard.total_projects);
  const totalTasks = numberValue(dashboard.total_tasks);
  const completedTasks = numberValue(dashboard.completed_tasks);
  const pendingTasks = numberValue(dashboard.pending_tasks);
  const status = dashboard.tasks_by_status || {};
  const statusData = [
    { name: 'Completed', value: numberValue(status.done) },
    { name: 'In Progress', value: numberValue(status.in_progress) },
    { name: 'Pending', value: numberValue(status.todo) },
  ].filter((entry) => Number.isFinite(entry.value));
  const projectTaskData = Array.isArray(dashboard.tasks_per_project)
    ? dashboard.tasks_per_project.map((entry) => ({
        name: entry?.name || 'Unknown',
        total: numberValue(entry?.total),
      }))
    : [];
  const userTaskData = Array.isArray(dashboard.tasks_per_user)
    ? dashboard.tasks_per_user.map((entry) => ({
        name: entry?.name || 'Unassigned',
        total: numberValue(entry?.total),
        completed: numberValue(entry?.completed),
        pending: numberValue(entry?.pending),
      }))
    : [];
  const progressData = Array.isArray(dashboard.progress_over_time)
    ? dashboard.progress_over_time.map((entry) => ({
        date: entry?.date || '',
        created: numberValue(entry?.created),
        completed: numberValue(entry?.completed),
      }))
    : [];
  const recentProjects = Array.isArray(dashboard.recent_projects) ? dashboard.recent_projects : [];
  const hasProjects = totalProjects > 0;
  const hasTasks = totalTasks > 0;
  const hasStatusData = statusData.some((entry) => entry.value > 0);
  const hasProjectChartData = projectTaskData.some((entry) => entry.total > 0);
  const hasUserChartData = userTaskData.some((entry) => entry.total > 0);
  const hasProgressData = progressData.some((entry) => entry.created > 0 || entry.completed > 0);

  return (
    <div className="page">
      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="text-sm font-extrabold uppercase tracking-wide text-primary">Workspace overview</span>
          <h1 className="mt-2 text-4xl font-black text-gray-950">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-gray-500">
            Track projects, task volume, completion, and workload distribution without losing the thread.
          </p>
        </div>
        <Link to="/projects" className="btn primary">
          New Project
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Projects" value={totalProjects} helper={hasProjects ? 'Active workspaces' : 'Create your first project'} />
        <SummaryCard label="Total Tasks" value={totalTasks} helper={hasTasks ? 'Across accessible projects' : 'No tasks created yet'} />
        <SummaryCard label="Completed Tasks" value={completedTasks} helper={`${numberValue(dashboard.completed_percent)}% completion rate`} />
        <SummaryCard label="Pending Tasks" value={pendingTasks} helper={`${numberValue(dashboard.overdue_tasks)} overdue`} />
      </div>

      {!hasProjects && (
        <div className="mt-6">
          <EmptyState
            title="No projects yet"
            message="Create a project to start tracking tasks, owners, and team progress."
            actionLabel="Create Project"
            actionTo="/projects"
          />
        </div>
      )}

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <section className="rounded-app border border-gray-200 bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="m-0 text-lg font-black text-gray-950">Task Status</h2>
              <p className="mb-0 mt-1 text-sm text-gray-500">Completed, in progress, and pending work.</p>
            </div>
          </div>
          {hasTasks && hasStatusData ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={92} innerRadius={56} paddingAngle={3}>
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94A3B8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <ChartPlaceholder type="pie" />
          )}
        </section>

        <section className="rounded-app border border-gray-200 bg-white p-5 shadow-soft">
          <div className="mb-4">
            <h2 className="m-0 text-lg font-black text-gray-950">Tasks Per User</h2>
            <p className="mb-0 mt-1 text-sm text-gray-500">Assigned workload by project member.</p>
          </div>
          {userTaskData.length > 0 && hasUserChartData ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userTaskData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <ChartPlaceholder type="bar" />
          )}
        </section>

        <section className="rounded-app border border-gray-200 bg-white p-5 shadow-soft">
          <div className="mb-4">
            <h2 className="m-0 text-lg font-black text-gray-950">Progress Over Time</h2>
            <p className="mb-0 mt-1 text-sm text-gray-500">Created and completed work by day.</p>
          </div>
          {progressData.length > 0 && hasProgressData ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="created" stroke="#4F46E5" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <ChartPlaceholder type="bar" />
          )}
        </section>

        <section className="rounded-app border border-gray-200 bg-white p-5 shadow-soft">
          <div className="mb-4">
            <h2 className="m-0 text-lg font-black text-gray-950">Tasks Per Project</h2>
            <p className="mb-0 mt-1 text-sm text-gray-500">Project-level workload distribution.</p>
          </div>
          {projectTaskData.length > 0 && hasProjectChartData ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectTaskData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#10B981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <ChartPlaceholder type="bar" />
          )}
        </section>
      </div>

      <section className="mt-6 rounded-app border border-gray-200 bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="m-0 text-lg font-black text-gray-950">Recent Projects</h2>
            <p className="mb-0 mt-1 text-sm text-gray-500">A quick path back into active work.</p>
          </div>
          <Link to="/projects" className="text-sm font-extrabold text-primary">
            View all
          </Link>
        </div>
        {recentProjects.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {recentProjects.map((project) => (
              <Link key={project.id} to={`/projects/${project.id}`} className="rounded-app border border-gray-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50">
                <strong className="block text-gray-950">{project.name}</strong>
                <span className="mt-1 block text-sm text-gray-500">{project.description || 'No description yet'}</span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No recent projects" message="Projects you create will show up here." />
        )}
      </section>
    </div>
  );
}

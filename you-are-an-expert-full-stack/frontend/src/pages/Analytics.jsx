import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
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
import { useAnalytics } from '../hooks/useAnalytics.js';

const COLORS = ['#4F46E5', '#F59E0B', '#10B981'];

function asNumber(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

export default function Analytics() {
  const { data, isLoading, isError, error, refetch } = useAnalytics();

  if (isLoading) return <LoadingSpinner label="Loading analytics..." />;

  if (isError) {
    return (
      <div className="page">
        <ErrorState title="Analytics could not load" message={error?.response?.data?.detail} onRetry={refetch} />
      </div>
    );
  }

  const analytics = data || {};
  const status = analytics.tasks_by_status || {};
  const statusData = [
    { name: 'Pending', value: asNumber(status.todo) },
    { name: 'In Progress', value: asNumber(status.in_progress) },
    { name: 'Completed', value: asNumber(status.done) },
  ];
  const overTime = Array.isArray(analytics.tasks_over_time) ? analytics.tasks_over_time : [];
  const progress = Array.isArray(analytics.projects_progress) ? analytics.projects_progress : [];
  const hasTasks = statusData.some((item) => item.value > 0);

  return (
    <div className="page">
      <div className="mb-7">
        <span className="text-sm font-extrabold uppercase tracking-wide text-primary">Reporting</span>
        <h1 className="mt-2 text-4xl font-black text-gray-950">Analytics</h1>
        <p className="mt-2 max-w-2xl text-gray-500">Visual reporting for task flow, completion, and project progress.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-app border border-gray-200 bg-white p-5 shadow-soft">
          <h2 className="m-0 text-lg font-black text-gray-950">Task Status Distribution</h2>
          {hasTasks ? (
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={56} outerRadius={92} paddingAngle={3}>
                    {statusData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState title="No task status data" message="Create tasks to populate status analytics." />
            </div>
          )}
        </section>

        <section className="rounded-app border border-gray-200 bg-white p-5 shadow-soft">
          <h2 className="m-0 text-lg font-black text-gray-950">Tasks Created Over Time</h2>
          {overTime.length > 0 ? (
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={overTime}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#4F46E5" fill="#EEF2FF" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState title="No timeline data" message="Newly created tasks will appear here over time." />
            </div>
          )}
        </section>

        <section className="rounded-app border border-gray-200 bg-white p-5 shadow-soft xl:col-span-2">
          <h2 className="m-0 text-lg font-black text-gray-950">Project Progress</h2>
          {progress.length > 0 ? (
            <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progress}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#4F46E5" name="Total tasks" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="completed" fill="#10B981" name="Completed" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid content-start gap-3">
                {progress.map((project) => (
                  <div className="progress-item" key={project.project_id}>
                    <div><strong>{project.name}</strong><span>{project.completed}/{project.total} done</span></div>
                    <div className="progress-track"><span style={{ width: `${project.percent}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState title="No projects to report" message="Project progress appears once projects are created." />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

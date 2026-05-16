import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CommentSection from '../components/CommentSection.jsx';
import ErrorState from '../components/ErrorState.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useProject, useProjectMembers } from '../hooks/useProjects.js';
import { useDeleteTask, useTask, useUpdateTask } from '../hooks/useTasks.js';

function toInputDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 16);
}

function isProjectAdmin(project, user) {
  if (!project || !user) return false;
  return user.role === 'admin' || project.owner_id === user.id || (project.admin_ids || []).includes(user.id);
}

export default function TaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: task, isLoading, isError, error, refetch } = useTask(taskId);
  const { data: project } = useProject(task?.project_id);
  const { data: members = [] } = useProjectMembers(task?.project_id);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [formError, setFormError] = useState('');
  const updateTask = useUpdateTask(task?.project_id);
  const deleteTask = useDeleteTask(task?.project_id);

  if (isLoading) return <LoadingSpinner label="Loading task..." />;
  if (isError) {
    return (
      <div className="page">
        <ErrorState title="Task could not load" message={error?.response?.data?.detail} onRetry={refetch} />
      </div>
    );
  }
  if (!task) return <div className="page"><ErrorState title="Task not found" message="This task may have been deleted or moved." /></div>;

  const canAdmin = isProjectAdmin(project, user);
  const isAssignedMember = task.assigned_to === user?.id;
  const canEdit = canAdmin || isAssignedMember;

  const startEdit = () => {
    setForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assigned_to: task.assigned_to || '',
      due_date: toInputDate(task.due_date),
    });
    setFormError('');
    setEditing(true);
  };

  const save = (event) => {
    event.preventDefault();
    setFormError('');
    const payload = canAdmin
      ? { ...form, assigned_to: form.assigned_to || null, due_date: form.due_date || null }
      : { status: form.status };
    updateTask.mutate(
      { taskId, payload },
      {
        onSuccess: () => setEditing(false),
        onError: (err) => setFormError(err.response?.data?.detail || 'Could not update task.'),
      },
    );
  };

  const remove = () => {
    deleteTask.mutate(taskId, {
      onSuccess: () => navigate(task.project_id ? `/projects/${task.project_id}` : '/tasks'),
    });
  };

  return (
    <div className="page detail-page">
      <section className="panel">
        <div className="page-head compact">
          <div>
            <span className="text-sm font-extrabold uppercase tracking-wide text-primary">{canAdmin ? 'Admin controls' : isAssignedMember ? 'Assigned to you' : 'Read only'}</span>
            <h1>{task.title}</h1>
            <p>{task.description || 'No description yet.'}</p>
          </div>
          <div className="flex gap-2">
            {canEdit && <button className="btn surface" onClick={startEdit}>Edit</button>}
            {canAdmin && <button className="btn surface text-red-600" onClick={remove}>Delete</button>}
          </div>
        </div>
        <div className="detail-grid">
          <span>Status <strong>{task.status.replace('_', ' ')}</strong></span>
          <span>Priority <strong>{task.priority}</strong></span>
          <span>Due <strong>{task.due_date ? new Date(task.due_date).toLocaleString() : 'None'}</strong></span>
          <span>Assigned <strong>{members.find((member) => member.id === task.assigned_to)?.username || 'Unassigned'}</strong></span>
        </div>
        {editing && (
          <form className="stack-form inline-edit" onSubmit={save}>
            {formError && <div className="error-box">{formError}</div>}
            {canAdmin && (
              <>
                <label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
                <label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
              </>
            )}
            <div className="form-row">
              <label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="todo">todo</option><option value="in_progress">in_progress</option><option value="done">done</option></select></label>
              {canAdmin && <label>Priority<select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option>low</option><option>medium</option><option>high</option></select></label>}
            </div>
            {canAdmin && (
              <div className="form-row">
                <label>
                  Assigned user
                  <select value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}>
                    <option value="">Unassigned</option>
                    {members.map((member) => <option key={member.id} value={member.id}>{member.username}</option>)}
                  </select>
                </label>
                <label>Due date<input type="datetime-local" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></label>
              </div>
            )}
            <button className="btn primary" type="submit">Save Task</button>
          </form>
        )}
      </section>
      <CommentSection taskId={taskId} />
    </div>
  );
}

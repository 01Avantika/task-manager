import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import KanbanBoard from '../components/KanbanBoard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import Modal from '../components/Modal.jsx';
import { useAuth } from '../hooks/useAuth.js';
import {
  useAddProjectMember,
  useProject,
  useProjectMembers,
  useRemoveProjectMember,
} from '../hooks/useProjects.js';
import { useCreateTask, useTasks, useUpdateTask } from '../hooks/useTasks.js';

function isProjectAdmin(project, user) {
  if (!project || !user) return false;
  return user.role === 'admin' || project.owner_id === user.id || (project.admin_ids || []).includes(user.id);
}

export default function ProjectDetail() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', status: 'todo', due_date: '', assigned_to: '' });
  const [memberInput, setMemberInput] = useState('');
  const [formError, setFormError] = useState('');
  const [memberError, setMemberError] = useState('');
  const { data: project, isLoading: projectLoading, isError: projectError, error, refetch } = useProject(projectId);
  const { data: members = [], isLoading: membersLoading } = useProjectMembers(projectId);
  const { data: tasks = [], isLoading: tasksLoading } = useTasks(projectId);
  const createTask = useCreateTask(projectId);
  const updateTask = useUpdateTask(projectId);
  const addMember = useAddProjectMember(projectId);
  const removeMember = useRemoveProjectMember(projectId);

  const canAdmin = isProjectAdmin(project, user);
  const memberById = useMemo(() => Object.fromEntries(members.map((member) => [member.id, member])), [members]);

  const submit = (event) => {
    event.preventDefault();
    setFormError('');
    createTask.mutate(
      { ...form, assigned_to: form.assigned_to || null, due_date: form.due_date || null },
      {
        onSuccess: () => {
          setOpen(false);
          setForm({ title: '', description: '', priority: 'medium', status: 'todo', due_date: '', assigned_to: '' });
        },
        onError: (err) => setFormError(err.response?.data?.detail || 'Could not create task.'),
      },
    );
  };

  const addMemberSubmit = (event) => {
    event.preventDefault();
    const value = memberInput.trim();
    if (!value) return;
    setMemberError('');
    const payload = value.includes('@') ? { email: value } : { username: value };
    addMember.mutate(payload, {
      onSuccess: () => setMemberInput(''),
      onError: (err) => setMemberError(err.response?.data?.detail || 'Could not add member.'),
    });
  };

  if (projectLoading || tasksLoading || membersLoading) return <LoadingSpinner label="Loading project..." />;

  if (projectError) {
    return (
      <div className="page">
        <ErrorState title="Project could not load" message={error?.response?.data?.detail} onRetry={refetch} />
      </div>
    );
  }

  const canMoveTask = (task) => canAdmin || task.assigned_to === user?.id;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="text-sm font-extrabold uppercase tracking-wide text-primary">{canAdmin ? 'Project admin' : 'Project member'}</span>
          <h1>{project?.name || 'Project'}</h1>
          <p>{project?.description || 'Plan, assign, and move work through delivery.'}</p>
        </div>
        {canAdmin && <button className="btn primary" onClick={() => setOpen(true)}>New Task</button>}
      </div>

      <div className="mb-5 grid gap-5 xl:grid-cols-[1fr_340px]">
        <section>
          {tasks.length === 0 ? (
            <div className="mb-5">
              <EmptyState
                title="No tasks yet"
                message={canAdmin ? 'Create the first task and assign it to a project member.' : 'Tasks assigned to this project will appear here.'}
              />
            </div>
          ) : null}
          <KanbanBoard
            tasks={tasks}
            canMoveTask={canMoveTask}
            onMove={(task, status) => updateTask.mutate({ taskId: task.id, payload: { status } })}
          />
        </section>

        <aside className="rounded-app border border-gray-200 bg-white p-5 shadow-soft">
          <div className="mb-4">
            <h2 className="m-0 text-lg font-black text-gray-950">Members</h2>
            <p className="mb-0 mt-1 text-sm text-gray-500">{canAdmin ? 'Add or remove project members.' : 'People with access to this project.'}</p>
          </div>
          {canAdmin && (
            <form className="mb-4 grid gap-2" onSubmit={addMemberSubmit}>
              {memberError && <div className="error-box">{memberError}</div>}
              <input value={memberInput} onChange={(event) => setMemberInput(event.target.value)} placeholder="Email or username" />
              <button className="btn primary" type="submit">Add Member</button>
            </form>
          )}
          <div className="member-list">
            {members.map((member) => (
              <div className="member-row" key={member.id}>
                <span className="avatar">{member.username.slice(0, 2).toUpperCase()}</span>
                <div>
                  <strong>{member.username}</strong>
                  <span>{member.email}</span>
                  {member.id === project?.owner_id && <span>Owner</span>}
                </div>
                {canAdmin && member.id !== project?.owner_id && (
                  <button className="text-sm font-extrabold text-red-500" onClick={() => removeMember.mutate(member.id)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </aside>
      </div>

      {open && (
        <Modal title="New task" onClose={() => setOpen(false)}>
          <form className="stack-form" onSubmit={submit}>
            {formError && <div className="error-box">{formError}</div>}
            <label>Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <label>
              Assigned user
              <select value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}>
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>{member.username}</option>
                ))}
              </select>
            </label>
            <div className="form-row">
              <label>Priority<select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option value="low">low</option><option value="medium">medium</option><option value="high">high</option></select></label>
              <label>Due date<input type="datetime-local" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></label>
            </div>
            <button className="btn primary" type="submit">Create Task</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

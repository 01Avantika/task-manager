import { useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useAddProjectMember, useRemoveProjectMember } from '../hooks/useProjects.js';
import { useTeam } from '../hooks/useTeam.js';
import { relativeTime } from '../utils/relativeTime.js';

function isProjectAdmin(project, user) {
  if (!project || !user) return false;
  return user.role === 'admin' || project.owner_id === user.id || (project.admin_ids || []).includes(user.id);
}

function DeleteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3" />
    </svg>
  );
}

export default function Team() {
  const { user } = useAuth();
  const [projectId, setProjectId] = useState('');
  const [adding, setAdding] = useState(false);
  const [memberInput, setMemberInput] = useState('');
  const [memberError, setMemberError] = useState('');
  const { data, isLoading, isError, error, refetch, isFetching } = useTeam(projectId);
  const selectedProject = data?.selected_project;
  const projects = Array.isArray(data?.projects) ? data.projects : [];
  const members = Array.isArray(data?.members) ? data.members : [];
  const activeProjectId = selectedProject?.id || projectId;
  const addMember = useAddProjectMember(activeProjectId);
  const removeMember = useRemoveProjectMember(activeProjectId);
  const canAdmin = Boolean(data?.can_manage) || isProjectAdmin(selectedProject, user);

  useEffect(() => {
    if (!projectId && selectedProject?.id) setProjectId(selectedProject.id);
  }, [projectId, selectedProject?.id]);

  const submit = (event) => {
    event.preventDefault();
    const value = memberInput.trim();
    if (!value || !activeProjectId) return;
    setMemberError('');
    const payload = value.includes('@') ? { email: value } : { username: value };
    addMember.mutate(payload, {
      onSuccess: () => {
        setMemberInput('');
        setAdding(false);
      },
      onError: (err) => setMemberError(err.response?.data?.detail || 'Could not add member.'),
    });
  };

  const remove = (memberId) => {
    if (!activeProjectId) return;
    setMemberError('');
    removeMember.mutate(memberId, {
      onError: (err) => setMemberError(err.response?.data?.detail || 'Could not remove member.'),
    });
  };

  if (isLoading) return <LoadingSpinner label="Loading team..." />;

  if (isError) {
    return (
      <div className="page">
        <ErrorState title="Team could not load" message={error?.response?.data?.detail} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="text-sm font-extrabold uppercase tracking-wide text-primary">Team workspace</span>
          <h1>Team</h1>
          <p>Review project members, workload, completion status, and admin controls in one place.</p>
        </div>
        {projects.length > 0 && (
          <select className="max-w-xs" value={activeProjectId} onChange={(event) => setProjectId(event.target.value)}>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {projects.length === 0 ? (
        <EmptyState title="No team projects yet" message="Create or join a project to see team members and performance." actionLabel="Go to Projects" actionTo="/projects" />
      ) : (
        <>
          <section className="mb-5 grid gap-4 md:grid-cols-3">
            <article className="stat-card">
              <span>Total Members</span>
              <strong>{members.length}</strong>
            </article>
            <article className="stat-card">
              <span>Assigned Tasks</span>
              <strong>{members.reduce((sum, member) => sum + (member.assigned_tasks || 0), 0)}</strong>
            </article>
            <article className="stat-card">
              <span>Completed Tasks</span>
              <strong>{members.reduce((sum, member) => sum + (member.completed_tasks || 0), 0)}</strong>
            </article>
          </section>

          <section className="panel">
            <div className="section-head">
              <div>
                <h2>{selectedProject?.name || 'Project'} members</h2>
                <p>Assigned, completed, pending, and completion progress by member.</p>
              </div>
              {canAdmin && (
                <button className="btn primary" onClick={() => setAdding((value) => !value)}>
                  + Add User
                </button>
              )}
            </div>

            {memberError && <div className="error-box mb-4">{memberError}</div>}
            {canAdmin && adding && (
              <form className="mb-5 grid gap-3 rounded-app border border-gray-200 bg-gray-50 p-4 md:grid-cols-[1fr_auto]" onSubmit={submit}>
                <input value={memberInput} onChange={(event) => setMemberInput(event.target.value)} placeholder="Email or username" />
                <button className="btn primary" type="submit" disabled={addMember.isPending}>
                  {addMember.isPending ? 'Adding...' : 'Add User'}
                </button>
              </form>
            )}

            {isFetching && <p className="text-sm font-bold text-gray-500">Refreshing team data...</p>}

            {members.length === 0 ? (
              <EmptyState title="No members found" message="Add a user to this project to start tracking team progress." />
            ) : (
              <div className="grid gap-3">
                {members.map((member) => (
                <article key={member.id} className="rounded-app border border-gray-200 bg-white p-4 shadow-sm transition hover:border-indigo-200">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="avatar">{member.username?.slice(0, 2).toUpperCase()}</span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <strong className="text-gray-950">{member.username}</strong>
                          <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-black uppercase text-primary">{member.project_role}</span>
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-black uppercase text-gray-500">{member.status || 'No tasks'}</span>
                        </div>
                        <span className="block truncate text-sm text-gray-500">{member.email}</span>
                      </div>
                    </div>

                    <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-4 lg:min-w-[320px]">
                      <span className="text-sm text-gray-500">Assigned <strong className="block text-base text-gray-950">{member.assigned_tasks || 0}</strong></span>
                      <span className="text-sm text-gray-500">Completed <strong className="block text-base text-gray-950">{member.completed_tasks || 0}</strong></span>
                      <span className="text-sm text-gray-500">Pending <strong className="block text-base text-gray-950">{member.pending_tasks || 0}</strong></span>
                      <span className="text-sm text-gray-500">Last done <strong className="block text-base text-gray-950">{member.last_completion_date ? relativeTime(member.last_completion_date) : 'None'}</strong></span>
                    </div>

                    <div className="flex min-w-[180px] items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex justify-between text-xs font-black text-gray-500">
                          <span>Completion</span>
                          <span>{member.completion_rate || 0}%</span>
                        </div>
                        <div className="progress-track">
                          <span style={{ width: `${member.completion_rate || 0}%` }} />
                        </div>
                      </div>
                      {canAdmin && member.id !== selectedProject?.owner_id && (
                        <button
                          className="icon-btn text-red-500"
                          onClick={() => remove(member.id)}
                          disabled={removeMember.isPending}
                          aria-label={`Remove ${member.username}`}
                        >
                          <DeleteIcon />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

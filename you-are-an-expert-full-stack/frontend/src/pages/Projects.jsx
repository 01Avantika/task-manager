import { useState } from 'react';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import Modal from '../components/Modal.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import { useCreateProject, useProjects } from '../hooks/useProjects.js';

export default function Projects() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const { data: projects = [], isLoading, isError, error, refetch } = useProjects();
  const [formError, setFormError] = useState('');
  const createProject = useCreateProject();

  const submit = (event) => {
    event.preventDefault();
    setFormError('');
    createProject.mutate(form, {
      onSuccess: () => {
        setOpen(false);
        setForm({ name: '', description: '' });
      },
      onError: (err) => setFormError(err.response?.data?.detail || 'Could not create project.'),
    });
  };

  if (isLoading) return <LoadingSpinner label="Loading projects..." />;

  if (isError) {
    return (
      <div className="page">
        <ErrorState title="Projects could not load" message={error?.response?.data?.detail} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Projects</h1>
          <p>Create shared spaces for initiatives, clients, and product work.</p>
        </div>
        <button className="btn primary" onClick={() => setOpen(true)}>New Project</button>
      </div>
      {projects.length === 0 ? (
        <EmptyState title="No projects yet" message="Create your first project to unlock Kanban boards, tasks, comments, and analytics." />
      ) : (
        <div className="project-grid">{projects.map((project) => <ProjectCard key={project.id} project={project} />)}</div>
      )}
      {open && (
        <Modal title="New project" onClose={() => setOpen(false)}>
          <form className="stack-form" onSubmit={submit}>
            {formError && <div className="error-box">{formError}</div>}
            <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <button className="btn primary" type="submit">Create Project</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

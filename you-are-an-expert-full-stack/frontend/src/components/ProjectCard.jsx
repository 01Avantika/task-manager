import { Link } from 'react-router-dom';

export default function ProjectCard({ project }) {
  return (
    <Link to={`/projects/${project.id}`} className="project-card">
      <div>
        <h3>{project.name}</h3>
        <p>{project.description || 'No description yet.'}</p>
      </div>
      <div className="project-meta">
        <span>{project.member_ids?.length || 0} members</span>
        <span>{new Date(project.created_at).toLocaleDateString()}</span>
      </div>
    </Link>
  );
}

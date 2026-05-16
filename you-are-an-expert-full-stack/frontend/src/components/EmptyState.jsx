import { Link } from 'react-router-dom';

export default function EmptyState({ title, message, actionLabel, actionTo }) {
  return (
    <div className="rounded-app border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-app bg-indigo-50 text-primary">
        <span className="text-lg font-black">+</span>
      </div>
      <h3 className="m-0 text-lg font-extrabold text-gray-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">{message}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn primary mt-4">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

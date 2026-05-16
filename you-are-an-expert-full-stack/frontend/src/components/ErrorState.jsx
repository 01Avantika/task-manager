export default function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="rounded-app border border-red-100 bg-red-50 p-5 text-red-700">
      <h3 className="m-0 text-base font-extrabold">{title}</h3>
      <p className="mb-0 mt-2 text-sm">{message || 'Please try again in a moment.'}</p>
      {onRetry && (
        <button className="btn surface mt-4" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

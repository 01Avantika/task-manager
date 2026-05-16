export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-64 items-center justify-center">
      <div className="flex items-center gap-3 rounded-app border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 shadow-sm">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
        {label}
      </div>
    </div>
  );
}

/** Reusable loading spinner used across pages and route guards. */
export default function LoadingSpinner({ fullScreen = false }: { fullScreen?: boolean }) {
  const spinner = (
    <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-64">
      {spinner}
    </div>
  );
}

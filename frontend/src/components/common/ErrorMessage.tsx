interface ErrorMessageProps {
  message: string;
  retry?: () => void;
}

export function ErrorMessage({ message, retry }: ErrorMessageProps) {
  return (
    <div className="rounded-lg bg-red-50 border border-red-200 p-6">
      <div className="flex items-start">
        <svg
          className="h-6 w-6 text-red-600 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <p className="mt-1 text-sm text-red-700">{message}</p>
          {retry && (
            <button
              onClick={retry}
              className="mt-3 text-sm font-medium text-red-800 hover:text-red-900 underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

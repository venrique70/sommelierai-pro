'use client';

export default function AdminError({
  error,
  reset,
}: {
  error: unknown;
  reset: () => void;
}) {
  return (
    <div className="p-6 text-red-400">
      <h2 className="font-bold mb-2">Admin error boundary</h2>
      <pre className="whitespace-pre-wrap text-sm">
        {String((error as any)?.message || error)}
      </pre>
      <button
        className="mt-4 rounded bg-white/10 px-3 py-1"
        onClick={() => reset()}
      >
        Reintentar
      </button>
    </div>
  );
}

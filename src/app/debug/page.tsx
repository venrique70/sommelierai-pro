// src/app/debug/page.tsx
"use client";

import { useEffect, useState } from "react";

type Env = Record<string, string | undefined>;

export default function DebugPage() {
  const [data, setData] = useState<Env | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/debug-config?t=${Date.now()}`)
      .then((r) => r.json())
      .then(setData)
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Debug Config</h1>
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      <pre className="text-sm overflow-auto bg-black/10 p-4 rounded">
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}

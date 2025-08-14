import type { ReactNode } from "react";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function HistoryLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

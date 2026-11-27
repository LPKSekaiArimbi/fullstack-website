"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function AdminDashboardRefresh() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="registrants-refresh-button"
      type="button"
      aria-label="Segarkan daftar pendaftar"
      aria-busy={isPending}
      disabled={isPending}
      onClick={() => startTransition(() => router.refresh())}
    >
      <RefreshCw aria-hidden="true" className={isPending ? "is-spinning" : ""} />
      {isPending ? "Memuat..." : "Segarkan"}
    </button>
  );
}

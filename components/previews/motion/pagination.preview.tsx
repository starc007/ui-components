"use client";

import { useState } from "react";
import { Pagination } from "@/components/motion/pagination";

export function PaginationPreview() {
  const [page, setPage] = useState(6);
  return (
    <div className="flex flex-col items-center gap-4">
      <Pagination totalPages={20} page={page} onPageChange={setPage} />
      <p className="text-xs text-muted-foreground tabular-nums">
        Page {page} of 20
      </p>
    </div>
  );
}

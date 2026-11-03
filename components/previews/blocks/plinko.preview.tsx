"use client";

import { useState } from "react";
import { Plinko, plinkoSlots } from "@/components/motion/plinko";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";

// Any list of values works: its length sets the board (n slots, n - 1 rows).
// plinkoSlots builds one for a row count, from 1 in the middle to 100 at the edges.
const ROW_COUNTS = ["8", "12", "16"];

export function PlinkoPreview() {
  const [rows, setRows] = useState("12");
  const [score, setScore] = useState(0);
  const [drops, setDrops] = useState(0);

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-3">
      <Tabs value={rows} onValueChange={setRows} variant="pill">
        <TabsList>
          {ROW_COUNTS.map((count) => (
            <TabsTrigger key={count} value={count}>
              {count} rows
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <p className="text-sm text-muted-foreground tabular-nums">
        Score <span className="font-medium text-foreground">{score}</span> · {drops} balls
      </p>
      <Plinko
        slots={plinkoSlots(Number(rows))}
        onLand={(_, value) => {
          setScore((total) => total + Number(value));
          setDrops((count) => count + 1);
        }}
      />
    </div>
  );
}

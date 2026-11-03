"use client";

import { useState } from "react";
import { Plinko } from "@/components/motion/plinko";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";

// Any list of values works: its length sets the board (n slots, n - 1 rows).
const BOARDS: Record<string, number[]> = {
  "8": [100, 25, 10, 3, 1, 3, 10, 25, 100],
  "12": [500, 120, 40, 15, 6, 2, 1, 2, 6, 15, 40, 120, 500],
  "16": [1000, 300, 100, 40, 15, 8, 4, 2, 1, 2, 4, 8, 15, 40, 100, 300, 1000],
};

export function PlinkoPreview() {
  const [rows, setRows] = useState("8");
  const [score, setScore] = useState(0);
  const [drops, setDrops] = useState(0);
  const slots = BOARDS[rows];

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-3">
      <Tabs value={rows} onValueChange={setRows} variant="pill">
        <TabsList>
          {Object.keys(BOARDS).map((count) => (
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
        slots={slots}
        onLand={(_, value) => {
          setScore((total) => total + Number(value));
          setDrops((count) => count + 1);
        }}
      />
    </div>
  );
}

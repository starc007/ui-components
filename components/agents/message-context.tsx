"use client";

import { createContext } from "react";

export type MessageSide = "start" | "end";

export const MessageSideContext = createContext<MessageSide | undefined>(
  undefined,
);

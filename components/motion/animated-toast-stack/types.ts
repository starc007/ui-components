import type { ReactNode } from "react";

export type ToastStatus = "neutral" | "info" | "loading" | "success" | "error";
export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type AnimatedToastAction = {
  label: ReactNode;
  onClick: (toast: AnimatedToast) => void;
};

export type AnimatedToast = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  status?: ToastStatus;
  icon?: ReactNode;
  action?: AnimatedToastAction;
  duration?: number;
  dismissible?: boolean;
  createdAt?: number;
};

export type ToastInput = Omit<AnimatedToast, "id" | "createdAt"> & {
  id?: string;
};

export type ToastClassNames = {
  /** The anchored layer the island sits in. */
  root?: string;
  /** One row of the open list. */
  item?: string;
  /** The island itself. */
  surface?: string;
  iconWrap?: string;
  content?: string;
  title?: string;
  description?: string;
  action?: string;
  close?: string;
  progress?: string;
};

export interface UseAnimatedToastStackOptions {
  /** Toasts in the stack on first render. */
  initialToasts?: ToastInput[];
  /** Time before a toast without its own `duration` closes, in ms. Default: 4200 */
  defaultDuration?: number;
  /** Most toasts kept. Older ones drop off when a new one arrives. */
  limit?: number;
}

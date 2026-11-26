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
  /** Text of the action button under the description. */
  label: ReactNode;
  /** Fires when the action button is pressed, with the toast it belongs to. */
  onClick: (toast: AnimatedToast) => void;
};

export type AnimatedToast = {
  /** Unique key, used to update or dismiss the toast. */
  id: string;
  /** Main line, shown in the closed island and the open list. */
  title: ReactNode;
  /** Muted second line, up to 2 lines, hidden in the closed island. */
  description?: ReactNode;
  /** Sets the icon and its colour; `loading` spins the icon. Default: `neutral` */
  status?: ToastStatus;
  /** Icon in the leading chip, used when the stack's `icons` has none for the status. */
  icon?: ReactNode;
  /** Optional button shown under the description. */
  action?: AnimatedToastAction;
  /** Time before the toast closes, in ms; 0 keeps it open. Default: the stack's `defaultDuration` */
  duration?: number;
  /** Set to false to hide the close button. Default: true */
  dismissible?: boolean;
  /** When the countdown started, in ms since epoch. Set by the stack. */
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
  /** The round chip around the status icon. */
  iconWrap?: string;
  /** The column holding the title, description and action. */
  content?: string;
  /** The title text. */
  title?: string;
  /** The description text. */
  description?: string;
  /** The action button. */
  action?: string;
  /** The close button. */
  close?: string;
  /** Not applied yet; the toast has no progress bar. */
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

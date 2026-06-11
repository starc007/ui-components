"use client";

import {
  ActionSwapButton,
  ActionSwapIcon,
  ActionSwapText,
  type ActionSwapButtonProps,
  type ActionSwapIconProps,
  type ActionSwapTextProps,
} from "./action-swap";

export type {
  ActionSwapButtonSize,
  ActionSwapButtonVariant,
  ActionSwapItem,
} from "./action-swap";

export type ActionSwapCascadeButtonProps = Omit<ActionSwapButtonProps, "animation">;
export type ActionSwapCascadeTextProps = Omit<ActionSwapTextProps, "animation">;
export type ActionSwapCascadeIconProps = Omit<ActionSwapIconProps, "animation">;

export function ActionSwapCascadeButton(props: ActionSwapCascadeButtonProps) {
  return <ActionSwapButton {...props} animation="cascade" />;
}

export function ActionSwapCascadeText(props: ActionSwapCascadeTextProps) {
  return <ActionSwapText {...props} animation="cascade" />;
}

export function ActionSwapCascadeIcon(props: ActionSwapCascadeIconProps) {
  return <ActionSwapIcon {...props} animation="cascade" />;
}

import type { Sound } from "@/lib/sounds/engine";
import { closeSound } from "@/lib/sounds/close";
import { copySound } from "@/lib/sounds/copy";
import { deleteSound } from "@/lib/sounds/delete";
import { dropSound } from "@/lib/sounds/drop";
import { errorSound } from "@/lib/sounds/error";
import { navigateSound } from "@/lib/sounds/navigate";
import { notifySound } from "@/lib/sounds/notify";
import { openSound } from "@/lib/sounds/open";
import { pressSound } from "@/lib/sounds/press";
import { selectSound } from "@/lib/sounds/select";
import { successSound } from "@/lib/sounds/success";
import { tapSound } from "@/lib/sounds/tap";
import { tickSound } from "@/lib/sounds/tick";
import { toggleOffSound, toggleOnSound } from "@/lib/sounds/toggle";
import { typeSound } from "@/lib/sounds/type";
import { warningSound } from "@/lib/sounds/warning";

export interface SoundItem {
  /** Registry slug of the sound's page. */
  slug: string;
  name: string;
  /** Keyboard shortcut on the sound board. */
  key: string;
  /** Played in turn on each press; toggle alternates on and off. */
  sounds: Sound[];
}

export const SOUND_ITEMS: SoundItem[] = [
  { slug: "tap-sound", name: "Tap", key: "1", sounds: [tapSound] },
  { slug: "press-sound", name: "Press", key: "2", sounds: [pressSound] },
  { slug: "type-sound", name: "Type", key: "3", sounds: [typeSound] },
  { slug: "select-sound", name: "Select", key: "4", sounds: [selectSound] },
  { slug: "toggle-sound", name: "Toggle", key: "5", sounds: [toggleOnSound, toggleOffSound] },
  { slug: "open-sound", name: "Open", key: "6", sounds: [openSound] },
  { slug: "close-sound", name: "Close", key: "7", sounds: [closeSound] },
  { slug: "navigate-sound", name: "Navigate", key: "8", sounds: [navigateSound] },
  { slug: "success-sound", name: "Success", key: "9", sounds: [successSound] },
  { slug: "error-sound", name: "Error", key: "0", sounds: [errorSound] },
  { slug: "warning-sound", name: "Warning", key: "q", sounds: [warningSound] },
  { slug: "notify-sound", name: "Notify", key: "w", sounds: [notifySound] },
  { slug: "copy-sound", name: "Copy", key: "e", sounds: [copySound] },
  { slug: "delete-sound", name: "Delete", key: "r", sounds: [deleteSound] },
  { slug: "drop-sound", name: "Drop", key: "t", sounds: [dropSound] },
  { slug: "tick-sound", name: "Tick", key: "y", sounds: [tickSound] },
];

import { bellSound } from "@/lib/sounds/bell";
import { bubbleSound } from "@/lib/sounds/bubble";
import { burstSound } from "@/lib/sounds/burst";
import { buzzSound } from "@/lib/sounds/buzz";
import { cameraSound } from "@/lib/sounds/camera";
import { checkSound } from "@/lib/sounds/check";
import { chimeSound } from "@/lib/sounds/chime";
import { closeSound } from "@/lib/sounds/close";
import { coinSound } from "@/lib/sounds/coin";
import { collapseSound } from "@/lib/sounds/collapse";
import { connectSound } from "@/lib/sounds/connect";
import { copySound } from "@/lib/sounds/copy";
import { deleteSound } from "@/lib/sounds/delete";
import { disconnectSound } from "@/lib/sounds/disconnect";
import { dismissSound } from "@/lib/sounds/dismiss";
import { dockSound } from "@/lib/sounds/dock";
import { dropSound } from "@/lib/sounds/drop";
import type { Sound } from "@/lib/sounds/engine";
import { errorSound } from "@/lib/sounds/error";
import { expandSound } from "@/lib/sounds/expand";
import { heartSound } from "@/lib/sounds/heart";
import { liftSound } from "@/lib/sounds/lift";
import { lockSound } from "@/lib/sounds/lock";
import { navigateSound } from "@/lib/sounds/navigate";
import { notifySound } from "@/lib/sounds/notify";
import { openSound } from "@/lib/sounds/open";
import { pingSound } from "@/lib/sounds/ping";
import { popSound } from "@/lib/sounds/pop";
import { pressSound } from "@/lib/sounds/press";
import { receiveSound } from "@/lib/sounds/receive";
import { refreshSound } from "@/lib/sounds/refresh";
import { revealSound } from "@/lib/sounds/reveal";
import { selectSound } from "@/lib/sounds/select";
import { sendSound } from "@/lib/sounds/send";
import { shutterSound } from "@/lib/sounds/shutter";
import { snapSound } from "@/lib/sounds/snap";
import { starSound } from "@/lib/sounds/star";
import { successSound } from "@/lib/sounds/success";
import { swipeSound } from "@/lib/sounds/swipe";
import { switchSound } from "@/lib/sounds/switch";
import { tapSound } from "@/lib/sounds/tap";
import { tickSound } from "@/lib/sounds/tick";
import { timerSound } from "@/lib/sounds/timer";
import { toggleOffSound, toggleOnSound } from "@/lib/sounds/toggle";
import { trashSound } from "@/lib/sounds/trash";
import { typeSound } from "@/lib/sounds/type";
import { unlockSound } from "@/lib/sounds/unlock";
import { warningSound } from "@/lib/sounds/warning";
import { whisperSound } from "@/lib/sounds/whisper";

export interface SoundItem {
  /** Registry slug of the sound's page. */
  slug: string;
  name: string;
  /** Keyboard shortcut on the sound board. */
  key?: string;
  /** Played in turn on each press; toggle alternates on and off. */
  sounds: Sound[];
}

export const SOUND_ITEMS: SoundItem[] = [
  // Numbers 1 to 0
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

  // Letters Q to P
  { slug: "warning-sound", name: "Warning", key: "q", sounds: [warningSound] },
  { slug: "notify-sound", name: "Notify", key: "w", sounds: [notifySound] },
  { slug: "copy-sound", name: "Copy", key: "e", sounds: [copySound] },
  { slug: "delete-sound", name: "Delete", key: "r", sounds: [deleteSound] },
  { slug: "drop-sound", name: "Drop", key: "t", sounds: [dropSound] },
  { slug: "tick-sound", name: "Tick", key: "y", sounds: [tickSound] },
  { slug: "shutter-sound", name: "Shutter", key: "u", sounds: [shutterSound] },
  { slug: "bell-sound", name: "Bell", key: "i", sounds: [bellSound] },
  { slug: "switch-sound", name: "Switch", key: "o", sounds: [switchSound] },
  { slug: "burst-sound", name: "Burst", key: "p", sounds: [burstSound] },

  // Letters A to L
  { slug: "camera-sound", name: "Camera", key: "a", sounds: [cameraSound] },
  { slug: "lock-sound", name: "Lock", key: "s", sounds: [lockSound] },
  { slug: "unlock-sound", name: "Unlock", key: "d", sounds: [unlockSound] },
  { slug: "coin-sound", name: "Coin", key: "f", sounds: [coinSound] },
  { slug: "chime-sound", name: "Chime", key: "g", sounds: [chimeSound] },
  { slug: "pop-sound", name: "Pop", key: "h", sounds: [popSound] },
  { slug: "trash-sound", name: "Trash", key: "j", sounds: [trashSound] },
  { slug: "heart-sound", name: "Heart", key: "k", sounds: [heartSound] },
  { slug: "buzz-sound", name: "Buzz", key: "l", sounds: [buzzSound] },

  // Letters Z to M
  { slug: "swipe-sound", name: "Swipe", key: "z", sounds: [swipeSound] },
  { slug: "refresh-sound", name: "Refresh", key: "x", sounds: [refreshSound] },
  { slug: "snap-sound", name: "Snap", key: "c", sounds: [snapSound] },
  { slug: "bubble-sound", name: "Bubble", key: "v", sounds: [bubbleSound] },
  { slug: "expand-sound", name: "Expand", key: "b", sounds: [expandSound] },
  { slug: "collapse-sound", name: "Collapse", key: "n", sounds: [collapseSound] },
  { slug: "ping-sound", name: "Ping", key: "m", sounds: [pingSound] },

  // Productivity & Interaction Pack
  { slug: "check-sound", name: "Check", sounds: [checkSound] },
  { slug: "send-sound", name: "Send", sounds: [sendSound] },
  { slug: "receive-sound", name: "Receive", sounds: [receiveSound] },
  { slug: "star-sound", name: "Star", sounds: [starSound] },
  { slug: "lift-sound", name: "Lift", sounds: [liftSound] },
  { slug: "dock-sound", name: "Dock", sounds: [dockSound] },
  { slug: "connect-sound", name: "Connect", sounds: [connectSound] },
  { slug: "disconnect-sound", name: "Disconnect", sounds: [disconnectSound] },
  { slug: "dismiss-sound", name: "Dismiss", sounds: [dismissSound] },
  { slug: "reveal-sound", name: "Reveal", sounds: [revealSound] },
  { slug: "timer-sound", name: "Timer", sounds: [timerSound] },
  { slug: "whisper-sound", name: "Whisper", sounds: [whisperSound] },
];

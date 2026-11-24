export const aiSidebarMessages = {
  label: "Resources",
  rename: "Rename",
  renameItem: "Rename {item}",
  actions: "Actions for {item}",
  moveUp: "Move up",
  moveDown: "Move down",
  moveInto: "Move into {target}",
  moveOut: "Move out",
  moveToTop: "Move to top level",
  movePending: "Wait for the current move to finish.",
  movedBefore: "Moved {item} before {target}.",
  movedInside: "Moved {item} inside {target}.",
  movedAfter: "Moved {item} after {target}.",
  movedToTop: "Moved {item} to the top level.",
  moveFailed: "Move failed. {item} was restored.",
  renameFailed: "Rename failed. {item} was restored.",
  unnamedItem: "item",
};

export type AISidebarMessages = typeof aiSidebarMessages;

export type Translate = (
  key: keyof AISidebarMessages,
  values?: Record<string, string | number>,
) => string;

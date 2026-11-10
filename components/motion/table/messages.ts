import type { useMessages } from "@/lib/i18n";

/** English defaults. Override per instance with `labels`, or app-wide with `LocaleProvider`. */
export const tableMessages = {
  empty: "No data",
  selectAll: "Select all rows",
  selectRow: "Select row {row}",
  cellLabel: "{column} for row {row}",
  cellPlaceholder: "Empty",
  columnOptions: "{column} column options",
  reorderColumn: "Reorder {column} column",
  renameColumn: "Rename {column} column",
  resizeColumn: "Resize {column} column",
  rowOptions: "Row {row} options",
  insertBefore: "Insert before",
  insertAfter: "Insert after",
  deleteColumn: "Delete column",
  deleteRow: "Delete row",
};

export type TableMessages = typeof tableMessages;

/** The resolved translator the root hands to its parts. */
export type TableTranslate = ReturnType<typeof useMessages<TableMessages>>;

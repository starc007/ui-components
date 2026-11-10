/** One line in a changelog entry. */
export type ChangelogItem = {
  type: "new" | "improved" | "fixed";
  text: string;
  /** Registry slug; links the item to that component's page. */
  component?: string;
  /** Site path for items that are not about a single component. */
  href?: string;
};

/** One release: everything that shipped on `date` (YYYY-MM-DD). */
export type ChangelogEntry = {
  date: string;
  title: string;
  summary?: string;
  items: ChangelogItem[];
};

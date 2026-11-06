/** Deep merge; arrays merge by index so a translated list keeps its order. */
export function mergeMessages<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base;
  if (Array.isArray(base)) {
    const list = Array.isArray(override) ? override : [];
    return base.map((item, index) => mergeMessages(item, list[index])) as T;
  }
  if (base && typeof base === "object") {
    if (typeof override !== "object") return base;
    const out = { ...base } as Record<string, unknown>;
    for (const [key, value] of Object.entries(override)) {
      out[key] = key in out ? mergeMessages(out[key], value) : value;
    }
    return out as T;
  }
  // A translation of the wrong kind (object for a string) falls back to English.
  return (typeof override === typeof base ? override : base) as T;
}

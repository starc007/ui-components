export function isValidAddress(v: string) {
  if (/^0x[0-9a-fA-F]{40}$/.test(v)) return true;
  if (/\.(eth|sol|bnb)$/.test(v) && v.length > 5) return true;
  return false;
}

export function truncateAddress(v: string) {
  if (v.startsWith("0x") && v.length === 42) {
    return `${v.slice(0, 6)}...${v.slice(-4)}`;
  }
  return v;
}

export function sanitizeAmount(v: string) {
  const cleaned = v.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join("")}`;
}

// Takes the locale explicitly: the widget renders on the server too, and a
// runtime locale that differs from the server's (de-DE vs en-US) makes React
// discard the server markup on hydration.
export function formatAmount(n: number, locale: string, max = 6) {
  if (!Number.isFinite(n)) return "0";
  if (n === 0) return "0";
  if (n >= 1000) {
    return n.toLocaleString(locale, { maximumFractionDigits: 2 });
  }
  return n.toLocaleString(locale, { maximumFractionDigits: max });
}

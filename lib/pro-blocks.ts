/** A Pro link tagged with the `free_to_pro` campaign; `content` names the page. */
export function proLink(path: string, content: string) {
  const params = new URLSearchParams({
    utm_source: "beui",
    utm_medium: "referral",
    utm_campaign: "free_to_pro",
    utm_content: content,
  });
  return `https://pro.beui.dev${path}?${params}`;
}

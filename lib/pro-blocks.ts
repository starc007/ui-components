/**
 * Free beUI pages that link to related beUI Pro blocks. Keys are page paths
 * without the leading `/components/` (`motion` for the category page,
 * `motion/timeline` for a component page) or `react-native`. Each Pro block
 * either uses the free component or covers the same use case. To add a page,
 * add a key; the page shows the section when its key is here.
 */

export type ProBlockLink = {
  name: string;
  /** Pro catalog path, e.g. `/components/roadmap`. */
  path: string;
};

const block = (slug: string, name: string): ProBlockLink => ({
  name,
  path: `/components/${slug}`,
});

export const PRO_BLOCKS: Record<string, ProBlockLink[]> = {
  motion: [
    block("dashboards", "Dashboards"),
    block("agent-chat-input", "Agent Chat Input"),
    block("hero-sections", "Hero Sections"),
  ],
  "motion/timeline": [
    block("roadmap", "Roadmap"),
    block("changelog-pages", "Changelog Pages"),
    block("audit-trail", "Audit Trail"),
  ],
  "motion/alert": [
    block("announcement-banners", "Announcement Banners"),
    block("notification-center", "Notification Center"),
    block("status-pages", "Status Pages"),
  ],
  "motion/button": [
    block("hero-sections", "Hero Sections"),
    block("pricing", "Pricing"),
    block("cta-sections", "CTA Sections"),
  ],
  "motion/card": [
    block("cards", "Cards"),
    block("bento-showcase", "Bento Showcase"),
    block("kpi-overview", "KPI Overview"),
  ],
  "motion/collapsible": [
    block("faq-blocks", "FAQ Blocks"),
    block("careers", "Careers"),
  ],
  "motion/tabs": [
    block("pricing", "Pricing"),
    block("settings-pages", "Settings Pages"),
    block("data-table", "Data Table"),
  ],
  "agents/voice-orb": [
    block("voice-agent", "Voice Agent"),
    block("voice-conversation", "Voice Conversation"),
  ],
  "agents/message-bubble": [
    block("messaging", "Messaging"),
    block("agent-chat-input", "Agent Chat Input"),
    block("ai-artifacts", "AI Artifacts"),
  ],
  "react-native": [{ name: "beUI Pro for mobile", path: "/mobile" }],
};

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

/** The Pro blocks for a page key, with links tagged for that page. */
export function proBlocksFor(key: string) {
  const content = `pro_blocks_${key.replace(/\//g, "_").replace(/-/g, "_")}`;
  return (PRO_BLOCKS[key] ?? []).map((link) => ({
    name: link.name,
    href: proLink(link.path, content),
  }));
}

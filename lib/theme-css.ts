/**
 * The beUI theme layer: everything a project needs for the components to look
 * right without shadcn. Paste it into your globals.css (below `@import
 * "tailwindcss";`), or run `npx shadcn init` which sets up the same tokens.
 *
 * Keep in sync with app/globals.css (this is the consumer-facing subset:
 * tokens, @theme mappings, animations and the utilities components rely on,
 * minus site-only bits like grid-noise and shiki).
 */
export const THEME_CSS = `@custom-variant dark (&:where(.dark, .dark *));

:root {
    /* Base palette */
    --background: oklch(99% 0 0);
    --foreground: oklch(15% 0 0);
    --card: oklch(97% 0 0);
    --muted-foreground: oklch(50% 0 0);
    --border: oklch(15% 0 0 / 0.06);
    /* beUI extensions */
    --border-strong: oklch(15% 0 0 / 0.12);
    --accent-fg: oklch(15% 0 0);
    --neon: oklch(80% 0.22 145);
    --violet: oklch(68% 0.22 295);
    --danger: oklch(62% 0.22 25);
    --success: oklch(70% 0.18 155);
    --warning: oklch(78% 0.18 75);
    --glass-bg: oklch(99% 0 0 / 0.55);
    --glass-border: oklch(15% 0 0 / 0.08);
    --glass-strong-bg: rgb(255 255 255 / 0.7);
    --glass-thin-bg: rgb(255 255 255 / 0.45);
    /* shadcn semantic tokens */
    --card-foreground: var(--foreground);
    --popover: var(--card);
    --popover-foreground: var(--foreground);
    --primary: var(--foreground);
    --primary-foreground: var(--background);
    --secondary: var(--card);
    --secondary-foreground: var(--foreground);
    --muted: var(--card);
    --accent: oklch(72% 0.18 195);
    --accent-foreground: var(--accent-fg);
    --destructive: var(--danger);
    --input: var(--border);
    --ring: var(--border-strong);
}

.dark {
    --background: #151515;
    --foreground: oklch(96% 0 0);
    --card: #1c1c1c;
    --muted-foreground: oklch(62% 0 0);
    --border: rgb(255 255 255 / 0.05);
    --border-strong: rgb(255 255 255 / 0.1);
    --accent: oklch(80% 0.18 195);
    --accent-fg: #151515;
    --glass-bg: rgb(28 28 28 / 0.55);
    --glass-border: rgb(255 255 255 / 0.08);
    --glass-strong-bg: rgb(28 28 28 / 0.6);
    --glass-thin-bg: rgb(21 21 21 / 0.45);
}

@theme inline {
    --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
    --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
    --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);

    --color-border: var(--border);
    --color-border-strong: var(--border-strong);
    --color-neon: var(--neon);
    --color-violet: var(--violet);
    --color-success: var(--success);
    --color-warning: var(--warning);
    --color-background: var(--background);
    --color-foreground: var(--foreground);
    --color-card: var(--card);
    --color-card-foreground: var(--card-foreground);
    --color-popover: var(--popover);
    --color-popover-foreground: var(--popover-foreground);
    --color-primary: var(--primary);
    --color-primary-foreground: var(--primary-foreground);
    --color-secondary: var(--secondary);
    --color-secondary-foreground: var(--secondary-foreground);
    --color-muted: var(--muted);
    --color-muted-foreground: var(--muted-foreground);
    --color-accent: var(--accent);
    --color-accent-foreground: var(--accent-foreground);
    --color-destructive: var(--destructive);
    --color-input: var(--input);
    --color-ring: var(--ring);
}

@theme {
    --animate-marquee: marquee 30s linear infinite;
    --animate-marquee-vertical: marquee-vertical 30s linear infinite;
    --animate-shimmer: shimmer 2.5s linear infinite;

    @keyframes marquee {
        from { transform: translateX(0); }
        to { transform: translateX(calc(-100% - var(--gap, 1rem))); }
    }
    @keyframes marquee-vertical {
        from { transform: translateY(0); }
        to { transform: translateY(calc(-100% - var(--gap, 1rem))); }
    }
    @keyframes shimmer {
        from { background-position: 200% 0; }
        to { background-position: -200% 0; }
    }
}

@layer utilities {
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { scrollbar-width: none; }

    .mask-radial-fade {
        mask-image: radial-gradient(ellipse at center, black 40%, transparent 75%);
    }
    .mask-b-fade {
        mask-image: linear-gradient(to bottom, black 60%, transparent);
    }

    .glass {
        background: var(--glass-bg);
        backdrop-filter: blur(20px) saturate(160%);
        border: 1px solid var(--glass-border);
        box-shadow:
            0 1px 0 0 rgb(255 255 255 / 0.06) inset,
            0 24px 60px -24px rgb(0 0 0 / 0.45);
    }
    .glass-strong {
        background: var(--glass-strong-bg);
        backdrop-filter: blur(16px);
    }
    .glass-thin {
        background: var(--glass-thin-bg);
        backdrop-filter: blur(12px);
        border: 1px solid var(--glass-border);
    }
}
`;

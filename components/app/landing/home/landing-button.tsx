import { PressLink, type PressLinkProps } from "@/components/app/press-link";
import { cn } from "@/lib/utils";

type LandingButtonVariant = "primary" | "outline" | "ghost";

const VARIANTS: Record<LandingButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-ring",
  outline:
    "border border-border-strong bg-background text-foreground hover:bg-card focus-visible:outline-ring",
  ghost: "text-muted-foreground hover:text-foreground focus-visible:outline-ring",
};

/**
 * Compact landing CTA: 32px tall, 13px label, the library Button's press
 * spring. Labels never wrap, so a narrow row moves the button, not its text.
 */
export function LandingButton({
  variant = "primary",
  className,
  ...props
}: PressLinkProps & { variant?: LandingButtonVariant }) {
  return (
    <PressLink
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[13px] font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 [&_svg]:size-3.5",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}

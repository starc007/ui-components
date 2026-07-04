import { InstallCommand } from "@/components/app/docs/install-command";
import { InstallTabs } from "@/components/app/docs/install-tabs";
import { ManualInstall } from "@/components/app/docs/manual-install";

/**
 * Install UI for a component: the shadcn CLI command plus a shadcn-free
 * manual path (deps + files), switchable via tabs.
 */
export function InstallBlock({
  category,
  slug,
}: {
  category: string;
  slug: string;
}) {
  return (
    <InstallTabs
      cli={<InstallCommand slug={slug} />}
      manual={<ManualInstall category={category} slug={slug} />}
    />
  );
}

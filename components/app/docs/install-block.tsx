import { InstallCommand } from "@/components/app/docs/install-command";
import { InstallTabs } from "@/components/app/docs/install-tabs";
import { ManualInstall } from "@/components/app/docs/manual-install";
import type { ManualInstallData } from "@/lib/manual-install";

/**
 * Install UI for a component: the shadcn CLI command plus a shadcn-free
 * manual path (deps + files), switchable via tabs.
 */
export function InstallBlock({
  slug,
  manual,
}: {
  slug: string;
  manual: ManualInstallData | null;
}) {
  return (
    <InstallTabs
      cli={<InstallCommand slug={slug} />}
      manual={manual ? <ManualInstall data={manual} /> : null}
    />
  );
}

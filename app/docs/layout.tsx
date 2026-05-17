import { SiteSidebar } from "@/components/app/site-sidebar";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4">
      <SiteSidebar />
      <div className="min-w-0 py-8 md:pl-64">{children}</div>
    </div>
  );
}

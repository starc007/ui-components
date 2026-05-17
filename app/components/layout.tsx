import { SiteSidebar } from "@/components/app/site-sidebar";

export default function ComponentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4">
      <SiteSidebar />
      <div className="min-w-0 flex-1 py-8">{children}</div>
    </div>
  );
}

import { Sidebar } from "@/components/sidebar";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <div className="container app-layout">
        <Sidebar />
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}

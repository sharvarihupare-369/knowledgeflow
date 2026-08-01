import { Sidebar } from "@/components/workspace/Sidebar";
import { Header } from "@/components/workspace/Header";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-zinc-50/30 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

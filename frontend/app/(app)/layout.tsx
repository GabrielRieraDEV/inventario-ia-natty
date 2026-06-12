import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <Sidebar alertCount={5} />
      <div className="flex-1 flex flex-col md:ml-sidebar-width w-full md:w-[calc(100%-260px)]">
        <Topbar />
        <main className="flex-1 p-md md:p-xl flex flex-col gap-lg">{children}</main>
      </div>
    </div>
  );
}

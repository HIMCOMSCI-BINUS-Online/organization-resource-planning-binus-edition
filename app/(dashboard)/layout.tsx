import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/lib/dal";
import Sidebar from "@/app/components/Sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import CustomCursor from "@/app/components/CustomCursor";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="dashboard-layout">
      <CustomCursor />
      <SidebarProvider>
        <Sidebar user={user} />
        <SidebarInset className="relative flex-1 w-full bg-background overflow-x-hidden min-h-[100dvh]">
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur px-4 md:hidden">
            <SidebarTrigger />
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

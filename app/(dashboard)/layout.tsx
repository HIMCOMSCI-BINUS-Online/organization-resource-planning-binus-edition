import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/lib/dal";
import DashboardNav from "@/app/components/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff" }}>
      <DashboardNav user={user} />
      {children}
    </div>
  );
}

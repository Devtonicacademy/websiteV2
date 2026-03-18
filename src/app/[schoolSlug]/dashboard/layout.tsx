import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ schoolSlug: string }>;
}) {
  const { schoolSlug } = await params;
  
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/20">
      <DashboardSidebar schoolSlug={schoolSlug} />
      <div className="flex flex-col md:pl-64 flex-1">
        {children}
      </div>
    </div>
  );
}

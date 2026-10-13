import { Sidebar } from "@/components/layout/sidebar";
import { TRPCProvider } from "@/lib/trpc/provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TRPCProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-8 py-8">{children}</div>
        </main>
      </div>
    </TRPCProvider>
  );
}

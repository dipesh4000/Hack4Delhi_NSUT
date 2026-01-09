import { checkRole } from "@/lib/check-role";
import CitizenNavbar from "@/components/citizen/CitizenNavbar";

export default async function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkRole("citizen");
  
  return (
    <div className="min-h-screen bg-slate-50">
      <CitizenNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

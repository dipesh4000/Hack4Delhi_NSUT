import { currentUser } from "@clerk/nextjs";
import LiveDashboard from "@/components/citizen/LiveDashboard";

export default async function CitizenDashboard() {
  const user = await currentUser();
  const userName = user?.firstName || "Citizen";

  return <LiveDashboard userName={userName} />;
}

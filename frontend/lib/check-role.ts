import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { clerkClient } from "@clerk/nextjs";

export async function checkRole(requiredRole: "citizen" | "authority") {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await clerkClient.users.getUser(userId);
  const role = user.publicMetadata.role as string | undefined;

  if (!role) {
    redirect("/onboarding");
  }

  if (role !== requiredRole) {
    // Redirect to their appropriate dashboard
    if (role === "citizen") {
      redirect("/citizen");
    } else {
      redirect("/authority");
    }
  }
}

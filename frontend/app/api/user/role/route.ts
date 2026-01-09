import { auth, clerkClient } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { role, authorityId } = await req.json();
    if (role !== "citizen" && role !== "authority") {
      return new NextResponse("Invalid role", { status: 400 });
    }

    // Verify Authority ID
    if (role === "authority") {
      if (authorityId !== "dipti2007") {
        return new NextResponse("Invalid Authority ID", { status: 403 });
      }
    }

    console.log("Updating metadata for user:", userId);
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role,
      },
    });
    console.log("Metadata updated successfully");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ROLE_UPDATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

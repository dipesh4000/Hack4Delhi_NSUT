import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/sign-up", "/api/user/role"],
  afterAuth(auth, req) {
    // Handle users who are not logged in
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    // If user is logged in and trying to access a public route (like sign-in), let them
    // unless it's the home page, which is accessible to everyone.
    // But if they are logged in and on home page, we might want to redirect to dashboard?
    // For now, let's keep home page accessible.

    if (auth.userId) {
      // We will handle role-based protection in the Layouts/Pages directly
      // because sessionClaims doesn't include metadata by default without
      // Clerk Dashboard configuration.
      
      // Allow access to all routes if logged in, but specific pages
      // will check for the correct role.
    }
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

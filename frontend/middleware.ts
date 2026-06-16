import {
  clerkClient,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Only attach Clerk's middleware when configured; otherwise pass through so
// the app runs without any Clerk setup (open demo mode).
const enabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

// Strictly protected surfaces.
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isErRoute = createRouteMatcher(["/er-dashboard(.*)"]);
// Standard signed-in user surface — admins get bounced away from here.
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);

/**
 * Reads the user's Clerk privateMetadata to determine the admin flag.
 * Admins are marked with { "admin": true } in privateMetadata. privateMetadata
 * is server-side only, so we fetch the full user via the Backend API.
 */
async function isAdminUser(userId: string): Promise<boolean> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return user.privateMetadata?.admin === true;
  } catch {
    return false;
  }
}

const handler = clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const home = new URL("/", req.url);

  // 1) Strictly protect /admin and /er-dashboard. Unauthenticated visitors
  //    are sent back to the home page.
  if (isAdminRoute(req) || isErRoute(req)) {
    if (!userId) return NextResponse.redirect(home);

    // /admin is admin-only; non-admins are redirected home.
    if (isAdminRoute(req) && !(await isAdminUser(userId))) {
      return NextResponse.redirect(home);
    }
    // /er-dashboard is open to any authenticated responder (and admins).
    return NextResponse.next();
  }

  // 2) Role-based redirect: admins landing on the standard user dashboard are
  //    automatically sent to the admin console.
  if (isDashboardRoute(req) && userId && (await isAdminUser(userId))) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
});

export default enabled ? handler : () => NextResponse.next();

export const config = {
  matcher: [
    // Skip Next internals and static files; run on everything else + API.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ico|woff2?|ttf)).*)",
    "/(api|trpc)(.*)",
  ],
};

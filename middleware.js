import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);
const adminRoutes = createRouteMatcher([
  "/dashboard(.*)",
  "/jobs(.*)",
  "/sites(.*)",
  "/employees(.*)",
  "/calendar(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) return;

  const { userId } = await auth.protect();
  if (!userId) return NextResponse.redirect(new URL("/sign-in", request.url));

  if (adminRoutes(request)) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();
    if (data?.role !== "admin") {
      return NextResponse.redirect(new URL("/schedule", request.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

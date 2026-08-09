import { clerkMiddleware } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { isPublicRoute } from "./middleware/auth";

const handleI18nRouting = createIntlMiddleware(routing);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth().protect();
  }

  // No aplicar next-intl a las rutas API
  if (request.nextUrl.pathname.startsWith("/api")) {
    return;
  }

  return handleI18nRouting(request);
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};

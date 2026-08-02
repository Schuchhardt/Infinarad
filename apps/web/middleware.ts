import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/", "/(en|es|pt|fr|de|ar|hi|zh|ja|he)/:path*"],
};

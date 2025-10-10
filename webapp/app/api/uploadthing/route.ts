import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Minimal visibility check (does not print the token)
console.log("[uploadthing] token present:", Boolean(process.env.UPLOADTHING_TOKEN));

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});




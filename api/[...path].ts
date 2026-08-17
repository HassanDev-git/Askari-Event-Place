import { createApp } from "../server/app";

const app = createApp();

/**
 * Vercel's catch-all API Function. `/api/*` reaches the same Express routes
 * used locally. The storage rewrite sends `/manus-storage/*` through this
 * function, so its original Express path is restored before routing.
 */
export default function handler(req: { url?: string }, res: Parameters<typeof app>[1]) {
  if (req.url?.startsWith("/api/manus-storage/")) {
    req.url = req.url.slice("/api".length);
  }

  return app(req as Parameters<typeof app>[0], res);
}

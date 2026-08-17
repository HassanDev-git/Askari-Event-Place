# Vercel Deployment Guide

## What the repository contains

This project uses a Vite-built React frontend and an Express/tRPC backend. For Vercel, the frontend is emitted to `dist/public` and the catch-all function at `api/[...path].ts` handles the existing `/api/*` routes. The configuration also rewrites `/manus-storage/*` through that function so the venue imagery can continue using the existing storage proxy.

> The application is structurally prepared for Vercel, but it is **not self-contained**. Its current authentication, managed storage, and owner-notification features use Manus service endpoints. Those services must remain reachable and correctly configured after deployment.

## Required Vercel Environment Variables

Set the following values for the **Production**, **Preview**, and **Development** environments in the Vercel project settings. Do not commit values to this repository.

| Variable | Required for | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Booking inquiries and users | Use a TLS-enabled, externally reachable MySQL/TiDB connection string. |
| `JWT_SECRET` | Owner-session signing | Generate a long, unique random value for this deployment. |
| `VITE_APP_ID` | Current Manus OAuth integration | Must correspond to the configured OAuth application. |
| `OAUTH_SERVER_URL` | Current Manus OAuth integration | Must permit the Vercel deployment domain as a callback origin. |
| `OWNER_OPEN_ID` | Owner-only dashboard access | The OAuth identity that should receive the `admin` role. |
| `BUILT_IN_FORGE_API_URL` | Image storage proxy and owner notifications | Current implementation relies on this Manus service endpoint. |
| `BUILT_IN_FORGE_API_KEY` | Image storage proxy and owner notifications | Keep server-only; never prefix this value with `VITE_`. |
| `VITE_ANALYTICS_ENDPOINT` | Optional analytics script | Add only when analytics is desired. |
| `VITE_ANALYTICS_WEBSITE_ID` | Optional analytics script | Add only when analytics is desired. |

## Deploy Steps

1. Import `HassanDev-git/Askari-Event-Place` in Vercel, or create a Git-connected project with the Vercel dashboard.
2. Leave the root directory at the repository root. Vercel will use `vercel.json`, run `pnpm build:vercel`, serve `dist/public`, and compile the catch-all function.
3. Add the required environment variables above. Configure the OAuth provider with the Vercel domain plus `/api/oauth/callback` before testing owner access.
4. Deploy a preview first. Confirm the public page, `/admin` login, booking submission, `/api/trpc`, images under `/manus-storage/`, and owner notification workflow.
5. Promote the verified deployment to production and add a custom domain if required.

## Important Compatibility Note

The app is built on Manus OAuth and Forge storage/notification integrations. If the intended Vercel deployment must operate completely independently of Manus, those three integrations need a separate migration to an external identity provider, object storage provider, and email/notification provider. The current repository preserves the existing feature behavior only when the documented service variables remain valid.

## References

[1] [Vercel — Vite SPA deep-linking configuration](https://vercel.com/docs/frameworks/frontend/vite)

[2] [Vercel — Node.js Functions](https://vercel.com/docs/functions/runtimes/node-js)

[3] [Vercel — Rewrites](https://vercel.com/docs/rewrites)

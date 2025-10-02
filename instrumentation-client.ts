// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://932731b25a23a13af6c1d272ea4b2df4@o4510117704368128.ingest.us.sentry.io/4510117709611008",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,
  
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Performance monitoring (tracing is enabled by default)

  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA || "development",

  // Environment
  environment: process.env.NODE_ENV || "development",

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false, // Disabled to avoid bundle issues

  // Additional options
  beforeSend(event) {
    // Filter out development errors in production
    if (process.env.NODE_ENV === "production" && event.exception) {
      const error = event.exception.values?.[0];
      if (error?.type === "ChunkLoadError" || error?.type === "Loading chunk") {
        return null; // Don't send chunk load errors to Sentry
      }
    }
    return event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
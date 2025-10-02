/**
 * Development CSP override for Clerk compatibility
 * This provides a more permissive CSP during development
 */

export function getDevelopmentCSP(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.clerk.dev https://*.clerk.accounts.dev https://*.clerk.com https://va.vercel-scripts.com",
    "script-src-elem 'self' 'unsafe-inline' https://js.clerk.dev https://*.clerk.accounts.dev https://*.clerk.com https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.clerk.accounts.dev",
    "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.clerk.accounts.dev",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.clerk.com https://*.clerk.accounts.dev https://*.clerk.com wss://*.clerk.accounts.dev https://vitals.vercel-insights.com webpack:",
    "frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join("; ")
}

export function getProductionCSP(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.clerk.dev https://*.clerk.accounts.dev https://va.vercel-scripts.com",
    "script-src-elem 'self' 'unsafe-inline' https://js.clerk.dev https://*.clerk.accounts.dev https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.clerk.com https://*.clerk.accounts.dev https://vitals.vercel-insights.com",
    "frame-src 'self' https://*.clerk.accounts.dev",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join("; ")
}

export function getCSPForEnvironment(): string {
  if (process.env.NODE_ENV === "development") {
    return getDevelopmentCSP()
  }
  return getProductionCSP()
}

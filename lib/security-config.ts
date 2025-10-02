/**
 * Enterprise-grade security configuration
 */

export const SECURITY_CONFIG = {
  // Rate limiting configuration
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100, // per window
    MAX_API_REQUESTS: 1000, // per window for API
  },

  // Session configuration
  SESSION: {
    MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
  },

  // CSRF protection
  CSRF: {
    TOKEN_HEADER: "x-csrf-token",
    COOKIE_NAME: "csrf-token",
  },

  // Security headers
  HEADERS: {
    // Content Security Policy
    CSP: {
      DEFAULT_SRC: "'self'",
      SCRIPT_SRC: "'self' 'unsafe-inline' 'unsafe-eval' https://js.clerk.dev https://*.clerk.accounts.dev https://*.clerk.com https://va.vercel-scripts.com",
      SCRIPT_SRC_ELEM: "'self' 'unsafe-inline' https://js.clerk.dev https://*.clerk.accounts.dev https://*.clerk.com https://va.vercel-scripts.com",
      STYLE_SRC: "'self' 'unsafe-inline' https://fonts.googleapis.com https://*.clerk.accounts.dev",
      STYLE_SRC_ELEM: "'self' 'unsafe-inline' https://fonts.googleapis.com https://*.clerk.accounts.dev",
      FONT_SRC: "'self' https://fonts.gstatic.com data:",
      IMG_SRC: "'self' data: https: blob:",
      CONNECT_SRC: "'self' https://api.clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://vitals.vercel-insights.com",
      FRAME_SRC: "'self' https://*.clerk.accounts.dev",
      WORKER_SRC: "'self' blob:",
      OBJECT_SRC: "'none'",
      BASE_URI: "'self'",
      FORM_ACTION: "'self'",
      FRAME_ANCESTORS: "'none'",
    },
    
    // CORS configuration
    CORS: {
      ORIGINS: process.env.ALLOWED_ORIGINS?.split(",") || [
        "http://localhost:3000",
        "https://invoice.lryanle.com"
      ],
      METHODS: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      HEADERS: [
        "Content-Type",
        "Authorization",
        "x-csrf-token",
        "x-requested-with"
      ],
      CREDENTIALS: true,
    },
    
    // Additional security headers
    ADDITIONAL: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    },
  },

  // Feature flags
  FEATURES: {
    RATE_LIMITING: true,
    CSRF_PROTECTION: true,
    SECURITY_HEADERS: true,
  },
} as const

/**
 * Environment-specific configuration overrides
 */
export function getSecurityConfig() {
  const isDevelopment = process.env.NODE_ENV === "development"
  
  if (isDevelopment) {
    // Return development config with relaxed settings
    return {
      ...SECURITY_CONFIG,
      RATE_LIMIT: {
        ...SECURITY_CONFIG.RATE_LIMIT,
        MAX_REQUESTS: 1000,
        MAX_API_REQUESTS: 10000,
      },
      FEATURES: {
        ...SECURITY_CONFIG.FEATURES,
        CSRF_PROTECTION: false,
      },
    }
  }
  
  return SECURITY_CONFIG
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof SECURITY_CONFIG.FEATURES): boolean {
  const config = getSecurityConfig()
  return config.FEATURES[feature]
}

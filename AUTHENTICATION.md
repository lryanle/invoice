# Authentication Setup Guide

This document explains how to properly configure Clerk authentication for both development and production environments.

## Required Environment Variables

### Development
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Production
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

## Setup Steps

### 1. Clerk Dashboard Configuration

1. **Create Production Instance**
   - Go to [Clerk Dashboard](https://dashboard.clerk.com)
   - Switch from "Development" to "Production" in the top dropdown
   - Create a new production instance or clone from development

2. **Configure Domains**
   - Add your production domain to the allowed domains
   - Set up DNS records as required by Clerk
   - Wait for DNS propagation (up to 48 hours)

3. **OAuth Configuration**
   - For production, configure your own OAuth credentials
   - Set up Google OAuth (or other providers) with your domain
   - Update the OAuth settings in Clerk Dashboard

### 2. Environment Variables

1. **Development**
   - Copy `.env.local` from `.env.example`
   - Use test keys from Clerk Dashboard

2. **Production**
   - Set environment variables in your hosting platform
   - Use live keys from Clerk Dashboard
   - Ensure `NEXT_PUBLIC_APP_URL` is set to your production domain

### 3. Application Configuration

The application includes several improvements for production reliability:

- **ClerkProvider Configuration**: Properly configured with production-ready settings
- **Middleware Protection**: Enhanced middleware with better route handling
- **Error Boundaries**: Client-side error handling for auth issues
- **Health Check**: `/api/health` endpoint for monitoring
- **Environment Validation**: Automatic validation of required environment variables

## Troubleshooting

### Common Issues

1. **"Invalid publishable key" errors**
   - Ensure you're using the correct key for your environment
   - Check that the key starts with `pk_test_` (dev) or `pk_live_` (prod)

2. **Redirect loops**
   - Check that your domain is properly configured in Clerk
   - Verify DNS records are set up correctly
   - Ensure `NEXT_PUBLIC_APP_URL` matches your actual domain

3. **Authentication not working in production**
   - Verify all environment variables are set correctly
   - Check that you're using production keys in production
   - Ensure OAuth credentials are configured for your domain

### Health Check

Visit `/api/health` to check the status of your authentication setup:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "clerk": {
    "publishableKey": true,
    "secretKey": true
  }
}
```

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use different keys for development and production
   - Rotate keys regularly

2. **Domain Configuration**
   - Only add trusted domains to Clerk
   - Use HTTPS in production
   - Configure proper CORS settings

3. **Session Management**
   - Sessions are automatically managed by Clerk
   - No additional session storage is required
   - Sessions are secure and encrypted

## Testing

1. **Development Testing**
   - Test sign-in/sign-out flows
   - Verify protected routes are properly guarded
   - Check redirect behavior

2. **Production Testing**
   - Test with production domain
   - Verify OAuth flows work correctly
   - Check that all environment variables are set
   - Test the health check endpoint

## Support

If you encounter issues:

1. Check the health check endpoint
2. Verify environment variables are set correctly
3. Check Clerk Dashboard for any configuration issues
4. Review browser console for client-side errors
5. Check server logs for authentication errors

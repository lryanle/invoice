"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset?: () => void;
}

export default function GlobalError({ 
  error, 
  reset 
}: Readonly<GlobalErrorProps>) {
  useEffect(() => {
    // Enhanced Sentry error capture with context
    Sentry.captureException(error, {
      tags: {
        errorBoundary: "global",
        component: "GlobalError",
      },
      extra: {
        digest: error.digest,
        timestamp: new Date().toISOString(),
      },
    });
  }, [error]);

  const handleReset = () => {
    if (reset) {
      reset();
    } else {
      window.location.reload();
    }
  };

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl">Something went wrong!</CardTitle>
            <CardDescription>
              We're sorry, but something unexpected happened. Our team has been notified.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {process.env.NODE_ENV === "development" && (
              <div className="rounded-md bg-gray-100 p-3">
                <p className="text-sm font-medium text-gray-900">Error Details:</p>
                <p className="text-sm text-gray-700 mt-1">{error.message}</p>
                {error.digest && (
                  <p className="text-xs text-gray-500 mt-1">Digest: {error.digest}</p>
                )}
              </div>
            )}
            
            <div className="flex flex-col space-y-2">
              <Button onClick={handleReset} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/"}
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </body>
    </html>
  );
}
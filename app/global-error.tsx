"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home, Bug, Copy, Check } from "lucide-react";
import { useTheme } from "next-themes";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset?: () => void;
}

export default function GlobalError({ 
  error, 
  reset 
}: Readonly<GlobalErrorProps>) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

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
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
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

  const copyErrorDetails = async () => {
    const errorDetails = {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <html lang="en" className={theme}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Error - Invoice Manager</title>
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <Card className="border-destructive/20 shadow-lg">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 dark:bg-destructive/20">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-bold text-foreground">
                    Oops! Something went wrong
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground max-w-md mx-auto">
                    We're sorry, but something unexpected happened. Our team has been notified and we're working to fix this issue.
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Error ID for support */}
                {error.digest && (
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Error Reference</p>
                    <code className="text-sm font-mono bg-background px-2 py-1 rounded border">
                      {error.digest}
                    </code>
                  </div>
                )}

                {/* Development error details */}
                {process.env.NODE_ENV === "development" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Bug className="h-4 w-4" />
                        Error Details
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyErrorDetails}
                        className="h-8 px-2"
                      >
                        {copied ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <div className="rounded-md bg-muted p-3 max-h-40 overflow-y-auto">
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words">
                        {error.message}
                        {error.stack && `\n\nStack trace:\n${error.stack}`}
                      </pre>
                    </div>
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={handleReset} 
                    className="flex-1 h-11 text-base font-medium"
                    size="lg"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = "/"}
                    className="flex-1 h-11 text-base font-medium"
                    size="lg"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Go Home
                  </Button>
                </div>

                {/* Help text */}
                <div className="text-center text-sm text-muted-foreground">
                  <p>
                    If this problem persists, please contact support with the error reference above.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </body>
    </html>
  );
}
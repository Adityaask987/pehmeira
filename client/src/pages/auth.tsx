import { useState } from "react";
import { useLocation } from "wouter";
import { signInWithGoogle } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import logoUrl from "@assets/VCXCVCXCV-removebg-preview (1)_1762695915269.png";

export default function Auth() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Welcome to Pehmeira",
        description: "You've successfully signed in",
      });
      setLocation("/occasions");
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign in failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src={logoUrl}
              alt="Pehmeira"
              className="h-16 md:h-20 object-contain"
              data-testid="img-logo-auth"
            />
          </div>
          <div className="space-y-2">
            <h1 className="font-serif text-3xl md:text-4xl font-bold" data-testid="text-auth-title">
              Welcome to Pehmeira
            </h1>
            <p className="text-muted-foreground" data-testid="text-auth-subtitle">
              Sign in to access personalized luxury fashion styling
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            className="w-full"
            size="lg"
            onClick={handleGoogleSignIn}
            disabled={loading}
            data-testid="button-google-signin"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </span>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-card text-muted-foreground">
                Secure authentication powered by Firebase
              </span>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground" data-testid="text-privacy-notice">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </Card>
    </div>
  );
}

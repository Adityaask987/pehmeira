import { createContext, useContext, useEffect, useState } from "react";
import { type User as FirebaseUser } from "firebase/auth";
import { onAuthChange } from "@/lib/firebase";
import { type User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refreshUser = async () => {
    if (firebaseUser) {
      try {
        const token = await firebaseUser.getIdToken();
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          try {
            const userData = await response.json();
            setUser(userData);
          } catch (jsonError: any) {
            console.error("[AUTH] Failed to parse refreshed user data:", jsonError);
            toast({
              title: "Data Error",
              description: "Received invalid user data. Please sign in again.",
              variant: "destructive",
            });
            setUser(null);
          }
        } else if (response.status === 404) {
          // User not found in database - recreate them (mirrors onAuthChange behavior)
          console.log("[AUTH] User not found during refresh, recreating...");
          const createResponse = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              profilePicture: firebaseUser.photoURL,
            }),
          });

          if (createResponse.ok) {
            try {
              const userData = await createResponse.json();
              setUser(userData);
              console.log("[AUTH] User recreated successfully during refresh:", userData.id);
              toast({
                title: "Session Restored",
                description: "Your account has been restored successfully.",
                variant: "default",
              });
            } catch (jsonError: any) {
              console.error("[AUTH] Failed to parse recreated user data:", jsonError);
              toast({
                title: "Data Error",
                description: "Account recreated but received invalid response. Please refresh the page.",
                variant: "destructive",
              });
              setUser(null);
            }
          } else {
            const errorData = await createResponse.json().catch(() => ({ message: "Unknown error" }));
            console.error("[AUTH] Failed to recreate user during refresh:", errorData);
            toast({
              title: "Account Recreation Failed",
              description: `Failed to restore your account: ${errorData.message}. Please sign in again.`,
              variant: "destructive",
            });
            setUser(null);
          }
        } else {
          // Non-404 error during refresh (500, etc.)
          const errorData = await response.json().catch(() => ({ message: "Refresh failed" }));
          console.error("[AUTH] Failed to refresh user data:", { status: response.status, error: errorData });
          toast({
            title: "Session Refresh Error",
            description: errorData.message || "Unable to refresh your session. Please sign in again.",
            variant: "destructive",
          });
          setUser(null);
        }
      } catch (error: any) {
        console.error("[AUTH] Error fetching user:", error);
        toast({
          title: "Session Error",
          description: `Unable to refresh your session: ${error.message}. Please sign in again.`,
          variant: "destructive",
        });
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      setLoading(true);

      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const response = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            try {
              const userData = await response.json();
              setUser(userData);
            } catch (jsonError: any) {
              console.error("[AUTH] Failed to parse user data:", jsonError);
              toast({
                title: "Data Error",
                description: "Received invalid user data from server. Please try again.",
                variant: "destructive",
              });
              setUser(null);
            }
          } else if (response.status === 404) {
            console.log("[AUTH] User not found in database, creating new user...");
            const createResponse = await fetch("/api/auth/login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName,
                profilePicture: firebaseUser.photoURL,
              }),
            });

            if (createResponse.ok) {
              try {
                const userData = await createResponse.json();
                setUser(userData);
                console.log("[AUTH] User created successfully:", userData.id);
                toast({
                  title: "Welcome to Pehmeira",
                  description: "Your account has been created successfully.",
                  variant: "default",
                });
              } catch (jsonError: any) {
                console.error("[AUTH] Failed to parse created user data:", jsonError);
                toast({
                  title: "Data Error",
                  description: "Account created but received invalid response. Please refresh the page.",
                  variant: "destructive",
                });
                setUser(null);
              }
            } else {
              const errorData = await createResponse.json().catch(() => ({ message: "Unknown error" }));
              console.error("[AUTH] Failed to create user:", errorData);
              toast({
                title: "Authentication Error",
                description: `Failed to save your account: ${errorData.message}. Please try again.`,
                variant: "destructive",
              });
            }
          } else {
            // /api/auth/me failed with non-404 status (500, etc.) - database sync error
            const errorData = await response.json().catch(() => ({ message: "Database sync failed" }));
            console.error("[AUTH] Database sync error:", { status: response.status, error: errorData });
            toast({
              title: "Database Sync Error",
              description: errorData.message || "Unable to sync your session with the database. Please refresh the page or sign in again.",
              variant: "destructive",
            });
          }
        } catch (error: any) {
          console.error("[AUTH] Error syncing user:", error);
          toast({
            title: "Connection Error",
            description: `Unable to sync your account: ${error.message}. Please check your connection.`,
            variant: "destructive",
          });
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

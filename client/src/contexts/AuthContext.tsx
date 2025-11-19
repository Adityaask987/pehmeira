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
          const userData = await response.json();
          setUser(userData);
        } else {
          console.error("[AUTH] Failed to refresh user data");
          setUser(null);
        }
      } catch (error: any) {
        console.error("[AUTH] Error fetching user:", error);
        toast({
          title: "Session Error",
          description: "Unable to refresh your session. Please sign in again.",
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
              } catch (jsonError: any) {
                console.error("[AUTH] Failed to parse created user data:", jsonError);
                toast({
                  title: "Data Error",
                  description: "User created but received invalid response. Please refresh the page.",
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
              description: `Unable to sync your session with the database. Please refresh the page or sign in again.`,
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

import { Heart, Menu, X, User, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/firebase";
import pehmeiraLogo from "@assets/VCXCVCXCV-removebg-preview (1)_1762695915269.png";

interface HeaderProps {
  wishlistCount?: number;
}

export function Header({ wishlistCount = 0 }: HeaderProps) {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, firebaseUser, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      setLocation("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const navItems = [
    { path: "/occasions", label: "DISCOVER" },
    { path: "/products", label: "SHOP" },
    { path: "/retail-products", label: "LIVE PRODUCTS" },
    { path: "/wishlist", label: "WISHLIST" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-card">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" data-testid="link-home">
            <img 
              src={pehmeiraLogo} 
              alt="Pehmeira" 
              className="h-10 md:h-12 cursor-pointer hover-elevate active-elevate-2 px-2 py-1 rounded-md"
              data-testid="img-logo"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={location === item.path ? "default" : "ghost"}
                  className="font-display text-xs font-medium tracking-wider"
                  data-testid={`link-nav-${item.label.toLowerCase()}`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user && firebaseUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                    data-testid="button-user-menu"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.profilePicture || undefined} alt={user.name || "User"} />
                      <AvatarFallback className="bg-accent text-accent-foreground">
                        {user.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel data-testid="text-user-name">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name || "User"}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="w-full cursor-pointer" data-testid="link-profile-menu">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist" className="w-full cursor-pointer" data-testid="link-wishlist-menu">
                      <Heart className="mr-2 h-4 w-4" />
                      Wishlist
                      {wishlistCount > 0 && (
                        <Badge className="ml-auto" variant="secondary" data-testid="badge-wishlist-count-menu">
                          {wishlistCount}
                        </Badge>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} data-testid="button-sign-out">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                {!loading && (
                  <Link href="/auth">
                    <Button variant="default" size="sm" data-testid="button-sign-in">
                      Sign In
                    </Button>
                  </Link>
                )}
              </>
            )}

            <Link href="/wishlist">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                data-testid="button-wishlist"
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-1 bg-accent text-accent-foreground text-xs"
                    data-testid="badge-wishlist-count"
                  >
                    {wishlistCount}
                  </Badge>
                )}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-menu-toggle"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden border-t py-4 space-y-2">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={location === item.path ? "default" : "ghost"}
                  className="w-full justify-start font-display text-xs font-medium tracking-wider"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`link-mobile-${item.label.toLowerCase()}`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { StyleCard } from "@/components/style-card";
import type { Style } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function StyleRecommendations() {
  const [, setLocation] = useLocation();
  const [wishlistedStyles, setWishlistedStyles] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const userGender = localStorage.getItem("userGender") || "";
  const userBodyType = localStorage.getItem("userBodyType") || "";
  const selectedOccasion = localStorage.getItem("selectedOccasion") || "";

  const { data: styles = [], isLoading } = useQuery<Style[]>({
    queryKey: ["/api/styles", userGender, userBodyType, selectedOccasion],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userGender) params.append("gender", userGender);
      if (userBodyType) params.append("bodyType", userBodyType);
      if (selectedOccasion) params.append("occasion", selectedOccasion);
      
      const response = await fetch(`/api/styles?${params.toString()}`);
      return response.json();
    },
  });

  const userId = localStorage.getItem("userId") || "default-user";

  const { data: wishlist = [] } = useQuery<any[]>({
    queryKey: ["/api/wishlist", userId],
    queryFn: async () => {
      const response = await fetch(`/api/wishlist?userId=${userId}`);
      return response.json();
    },
  });

  useEffect(() => {
    const styleIds = new Set(
      wishlist
        .filter((item) => item.itemType === "style")
        .map((item) => item.itemId)
    );
    setWishlistedStyles(styleIds);
  }, [wishlist]);

  const addToWishlistMutation = useMutation({
    mutationFn: async (style: Style) => {
      return apiRequest("POST", "/api/wishlist", {
        userId,
        itemType: "style",
        itemId: style.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Added to wishlist",
        description: "Style saved successfully",
      });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (styleId: string) => {
      const item = wishlist.find(
        (w) => w.itemType === "style" && w.itemId === styleId
      );
      if (item) {
        return apiRequest("DELETE", `/api/wishlist/${item.id}`, {});
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Removed from wishlist",
        description: "Style removed successfully",
      });
    },
  });

  const handleToggleWishlist = async (style: Style) => {
    const isWishlisted = wishlistedStyles.has(style.id);
    
    if (isWishlisted) {
      setWishlistedStyles((prev) => {
        const next = new Set(prev);
        next.delete(style.id);
        return next;
      });
      removeFromWishlistMutation.mutate(style.id);
    } else {
      setWishlistedStyles((prev) => new Set(prev).add(style.id));
      addToWishlistMutation.mutate(style);
    }
  };

  const handleShopLook = (style: Style) => {
    localStorage.setItem("selectedStyle", style.id);
    setLocation("/products");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header wishlistCount={wishlist.length} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin h-12 w-12 border-4 border-accent border-t-transparent rounded-full mx-auto" data-testid="loading-spinner"></div>
            <p className="text-muted-foreground font-display">Loading your personalized styles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header wishlistCount={wishlist.length} />
      
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="text-center space-y-4 mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-bold" data-testid="text-title">
            Your Curated Styles
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Handpicked by fashion designers to complement your unique style
          </p>
        </div>

        {styles.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="mx-auto w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <span className="text-4xl font-serif text-accent">S</span>
            </div>
            <h2 className="font-serif text-2xl font-semibold" data-testid="text-empty-title">
              No Styles Available
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto" data-testid="text-empty-desc">
              Complete your profile to see personalized style recommendations
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {styles.map((style) => (
              <StyleCard
                key={style.id}
                style={style}
                isWishlisted={wishlistedStyles.has(style.id)}
                onToggleWishlist={handleToggleWishlist}
                onShopLook={handleShopLook}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

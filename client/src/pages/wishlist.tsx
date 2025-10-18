import { useState } from "react";
import { Header } from "@/components/header";
import { ProductCard } from "@/components/product-card";
import { StyleCard } from "@/components/style-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Heart, ShoppingBag } from "lucide-react";
import type { Product, Style } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Wishlist() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"styles" | "products">("styles");
  const { toast } = useToast();

  const userId = localStorage.getItem("userId") || "default-user";

  const { data: wishlist = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/wishlist", userId],
    queryFn: async () => {
      const response = await fetch(`/api/wishlist?userId=${userId}`);
      return response.json();
    },
  });

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: allStyles = [] } = useQuery<Style[]>({
    queryKey: ["/api/styles"],
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const item = wishlist.find((w) => w.itemId === itemId);
      if (item) {
        return apiRequest("DELETE", `/api/wishlist/${item.id}`, {});
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Removed from wishlist",
        description: "Item removed successfully",
      });
    },
  });

  const handleRemoveProduct = (product: Product) => {
    removeFromWishlistMutation.mutate(product.id);
  };

  const handleRemoveStyle = (style: Style) => {
    removeFromWishlistMutation.mutate(style.id);
  };

  const wishlistedProducts = allProducts.filter((p) =>
    wishlist.some((w) => w.itemType === "product" && w.itemId === p.id)
  );

  const wishlistedStyles = allStyles.filter((s) =>
    wishlist.some((w) => w.itemType === "style" && w.itemId === s.id)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin h-12 w-12 border-4 border-accent border-t-transparent rounded-full mx-auto" data-testid="loading-spinner"></div>
            <p className="text-muted-foreground font-display">Loading wishlist...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalCount = wishlistedStyles.length + wishlistedProducts.length;

  return (
    <div className="min-h-screen bg-background">
      <Header wishlistCount={totalCount} />
      
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4" data-testid="text-title">
            My Wishlist
          </h1>
          <p className="text-lg text-muted-foreground" data-testid="text-subtitle">
            {totalCount} {totalCount === 1 ? "item" : "items"} saved
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
          <TabsList className="mb-8">
            <TabsTrigger value="styles" className="font-display" data-testid="tab-styles">
              Complete Styles ({wishlistedStyles.length})
            </TabsTrigger>
            <TabsTrigger value="products" className="font-display" data-testid="tab-products">
              Individual Items ({wishlistedProducts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="styles">
            {wishlistedStyles.length === 0 ? (
              <div className="text-center py-20 space-y-6">
                <div className="mx-auto w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <Heart className="w-12 h-12 text-accent" />
                </div>
                <h2 className="font-serif text-2xl font-semibold" data-testid="text-empty-styles">
                  No Saved Styles Yet
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Start exploring curated looks and save your favorites
                </p>
                <Button
                  onClick={() => setLocation("/styles")}
                  className="font-display tracking-wide"
                  data-testid="button-browse-styles"
                >
                  BROWSE STYLES
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {wishlistedStyles.map((style) => (
                  <StyleCard
                    key={style.id}
                    style={style}
                    isWishlisted={true}
                    onToggleWishlist={handleRemoveStyle}
                    onShopLook={(s) => {
                      localStorage.setItem("selectedStyle", s.id);
                      setLocation("/products");
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="products">
            {wishlistedProducts.length === 0 ? (
              <div className="text-center py-20 space-y-6">
                <div className="mx-auto w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-12 h-12 text-accent" />
                </div>
                <h2 className="font-serif text-2xl font-semibold" data-testid="text-empty-products">
                  No Saved Products Yet
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Discover products and add them to your wishlist
                </p>
                <Button
                  onClick={() => setLocation("/products")}
                  className="font-display tracking-wide"
                  data-testid="button-browse-products"
                >
                  BROWSE PRODUCTS
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {wishlistedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isWishlisted={true}
                    onToggleWishlist={handleRemoveProduct}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

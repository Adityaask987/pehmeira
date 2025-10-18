import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Product, Category } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "all", label: "All Products" },
  { value: "shirts", label: "Shirts" },
  { value: "pants", label: "Pants" },
  { value: "shoes", label: "Shoes" },
  { value: "accessories", label: "Accessories" },
];

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [sortBy, setSortBy] = useState<"price-low" | "price-high" | "match">("match");
  const [wishlistedProducts, setWishlistedProducts] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const selectedStyleId = localStorage.getItem("selectedStyle");
  const userGender = localStorage.getItem("userGender") || "";
  const userBodyType = localStorage.getItem("userBodyType") || "";

  const { data: allProducts = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: allStyles = [] } = useQuery<any[]>({
    queryKey: ["/api/styles"],
  });

  const selectedStyle = selectedStyleId 
    ? allStyles.find((s: any) => s.id === selectedStyleId)
    : null;

  const userId = localStorage.getItem("userId") || "default-user";

  const { data: wishlist = [] } = useQuery<any[]>({
    queryKey: ["/api/wishlist", userId],
    queryFn: async () => {
      const response = await fetch(`/api/wishlist?userId=${userId}`);
      return response.json();
    },
  });

  useEffect(() => {
    const productIds = new Set(
      wishlist
        .filter((item) => item.itemType === "product")
        .map((item) => item.itemId)
    );
    setWishlistedProducts(productIds);
  }, [wishlist]);

  const addToWishlistMutation = useMutation({
    mutationFn: async (product: Product) => {
      return apiRequest("POST", "/api/wishlist", {
        userId,
        itemType: "product",
        itemId: product.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist", userId] });
      toast({
        title: "Added to wishlist",
        description: "Product saved successfully",
      });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      const item = wishlist.find(
        (w) => w.itemType === "product" && w.itemId === productId
      );
      if (item) {
        return apiRequest("DELETE", `/api/wishlist/${item.id}`, {});
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist", userId] });
      toast({
        title: "Removed from wishlist",
        description: "Product removed successfully",
      });
    },
  });

  const handleToggleWishlist = async (product: Product) => {
    const isWishlisted = wishlistedProducts.has(product.id);
    
    if (isWishlisted) {
      setWishlistedProducts((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
      removeFromWishlistMutation.mutate(product.id);
    } else {
      setWishlistedProducts((prev) => new Set(prev).add(product.id));
      addToWishlistMutation.mutate(product);
    }
  };

  let filteredProducts = allProducts;
  
  if (selectedStyle && selectedStyle.products) {
    filteredProducts = allProducts.filter((p) =>
      selectedStyle.products.includes(p.id)
    );
  }
  
  filteredProducts = filteredProducts
    .filter((p) => selectedCategory === "all" || p.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "match") return (b.matchPercentage || 0) - (a.matchPercentage || 0);
      return 0;
    });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header wishlistCount={wishlist.length} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin h-12 w-12 border-4 border-accent border-t-transparent rounded-full mx-auto" data-testid="loading-spinner"></div>
            <p className="text-muted-foreground font-display">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header wishlistCount={wishlist.length} />
      
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 space-y-6">
          {selectedStyle ? (
            <div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2" data-testid="text-title">
                Shop This Look
              </h1>
              <p className="text-lg text-muted-foreground">
                Products from <span className="font-display font-semibold">{selectedStyle.name}</span> by {selectedStyle.designer}
              </p>
            </div>
          ) : (
            <h1 className="font-serif text-4xl md:text-5xl font-bold" data-testid="text-title">
              Discover Products
            </h1>
          )}

          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.value}
                  variant={selectedCategory === cat.value ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat.value)}
                  className="font-display text-xs tracking-wide"
                  data-testid={`button-category-${cat.value}`}
                >
                  {cat.label}
                </Button>
              ))}
            </div>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-48 font-display" data-testid="select-sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="match">Best Match</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="mx-auto w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <span className="text-4xl font-serif text-accent">P</span>
            </div>
            <h2 className="font-serif text-2xl font-semibold" data-testid="text-empty-title">
              No Products Found
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto" data-testid="text-empty-desc">
              Try selecting a different category
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={wishlistedProducts.has(product.id)}
                onToggleWishlist={handleToggleWishlist}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

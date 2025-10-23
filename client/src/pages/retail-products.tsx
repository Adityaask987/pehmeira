import { useState } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Search, Filter, Heart, ExternalLink, DollarSign, ShoppingBag } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RetailProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category: string;
  retailer: string;
  productUrl: string;
  inStock: boolean;
  colors?: string[];
  sizes?: string[];
  description?: string;
}

export default function RetailProducts() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const userId = localStorage.getItem("userId") || "default-user";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();

  const { data: wishlist = [] } = useQuery<any[]>({
    queryKey: ["/api/wishlist", userId],
  });

  const { data: user } = useQuery<any>({
    queryKey: ["/api/users", userId],
  });

  const buildQueryUrl = () => {
    const params = new URLSearchParams();
    if (selectedCategory !== "all") params.append("category", selectedCategory);
    if (searchQuery) params.append("query", searchQuery);
    if (minPrice !== undefined) params.append("minPrice", minPrice.toString());
    if (maxPrice !== undefined) params.append("maxPrice", maxPrice.toString());
    if (user?.gender) params.append("gender", user.gender);
    if (user?.favoriteBrands && user.favoriteBrands.length > 0) {
      params.append("brands", user.favoriteBrands.join(","));
    }
    const queryString = params.toString();
    return `/api/retail/products${queryString ? `?${queryString}` : ''}`;
  };

  const { data: products = [], isLoading } = useQuery<RetailProduct[]>({
    queryKey: ["/api/retail/products", selectedCategory, searchQuery, minPrice, maxPrice, user?.gender, user?.favoriteBrands],
    queryFn: () => fetch(buildQueryUrl()).then(res => res.json()),
    enabled: !!user,
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      return apiRequest("POST", "/api/wishlist", {
        userId,
        itemType: "product",
        itemId: productId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist", userId] });
      toast({
        title: "Added to wishlist",
        description: "Product saved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add to wishlist",
        variant: "destructive",
      });
    },
  });

  const isInWishlist = (productId: string) => {
    return wishlist.some(
      (item) => item.itemType === "product" && item.itemId === productId
    );
  };

  if (isLoading && !products.length) {
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
      
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="font-serif text-4xl md:text-5xl font-bold" data-testid="text-page-title">
              Live Retail Products
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover luxury fashion from top retailers, curated based on your preferences
            </p>
          </div>

          <Card data-testid="card-search-filters">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-accent" />
                <CardTitle className="font-serif">Search & Filters</CardTitle>
              </div>
              <CardDescription>Find the perfect pieces for your style</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger id="category" data-testid="select-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="shirts">Shirts</SelectItem>
                      <SelectItem value="pants">Pants</SelectItem>
                      <SelectItem value="shoes">Shoes</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minPrice">Min Price ($)</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={minPrice || ""}
                    onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                    data-testid="input-min-price"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxPrice">Max Price ($)</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    min="0"
                    placeholder="5000"
                    value={maxPrice || ""}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                    data-testid="input-max-price"
                  />
                </div>
              </div>

              {user?.favoriteBrands && user.favoriteBrands.length > 0 && (
                <div className="pt-2">
                  <Label className="text-sm text-muted-foreground mb-2 block">
                    Filtering by your favorite brands
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {user.favoriteBrands.map((brand: string) => (
                      <Badge key={brand} variant="secondary" data-testid={`badge-filter-brand-${brand.toLowerCase()}`}>
                        {brand}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground" data-testid="text-results-count">
              {products.length} products found
            </p>
            {user?.minBudget !== undefined && user?.maxBudget !== undefined && (
              <Badge variant="outline" className="gap-2">
                <DollarSign className="w-3 h-3" />
                Budget: ${user.minBudget} - ${user.maxBudget}
              </Badge>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <Card key={product.id} className="hover-elevate overflow-hidden" data-testid={`card-product-${product.id}`}>
                <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.originalPrice && (
                    <Badge className="absolute top-3 right-3 bg-red-500 text-white border-0">
                      Sale
                    </Badge>
                  )}
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="secondary" className="text-base">
                        Out of Stock
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-5 space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground font-display">{product.brand}</p>
                    <h3 className="font-serif font-semibold mt-1 line-clamp-2" data-testid={`text-product-name-${product.id}`}>
                      {product.name}
                    </h3>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-serif font-bold text-accent" data-testid={`text-price-${product.id}`}>
                      ${product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{product.retailer}</span>
                  </div>

                  {product.sizes && product.sizes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {product.sizes.slice(0, 5).map((size) => (
                        <Badge key={size} variant="outline" className="text-xs">
                          {size}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => window.open(product.productUrl, "_blank")}
                      disabled={!product.inStock}
                      data-testid={`button-view-${product.id}`}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant={isInWishlist(product.id) ? "default" : "outline"}
                      size="icon"
                      onClick={() => addToWishlistMutation.mutate(product.id)}
                      disabled={addToWishlistMutation.isPending || isInWishlist(product.id)}
                      data-testid={`button-wishlist-${product.id}`}
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {products.length === 0 && !isLoading && (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold mb-2">No products found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search query
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

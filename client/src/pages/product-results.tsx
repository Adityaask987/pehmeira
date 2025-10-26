import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProductSearchResponse, SearchedProduct } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ExternalLink, Star, ArrowLeft, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProductResults() {
  const [, params] = useRoute("/product-results/:styleId");
  const [, setLocation] = useLocation();
  const styleId = params?.styleId || "";
  const { toast } = useToast();
  const userId = localStorage.getItem("userId") || "default-user";

  const { data: wishlist = [] } = useQuery<any[]>({
    queryKey: ["/api/wishlist", userId],
  });

  const searchMutation = useMutation<ProductSearchResponse, Error, string>({
    mutationFn: async (styleId: string) => {
      const response = await apiRequest("POST", "/api/search-products", { styleId });
      return response.json();
    },
    onError: (error: any) => {
      toast({
        title: "Search failed",
        description: error.message || "Failed to search for products",
        variant: "destructive",
      });
    },
  });

  useState(() => {
    if (styleId && !searchMutation.data && !searchMutation.isPending) {
      searchMutation.mutate(styleId);
    }
  });

  const results = searchMutation.data;
  const isLoading = searchMutation.isPending;

  const categoryLabels = {
    upper: "Tops & Shirts",
    lower: "Bottoms & Skirts",
    accessories: "Accessories & Jewelry",
    footwear: "Shoes & Boots",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header wishlistCount={wishlist.length} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin h-12 w-12 border-4 border-accent border-t-transparent rounded-full mx-auto" data-testid="loading-spinner"></div>
            <p className="text-muted-foreground font-display">Searching for perfect products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-background">
        <Header wishlistCount={wishlist.length} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">No results found</p>
            <Button onClick={() => setLocation("/styles")} data-testid="button-back">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Styles
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalProducts = results.upper.length + results.lower.length + results.accessories.length + results.footwear.length;

  return (
    <div className="min-h-screen bg-background">
      <Header wishlistCount={wishlist.length} />
      
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/styles")}
            className="mb-4"
            data-testid="button-back-to-styles"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Styles
          </Button>
          
          <div className="text-center space-y-4 mb-12">
            <div className="flex items-center justify-center gap-3">
              <ShoppingBag className="h-10 w-10 text-accent" />
              <h1 className="font-serif text-4xl md:text-5xl font-bold" data-testid="text-title">
                Shop This Look
              </h1>
            </div>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Found {totalProducts} products across {Object.keys(categoryLabels).length} categories
            </p>
          </div>
        </div>

        <Tabs defaultValue="upper" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8" data-testid="tabs-categories">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <TabsTrigger 
                key={key} 
                value={key}
                data-testid={`tab-${key}`}
              >
                {label}
                <Badge variant="secondary" className="ml-2">
                  {results[key as keyof ProductSearchResponse].length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(categoryLabels).map(([category, label]) => {
            const products = results[category as keyof ProductSearchResponse];
            
            return (
              <TabsContent key={category} value={category} className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="font-serif text-2xl font-semibold mb-2" data-testid={`text-category-${category}`}>
                    {label}
                  </h2>
                  <p className="text-muted-foreground">
                    {products.length} {products.length === 1 ? 'item' : 'items'} found
                  </p>
                </div>

                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground" data-testid={`text-empty-${category}`}>
                      No products found in this category
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product, index) => (
                      <ProductResultCard 
                        key={`${category}-${index}`} 
                        product={product}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}

function ProductResultCard({ product, index }: { product: SearchedProduct, index: number }) {
  return (
    <Card 
      className="group overflow-hidden hover-elevate transition-all duration-300"
      data-testid={`card-product-${product.category}-${index}`}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            data-testid={`img-product-${product.category}-${index}`}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-muted">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 
            className="font-medium text-sm line-clamp-2 min-h-[2.5rem]" 
            data-testid={`text-product-title-${product.category}-${index}`}
          >
            {product.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1" data-testid={`text-source-${product.category}-${index}`}>
            {product.source}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-semibold text-accent text-lg" data-testid={`text-price-${product.category}-${index}`}>
            {product.price}
          </span>
          
          {product.rating && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-accent text-accent" />
              <span>{product.rating.toFixed(1)}</span>
              {product.reviews && <span>({product.reviews})</span>}
            </div>
          )}
        </div>

        <Button 
          variant="outline" 
          className="w-full gap-2"
          onClick={() => window.open(product.link, '_blank')}
          data-testid={`button-view-product-${product.category}-${index}`}
        >
          View Product
          <ExternalLink className="h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  );
}

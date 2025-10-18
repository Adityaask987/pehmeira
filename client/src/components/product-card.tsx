import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
}

export function ProductCard({ product, isWishlisted, onToggleWishlist }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden hover-elevate transition-all duration-300" data-testid={`card-product-${product.id}`}>
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          data-testid={`img-product-${product.id}`}
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-9 w-9 rounded-full bg-card/80 backdrop-blur-sm"
          onClick={() => onToggleWishlist?.(product)}
          data-testid={`button-wishlist-${product.id}`}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isWishlisted ? "fill-accent stroke-accent" : ""
            }`}
          />
        </Button>
        {product.matchPercentage && (
          <Badge
            className="absolute top-2 left-2 bg-accent text-accent-foreground font-display font-semibold"
            data-testid={`badge-match-${product.id}`}
          >
            {product.matchPercentage}% MATCH
          </Badge>
        )}
      </div>
      <CardContent className="p-4 space-y-2">
        <h3 className="font-display font-medium text-sm line-clamp-2" data-testid={`text-product-name-${product.id}`}>
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground" data-testid={`text-retailer-${product.id}`}>
          {product.retailer}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between gap-2">
        <p className="font-display font-semibold text-lg" data-testid={`text-price-${product.id}`}>
          ${product.price}
        </p>
        <Button variant="outline" size="sm" className="font-display text-xs tracking-wide" data-testid={`button-view-${product.id}`}>
          VIEW
        </Button>
      </CardFooter>
    </Card>
  );
}

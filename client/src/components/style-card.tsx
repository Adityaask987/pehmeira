import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Style } from "@shared/schema";

interface StyleCardProps {
  style: Style;
  isWishlisted?: boolean;
  onToggleWishlist?: (style: Style) => void;
  onShopLook?: (style: Style) => void;
}

export function StyleCard({ style, isWishlisted, onToggleWishlist, onShopLook }: StyleCardProps) {
  return (
    <Card className="group overflow-hidden hover-elevate transition-all duration-300" data-testid={`card-style-${style.id}`}>
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={style.image}
          alt={style.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          data-testid={`img-style-${style.id}`}
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm"
          onClick={() => onToggleWishlist?.(style)}
          data-testid={`button-wishlist-style-${style.id}`}
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              isWishlisted ? "fill-accent stroke-accent" : ""
            }`}
          />
        </Button>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
          <Badge variant="outline" className="mb-2 bg-accent/20 backdrop-blur-sm border-accent/50 text-white font-display text-xs" data-testid={`badge-occasion-${style.id}`}>
            {style.occasion}
          </Badge>
        </div>
      </div>
      <CardContent className="p-6 space-y-3">
        <div>
          <h3 className="font-serif text-xl font-semibold mb-1" data-testid={`text-style-name-${style.id}`}>
            {style.name}
          </h3>
          <p className="text-sm text-muted-foreground font-display" data-testid={`text-designer-${style.id}`}>
            Curated by {style.designer}
          </p>
        </div>
        <p className="text-sm leading-relaxed" data-testid={`text-description-${style.id}`}>
          {style.description}
        </p>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button
          className="w-full font-display tracking-wide"
          onClick={() => onShopLook?.(style)}
          data-testid={`button-shop-look-${style.id}`}
        >
          SHOP THIS LOOK
        </Button>
      </CardFooter>
    </Card>
  );
}

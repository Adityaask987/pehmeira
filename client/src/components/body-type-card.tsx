import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import type { BodyType } from "@shared/schema";

interface BodyTypeCardProps {
  bodyType: BodyType;
  selected?: boolean;
  onSelect?: (bodyType: BodyType) => void;
}

const getSilhouetteImage = (illustration: string) => {
  const imageMap: Record<string, string> = {
    // Female silhouettes
    "petite-female": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop&crop=top",
    "slim-female": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop&crop=top",
    "athletic-female": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&crop=top",
    "rectangle-female": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=top",
    "hourglass-female": "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&crop=top",
    "curvy-hourglass-female": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=600&fit=crop&crop=top",
    "pear-female": "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=400&h=600&fit=crop&crop=top",
    "triangle-female": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop&crop=top",
    "sporty-female": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&h=600&fit=crop&crop=top",
    "inverted-triangle-female": "https://images.unsplash.com/photo-1479936343636-73cdc5aae0c3?w=400&h=600&fit=crop&crop=top",
    "apple-female": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=top",
    "round-apple-female": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=top",
    "full-figure-female": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=top",
    "plus-size-female": "https://images.unsplash.com/photo-1499887142886-791eca5918cd?w=400&h=600&fit=crop&crop=top",
    "voluptuous-female": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop&crop=top",
    "curvy-plus-female": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=top",
    // Male silhouettes
    "very-slim-male": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop&crop=top",
    "slim-male": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=top",
    "lean-athletic-male": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=top",
    "rectangle-male": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=600&fit=crop&crop=top",
    "medium-male": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=600&fit=crop&crop=top",
    "triangle-male": "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=600&fit=crop&crop=top",
    "inverted-triangle-male": "https://images.unsplash.com/photo-1502323777036-f29e3972d82f?w=400&h=600&fit=crop&crop=top",
    "broad-shoulder-male": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop&crop=top",
    "trapezoid-male": "https://images.unsplash.com/photo-1496345875659-11f7dd282d1d?w=400&h=600&fit=crop&crop=top",
    "muscular-male": "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=600&fit=crop&crop=top",
    "stocky-male": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&h=600&fit=crop&crop=top",
    "oval-male": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop&crop=top",
    "heavyset-male": "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=400&h=600&fit=crop&crop=top",
    "large-frame-male": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=600&fit=crop&crop=top",
    "plus-size-male": "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=600&fit=crop&crop=top",
  };
  return imageMap[illustration] || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop&crop=top";
};

export function BodyTypeCard({ bodyType, selected, onSelect }: BodyTypeCardProps) {
  return (
    <Card
      className={`relative cursor-pointer transition-all duration-300 bg-card dark:bg-card/50 ${
        selected ? "ring-2 ring-accent border-accent" : "border-border hover-elevate"
      }`}
      onClick={() => onSelect?.(bodyType)}
      data-testid={`card-body-type-${bodyType.id}`}
    >
      {selected && (
        <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
          <Check className="w-4 h-4 text-black" />
        </div>
      )}
      <CardContent className="p-4 space-y-3">
        <div className="aspect-[3/4] flex items-center justify-center bg-background rounded-md overflow-hidden">
          <img
            src={getSilhouetteImage(bodyType.illustration)}
            alt={bodyType.name}
            className="w-full h-full object-cover object-top opacity-60"
            data-testid={`icon-body-type-${bodyType.id}`}
          />
        </div>
        <div className="text-center">
          <h3 className="font-serif font-semibold text-base" data-testid={`text-body-type-name-${bodyType.id}`}>
            {bodyType.name}
          </h3>
        </div>
      </CardContent>
    </Card>
  );
}

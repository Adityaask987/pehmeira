import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import type { BodyType } from "@shared/schema";
import verySlimMale from "@assets/Very Slim_1761223075102.png";
import slimMale from "@assets/Slim_1761223075100.png";
import leanAthleticMale from "@assets/Lean Athletic_1761223075101.png";
import rectangleMale from "@assets/Rectangle_1761223075101.png";
import mediumMale from "@assets/Medium_1761223075103.png";
import triangleMale from "@assets/Triangle_1761223075103.png";
import invertedTriangleMale from "@assets/Inverted Triangle_1761223075101.png";
import broadShoulderMale from "@assets/Broad Shoulder_1761223075104.png";
import trapezoidMale from "@assets/Trapezoid_1761223075099.png";
import muscularMale from "@assets/Muscular_1761223075102.png";
import stockyMale from "@assets/Stocky_1761223075102.png";
import ovalMale from "@assets/Oval_1761223075100.png";
import heavysetMale from "@assets/Heavyset_1761223075103.png";
import largeFrameMale from "@assets/Large frame_1761223075103.png";
import plusSizeMale from "@assets/Plus Size_1761223075100.png";

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
    "very-slim-male": verySlimMale,
    "slim-male": slimMale,
    "lean-athletic-male": leanAthleticMale,
    "rectangle-male": rectangleMale,
    "medium-male": mediumMale,
    "triangle-male": triangleMale,
    "inverted-triangle-male": invertedTriangleMale,
    "broad-shoulder-male": broadShoulderMale,
    "trapezoid-male": trapezoidMale,
    "muscular-male": muscularMale,
    "stocky-male": stockyMale,
    "oval-male": ovalMale,
    "heavyset-male": heavysetMale,
    "large-frame-male": largeFrameMale,
    "plus-size-male": plusSizeMale,
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

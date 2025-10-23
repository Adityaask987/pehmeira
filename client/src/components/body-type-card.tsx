import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import type { BodyType } from "@shared/schema";

// Male body type images
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

// Female body type images
import petiteFemale from "@assets/Petite_1761223629845.png";
import slimFemale from "@assets/Slim_1761223629842.png";
import athleticFemale from "@assets/Athletic_1761223629843.png";
import rectangleFemale from "@assets/Rectangle_1761223629843.png";
import hourglassFemale from "@assets/Hourglass_1761223629844.png";
import curvyHourglassFemale from "@assets/Curvy Hourglass_1761223629843.png";
import pearFemale from "@assets/Pear_1761223629843.png";
import triangleFemale from "@assets/triangle_1761223629844.png";
import sportyFemale from "@assets/Sporty_1761223629845.png";
import invertedTriangleFemale from "@assets/Inverted Triangle_1761223629841.png";
import appleFemale from "@assets/Apple_1761223629841.png";
import roundAppleFemale from "@assets/Round Apple_1761223629845.png";
import fullFigureFemale from "@assets/Full Figure_1761223629846.png";
import plusSizeFemale from "@assets/Plus Size_1761223629842.png";
import voluptuousFemale from "@assets/Voluptuous_1761223629844.png";
import curvyPlusFemale from "@assets/Curvy +_1761223629842.png";

interface BodyTypeCardProps {
  bodyType: BodyType;
  selected?: boolean;
  onSelect?: (bodyType: BodyType) => void;
}

const getSilhouetteImage = (illustration: string) => {
  const imageMap: Record<string, string> = {
    // Female silhouettes
    "petite-female": petiteFemale,
    "slim-female": slimFemale,
    "athletic-female": athleticFemale,
    "rectangle-female": rectangleFemale,
    "hourglass-female": hourglassFemale,
    "curvy-hourglass-female": curvyHourglassFemale,
    "pear-female": pearFemale,
    "triangle-female": triangleFemale,
    "sporty-female": sportyFemale,
    "inverted-triangle-female": invertedTriangleFemale,
    "apple-female": appleFemale,
    "round-apple-female": roundAppleFemale,
    "full-figure-female": fullFigureFemale,
    "plus-size-female": plusSizeFemale,
    "voluptuous-female": voluptuousFemale,
    "curvy-plus-female": curvyPlusFemale,
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
  return imageMap[illustration] || petiteFemale;
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

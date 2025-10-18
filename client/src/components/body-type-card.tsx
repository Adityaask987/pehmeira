import { Card, CardContent } from "@/components/ui/card";
import type { BodyType } from "@shared/schema";

interface BodyTypeCardProps {
  bodyType: BodyType;
  selected?: boolean;
  onSelect?: (bodyType: BodyType) => void;
}

export function BodyTypeCard({ bodyType, selected, onSelect }: BodyTypeCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all duration-300 hover-elevate active-elevate-2 ${
        selected ? "ring-2 ring-accent border-accent" : ""
      }`}
      onClick={() => onSelect?.(bodyType)}
      data-testid={`card-body-type-${bodyType.id}`}
    >
      <CardContent className="p-6 space-y-4">
        <div className="aspect-[3/4] flex items-center justify-center bg-muted rounded-md overflow-hidden">
          <div 
            className="text-8xl font-serif font-bold text-accent/20" 
            data-testid={`icon-body-type-${bodyType.id}`}
          >
            {bodyType.illustration}
          </div>
        </div>
        <div className="text-center space-y-1">
          <h3 className="font-display font-semibold text-lg" data-testid={`text-body-type-name-${bodyType.id}`}>
            {bodyType.name}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-body-type-desc-${bodyType.id}`}>
            {bodyType.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

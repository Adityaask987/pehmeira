import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Briefcase, Coffee, Crown, Heart, Zap, PartyPopper } from "lucide-react";
import type { Occasion } from "@shared/schema";

const OCCASIONS: Occasion[] = [
  {
    id: "casual",
    name: "Casual",
    description: "Everyday comfort with effortless style",
    image: "Coffee",
  },
  {
    id: "business",
    name: "Business",
    description: "Professional and polished workwear",
    image: "Briefcase",
  },
  {
    id: "formal",
    name: "Formal",
    description: "Elegant attire for special events",
    image: "Crown",
  },
  {
    id: "date-night",
    name: "Date Night",
    description: "Romantic and sophisticated looks",
    image: "Heart",
  },
  {
    id: "athleisure",
    name: "Athleisure",
    description: "Sporty comfort meets urban style",
    image: "Zap",
  },
  {
    id: "party",
    name: "Party",
    description: "Stand out with bold, festive fashion",
    image: "PartyPopper",
  },
];

const getOccasionIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    Coffee,
    Briefcase,
    Crown,
    Heart,
    Zap,
    PartyPopper,
  };
  return icons[iconName] || Coffee;
};

export default function OccasionSelection() {
  const [, setLocation] = useLocation();

  const handleOccasionSelect = (occasion: Occasion) => {
    localStorage.setItem("selectedOccasion", occasion.id);
    setLocation("/styles");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="text-center space-y-4 mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-bold" data-testid="text-title">
            Choose Your Occasion
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Select the occasion and discover curated styles designed just for you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {OCCASIONS.map((occasion) => {
            const Icon = getOccasionIcon(occasion.image);
            return (
              <Card
                key={occasion.id}
                className="cursor-pointer hover-elevate active-elevate-2 transition-all duration-300"
                onClick={() => handleOccasionSelect(occasion)}
                data-testid={`card-occasion-${occasion.id}`}
              >
                <CardContent className="p-8 text-center space-y-4">
                  <div className="mx-auto w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mb-4" data-testid={`icon-occasion-${occasion.id}`}>
                    <Icon className="w-12 h-12 text-accent" />
                  </div>
                  <h2 className="font-display text-2xl font-semibold" data-testid={`text-occasion-name-${occasion.id}`}>
                    {occasion.name}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed" data-testid={`text-occasion-desc-${occasion.id}`}>
                    {occasion.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

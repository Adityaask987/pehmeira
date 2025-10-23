import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BodyTypeCard } from "@/components/body-type-card";
import { User, Users } from "lucide-react";
import type { BodyType } from "@shared/schema";

const BODY_TYPES_FEMALE: BodyType[] = [
  { id: "petite", name: "Petite", description: "Small frame with delicate proportions", gender: "female", illustration: "petite-female" },
  { id: "slim", name: "Slim", description: "Narrow build throughout", gender: "female", illustration: "slim-female" },
  { id: "athletic", name: "Athletic", description: "Toned and fit physique", gender: "female", illustration: "athletic-female" },
  { id: "rectangle", name: "Rectangle", description: "Bust, waist, and hips similar width", gender: "female", illustration: "rectangle-female" },
  { id: "hourglass", name: "Hourglass", description: "Balanced bust and hips with defined waist", gender: "female", illustration: "hourglass-female" },
  { id: "curvy-hourglass", name: "Curvy Hourglass", description: "Pronounced curves with defined waist", gender: "female", illustration: "curvy-hourglass-female" },
  { id: "pear", name: "Pear", description: "Hips wider than bust and shoulders", gender: "female", illustration: "pear-female" },
  { id: "triangle", name: "Triangle", description: "Lower body fuller than upper", gender: "female", illustration: "triangle-female" },
  { id: "sporty", name: "Sporty", description: "Athletic with minimal curves", gender: "female", illustration: "sporty-female" },
  { id: "inverted-triangle", name: "Inverted Triangle", description: "Shoulders broader than hips", gender: "female", illustration: "inverted-triangle-female" },
  { id: "apple", name: "Apple", description: "Bust wider than hips, fuller midsection", gender: "female", illustration: "apple-female" },
  { id: "round-apple", name: "Round Apple", description: "Rounded midsection", gender: "female", illustration: "round-apple-female" },
  { id: "full-figure", name: "Full Figure", description: "Balanced proportions with fuller build", gender: "female", illustration: "full-figure-female" },
  { id: "plus-size", name: "Plus Size", description: "Curvy with generous proportions", gender: "female", illustration: "plus-size-female" },
  { id: "voluptuous", name: "Voluptuous", description: "Full curves throughout", gender: "female", illustration: "voluptuous-female" },
  { id: "curvy-plus", name: "Curvy Plus", description: "Plus size with pronounced curves", gender: "female", illustration: "curvy-plus-female" },
];

const BODY_TYPES_MALE: BodyType[] = [
  { id: "very-slim", name: "Very Slim", description: "Extremely lean build", gender: "male", illustration: "very-slim-male" },
  { id: "slim", name: "Slim", description: "Narrow frame throughout", gender: "male", illustration: "slim-male" },
  { id: "lean-athletic", name: "Lean Athletic", description: "Fit with low body fat", gender: "male", illustration: "lean-athletic-male" },
  { id: "rectangle-male", name: "Rectangle", description: "Shoulders and waist similar width", gender: "male", illustration: "rectangle-male" },
  { id: "medium", name: "Medium", description: "Average proportions", gender: "male", illustration: "medium-male" },
  { id: "triangle", name: "Triangle", description: "Lower body fuller than upper", gender: "male", illustration: "triangle-male" },
  { id: "inverted-triangle-male", name: "Inverted Triangle", description: "Wide shoulders, narrow hips", gender: "male", illustration: "inverted-triangle-male" },
  { id: "broad-shoulder", name: "Broad Shoulder", description: "Wide upper body frame", gender: "male", illustration: "broad-shoulder-male" },
  { id: "trapezoid", name: "Trapezoid", description: "Broad shoulders, narrow waist", gender: "male", illustration: "trapezoid-male" },
  { id: "muscular", name: "Muscular", description: "Well-developed muscle mass", gender: "male", illustration: "muscular-male" },
  { id: "stocky", name: "Stocky", description: "Compact and solid build", gender: "male", illustration: "stocky-male" },
  { id: "oval", name: "Oval", description: "Fuller midsection, rounded shape", gender: "male", illustration: "oval-male" },
  { id: "heavyset", name: "Heavyset", description: "Larger overall frame", gender: "male", illustration: "heavyset-male" },
  { id: "large-frame", name: "Large Frame", description: "Broad build with size", gender: "male", illustration: "large-frame-male" },
  { id: "plus-size-male", name: "Plus Size", description: "Generous proportions", gender: "male", illustration: "plus-size-male" },
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"gender" | "bodyType">("gender");
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [selectedBodyType, setSelectedBodyType] = useState<BodyType | null>(null);

  const handleGenderSelect = (gender: string) => {
    setSelectedGender(gender);
    setStep("bodyType");
  };

  const handleBodyTypeSelect = (bodyType: BodyType) => {
    setSelectedBodyType(bodyType);
  };

  const handleContinue = async () => {
    if (selectedBodyType && selectedGender) {
      try {
        const response = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: `user_${Date.now()}`,
            gender: selectedGender,
            bodyType: selectedBodyType.id,
          }),
        });
        
        const user = await response.json();
        localStorage.setItem("userId", user.id);
        localStorage.setItem("userGender", selectedGender);
        localStorage.setItem("userBodyType", selectedBodyType.id);
        setLocation("/occasions");
      } catch (error) {
        console.error("Error creating user:", error);
      }
    }
  };

  const bodyTypes = selectedGender === "female" ? BODY_TYPES_FEMALE : BODY_TYPES_MALE;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-20">
        {step === "gender" && (
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h1 className="font-serif text-4xl md:text-6xl font-bold" data-testid="text-welcome">
                Welcome to StyleCurate
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Let's personalize your styling experience. First, select your gender preference.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <Card
                className="cursor-pointer hover-elevate active-elevate-2 transition-all duration-300"
                onClick={() => handleGenderSelect("female")}
                data-testid="card-gender-female"
              >
                <CardContent className="p-12 text-center space-y-4">
                  <div className="mx-auto w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
                    <User className="w-10 h-10 text-accent" />
                  </div>
                  <h2 className="font-display text-2xl font-semibold">Women's</h2>
                  <p className="text-muted-foreground">
                    Explore curated styles for women
                  </p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover-elevate active-elevate-2 transition-all duration-300"
                onClick={() => handleGenderSelect("male")}
                data-testid="card-gender-male"
              >
                <CardContent className="p-12 text-center space-y-4">
                  <div className="mx-auto w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
                    <Users className="w-10 h-10 text-accent" />
                  </div>
                  <h2 className="font-display text-2xl font-semibold">Men's</h2>
                  <p className="text-muted-foreground">
                    Discover tailored looks for men
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {step === "bodyType" && (
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <Button
                variant="ghost"
                onClick={() => setStep("gender")}
                className="mb-4 font-display"
                data-testid="button-back"
              >
                ← Back
              </Button>
              <h1 className="font-serif text-4xl md:text-5xl font-bold" data-testid="text-body-type-title">
                Select Your Body Type
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Choose the shape that best describes your figure. This helps us recommend styles that flatter you most.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {bodyTypes.map((bodyType) => (
                <BodyTypeCard
                  key={bodyType.id}
                  bodyType={bodyType}
                  selected={selectedBodyType?.id === bodyType.id}
                  onSelect={handleBodyTypeSelect}
                />
              ))}
            </div>

            {selectedBodyType && (
              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleContinue}
                  className="px-12 font-display tracking-wide text-base"
                  data-testid="button-continue"
                >
                  CONTINUE
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

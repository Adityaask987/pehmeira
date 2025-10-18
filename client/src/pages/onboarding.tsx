import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BodyTypeCard } from "@/components/body-type-card";
import { User, Users } from "lucide-react";
import type { BodyType } from "@shared/schema";

const BODY_TYPES_FEMALE: BodyType[] = [
  {
    id: "hourglass",
    name: "Hourglass",
    description: "Balanced bust and hips with defined waist",
    gender: "female",
    illustration: "H",
  },
  {
    id: "pear",
    name: "Pear",
    description: "Hips wider than bust and shoulders",
    gender: "female",
    illustration: "A",
  },
  {
    id: "apple",
    name: "Apple",
    description: "Bust wider than hips, fuller midsection",
    gender: "female",
    illustration: "O",
  },
  {
    id: "rectangle",
    name: "Rectangle",
    description: "Bust, waist, and hips similar width",
    gender: "female",
    illustration: "I",
  },
  {
    id: "inverted-triangle",
    name: "Inverted Triangle",
    description: "Shoulders broader than hips",
    gender: "female",
    illustration: "V",
  },
];

const BODY_TYPES_MALE: BodyType[] = [
  {
    id: "rectangle-male",
    name: "Rectangle",
    description: "Shoulders and waist similar width",
    gender: "male",
    illustration: "I",
  },
  {
    id: "trapezoid-male",
    name: "Trapezoid",
    description: "Broad shoulders, narrow waist",
    gender: "male",
    illustration: "T",
  },
  {
    id: "inverted-triangle-male",
    name: "Inverted Triangle",
    description: "Wide shoulders, narrow hips",
    gender: "male",
    illustration: "V",
  },
  {
    id: "oval-male",
    name: "Oval",
    description: "Fuller midsection, rounded shape",
    gender: "male",
    illustration: "O",
  },
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

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
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

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import { updateUserProfileSchema } from "@shared/schema";
import { ArrowLeft, Save, User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const profileFormSchema = z.object({
  shirtSize: z.string().optional(),
  pantSize: z.string().optional(),
  shoeSize: z.string().optional(),
  favoriteBrands: z.array(z.string()).optional(),
  minBudget: z.number().min(0).optional(),
  maxBudget: z.number().min(0).optional(),
}).refine(
  (data) => {
    if (data.minBudget !== undefined && data.maxBudget !== undefined) {
      return data.minBudget <= data.maxBudget;
    }
    return true;
  },
  {
    message: "Minimum budget must be less than or equal to maximum budget",
    path: ["minBudget"],
  }
);

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function Profile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const userId = localStorage.getItem("userId") || "default-user";

  const { data: wishlist = [] } = useQuery<any[]>({
    queryKey: ["/api/wishlist", userId],
  });

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/users", userId],
  });

  const [brandInput, setBrandInput] = useState("");

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      shirtSize: "",
      pantSize: "",
      shoeSize: "",
      favoriteBrands: [],
      minBudget: 0,
      maxBudget: 1000,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        shirtSize: user.shirtSize || "",
        pantSize: user.pantSize || "",
        shoeSize: user.shoeSize || "",
        favoriteBrands: user.favoriteBrands || [],
        minBudget: user.minBudget || 0,
        maxBudget: user.maxBudget || 1000,
      });
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      return apiRequest("PATCH", `/api/users/${userId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId] });
      toast({
        title: "Profile updated",
        description: "Your preferences have been saved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleAddBrand = () => {
    const currentBrands = form.getValues("favoriteBrands") || [];
    if (brandInput.trim() && !currentBrands.includes(brandInput.trim())) {
      form.setValue("favoriteBrands", [...currentBrands, brandInput.trim()]);
      setBrandInput("");
    }
  };

  const handleRemoveBrand = (brand: string) => {
    const currentBrands = form.getValues("favoriteBrands") || [];
    form.setValue("favoriteBrands", currentBrands.filter(b => b !== brand));
  };

  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header wishlistCount={wishlist.length} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin h-12 w-12 border-4 border-accent border-t-transparent rounded-full mx-auto" data-testid="loading-spinner"></div>
            <p className="text-muted-foreground font-display">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header wishlistCount={wishlist.length} />
      
      <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/wishlist")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold" data-testid="text-page-title">
                My Profile
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Personalize your style preferences for better recommendations
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card data-testid="card-user-info">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <CardTitle className="font-serif">Your Details</CardTitle>
                    <CardDescription>Basic profile information</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Username</Label>
                  <p className="text-lg font-display mt-1" data-testid="text-username">{user?.username}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Gender</Label>
                  <p className="text-lg font-display mt-1 capitalize" data-testid="text-gender">{user?.gender}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Body Type</Label>
                  <p className="text-lg font-display mt-1 capitalize" data-testid="text-body-type">
                    {user?.bodyType?.replace(/-/g, ' ')}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-wishlist-stats">
              <CardHeader>
                <CardTitle className="font-serif">Your Activity</CardTitle>
                <CardDescription>Wishlist statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Total Wishlist Items</Label>
                  <p className="text-3xl font-serif font-bold text-accent mt-1" data-testid="text-wishlist-count">
                    {wishlist.length}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Styles</Label>
                    <p className="text-xl font-display mt-1" data-testid="text-styles-count">
                      {wishlist.filter(item => item.itemType === "style").length}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Products</Label>
                    <p className="text-xl font-display mt-1" data-testid="text-products-count">
                      {wishlist.filter(item => item.itemType === "product").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card data-testid="card-preferences">
            <CardHeader>
              <CardTitle className="font-serif">Style Preferences</CardTitle>
              <CardDescription>Help us find the perfect fit and styles for you</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="shirtSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shirt Size</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., M, L, XL" {...field} data-testid="input-shirt-size" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pantSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pant Size</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 32, 34, 36" {...field} data-testid="input-pant-size" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="shoeSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shoe Size</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 9, 10, 11" {...field} data-testid="input-shoe-size" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brandInput">Favorite Brands</Label>
                    <div className="flex gap-2">
                      <Input
                        id="brandInput"
                        placeholder="Add a brand you love..."
                        value={brandInput}
                        onChange={(e) => setBrandInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddBrand())}
                        data-testid="input-brand"
                      />
                      <Button
                        type="button"
                        onClick={handleAddBrand}
                        variant="outline"
                        data-testid="button-add-brand"
                      >
                        Add
                      </Button>
                    </div>
                    {(form.watch("favoriteBrands")?.length || 0) > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3" data-testid="container-brands">
                        {form.watch("favoriteBrands")?.map((brand) => (
                          <Badge
                            key={brand}
                            variant="secondary"
                            className="px-3 py-1.5 cursor-pointer hover-elevate"
                            onClick={() => handleRemoveBrand(brand)}
                            data-testid={`badge-brand-${brand.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            {brand} ×
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Label>Budget Range</Label>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="minBudget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-muted-foreground">Minimum ($)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                data-testid="input-min-budget"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="maxBudget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-muted-foreground">Maximum ($)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                data-testid="input-max-budget"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormDescription>
                      Price range: ${form.watch("minBudget") || 0} - ${form.watch("maxBudget") || 0}
                    </FormDescription>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLocation("/wishlist")}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="px-8"
                      data-testid="button-save"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateProfileMutation.isPending ? "Saving..." : "Save Preferences"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStyleSchema, type Style, type InsertStyle } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

// Body type options for female
const FEMALE_BODY_TYPES = [
  { value: "petite", label: "Petite" },
  { value: "slim", label: "Slim" },
  { value: "athletic", label: "Athletic" },
  { value: "rectangle", label: "Rectangle" },
  { value: "hourglass", label: "Hourglass" },
  { value: "curvy-hourglass", label: "Curvy Hourglass" },
  { value: "pear", label: "Pear" },
  { value: "triangle", label: "Triangle" },
  { value: "sporty", label: "Sporty" },
  { value: "inverted-triangle", label: "Inverted Triangle" },
  { value: "apple", label: "Apple" },
  { value: "round-apple", label: "Round Apple" },
  { value: "full-figure", label: "Full Figure" },
  { value: "plus-size", label: "Plus Size" },
  { value: "voluptuous", label: "Voluptuous" },
  { value: "curvy-plus", label: "Curvy Plus" },
];

// Body type options for male
const MALE_BODY_TYPES = [
  { value: "very-slim", label: "Very Slim" },
  { value: "slim", label: "Slim" },
  { value: "lean-athletic", label: "Lean Athletic" },
  { value: "rectangle-male", label: "Rectangle" },
  { value: "medium", label: "Medium" },
  { value: "triangle", label: "Triangle" },
  { value: "inverted-triangle-male", label: "Inverted Triangle" },
  { value: "broad-shoulder", label: "Broad Shoulder" },
  { value: "trapezoid", label: "Trapezoid" },
  { value: "muscular", label: "Muscular" },
  { value: "stocky", label: "Stocky" },
  { value: "oval", label: "Oval" },
  { value: "heavyset", label: "Heavyset" },
  { value: "large-frame", label: "Large Frame" },
  { value: "plus-size-male", label: "Plus Size" },
];

export default function AdminPage() {
  const { user, firebaseUser, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStyle, setEditingStyle] = useState<Style | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  // Centralized admin request handler
  const adminFetch = async (url: string, options?: RequestInit): Promise<Response> => {
    let token: string;
    
    try {
      token = await firebaseUser?.getIdToken() || '';
    } catch (error) {
      // Token acquisition failed - treat as unauthorized
      setIsUnauthorized(true);
      queryClient.invalidateQueries({ queryKey: ["/api/admin"] });
      setLocation("/");
      throw new Error("Failed to acquire authentication token");
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401 || response.status === 403) {
      setIsUnauthorized(true);
      queryClient.invalidateQueries({ queryKey: ["/api/admin"] });
      setLocation("/");
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Request failed");
    }

    return response;
  };

  // Redirect non-admin users safely via effect
  useEffect(() => {
    if (!loading && user && !user.isAdmin) {
      setIsUnauthorized(true);
      setLocation("/");
    }
  }, [loading, user, setLocation]);

  const { data: styles, isLoading, error } = useQuery<Style[]>({
    queryKey: ["/api/admin/styles"],
    enabled: !!user?.isAdmin && !!firebaseUser && !isUnauthorized,
    queryFn: async () => {
      const response = await adminFetch("/api/admin/styles");
      return response.json();
    },
  });

  const form = useForm<InsertStyle>({
    resolver: zodResolver(insertStyleSchema),
    defaultValues: {
      name: "",
      designer: "",
      description: "",
      occasion: "",
      bodyType: "",
      gender: "",
      image: "",
      products: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertStyle) => {
      const response = await adminFetch("/api/admin/styles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/styles"] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Style created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertStyle> }) => {
      const response = await adminFetch(`/api/admin/styles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/styles"] });
      setIsDialogOpen(false);
      setEditingStyle(null);
      form.reset();
      toast({ title: "Style updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await adminFetch(`/api/admin/styles/${id}`, {
        method: "DELETE",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/styles"] });
      toast({ title: "Style deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Reset body type when gender changes to avoid invalid combinations
  // Skip clearing on initial form reset during edit to preserve existing values
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      // Only reset bodyType if gender changes AND we're not in the middle of a form reset
      if (name === "gender" && type === "change") {
        const currentBodyType = form.getValues("bodyType");
        const currentGender = value.gender;
        
        // Only clear if bodyType doesn't match the new gender's options
        if (currentBodyType && currentGender) {
          const validOptions = currentGender === "female" 
            ? FEMALE_BODY_TYPES.map(bt => bt.value)
            : MALE_BODY_TYPES.map(bt => bt.value);
          
          if (!validOptions.includes(currentBodyType)) {
            form.setValue("bodyType", "");
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      let token: string;
      try {
        token = await firebaseUser?.getIdToken() || '';
      } catch (error) {
        // Token acquisition failed - treat as unauthorized
        setIsUnauthorized(true);
        queryClient.invalidateQueries({ queryKey: ["/api/admin"] });
        setLocation("/");
        throw new Error("Failed to acquire authentication token");
      }

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 401 || response.status === 403) {
        setIsUnauthorized(true);
        queryClient.invalidateQueries({ queryKey: ["/api/admin"] });
        setLocation("/");
        throw new Error("Unauthorized");
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Upload failed");
      }

      const data = await response.json();
      form.setValue("image", data.url);
      toast({ title: "Image uploaded successfully" });
    } catch (error: any) {
      // Only show error toast for non-authorization errors
      if (!error.message.includes("authentication token") && !error.message.includes("Unauthorized")) {
        toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = (data: InsertStyle) => {
    if (editingStyle) {
      updateMutation.mutate({ id: editingStyle.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (style: Style) => {
    setEditingStyle(style);
    form.reset({
      name: style.name,
      designer: style.designer,
      description: style.description,
      occasion: style.occasion,
      bodyType: style.bodyType,
      gender: style.gender,
      image: style.image,
      products: style.products,
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingStyle(null);
    form.reset({
      name: "",
      designer: "",
      description: "",
      occasion: "",
      bodyType: "",
      gender: "",
      image: "",
      products: [],
    });
    setIsDialogOpen(true);
  };

  // Don't render anything if unauthorized or redirecting
  if (isUnauthorized) {
    return null;
  }

  // Show loading state while auth is resolving
  if (loading || !firebaseUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gold">Loading...</p>
      </div>
    );
  }

  // Don't render anything if not admin
  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-serif text-gold">Admin Panel</h1>
          <Button
            onClick={handleAddNew}
            disabled={loading || !firebaseUser || isUnauthorized}
            className="bg-gold text-black hover:bg-gold/90"
            data-testid="button-add-style"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Style
          </Button>
        </div>

        {isLoading ? (
          <p className="text-gray-400">Loading styles...</p>
        ) : error ? (
          <p className="text-red-500">Error loading styles: {(error as Error).message}</p>
        ) : !styles || styles.length === 0 ? (
          <p className="text-gray-400">No styles found. Click "Add Style" to create your first style.</p>
        ) : (
          <div className="grid gap-6">
            {styles.map((style) => (
              <Card key={style.id} className="bg-zinc-900 border-gold/20 p-6" data-testid={`card-style-${style.id}`}>
                <div className="flex gap-6">
                  <img
                    src={style.image}
                    alt={style.name}
                    className="w-32 h-32 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-serif text-gold mb-2">{style.name}</h3>
                    <p className="text-gray-400 text-sm mb-1">Designer: {style.designer}</p>
                    <p className="text-gray-500 text-sm mb-2">{style.description}</p>
                    <div className="flex gap-4 text-sm text-gray-400">
                      <span>Occasion: {style.occasion}</span>
                      <span>Body Type: {style.bodyType}</span>
                      <span>Gender: {style.gender}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(style)}
                      disabled={!firebaseUser || isUnauthorized}
                      className="border-gold/20 text-gold hover:bg-gold/10"
                      data-testid={`button-edit-${style.id}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMutation.mutate(style.id)}
                      disabled={!firebaseUser || deleteMutation.isPending || isUnauthorized}
                      className="border-red-500/20 text-red-500 hover:bg-red-500/10"
                      data-testid={`button-delete-${style.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-zinc-900 border-gold/20 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-gold font-serif">
                {editingStyle ? "Edit Style" : "Add New Style"}
              </DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Style Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-black border-gold/20" data-testid="input-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="designer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designer</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-black border-gold/20" data-testid="input-designer" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="bg-black border-gold/20" data-testid="input-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black border-gold/20" data-testid="select-gender">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-zinc-900 border-gold/20">
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="male">Male</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="occasion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occasion</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black border-gold/20" data-testid="select-occasion">
                              <SelectValue placeholder="Select occasion" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-zinc-900 border-gold/20">
                            <SelectItem value="casual">Casual</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="formal">Formal</SelectItem>
                            <SelectItem value="date-night">Date Night</SelectItem>
                            <SelectItem value="party">Party</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bodyType"
                  render={({ field }) => {
                    const selectedGender = form.watch("gender");
                    const bodyTypeOptions = selectedGender === "female" ? FEMALE_BODY_TYPES : selectedGender === "male" ? MALE_BODY_TYPES : [];
                    
                    return (
                      <FormItem>
                        <FormLabel>Body Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={!selectedGender}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-black border-gold/20" data-testid="select-bodytype">
                              <SelectValue placeholder={selectedGender ? "Select body type" : "Select gender first"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-zinc-900 border-gold/20 max-h-80 overflow-y-auto">
                            {bodyTypeOptions.map((bodyType) => (
                              <SelectItem key={bodyType.value} value={bodyType.value}>
                                {bodyType.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <div>
                  <Label>Image</Label>
                  <div className="mt-2 space-y-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      disabled={uploadingImage}
                      className="bg-black border-gold/20"
                      data-testid="input-image-upload"
                    />
                    {form.watch("image") && (
                      <img
                        src={form.watch("image")}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded"
                      />
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingStyle(null);
                      form.reset();
                    }}
                    className="border-gold/20 text-gold"
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!firebaseUser || createMutation.isPending || updateMutation.isPending || isUnauthorized}
                    className="bg-gold text-black hover:bg-gold/90"
                    data-testid="button-submit"
                  >
                    {editingStyle ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

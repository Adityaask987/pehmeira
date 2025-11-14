import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Onboarding from "@/pages/onboarding";
import OccasionSelection from "@/pages/occasion-selection";
import StyleRecommendations from "@/pages/style-recommendations";
import Products from "@/pages/products";
import RetailProducts from "@/pages/retail-products";
import ProductResults from "@/pages/product-results";
import Wishlist from "@/pages/wishlist";
import Profile from "@/pages/profile";
import Auth from "@/pages/auth";
import AdminPage from "@/pages/admin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Onboarding} />
      <Route path="/auth" component={Auth} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/occasions" component={OccasionSelection} />
      <Route path="/styles" component={StyleRecommendations} />
      <Route path="/products" component={Products} />
      <Route path="/retail-products" component={RetailProducts} />
      <Route path="/product-results/:styleId" component={ProductResults} />
      <Route path="/wishlist" component={Wishlist} />
      <Route path="/profile" component={Profile} />
      <Route component={Onboarding} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

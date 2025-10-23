import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Onboarding from "@/pages/onboarding";
import OccasionSelection from "@/pages/occasion-selection";
import StyleRecommendations from "@/pages/style-recommendations";
import Products from "@/pages/products";
import RetailProducts from "@/pages/retail-products";
import Wishlist from "@/pages/wishlist";
import Profile from "@/pages/profile";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Onboarding} />
      <Route path="/occasions" component={OccasionSelection} />
      <Route path="/styles" component={StyleRecommendations} />
      <Route path="/products" component={Products} />
      <Route path="/retail-products" component={RetailProducts} />
      <Route path="/wishlist" component={Wishlist} />
      <Route path="/profile" component={Profile} />
      <Route component={Onboarding} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

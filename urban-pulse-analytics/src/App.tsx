import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FilterProvider } from "@/contexts/FilterContext";
import Index from "./pages/Index";
import Comparison from "./pages/Comparison";
import CostIncome from "./pages/CostIncome";
import IndexBuilder from "./pages/IndexBuilder";
import Trends from "./pages/Trends";
import Insights from "./pages/Insights";
import Methodology from "./pages/Methodology";
import NotFound from "./pages/NotFound";

import Login from "./pages/Login"; // Import Login Page
import Settings from "./pages/Settings"; // Import Settings Page

import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <FilterProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} /> {/* New Login Route */}
              <Route path="/settings" element={<Settings />} /> {/* Settings Route */}
              <Route path="/comparison" element={<Comparison />} />
              <Route path="/cost-income" element={<CostIncome />} />
              <Route path="/index-builder" element={<IndexBuilder />} />
              <Route path="/trends" element={<Trends />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/methodology" element={<Methodology />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </FilterProvider>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

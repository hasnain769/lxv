import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { Auth0ProviderWithNavigate } from "@/components/auth/Auth0ProviderWithNavigate";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import Index from "./pages/Index";
import Settings from "./pages/Settings";
import Certification from "./pages/Certification";
import CertificationDetail from "./pages/CertificationDetail";
import ModuleLibrary from "./pages/ModuleLibrary";
import ModuleDetail from "./pages/ModuleDetail";
import ReadingMaterialDetail from "./pages/ReadingMaterialDetail";
import SpeakersCreators from "./pages/SpeakersCreators";
import ScenarioDetail from "./pages/ScenarioDetail";
import ScenarioGame from "./pages/ScenarioGame";
import ScenarioEvaluation from "./pages/ScenarioEvaluation";
import ExpertConsultants from "./pages/ExpertConsultants";
import MyModules from "./pages/MyModules";
import NotFound from "./pages/NotFound";
import TermsOfConditions from "./pages/TermsOfConditions";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SubscriptionProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Auth0ProviderWithNavigate>
            <Routes>
              {/* Unprotected or Special Routes */}
              <Route path="/terms" element={<TermsOfConditions />} />
              
              {/* Protected Routes */}
              <Route path="/" element={<Navigate to="/library" replace />} />
              <Route path="/my-modules" element={<ProtectedRoute component={MyModules} />} />
              <Route path="/settings" element={<ProtectedRoute component={Settings} />} />
              <Route path="/certification" element={<ProtectedRoute component={Certification} />} />
              <Route path="/certification/:id" element={<ProtectedRoute component={CertificationDetail} />} />
              <Route path="/library" element={<ProtectedRoute component={ModuleLibrary} />} />
              <Route path="/library/:id" element={<ProtectedRoute component={ModuleDetail} />} />
              <Route path="/library/:id/reading/:materialId" element={<ProtectedRoute component={ReadingMaterialDetail} />} />
              <Route path="/library/:id/speakers" element={<ProtectedRoute component={SpeakersCreators} />} />
              <Route path="/library/:id/scenario/:scenarioId" element={<ProtectedRoute component={ScenarioDetail} />} />
              <Route path="/library/:id/scenario/:scenarioId/play" element={<ProtectedRoute component={ScenarioGame} />} />
              <Route path="/library/:id/scenario/:scenarioId/experts" element={<ProtectedRoute component={ExpertConsultants} />} />
              <Route path="/library/:id/scenario/:scenarioId/evaluation" element={<ProtectedRoute component={ScenarioEvaluation} />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Auth0ProviderWithNavigate>
        </BrowserRouter>
      </TooltipProvider>
    </SubscriptionProvider>
  </QueryClientProvider>
);

export default App;

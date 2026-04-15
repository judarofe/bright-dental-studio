import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider } from "@/data/StoreContext";
import { AppLayout } from "@/components/AppLayout";
import { FloatingAction } from "@/components/FloatingAction";
import Dashboard from "./pages/Dashboard";
import Agenda from "./pages/Agenda";
import Patients from "./pages/Patients";
import PatientDetail from "./pages/PatientDetail";
import Payments from "./pages/Payments";
import ClinicalHistory from "./pages/ClinicalHistory";
import QuickNotes from "./pages/QuickNotes";
import History from "./pages/History";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import ClinicalWorkspace from "./pages/ClinicalWorkspace";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <StoreProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/patients/:id" element={<PatientDetail />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/clinical" element={<ClinicalHistory />} />
              <Route path="/notes" element={<QuickNotes />} />
              <Route path="/history" element={<History />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
          <FloatingAction />
        </BrowserRouter>
      </StoreProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

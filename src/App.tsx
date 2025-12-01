import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import UserDetails from "./pages/UserDetails";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import EditPart from "./pages/EditPart.tsx";
import EditMerchandise from "./pages/EditMerchandise.tsx";
import CreatePart from "./pages/CreatePart.tsx";
import Manufacturers from "./pages/Manufacturers.tsx";
import Categories from "./pages/Categories";
import Partners from "./pages/Partners";
import Feedback from "./pages/Feedback";
import Ambassadors from "./pages/Ambassadors";
import NotFound from "./pages/NotFound";
import { authApi } from "@/lib/api";
import OrderDetails from "./pages/OrderDetails.tsx";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const validateAuth = async () => {
      // First check if token exists
      if (!authApi.isAuthenticated()) {
        setIsAuthenticated(false);
        return;
      }

      // Then validate the token by making an API call
      const isValid = await authApi.validateToken();
      setIsAuthenticated(isValid);
    };

    validateAuth();

    // Listen for invalid token events from API requests
    const handleInvalidToken = () => {
      setIsAuthenticated(false);
    };
    window.addEventListener('auth:invalid-token', handleInvalidToken);

    return () => {
      window.removeEventListener('auth:invalid-token', handleInvalidToken);
    };
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const validateAuth = async () => {
      // First check if token exists
      if (!authApi.isAuthenticated()) {
        setIsAuthenticated(false);
        return;
      }

      // Then validate the token by making an API call
      const isValid = await authApi.validateToken();
      setIsAuthenticated(isValid);
    };

    validateAuth();
    
    // Listen for storage changes (e.g., when token is set in another tab)
    const handleStorageChange = async () => {
      if (authApi.isAuthenticated()) {
        const isValid = await authApi.validateToken();
        setIsAuthenticated(isValid);
      } else {
        setIsAuthenticated(false);
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Listen for invalid token events from API requests
    const handleInvalidToken = () => {
      setIsAuthenticated(false);
    };
    window.addEventListener('auth:invalid-token', handleInvalidToken);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener('auth:invalid-token', handleInvalidToken);
    };
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full bg-background">
                      <AdminSidebar />
                      <div className="flex flex-1 flex-col">
                        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-card/50 px-4 sm:px-6 backdrop-blur-sm">
                          <SidebarTrigger />
                          <div className="flex-1" />
                        </header>
                        <main className="flex-1 p-4 sm:p-6">
                          <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/users" element={<Users />} />
                            <Route path="/users/:id" element={<UserDetails />} />
                            <Route path="/orders" element={<Orders />} />
                            <Route path="/orders/:id" element={<OrderDetails />} />
                            <Route path="/products" element={<Products />} />
                            <Route path="/products/parts/new" element={<CreatePart />} />
                            <Route path="/products/parts/:id" element={<EditPart />} />
                            <Route path="/products/merchandise/:id" element={<EditMerchandise />} />
                            <Route path="/manufacturers" element={<Manufacturers />} />
                            <Route path="/categories" element={<Categories />} />
                            <Route path="/partners" element={<Partners />} />
                            <Route path="/feedback" element={<Feedback />} />
                            <Route path="/ambassadors" element={<Ambassadors />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </main>
                      </div>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

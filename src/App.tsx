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
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import EditPart from "./pages/EditPart.tsx";
import EditMerchandise from "./pages/EditMerchandise.tsx";
import CreatePart from "./pages/CreatePart.tsx";
import Brands from "./pages/Brands";
import Categories from "./pages/Categories";
import Feedback from "./pages/Feedback";
import Ambassadors from "./pages/Ambassadors";
import NotFound from "./pages/NotFound";
import { authApi } from "@/lib/api";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    setIsAuthenticated(authApi.isAuthenticated());
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
    setIsAuthenticated(authApi.isAuthenticated());
    
    // Listen for storage changes (e.g., when token is set in another tab)
    const handleStorageChange = () => {
      setIsAuthenticated(authApi.isAuthenticated());
    };
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
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
                        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-card/50 px-6 backdrop-blur-sm">
                          <SidebarTrigger />
                          <div className="flex-1" />
                        </header>
                        <main className="flex-1 p-6">
                          <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/users" element={<Users />} />
                            <Route path="/orders" element={<Orders />} />
                            <Route path="/products" element={<Products />} />
                            <Route path="/products/parts/new" element={<CreatePart />} />
                            <Route path="/products/parts/:id" element={<EditPart />} />
                            <Route path="/products/merchandise/:id" element={<EditMerchandise />} />
                            <Route path="/brands" element={<Brands />} />
                            <Route path="/categories" element={<Categories />} />
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

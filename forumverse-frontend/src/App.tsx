import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserProvider } from "./contexts/UserContext";
import { PostProvider } from "./contexts/PostContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { useAuth } from "./hooks/useAuth";
import { useUser } from "./hooks/useUser";
import { Navbar } from "@/components/Navbar";

// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Feed = lazy(() => import("./pages/Feed"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const CreatePost = lazy(() => import("./pages/CreatePost"));
const PostDetail = lazy(() => import("./pages/PostDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const VerifiedEmailSent = lazy(() => import("./pages/VerifyEmailSent"));
const VerifiedSuccess = lazy(() => import("./pages/VerifiedSuccess"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex justify-center items-center min-h-[400px]">
    <div className="w-8 h-8 border-4 border-t-transparent border-primary rounded-full animate-spin" />
  </div>
);

const queryClient = new QueryClient();

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const {profile} = useUser()

   if (loading && !profile) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email-sent" element={<VerifiedEmailSent />} />
          <Route path="/verify-success" element={<VerifiedSuccess />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/create" element={<CreatePost />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="*" element={<Feed />} />
      </Routes>
    </Suspense>
  );

}

const App = () => (
  
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <NotificationProvider>
          <UserProvider>
            <PostProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <div className="min-h-screen bg-background">
                  <Navbar />
                  <main className="container mx-auto px-4 py-8">
                    <AppContent />  
                  </main>
                 
                </div>
              </BrowserRouter>
            </PostProvider>
          </UserProvider>
        </NotificationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserProvider } from "./contexts/UserContext";
import { PostProvider } from "./contexts/PostContext";
import { useAuth } from "./hooks/useAuth";
import { useUser } from "./hooks/useUser";
import { Navbar } from "@/components/Navbar";

// Pages
import Index from "./pages/Index";
import Feed from "./pages/Feed";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreatePost from "./pages/CreatePost";
import PostDetail from "./pages/PostDetail";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import VerifiedEmailSent from "./pages/VerifyEmailSent";
import VerifiedSuccess from "./pages/VerifiedSuccess";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const {profile} = useUser()

   if (loading && !profile) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email-sent" element={<VerifiedEmailSent />} />
        <Route path="/verify-success" element={<VerifiedSuccess />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/feed" element={<Feed />} />
      <Route path="/create" element={<CreatePost />} />
      <Route path="/post/:id" element={<PostDetail />} />
      <Route path="/profile/:id" element={<Profile />} />
    </Routes>
  );

}

const App = () => (
  
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
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
        
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

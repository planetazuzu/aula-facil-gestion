
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import WaitingList from "./pages/WaitingList";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Messages from "./pages/Messages";
import Enrollments from "./pages/Enrollments";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import CoursesAdmin from "./pages/admin/CoursesAdmin";
import UsersAdmin from "./pages/admin/UsersAdmin";
import Notifications from "./pages/Notifications";
import Ratings from "./pages/Ratings";
import Statistics from "./pages/admin/Statistics";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:courseId" element={<CourseDetail />} />
            <Route path="/waitlist" element={<WaitingList />} />
            <Route path="/enrollments" element={<Enrollments />} />
            <Route path="/history" element={<History />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/courses" element={<CoursesAdmin />} />
            <Route path="/admin/users" element={<UsersAdmin />} />
            <Route path="/admin/statistics" element={<Statistics />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/ratings" element={<Ratings />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;


import { Layout } from "@/components/layout/Layout";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLogin } from "@/hooks/useLogin";
import { LoginHeader } from "@/components/auth/LoginHeader";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoginLink } from "@/components/auth/LoginLink";
import { LoginDemoCredentials } from "@/components/auth/LoginDemoCredentials";

export default function Login() {
  const { user } = useAuth();
  const { isSubmitting, error, handleSubmit } = useLogin();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout requireAuth={false}>
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <LoginHeader />
          <LoginForm 
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            error={error}
          />
          <LoginLink />
          <LoginDemoCredentials />
        </div>
      </div>
    </Layout>
  );
}

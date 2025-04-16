
import { Layout } from "@/components/layout/Layout";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { RegisterHeader } from "@/components/auth/RegisterHeader";
import { RegisterLink } from "@/components/auth/RegisterLink";
import { useRegister } from "@/hooks/useRegister";

export default function Register() {
  const { user } = useAuth();
  const { isSubmitting, error, handleSubmit } = useRegister();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout requireAuth={false}>
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <RegisterHeader />
          <RegisterForm 
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            error={error}
          />
          <RegisterLink />
        </div>
      </div>
    </Layout>
  );
}

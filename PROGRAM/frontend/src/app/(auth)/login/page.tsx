"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/shared/auth-form";
import { useLogin } from "@/lib/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const [error, setError] = useState("");

  return (
    <div className="grid min-h-screen place-items-center p-4" style={{ backgroundImage: "url('/program-logo.svg')", backgroundSize: "380px", backgroundRepeat: "no-repeat", backgroundPosition: "center", opacity: 0.98 }}>
      <AuthForm
        title="Welcome back"
        description="Sign in to continue your learning"
        buttonText="Login"
        fields={[
          { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
          { name: "password", label: "Password", type: "password", placeholder: "********" },
        ]}
        loading={login.isPending}
        error={error}
        onSubmit={async (values) => {
          setError("");
          try {
            const data = await login.mutateAsync({ email: values.email, password: values.password });
            const destination = data.user.role === "admin"
              ? "/admin"
              : data.user.role === "instructor"
                ? "/dashboard/instructor"
                : "/dashboard/student";
            router.push(destination);
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      />
    </div>
  );
}


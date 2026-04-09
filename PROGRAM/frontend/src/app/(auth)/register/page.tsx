"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/shared/auth-form";
import { useRegister } from "@/lib/hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegister();
  const [error, setError] = useState("");

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <AuthForm
        title="Create account"
        description="Join PROGRAM and start learning today"
        buttonText="Register"
        fields={[
          { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
          { name: "password", label: "Password", type: "password", placeholder: "Create a strong password" },
          {
            name: "confirmPassword",
            label: "Confirm password",
            type: "password",
            placeholder: "Re-enter your password",
          },
        ]}
        loading={registerMutation.isPending}
        error={error}
        onSubmit={async (values) => {
          setError("");
          try {
            const response = await registerMutation.mutateAsync({
              email: values.email,
              password: values.password,
            });
            router.push(response.emailVerificationToken ? "/verify-email" : "/login");
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      />
    </div>
  );
}


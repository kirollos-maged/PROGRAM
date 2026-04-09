"use client";

import { useState } from "react";
import { authApi } from "@/lib/api/auth.api";
import { AuthForm } from "@/components/shared/auth-form";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <AuthForm
        title="Forgot password"
        description="We will send a reset link to your email"
        buttonText="Send reset link"
        fields={[{ name: "email", label: "Email", type: "email", placeholder: "you@example.com" }]}
        onSubmit={async (values) => {
          const response = await authApi.forgotPassword({ email: values.email });
          setMessage(
            response.passwordResetToken
              ? `Reset token (dev): ${response.passwordResetToken}`
              : "If this email exists, a reset link has been sent."
          );
        }}
      />
      {message && <p className="mt-4 text-sm text-green-500">{message}</p>}
    </div>
  );
}


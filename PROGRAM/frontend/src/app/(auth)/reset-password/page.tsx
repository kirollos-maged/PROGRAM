"use client";

import { useState } from "react";
import { AuthForm } from "@/components/shared/auth-form";
import { authApi } from "@/lib/api/auth.api";

export default function ResetPasswordPage() {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <AuthForm
        title="Reset password"
        description="Create a new secure password (uppercase, lowercase, number, special character)"
        buttonText="Reset password"
        error={error}
        fields={[
          { name: "token", label: "Reset Token", type: "text", placeholder: "Paste reset token" },
          { name: "password", label: "New Password", type: "password", placeholder: "New password" },
          {
            name: "confirmPassword",
            label: "Confirm new password",
            type: "password",
            placeholder: "Re-enter new password",
          },
        ]}
        onSubmit={async (values) => {
          setError("");
          setStatus("");
          try {
            await authApi.resetPassword({ token: values.token, newPassword: values.password });
            setStatus("Password reset successful. You can now login.");
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      />
      {status && <p className="mt-3 text-sm text-green-500">{status}</p>}
    </div>
  );
}

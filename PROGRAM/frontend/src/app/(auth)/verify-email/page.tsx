"use client";

import { useState } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api/auth.api";
import { AuthForm } from "@/components/shared/auth-form";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const [message, setMessage] = useState("Enter the token from your email to verify your account.");
  const [error, setError] = useState("");

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-md space-y-4">
        <AuthForm
          title="Verify your email"
          description="Paste your verification token"
          buttonText="Verify"
          error={error}
          fields={[{ name: "token", label: "Verification Token", type: "text", placeholder: "Paste token" }]}
          onSubmit={async (values) => {
            setError("");
            try {
              await authApi.verifyEmail({ token: values.token });
              setMessage("Email verified successfully. You can now log in.");
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        />
        <p className="text-center text-sm text-zinc-500">{message}</p>
        <div className="text-center">
          <Link href="/login">
            <Button variant="outline">Go to login</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

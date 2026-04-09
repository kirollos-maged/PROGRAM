"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { strongPasswordSchema } from "@/lib/validation/password";

export type AuthFieldName = "name" | "email" | "password" | "confirmPassword" | "token";

interface AuthFormProps {
  title: string;
  description: string;
  buttonText: string;
  fields: Array<{ name: AuthFieldName; label: string; type: string; placeholder: string }>;
  onSubmit: (values: Record<string, string>) => Promise<void>;
  loading?: boolean;
  error?: string;
}

function buildSchema(fields: AuthFormProps["fields"]) {
  const names = new Set(fields.map((f) => f.name));
  const hasConfirm = names.has("confirmPassword");
  const passwordField = hasConfirm
    ? strongPasswordSchema
    : z.string().min(8, "Password must be at least 8 characters");

  const shape: Record<string, z.ZodTypeAny> = {};

  if (names.has("name")) {
    shape.name = z.string().min(2, "Name must be at least 2 characters");
  }
  if (names.has("email")) {
    shape.email = z.string().min(1, "Email is required").email("Enter a valid email");
  }
  if (names.has("password")) shape.password = passwordField;
  if (names.has("confirmPassword")) shape.confirmPassword = passwordField;
  if (names.has("token")) {
    shape.token = z.string().min(10, "Token should be at least 10 characters");
  }

  let base = z.object(shape);

  if (hasConfirm && names.has("password")) {
    base = base.refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
  }

  return base;
}

function autocompleteFor(name: AuthFieldName, isRegistrationWithConfirm: boolean): string {
  if (name === "email") return "email";
  if (name === "password") return isRegistrationWithConfirm ? "new-password" : "current-password";
  if (name === "confirmPassword") return "new-password";
  if (name === "name") return "name";
  return "off";
}

const PASSWORD_RULES_HINT =
  "Use at least 8 characters with uppercase, lowercase, a number, and a special character (!@#$ etc.).";

export function AuthForm({ title, description, buttonText, fields, onSubmit, loading, error }: AuthFormProps) {
  const schema = useMemo(() => buildSchema(fields), [fields]);
  const fieldNames = useMemo(() => new Set(fields.map((f) => f.name)), [fields]);
  const showPasswordRules = fieldNames.has("password") && fieldNames.has("confirmPassword");
  const defaultValues = useMemo(
    () => Object.fromEntries(fields.map((f) => [f.name, ""])) as Record<string, string>,
    [fields],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Record<string, string>>({
    resolver: zodResolver(schema) as Resolver<Record<string, string>>,
    defaultValues,
  });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Card className="mx-auto w-full max-w-md space-y-5 p-6">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="mt-1 text-sm text-zinc-500">{description}</p>
        </div>
        <form
          className="space-y-4"
          onSubmit={handleSubmit(async (values) => onSubmit(values as Record<string, string>))}
        >
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              {field.name === "confirmPassword" && showPasswordRules ? (
                <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password confirmation</p>
                  <p className="mt-1 text-xs text-zinc-500">Type the same password again to avoid typos.</p>
                </div>
              ) : null}
              <label className="text-sm font-medium">{field.label}</label>
              {field.name === "password" && showPasswordRules ? (
                <p className="text-xs text-zinc-500">{PASSWORD_RULES_HINT}</p>
              ) : null}
              <Input type={field.type} placeholder={field.placeholder} autoComplete={autocompleteFor(field.name, showPasswordRules)} {...register(field.name)} />
              {errors[field.name] && <p className="text-xs text-red-500">{String(errors[field.name]?.message)}</p>}
            </div>
          ))}
          {error && <p className="rounded-lg bg-red-500/10 p-2 text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Please wait..." : buttonText}
          </Button>
        </form>
      </Card>
    </motion.div>
  );
}

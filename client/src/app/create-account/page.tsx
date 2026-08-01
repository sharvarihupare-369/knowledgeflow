"use client";

import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { createAccountSchema } from "@/schemas/auth";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "@/components/ui/AuthLayout";
import * as yup from "yup";
import { Suspense, useEffect, useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";

type CreateAccountFormData = yup.InferType<typeof createAccountSchema>;

function CreateAccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const e =
      searchParams.get("email") || localStorage.getItem("signup_email") || "";
    setEmail(e);
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateAccountFormData>({
    resolver: yupResolver(createAccountSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = useWatch({ control, name: "password" });
  const confirmPasswordValue = useWatch({ control, name: "confirmPassword" });

  const rules = [
    { label: "At least 8 characters", valid: passwordValue.length >= 8 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(passwordValue) },
    { label: "One number", valid: /[0-9]/.test(passwordValue) },
    {
      label: "Passwords match",
      valid: passwordValue !== "" && passwordValue === confirmPasswordValue,
    },
  ];

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: CreateAccountFormData) => {
      const response = await api.post("/auth/create-account", {
        ...data,
        email,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Account created successfully.");
      localStorage.removeItem("signup_email");
      router.push("/login");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create account.");
    },
  });

  const onSubmit = (data: CreateAccountFormData) => {
    if (!email) {
      toast.error("Email is missing. Please restart signup.");
      return;
    }
    mutate(data);
  };

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-sm font-medium text-zinc-900"
        >
          Password
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter a strong password"
            {...register("password")}
            error={errors.password?.message}
          />
          <button
            type="button"
            className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-1 block text-sm font-medium text-zinc-900"
        >
          Confirm password
        </label>
        <div className="relative">

          <Input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />
          <button
            type="button"
            className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-600"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-2 rounded-lg border border-zinc-100 bg-zinc-50/50 p-4">
        {rules.map((rule, idx) => (
          <div key={idx} className="flex items-center space-x-2 text-sm">
            {rule.valid ? (
              <Check className="h-4 w-4 text-zinc-400" />
            ) : (
              <X className="h-4 w-4 text-zinc-400" />
            )}
            <span
              className={
                rule.valid
                  ? "text-zinc-700"
                  : "text-zinc-500"
              }
            >
              {rule.label}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          className="w-full bg-[#10172A] hover:bg-[#1e293b]"
          isLoading={isPending}
        >
          Finish setup
        </Button>
      </div>
    </form>
  );
}

export default function CreateAccountPage() {
  return (
    <AuthLayout
      title="Create a password"
      subtitle="Pick something memorable but hard to guess."
      step={3}
    >
      <Suspense fallback={<div className="mt-4 text-center">Loading...</div>}>
        <CreateAccountForm />
      </Suspense>
    </AuthLayout>
  );
}

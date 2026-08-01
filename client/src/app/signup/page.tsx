"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signupSchema } from "@/schemas/auth";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "@/components/ui/AuthLayout";
import * as yup from "yup";

type SignupFormData = yup.InferType<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: yupResolver(signupSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: SignupFormData) => {
      const response = await api.post("/auth/signuprequest", data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success(data.message || "Verification email sent successfully.");
      localStorage.setItem("signup_email", variables.email);
      router.push("/verify"); // Or wherever they need to go next
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create signup request."
      );
    },
  });

  const onSubmit = (data: SignupFormData) => {
    mutate(data);
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your 14-day free trial. No credit card required."
      step={1}
    >
      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-zinc-900"
          >
            Full name
          </label>
          <Input
            id="name"
            type="text"
            placeholder="Ada Lovelace"
            {...register("name")}
            error={errors.name?.message}
          />
        </div>

        <div>
          <label
            htmlFor="company_name"
            className="mb-1 block text-sm font-medium text-zinc-900"
          >
            Company name
          </label>
          <Input
            id="company_name"
            type="text"
            placeholder="Acme Inc."
            {...register("company_name")}
            error={errors.company_name?.message}
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-zinc-900"
          >
            Work email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            {...register("email")}
            error={errors.email?.message}
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full bg-[#10172A] hover:bg-[#1e293b]"
            isLoading={isPending}
          >
            Continue
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center text-xs text-zinc-500">
        <p>
          By continuing, you agree to our{" "}
          <a href="#" className="underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>

      <div className="mt-6 text-center text-sm">
        <p className="text-zinc-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-zinc-900 hover:text-zinc-800"
          >
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

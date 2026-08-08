"use client";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOtpSchema } from "@/schemas/auth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "@/components/ui/AuthLayout";
import * as yup from "yup";
import { Suspense, useEffect, useState, useRef } from "react";
import { Mail, RefreshCw } from "lucide-react";
import Link from "next/link";

type VerifyFormData = yup.InferType<typeof verifyOtpSchema>;

function OtpInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (value) {
      setOtp(value.split("").slice(0, 6).concat(Array(6).fill("")).slice(0, 6));
    }
  }, [value]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const val = e.target.value;
    if (/[^0-9]/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);
    onChange(newOtp.join(""));

    if (val && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, 6);
    if (pasted) {
      const newOtp = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
      setOtp(newOtp);
      onChange(newOtp.join(""));
      const nextFocus = Math.min(pasted.length, 5);
      inputs.current[nextFocus]?.focus();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center space-x-2" onPaste={handlePaste}>
        {otp.map((digit, idx) => (
          <div key={idx} className="flex items-center space-x-2">
            <input
              ref={(el) => {
                inputs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="h-14 w-12 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#0a0a0a] text-center text-xl font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {idx === 2 && <span className="mx-1 text-zinc-400">-</span>}
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-zinc-500">Paste the code or type it in</p>
    </div>
  );
}

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const e =
      searchParams.get("email") || localStorage.getItem("signup_email") || "";
    setEmail(e);
  }, [searchParams]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyFormData>({
    resolver: yupResolver(verifyOtpSchema),
  });

  const { mutate: verifyMutate, isPending: isVerifying } = useMutation({
    mutationFn: async (data: VerifyFormData) => {
      const response = await api.post("/auth/verify-otp", {
        ...data,
        email,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Verified successfully!");
      // Open in a new tab
      window.open(`/create-account?email=${encodeURIComponent(email)}`, "_blank");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Invalid OTP.");
    },
  });

  const { mutate: resendMutate, isPending: isResending } = useMutation({
    mutationFn: async () => {
      if (!email) throw new Error("Email is missing.");
      const response = await api.post("/auth/resend-otp", { email });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "A new OTP has been sent.");
      setCountdown(60);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to resend OTP.");
    },
  });

  const onSubmit = (data: VerifyFormData) => {
    if (!email) {
      toast.error("Email is missing. Please restart signup.");
      return;
    }
    verifyMutate(data);
  };

  const handleResend = () => {
    if (countdown === 0 && !isResending) {
      resendMutate();
    }
  };

  const obfuscatedEmail = email
    ? email.replace(
        /^(.{1})(.*)(@.*)$/,
        (_, a, b, c) => a + b.replace(/./g, "•") + c
      )
    : "your email";

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Check your inbox
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          We sent a 6-digit code to {obfuscatedEmail}. Enter it below to
          continue.
        </p>
      </div>

      <div className="mb-8 flex items-center rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
          <Mail className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
        </div>
        <div>
          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Verification code sent
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">{email}</div>
        </div>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Controller
            name="otp"
            control={control}
            render={({ field }) => (
              <OtpInput value={field.value} onChange={field.onChange} />
            )}
          />
          {errors.otp && (
            <p className="mt-2 text-center text-sm text-red-500">
              {errors.otp.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-[#10172A] hover:bg-[#1e293b] dark:bg-zinc-100 dark:hover:bg-zinc-200"
          isLoading={isVerifying}
        >
          Verify code
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-zinc-500">
        <button
          type="button"
          onClick={handleResend}
          disabled={countdown > 0 || isResending}
          className="inline-flex items-center text-zinc-600 hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-300"
        >
          Didn't get the code?
          {countdown > 0 ? (
            <span className="ml-1">Resend in {countdown}s</span>
          ) : (
            <span className="ml-1 flex items-center">
              <RefreshCw className="mr-1 h-3 w-3" /> Resend
            </span>
          )}
        </button>
      </div>

      <div className="mt-6 text-center text-sm">
        <p className="text-zinc-500 dark:text-zinc-400">
          Wrong email?{" "}
          <Link
            href="/signup"
            className="font-medium text-zinc-900 hover:text-zinc-800 dark:text-zinc-100 dark:hover:text-zinc-300"
          >
            Go back
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <AuthLayout title="" subtitle="" step={2}>
      <Suspense fallback={<div className="mt-4 text-center">Loading...</div>}>
        <VerifyForm />
      </Suspense>
    </AuthLayout>
  );
}

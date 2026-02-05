"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

import Button from "@/shared/components/UI/button";
import Input from "@/shared/components/UI/input";
import AuthLayout from "@/domains/auth/shared/components/AuthLayout";
import SocialLogins from "@/domains/auth/shared/components/SocialLogins";

const Login = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    signIn("credentials", {
      ...loginData,
      redirect: false,
    })
      .then((callback) => {
        if (callback?.ok) {
          router.push("/admin");
        }

        if (callback?.error) {
          setError("Invalid email or password. Please try again.");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Enter your details to access your account"
    >
      <form onSubmit={handleLogin} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
          <Input
            type="email"
            placeholder="name@example.com"
            value={loginData.email}
            inputSize="base"
            required
            className="rounded-xl border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition-all"
            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center px-1">
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <Link href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            value={loginData.password}
            inputSize="base"
            required
            className="rounded-xl border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition-all"
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in zoom-in duration-300">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          isLoading={loading}
          className="w-full py-4 bg-black text-white hover:bg-gray-900 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transform active:scale-[0.98] transition-all duration-200"
        >
          Sign In
        </Button>

        <p className="text-center text-sm text-gray-500 mt-2">
          Don't have an account?{" "}
          <Link href="/signup" className="text-black font-bold hover:underline">
            Sign up for free
          </Link>
        </p>
      </form>

      <SocialLogins />
    </AuthLayout>
  );
};

export default Login;


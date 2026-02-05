"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

import Button from "@/shared/components/UI/button";
import Input from "@/shared/components/UI/input";
import AuthLayout from "@/domains/auth/shared/components/AuthLayout";
import SocialLogins from "@/domains/auth/shared/components/SocialLogins";

import { register } from "@/actions/auth/register";

const SignUp = () => {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [signUpData, setSignUpData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (signUpData.password !== signUpData.confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        register(signUpData)
            .then((data) => {
                if (data.error) {
                    setError(data.error);
                }
                if (data.success) {
                    router.push("/login");
                }
            })
            .catch(() => setError("Something went wrong!"))
            .finally(() => setLoading(false));
    };


    return (
        <AuthLayout
            title="Create Account"
            subtitle="Join Thyonx and start shopping today"
        >
            <form onSubmit={handleSignUp} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
                    <Input
                        type="text"
                        placeholder="John Doe"
                        value={signUpData.name}
                        inputSize="base"
                        required
                        className="rounded-xl border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition-all"
                        onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                    <Input
                        type="email"
                        placeholder="name@example.com"
                        value={signUpData.email}
                        inputSize="base"
                        required
                        className="rounded-xl border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition-all"
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
                    <Input
                        type="password"
                        placeholder="••••••••"
                        value={signUpData.password}
                        inputSize="base"
                        required
                        className="rounded-xl border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition-all"
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Confirm Password</label>
                    <Input
                        type="password"
                        placeholder="••••••••"
                        value={signUpData.confirmPassword}
                        inputSize="base"
                        required
                        className="rounded-xl border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition-all"
                        onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
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
                    className="w-full py-4 bg-black text-white hover:bg-gray-900 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transform active:scale-[0.98] transition-all duration-200 mt-2"
                >
                    Create Account
                </Button>

                <p className="text-center text-sm text-gray-500 mt-2">
                    Already have an account?{" "}
                    <Link href="/login" className="text-black font-bold hover:underline">
                        Sign in
                    </Link>
                </p>
            </form>

            <SocialLogins />
        </AuthLayout>
    );
};

export default SignUp;

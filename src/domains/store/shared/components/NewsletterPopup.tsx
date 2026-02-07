"use client";

import React, { useEffect, useState } from "react";
import Button from "@/shared/components/UI/button";

const NewsletterPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const hasSeenPopup = localStorage.getItem("newsletter_popup_seen");
        if (!hasSeenPopup) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 5000); // Show after 5 seconds
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem("newsletter_popup_seen", "true");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        try {
            const res = await fetch("/api/newsletter/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            if (res.ok) {
                setStatus("success");
                setMessage("Thank you for subscribing!");
                setTimeout(handleClose, 2000);
            } else {
                const msg = await res.text();
                throw new Error(msg);
            }
        } catch (err: any) {
            setStatus("error");
            setMessage(err.message || "Something went wrong.");
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl relative animate-in slide-in-from-bottom-10 duration-500">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 size-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                    ✕
                </button>

                <div className="p-10 flex flex-col items-center text-center">
                    <div className="size-16 bg-bitex-blue-50 rounded-2xl flex items-center justify-center mb-6">
                        <span className="text-3xl">📩</span>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Join Our Newsletter</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
                    </p>

                    <form onSubmit={handleSubmit} className="w-full space-y-4">
                        <input
                            type="email"
                            required
                            placeholder="your@email.com"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            disabled={status === "loading" || status === "success"}
                        />
                        <Button
                            className="w-full py-3.5"
                            isLoading={status === "loading"}
                            disabled={status === "success"}
                        >
                            {status === "success" ? "Subscribed!" : "Subscribe Now"}
                        </Button>
                    </form>

                    {message && (
                        <p className={`mt-4 text-sm font-medium ${status === "success" ? "text-green-600" : "text-red-500"}`}>
                            {message}
                        </p>
                    )}

                    <p className="mt-8 text-[10px] text-gray-400">
                        By subscribing, you agree to our Privacy Policy and Terms of Service.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NewsletterPopup;

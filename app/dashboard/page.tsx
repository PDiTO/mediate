"use client";

import { useAccount } from "wagmi";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

export default function Dashboard() {
  const { isConnected } = useAccount();
  const router = useRouter();

  // Redirect to home if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  // Don't render content while redirecting, but keep navbar
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-teal-500 to-emerald-500">
        <Navbar />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-600 via-teal-500 to-emerald-500">
      <Navbar />
      <div className="max-w-7xl mx-auto px-8 pt-32">
        <h1 className="text-6xl font-serif text-white mb-8">Dashboard</h1>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
          <p className="text-white/90 text-xl">
            Welcome to your mediation dashboard
          </p>
        </div>
      </div>
    </div>
  );
}

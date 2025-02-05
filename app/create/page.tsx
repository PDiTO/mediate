"use client";

import { useAccount } from "wagmi";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

export default function CreateIssue() {
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
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-teal-300 to-emerald-500 animate-gradient-hero">
        <Navbar />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-400 via-teal-300 to-emerald-500 animate-gradient-hero">
      <Navbar />
      <div className="max-w-7xl mx-auto px-8 pt-32 pb-16">
        <div className="flex flex-col items-center">
          <h1 className="text-6xl font-serif text-white mb-12">New Issue</h1>

          <div className="w-full max-w-2xl">
            <form className="space-y-8">
              <div>
                <label
                  htmlFor="title"
                  className="block text-white text-lg font-medium mb-3"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 text-lg"
                  placeholder="What's the issue about?"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-white text-lg font-medium mb-3"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  rows={6}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 text-lg"
                  placeholder="Provide details about the dispute, including any relevant transaction hashes, dates, or agreements..."
                />
              </div>

              <div>
                <label
                  htmlFor="counterparty"
                  className="block text-white text-lg font-medium mb-3"
                >
                  Counterparty Wallet Address
                </label>
                <input
                  type="text"
                  id="counterparty"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 text-lg font-mono"
                  placeholder="0x..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg backdrop-blur-sm transition-all text-lg font-medium mt-8"
              >
                Create Issue
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

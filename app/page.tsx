"use client";

import TypeWriter from "../components/TypeWriter";
import Navbar from "../components/Navbar";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isConnected } = useAccount();
  const router = useRouter();

  // Redirect to dashboard when connected
  useEffect(() => {
    if (isConnected) {
      router.push("/dashboard");
    }
  }, [isConnected, router]);

  const questions = [
    "How can we resolve this dispute?",
    "What's the fairest outcome for both parties?",
    "Can you help mediate our agreement?",
    "Can you allocate funds based on the submitted proposals?",
    "Please escrow the funds for this bet.",
  ];

  // Don't render the main content while redirecting
  if (isConnected) {
    return null;
  }

  return (
    <div className="relative">
      <Navbar />

      {/* Hero Section */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-teal-300 to-emerald-500 animate-gradient-hero"></div>
        <div className="relative z-10 text-center flex flex-col items-center gap-2">
          <h1 className="text-9xl font-serif text-white tracking-tight">
            Mediate
          </h1>
          <TypeWriter sentences={questions} />
        </div>
      </section>

      {/* How it Works Section */}
      <section
        id="how-it-works"
        className="relative min-h-screen overflow-hidden pt-32"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-emerald-500 to-cyan-400 animate-gradient-how"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-8">
          <h2 className="text-6xl font-serif text-white mb-12">How it Works</h2>
          {/* Add content here */}
        </div>
      </section>

      {/* Use Cases Section */}
      <section
        id="cases"
        className="relative min-h-screen overflow-hidden pt-32"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-500 to-blue-400 animate-gradient-cases"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-8">
          <h2 className="text-6xl font-serif text-white mb-12">Use Cases</h2>
          {/* Add content here */}
        </div>
      </section>

      {/* Technology Section */}
      <section
        id="technology"
        className="relative min-h-screen overflow-hidden pt-32"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-teal-400 to-cyan-400 animate-gradient-tech"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-8">
          <h2 className="text-6xl font-serif text-white mb-12">Technology</h2>
          {/* Add content here */}
        </div>
      </section>

      {/* Community Section */}
      <section
        id="community"
        className="relative min-h-screen overflow-hidden pt-32"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-cyan-400 to-blue-500 animate-gradient-community"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-8">
          <h2 className="text-6xl font-serif text-white mb-12">Community</h2>
          {/* Add content here */}
        </div>
      </section>
    </div>
  );
}

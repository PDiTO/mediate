"use client";

import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "../../components/Navbar";
import MediationCard from "../../components/MediationCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Mediation } from "../../types/mediation";

export default function Dashboard() {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const pathname = usePathname();
  const [mediations, setMediations] = useState<Mediation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch mediations
  useEffect(() => {
    async function fetchMediations() {
      try {
        if (!address) return;

        const response = await fetch(`/api/nillion/read`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            schema: "mediationSchema",
            filter: {
              $or: [{ creator: address }, { parties: address }],
            },
          }),
        });
        const data = await response.json();

        if (response.ok && data.success) {
          setMediations(data.records);
        } else {
          console.error("Failed to fetch mediations:", data.error);
        }
      } catch (error) {
        console.error("Failed to fetch mediations:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (isConnected && address) {
      fetchMediations();
    }
  }, [isConnected, address]);

  // Sort mediations by date
  const sortedMediations = [...mediations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Filter mediations
  const openMediations = sortedMediations.filter(
    (m) => m.status === "open" || m.status === "funded"
  );
  const closedMediations = sortedMediations.filter(
    (m) => m.status !== "open" && m.status !== "funded"
  );

  // Redirect to home if not connected
  useEffect(() => {
    if (!isConnected && pathname !== "/test") {
      router.push("/");
    }
  }, [isConnected, router, pathname]);

  // Don't render content while redirecting, but keep navbar
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-teal-300 to-emerald-500 animate-gradient-hero">
        <Navbar />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-400 via-teal-300 to-emerald-500 animate-gradient-hero">
      <Navbar />
      <div className="max-w-7xl mx-auto px-8 pt-32 pb-16">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-6xl font-serif text-white">Dashboard</h1>
          <button
            onClick={() => router.push("/create")}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg backdrop-blur-sm transition-all"
          >
            Create New Issue
          </button>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : mediations.length === 0 ? (
          <div className="text-center text-white/80 py-12">
            No issues found. Create a new issue to get started.
          </div>
        ) : (
          <>
            {/* Open Issues */}
            {openMediations.length > 0 && (
              <section className="mb-12">
                <h2 className="text-3xl font-serif text-white mb-6">
                  Open Issues
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {openMediations.map((mediation) => (
                    <MediationCard key={mediation._id} mediation={mediation} />
                  ))}
                </div>
              </section>
            )}

            {/* Closed Issues */}
            {closedMediations.length > 0 && (
              <section>
                <h2 className="text-3xl font-serif text-white mb-6">
                  Closed Issues
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {closedMediations.map((mediation) => (
                    <MediationCard key={mediation._id} mediation={mediation} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

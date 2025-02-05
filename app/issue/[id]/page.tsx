"use client";

import { useAccount } from "wagmi";
import { useEffect, useMemo, use, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { testMediations } from "../../../data/mediations";
import {
  CircleDot,
  CheckCircle2,
  XCircle,
  Plus,
  CircleDollarSign,
  Bot,
} from "lucide-react";
import { format } from "date-fns";
import { MODEL_NAMES, MODEL_DESCRIPTIONS } from "../../../lib/models/models";

export default function IssueDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { isConnected } = useAccount();
  const router = useRouter();
  const resolvedParams = use(params);
  const [showAddParty, setShowAddParty] = useState(false);
  const [newParty, setNewParty] = useState("");

  const mediation = useMemo(
    () => testMediations.find((m) => m.id === resolvedParams.id),
    [resolvedParams.id]
  );

  // Redirect to home if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  // Redirect to dashboard if mediation not found
  useEffect(() => {
    if (!mediation) {
      router.push("/dashboard");
    }
  }, [mediation, router]);

  // Don't render content while redirecting or if mediation not found
  if (!isConnected || !mediation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-teal-300 to-emerald-500 animate-gradient-hero">
        <Navbar />
      </div>
    );
  }

  const statusConfig = {
    open: {
      icon: CircleDot,
      color: "text-blue-400",
      label: "Open",
    },
    resolved: {
      icon: CheckCircle2,
      color: "text-green-500",
      label: "Resolved",
    },
    unresolved: {
      icon: XCircle,
      color: "text-red-400",
      label: "Unresolved",
    },
    funded: {
      icon: CircleDollarSign,
      color: "text-yellow-400",
      label: "Funded",
    },
  };

  const StatusIcon = statusConfig[mediation.status].icon;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-400 via-teal-300 to-emerald-500 animate-gradient-hero">
      <Navbar />
      <div className="max-w-7xl mx-auto px-8 pt-32 pb-16">
        <div className="flex flex-col items-center">
          {/* Header */}
          <div className="w-full max-w-3xl flex justify-between items-center mb-8">
            <h1 className="text-5xl font-serif text-white leading-none">
              {mediation.title}
            </h1>
            <div className="flex items-center gap-2 ml-8 shrink-0">
              <span className="text-xs font-bold text-white whitespace-nowrap uppercase">
                {statusConfig[mediation.status].label}
              </span>
              <StatusIcon
                className={`w-6 h-6 ${
                  statusConfig[mediation.status].color
                } shrink-0`}
              />
            </div>
          </div>

          {/* Details */}
          <div className="w-full max-w-3xl space-y-8">
            {/* Description */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-xl font-medium text-white mb-4">
                Description
              </h2>
              <p className="text-white/80 text-lg leading-relaxed">
                {mediation.description}
              </p>
            </div>

            {/* Mediator Model */}
            {mediation.mediatorModel && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Bot className="w-5 h-5 text-white" />
                  <h2 className="text-xl font-medium text-white">
                    AI Mediator Model
                  </h2>
                </div>
                <div className="space-y-2">
                  <div className="text-white/80 font-medium">
                    {MODEL_NAMES[mediation.mediatorModel]}
                  </div>
                  <p className="text-white/60 text-sm">
                    {MODEL_DESCRIPTIONS[mediation.mediatorModel]}
                  </p>
                </div>
              </div>
            )}

            {/* Parties */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium text-white">Parties</h2>
                {mediation.status === "open" && (
                  <button
                    onClick={() => setShowAddParty(!showAddParty)}
                    className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Party
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {showAddParty && mediation.status === "open" && (
                  <form
                    className="flex gap-4 mb-6"
                    onSubmit={(e) => {
                      e.preventDefault();
                      // TODO: Add party logic here
                      setNewParty("");
                      setShowAddParty(false);
                    }}
                  >
                    <input
                      type="text"
                      value={newParty}
                      onChange={(e) => setNewParty(e.target.value)}
                      placeholder="Enter wallet address"
                      className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm font-mono"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm transition-all text-sm font-medium"
                    >
                      Add
                    </button>
                  </form>
                )}

                {mediation.parties.map((party, index) => (
                  <div
                    key={party}
                    className="flex items-center justify-between text-white/80"
                  >
                    <span className="font-medium">Party {index + 1}</span>
                    <code className="bg-white/10 px-3 py-1 rounded-lg">
                      {party}
                    </code>
                  </div>
                ))}
                {mediation.mediator && (
                  <div className="flex items-center justify-between text-white/80">
                    <span className="font-medium">Mediator</span>
                    <code className="bg-white/10 px-3 py-1 rounded-lg">
                      {mediation.mediator}
                    </code>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-xl font-medium text-white mb-4">Timeline</h2>
              <div className="text-white/80">
                <div className="flex items-center justify-between">
                  <span>Created</span>
                  <span>{format(new Date(mediation.createdAt), "PPP")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

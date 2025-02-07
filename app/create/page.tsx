"use client";

import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { MODEL_IDS, MODELS, ModelId } from "../../lib/models/models";
import { Bot, Plus, X } from "lucide-react";

export default function CreateIssue() {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
  });
  const [selectedModel, setSelectedModel] = useState<ModelId>(
    MODEL_IDS.DEEPSEEK_R1_70B_DISPUTE
  );
  const [parties, setParties] = useState<string[]>(["", ""]);
  const [newParty, setNewParty] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!address) throw new Error("Wallet not connected");
      if (!formData.title) throw new Error("Title is required");
      if (!formData.description) throw new Error("Description is required");
      if (!formData.amount || isNaN(Number(formData.amount)))
        throw new Error("Valid amount is required");
      if (parties.some((p) => !p.trim()))
        throw new Error("All party addresses must be filled");

      const mediationData = {
        title: formData.title,
        description: formData.description,
        amount: Number(formData.amount),
        createdAt: new Date().toISOString(),
        creator: address,
        parties: parties,
        model: selectedModel,
        status: "open" as const,
      };

      const response = await fetch("/api/nillion/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          schema: "mediationSchema",
          data: mediationData,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to create mediation");
      }

      router.push("/dashboard"); // Redirect to dashboard or appropriate page
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addParty = () => {
    if (newParty.trim()) {
      setParties([...parties, newParty.trim()]);
      setNewParty("");
    }
  };

  const removeParty = (index: number) => {
    if (parties.length > 2) {
      setParties(parties.filter((_, i) => i !== index));
    }
  };

  // Redirect to home if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  // Don't render content while redirecting, but keep navbar
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-teal-500 to-emerald-500 animate-gradient-hero">
        <Navbar />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-500 via-teal-500 to-emerald-500 animate-gradient-hero">
      <Navbar />
      <div className="max-w-7xl mx-auto px-8 pt-32 pb-16">
        <div className="flex flex-col items-center">
          <h1 className="text-6xl font-serif text-white mb-12">New Issue</h1>

          {error && (
            <div className="w-full max-w-2xl mb-8 p-4 bg-red-500/20 border border-red-500/40 rounded-lg text-white">
              {error}
            </div>
          )}

          <div className="w-full max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-8">
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
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 text-lg"
                  placeholder="What's the issue about?"
                  required
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
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 text-lg"
                  placeholder="Provide details about the issue, including evaluation criteria, relevant dates or agreements, preferences..."
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="block text-white text-lg font-medium mb-3"
                >
                  Amount (ETH)
                </label>
                <input
                  type="number"
                  id="amount"
                  step="0.000000000000000001"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 text-lg"
                  placeholder="0.0"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-white text-lg font-medium">
                    Parties
                  </label>
                  <span className="text-white/60 text-sm">
                    Add wallet addresses of all involved parties
                  </span>
                </div>
                <div className="space-y-3">
                  {parties.map((party, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={party}
                        onChange={(e) => {
                          const newParties = [...parties];
                          newParties[index] = e.target.value;
                          setParties(newParties);
                        }}
                        placeholder="0x..."
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 text-lg font-mono"
                      />
                      {parties.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeParty(index)}
                          className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-all"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setParties([...parties, ""])}
                    className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another Party
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-white text-lg font-medium mb-3">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    <span>AI Mediator Model</span>
                  </div>
                </label>
                <div className="grid gap-4">
                  {Object.entries(MODEL_IDS).map(([key, id]) => (
                    <label
                      key={id}
                      className={`relative flex items-start p-4 cursor-pointer rounded-lg border ${
                        selectedModel === id
                          ? "bg-white/20 border-white/40"
                          : "bg-white/10 border-white/20"
                      } hover:bg-white/20 transition-colors`}
                    >
                      <input
                        type="radio"
                        name="model"
                        value={id}
                        checked={selectedModel === id}
                        onChange={(e) =>
                          setSelectedModel(e.target.value as ModelId)
                        }
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <div className="text-white font-medium mb-1">
                          {MODELS[id].name}
                        </div>
                        <div className="text-white/60 text-sm">
                          {MODELS[id].description}
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 mt-1 ml-4 ${
                          selectedModel === id
                            ? "border-white bg-white"
                            : "border-white/60"
                        }`}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg backdrop-blur-sm transition-all text-lg font-medium mt-8"
              >
                {isSubmitting ? "Creating..." : "Create Issue"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

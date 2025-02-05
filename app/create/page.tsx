"use client";

import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import {
  MODEL_IDS,
  MODEL_NAMES,
  MODEL_DESCRIPTIONS,
  ModelId,
} from "../../lib/models/models";
import { Bot, Plus, X } from "lucide-react";

export default function CreateIssue() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState<ModelId>(
    MODEL_IDS.DEEPSEEK_R1_671B_DISPUTE
  );
  const [parties, setParties] = useState<string[]>([""]);
  const [newParty, setNewParty] = useState("");

  const addParty = () => {
    if (newParty.trim()) {
      setParties([...parties, newParty.trim()]);
      setNewParty("");
    }
  };

  const removeParty = (index: number) => {
    setParties(parties.filter((_, i) => i !== index));
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
                      {parties.length > 1 && (
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
                          {MODEL_NAMES[id]}
                        </div>
                        <div className="text-white/60 text-sm">
                          {MODEL_DESCRIPTIONS[id]}
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

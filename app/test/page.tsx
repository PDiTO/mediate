"use client";

import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { MODEL_IDS, MODELS, ModelId } from "../../lib/models/models";
import { Bot, Plus, X, Loader2, Trash2 } from "lucide-react";
import { Mediation } from "../../types/mediation";

interface Party {
  address: string;
  evidence: string;
}

export default function TestPage() {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState<ModelId>(
    MODEL_IDS.DEEPSEEK_R1_70B_DISPUTE
  );
  const [parties, setParties] = useState<Party[]>([
    { address: "", evidence: "" },
  ]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<string[]>([]);
  const [isPostingSchema, setIsPostingSchema] = useState(false);
  const [mediations, setMediations] = useState<Mediation[]>([]);

  // Fetch mediations
  useEffect(() => {
    async function fetchMediations() {
      try {
        const response = await fetch("/api/nillion/read", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            schema: "mediationSchema",
          }),
        });
        const data = await response.json();
        if (data.success) {
          setMediations(data.records);
        } else {
          console.error("Failed to fetch mediations:", data.error);
        }
      } catch (error) {
        console.error("Error fetching mediations:", error);
      }
    }

    fetchMediations();
  }, []);

  // Handle Nillion schema posting
  const handlePostSchema = async () => {
    setIsPostingSchema(true);
    try {
      const res = await fetch("/api/nillion/schema/create", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        alert("Schema posted successfully!");
      } else {
        alert("Failed to post schema: " + data.error);
      }
    } catch (error) {
      console.error("Error posting schema:", error);
      alert("Error posting schema. Check console for details.");
    } finally {
      setIsPostingSchema(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResponse([]);

    try {
      // Filter out empty parties
      const validParties = parties.filter((p) => p.address.trim() !== "");

      const message = `
Title: ${title}
Description: ${description}
Total Funds: ${amount} ETH
Parties:
${validParties
  .map(
    (p, i) => `Party ${p.address}:
  Evidence: ${p.evidence}`
  )
  .join("\n")}
Model: ${MODELS[selectedModel].name}

Please analyze this mediation request and provide your assessment.
`;

      const res = await fetch("/api/reason", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      if (data.responses) {
        setResponse(data.responses.map((r: any) => r.content));
      }
    } catch (error) {
      console.error("Error submitting mediation:", error);
      setResponse(["Error: Failed to get AI response. Please try again."]);
    } finally {
      setIsSubmitting(false);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-teal-300 to-emerald-500 animate-gradient-hero">
        <Navbar />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-400 via-teal-300 to-emerald-500 animate-gradient-hero">
      <style jsx global>{`
        textarea::-webkit-resizer {
          border-width: 6px;
          border-style: solid;
          border-color: transparent rgba(255, 255, 255, 0.6)
            rgba(255, 255, 255, 0.6) transparent;
          background: transparent;
        }
        textarea {
          cursor: text;
        }
        textarea:hover {
          cursor: text;
        }
        textarea::-webkit-resizer:hover {
          cursor: ns-resize;
        }
      `}</style>
      <Navbar />
      <div className="max-w-7xl mx-auto px-8 pt-32 pb-16">
        <div className="flex flex-col items-center">
          <h1 className="text-6xl font-serif text-white mb-12">
            Test Mediation
          </h1>

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
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 text-lg"
                  placeholder="What's the issue about?"
                />
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="block text-white text-lg font-medium mb-3"
                >
                  Total Amount (ETH)
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.000000000000000001"
                  min="0"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 text-lg font-mono"
                  placeholder="0.0"
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 text-lg resize"
                  placeholder="Provide details about the dispute, including any relevant transaction hashes, dates, or agreements..."
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-white text-lg font-medium">
                    Parties
                  </label>
                  <span className="text-white/60 text-sm">
                    Add wallet addresses and evidence for all involved parties
                  </span>
                </div>
                <div className="space-y-6">
                  {parties.map((party, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={party.address}
                            onChange={(e) => {
                              const newParties = [...parties];
                              newParties[index] = {
                                ...newParties[index],
                                address: e.target.value,
                              };
                              setParties(newParties);
                            }}
                            placeholder="Wallet Address (0x...)"
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 text-lg font-mono"
                          />
                        </div>
                        {parties.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setParties(parties.filter((_, i) => i !== index))
                            }
                            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-all"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        )}
                      </div>
                      <textarea
                        value={party.evidence}
                        onChange={(e) => {
                          const newParties = [...parties];
                          newParties[index] = {
                            ...newParties[index],
                            evidence: e.target.value,
                          };
                          setParties(newParties);
                        }}
                        placeholder="Evidence (transaction hashes, agreements, or any other relevant information)"
                        rows={3}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 text-lg resize"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setParties([...parties, { address: "", evidence: "" }])
                    }
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
                  {Object.entries(MODELS).map(([id, model]) => (
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
                          {model.name}
                        </div>
                        <div className="text-white/60 text-sm">
                          {model.description}
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

              <div className="mt-12 border-t border-white/20 pt-8">
                <h2 className="text-2xl font-serif text-white mb-6">
                  Nillion Testing
                </h2>
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={handlePostSchema}
                    disabled={isPostingSchema}
                    className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white rounded-lg backdrop-blur-sm transition-all"
                  >
                    {isPostingSchema ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Posting Schema...
                      </>
                    ) : (
                      "Post Nillion Schema"
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-12 border-t border-white/20 pt-8">
                <h2 className="text-2xl font-serif text-white mb-6">
                  Mediation Records
                </h2>
                <div className="space-y-4">
                  {response.length === 0 && !isSubmitting && (
                    <div className="text-white/60 text-center py-8">
                      No mediation records found
                    </div>
                  )}
                  {mediations.map((mediation) => (
                    <div
                      key={mediation._id}
                      className="bg-white/10 backdrop-blur-sm rounded-lg p-6 flex justify-between items-center"
                    >
                      <div>
                        <h3 className="text-xl font-medium text-white mb-2">
                          {mediation.title}
                        </h3>
                        <p className="text-white/60">
                          Created:{" "}
                          {new Date(mediation.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-white/60">
                          Status: {mediation.status}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            try {
                              const response = await fetch(
                                "/api/nillion/update",
                                {
                                  method: "PUT",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    id: mediation._id,
                                    status: "funded",
                                  }),
                                }
                              );
                              const data = await response.json();
                              if (data.success) {
                                setMediations(
                                  mediations.map((m) =>
                                    m._id === mediation._id
                                      ? { ...m, status: "funded" }
                                      : m
                                  )
                                );
                              } else {
                                alert(
                                  "Failed to update mediation status: " +
                                    data.error
                                );
                              }
                            } catch (error) {
                              console.error("Error updating mediation:", error);
                              alert(
                                "Error updating mediation. Check console for details."
                              );
                            }
                          }}
                          className="p-2 hover:bg-white/20 text-white/60 hover:text-white rounded-lg transition-all"
                          title="Fund Mediation"
                        >
                          <span className="text-xl">💰</span>
                        </button>
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            if (
                              window.confirm(
                                "Are you sure you want to delete this mediation?"
                              )
                            ) {
                              try {
                                const res = await fetch("/api/nillion/delete", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    schema: "mediationSchema",
                                    id: mediation._id,
                                  }),
                                });
                                const data = await res.json();
                                if (data.success) {
                                  setMediations(
                                    mediations.filter(
                                      (m) => m._id !== mediation._id
                                    )
                                  );
                                } else {
                                  alert(
                                    "Failed to delete mediation: " + data.error
                                  );
                                }
                              } catch (error) {
                                console.error(
                                  "Error deleting mediation:",
                                  error
                                );
                                alert(
                                  "Error deleting mediation. Check console for details."
                                );
                              }
                            }
                          }}
                          className="p-2 hover:bg-white/20 text-white/60 hover:text-white rounded-lg transition-all"
                          title="Delete Mediation"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:hover:bg-white/20 text-white px-8 py-4 rounded-lg backdrop-blur-sm transition-all text-lg font-medium mt-8 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Submit Mediation"
                )}
              </button>
            </form>

            {/* {response.length > 0 && (
              <div className="mt-12 space-y-4">
                <h2 className="text-2xl font-serif text-white">AI Response</h2>
                {response.map((text, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-6"
                  >
                    <p className="text-white/80 whitespace-pre-wrap">{text}</p>
                  </div>
                ))}
              </div>
            )} */}
            {response.length > 0 && (
              <div className="mt-12 space-y-4">
                <h2 className="text-2xl font-serif text-white">AI Response</h2>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <p className="text-white/80 whitespace-pre-wrap">
                    {response[response.length - 1]}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

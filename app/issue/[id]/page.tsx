"use client";

import { useAccount } from "wagmi";
import { useEffect, use, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import LoadingSpinner from "../../../components/LoadingSpinner";
import {
  CircleDot,
  CheckCircle2,
  CircleDollarSign,
  XCircle,
  DollarSign,
  Bot,
  Hourglass,
  UsersRound,
  Trash2,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { Mediation } from "../../../types/mediation";
import { getModel } from "../../../lib/models/models";
import { TransactionDefault } from "@coinbase/onchainkit/transaction";
import { parseEther } from "viem";
export default function IssueDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const resolvedParams = use(params);
  const [mediation, setMediation] = useState<Mediation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [newPartyAddress, setNewPartyAddress] = useState("");
  const [stagedParties, setStagedParties] = useState<{ address: string }[]>([]);
  const [removedPartyIndexes, setRemovedPartyIndexes] = useState<number[]>([]);

  useEffect(() => {
    const fetchMediation = async () => {
      try {
        const response = await fetch("/api/mediation/read", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            schema: "mediationSchema",
            filter: {
              _id: resolvedParams.id,
            },
          }),
        });

        const data = await response.json();
        if (data.success && data.records && data.records.length > 0) {
          setMediation(data.records[0]);
        } else {
          console.error("Mediation not found");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching mediation:", error);
      } finally {
        setLoading(false);
      }
    };

    if (resolvedParams.id) {
      fetchMediation();
    }
  }, [resolvedParams.id, router]);

  useEffect(() => {
    if (mediation) {
      setEditedTitle(mediation.title);
      setEditedDescription(mediation.description);
      setStagedParties([]);
      setRemovedPartyIndexes([]);
    }
  }, [mediation]);

  // Redirect to home if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  // Don't render content while redirecting, loading, or if mediation not found
  if (!isConnected || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-teal-300 to-emerald-500 animate-gradient-hero">
        <Navbar />
        <div className="max-w-7xl mx-auto px-8 pt-32 pb-16">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!mediation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-teal-300 to-emerald-500 animate-gradient-hero">
        <Navbar />
        <div className="max-w-7xl mx-auto px-8 pt-32 pb-16">
          <div className="text-white text-xl">Mediation not found</div>
        </div>
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
    pending: {
      icon: Hourglass,
      color: "text-gray-400",
      label: "Pending",
    },
  };

  const StatusIcon = statusConfig[mediation.status].icon;

  const handleDelete = async () => {
    if (!mediation?._id) return;
    setIsDeleting(true);
    try {
      const response = await fetch("/api/mediation/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          schema: "mediationSchema",
          id: mediation._id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        router.push("/dashboard");
      } else {
        console.error("Failed to delete mediation");
      }
    } catch (error) {
      console.error("Error deleting mediation:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!mediation?._id) return;
    setIsSaving(true);

    const updates: { [key: string]: any } = {};
    if (editedTitle !== mediation.title) updates.title = editedTitle;
    if (editedDescription !== mediation.description)
      updates.description = editedDescription;

    // Update parties list if there are any changes
    if (stagedParties.length > 0 || removedPartyIndexes.length > 0) {
      const remainingParties = mediation.parties.filter(
        (_, index) => !removedPartyIndexes.includes(index)
      );
      updates.parties = [...remainingParties, ...stagedParties];
    }

    try {
      const response = await fetch("/api/mediation/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: mediation._id,
          ...updates,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMediation({
          ...mediation,
          ...updates,
        });
        setIsEditMode(false);
      } else {
        console.error("Failed to update mediation");
      }
    } catch (error) {
      console.error("Error updating mediation:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-400 via-teal-300 to-emerald-500 animate-gradient-hero">
      <Navbar />
      <div className="max-w-7xl mx-auto px-8 pt-32 pb-16">
        <div className="flex flex-col items-center">
          {/* Header */}
          <div className="w-full max-w-3xl flex justify-between items-center mb-8">
            {isEditMode ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="text-5xl font-serif bg-white/10 text-white leading-none px-4 py-2 rounded-lg w-full mr-8 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Enter title..."
              />
            ) : (
              <h1 className="text-5xl font-serif text-white leading-none">
                {mediation.title}
              </h1>
            )}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 shrink-0">
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
          </div>

          {/* Details */}
          <div className="w-full max-w-3xl space-y-8">
            {/* Description */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-xl font-medium text-white mb-4">
                Description
              </h2>
              {isEditMode ? (
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="w-full h-40 bg-white/10 text-white/80 text-lg leading-relaxed p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
                  placeholder="Enter description..."
                />
              ) : (
                <p className="text-white/80 text-lg leading-relaxed">
                  {mediation.description}
                </p>
              )}
            </div>

            {/* Mediator Model */}
            {mediation.model && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Bot className="w-5 h-5 text-white" />
                  <h2 className="text-xl font-medium text-white">
                    AI Mediator Model
                  </h2>
                </div>
                <div className="space-y-2">
                  <div className="text-white/80 font-medium">
                    {getModel(mediation.model).name}
                  </div>
                  <p className="text-white/60 text-sm">
                    {getModel(mediation.model).description}
                  </p>
                </div>
              </div>
            )}

            {/* Parties */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <UsersRound className="w-5 h-5 text-white" />
                <h2 className="text-xl font-medium text-white">Parties</h2>
              </div>

              <div className="space-y-4">
                {/* Existing Parties */}
                {mediation.parties.map(
                  (party, index) =>
                    !removedPartyIndexes.includes(index) && (
                      <div
                        key={party.address}
                        className="flex items-center justify-between text-white/80"
                      >
                        <span className="font-medium">
                          Party{" "}
                          {index +
                            1 -
                            removedPartyIndexes.filter((i) => i < index).length}
                        </span>
                        <div className="flex items-center gap-2">
                          <code className="bg-white/10 px-3 py-1 rounded-lg">
                            {party.address}
                          </code>
                          {isEditMode && (
                            <button
                              onClick={() =>
                                setRemovedPartyIndexes([
                                  ...removedPartyIndexes,
                                  index,
                                ])
                              }
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                )}

                {/* Staged Parties */}
                {stagedParties.map((party, index) => (
                  <div
                    key={`staged-${index}`}
                    className="flex items-center justify-between text-white/80"
                  >
                    <span className="font-medium">
                      Party {mediation.parties.length + index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <code className="bg-white/10 px-3 py-1 rounded-lg">
                        {party.address}
                      </code>
                      {isEditMode && (
                        <button
                          onClick={() => {
                            setStagedParties(
                              stagedParties.filter((_, i) => i !== index)
                            );
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Mediator */}
                {mediation.mediator && (
                  <div className="flex items-center justify-between text-white/80">
                    <span className="font-medium">Mediator</span>
                    <code className="bg-white/10 px-3 py-1 rounded-lg">
                      {mediation.mediator}
                    </code>
                  </div>
                )}

                {/* Add Party Input */}
                {isEditMode && (
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newPartyAddress}
                        onChange={(e) => setNewPartyAddress(e.target.value)}
                        placeholder="Enter wallet address..."
                        className="flex-1 bg-white/10 text-white placeholder:text-white/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                      />
                      <button
                        onClick={() => {
                          if (newPartyAddress) {
                            setStagedParties([
                              ...stagedParties,
                              { address: newPartyAddress },
                            ]);
                            setNewPartyAddress("");
                          }
                        }}
                        disabled={!newPartyAddress}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500/80 hover:bg-blue-500/90 text-white rounded-lg backdrop-blur-sm transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Party
                      </button>
                    </div>
                    {stagedParties.length > 0 && (
                      <p className="text-white/60 text-xs mt-2">
                        New parties will be saved when you click "Save Changes"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Amount Information */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-white" />
                <h2 className="text-xl font-medium text-white">
                  Financial Details
                </h2>
              </div>
              <div className="text-white/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span>Total Amount</span>
                  <span className="font-mono text-lg">
                    {mediation.amount} ETH
                  </span>
                </div>
                {mediation.parties.map(
                  (party, index) =>
                    party.share && (
                      <div
                        key={`${party.address}-share`}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>Party {index + 1} Share</span>
                        <div className="flex items-center gap-4">
                          <span className="font-mono">{party.share}%</span>
                          {party.txHash && (
                            <a
                              href={`https://etherscan.io/tx/${party.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-300 hover:text-blue-200 underline"
                            >
                              View Transaction
                            </a>
                          )}
                        </div>
                      </div>
                    )
                )}
              </div>
            </div>

            {/* Resolution Details */}
            {(mediation.resolution || mediation.resolutionDate) && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h2 className="text-xl font-medium text-white mb-4">
                  Resolution
                </h2>
                {mediation.resolutionDate && (
                  <div className="text-white/80 mb-4">
                    <div className="flex items-center justify-between">
                      <span>Resolved at</span>
                      <span>
                        {format(new Date(mediation.resolutionDate), "PPP")}
                      </span>
                    </div>
                  </div>
                )}
                {mediation.resolution && (
                  <p className="text-white/80 text-lg leading-relaxed whitespace-pre-wrap">
                    {mediation.resolution}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {mediation.status === "open" && address === mediation.creator && (
              <div className="space-y-6 pt-4">
                {/* Primary Fund Button */}

                {/* Secondary Actions */}
                <div className="flex justify-center gap-3">
                  {isEditMode ? (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/80 hover:bg-green-500/90 text-white rounded-lg backdrop-blur-sm transition-all text-sm font-medium shadow hover:shadow-green-500/20 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {isSaving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditMode(false);
                          setEditedTitle(mediation.title);
                          setEditedDescription(mediation.description);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-500/80 hover:bg-gray-500/90 text-white rounded-lg backdrop-blur-sm transition-all text-sm font-medium shadow hover:shadow-gray-500/20"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditMode(true)}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-all text-sm font-medium shadow hover:shadow-white/20 w-24"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-500/80 hover:bg-red-500/90 text-white rounded-lg backdrop-blur-sm transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow hover:shadow-red-500/20 w-24"
                      >
                        <Trash2 className="w-4 h-4" />
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

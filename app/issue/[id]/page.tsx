"use client";

import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
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
  FileText,
  FileQuestion,
} from "lucide-react";
import { format } from "date-fns";
import { Mediation } from "../../../types/mediation";
import { Party } from "../../../types/party";
import { getModel } from "../../../lib/models/models";
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
  const [party, setParty] = useState<Party | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [newPartyAddress, setNewPartyAddress] = useState("");
  const [stagedParties, setStagedParties] = useState<{ address: string }[]>([]);
  const [removedPartyIndexes, setRemovedPartyIndexes] = useState<number[]>([]);

  const { data: hash, sendTransaction, isPending } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: hash,
    });

  // Update mediation status when transaction is confirmed
  useEffect(() => {
    const updateMediationStatus = async () => {
      if (isConfirmed && mediation?._id) {
        // Optimistically update the UI immediately
        setMediation((prev) => (prev ? { ...prev, status: "funded" } : null));

        // Update the database in the background
        try {
          const response = await fetch("/api/nillion/update", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: mediation._id,
              status: "funded",
            }),
          });

          const data = await response.json();
          if (!data.success) {
            // Only show error if the update failed
            console.error("Failed to update mediation status");
            // Optionally revert the optimistic update if the server update failed
            setMediation((prev) => (prev ? { ...prev, status: "open" } : null));
          }
        } catch (error) {
          console.error("Error updating mediation status:", error);
          // Revert the optimistic update on error
          setMediation((prev) => (prev ? { ...prev, status: "open" } : null));
        }
      }
    };

    updateMediationStatus();
  }, [isConfirmed, mediation?._id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mediationResponse, partyResponse] = await Promise.all([
          fetch("/api/nillion/read", {
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
          }),
          fetch("/api/nillion/read", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              schema: "partySchema",
              filter: {
                mediationId: resolvedParams.id,
                address: address,
              },
            }),
          }),
        ]);

        const [mediationData, partyData] = await Promise.all([
          mediationResponse.json(),
          partyResponse.json(),
        ]);

        if (
          mediationData.success &&
          mediationData.records &&
          mediationData.records.length > 0
        ) {
          setMediation(mediationData.records[0]);
        } else {
          console.error("Mediation not found");
          router.push("/dashboard");
        }

        if (
          partyData.success &&
          partyData.records &&
          partyData.records.length > 0
        ) {
          setParty(partyData.records[0]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (resolvedParams.id && address) {
      fetchData();
    }
  }, [resolvedParams.id, router, address]);

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
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-teal-500 to-emerald-500 animate-gradient-hero">
        <Navbar />
        <div className="max-w-7xl mx-auto px-8 pt-32 pb-16">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!mediation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-teal-500 to-emerald-500 animate-gradient-hero">
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
      color: "text-blue-500",
      label: "Open",
    },
    resolved: {
      icon: CheckCircle2,
      color: "text-green-500",
      label: "Resolved",
    },
    unresolved: {
      icon: XCircle,
      color: "text-red-500",
      label: "Unresolved",
    },
    funded: {
      icon: CircleDollarSign,
      color: "text-yellow-500",
      label: "Funded",
    },
    pending: {
      icon: Hourglass,
      color: "text-gray-500",
      label: "Pending",
    },
  };

  const StatusIcon = statusConfig[mediation.status].icon;

  const handleDelete = async () => {
    if (!mediation?._id) return;
    setIsDeleting(true);
    try {
      const response = await fetch("/api/nillion/delete", {
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
      const response = await fetch("/api/nillion/update", {
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
    <div className="relative min-h-screen bg-gradient-to-br from-blue-500 via-teal-500 to-emerald-500 animate-gradient-hero">
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

          {/* Action Buttons */}
          {mediation.status === "open" && address === mediation.creator && (
            <div className="w-full max-w-3xl flex justify-between items-center mb-6">
              {/* Fund Button */}
              {!isEditMode && (
                <button
                  disabled={isPending || isConfirming}
                  onClick={() => {
                    sendTransaction({
                      to: mediation.mediator as `0x${string}`,
                      value: parseEther(mediation.amount.toString()),
                    });
                  }}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-500/70 hover:bg-indigo-500/90 text-white rounded-lg backdrop-blur-sm transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-500/20"
                >
                  {isPending || isConfirming ? (
                    <>
                      <LoadingSpinner size="sm" />
                      {isPending ? "Processing..." : "Confirming..."}
                    </>
                  ) : (
                    <>
                      <CircleDollarSign className="w-4 h-4" />
                      <span>Fund ({mediation.amount} ETH)</span>
                    </>
                  )}
                </button>
              )}

              {/* Edit/Delete Buttons */}
              {!isPending && !isConfirming && !isEditMode && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-all"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-all disabled:opacity-50"
                    title="Delete"
                  >
                    {isDeleting ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}

              {/* Save/Cancel Buttons for Edit Mode */}
              {isEditMode && (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-all disabled:opacity-50"
                    title="Save"
                  >
                    {isSaving ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditMode(false);
                      setEditedTitle(mediation.title);
                      setEditedDescription(mediation.description);
                    }}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-all"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Details */}
          <div className="w-full max-w-3xl space-y-8">
            {/* Description and Financial Details */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-xl font-serif text-white mb-4">
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

              <div className="mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-white" />
                  <h2 className="text-xl font-serif text-white">
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
                </div>
              </div>
            </div>

            {/* Mediator Model */}
            {mediation.model && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Bot className="w-5 h-5 text-white" />
                  <h2 className="text-xl font-serif text-white">
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
                <h2 className="text-xl font-serif text-white">Parties</h2>
              </div>

              <div className="space-y-4">
                {/* Existing Parties */}
                {mediation.parties.map(
                  (party, index) =>
                    !removedPartyIndexes.includes(index) && (
                      <div
                        key={party}
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
                            {party}
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
                        New parties will be saved when you click &ldquo;Save
                        Changes&rdquo;
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Resolution Details */}
            {(mediation.resolution || mediation.resolutionDate) && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h2 className="text-xl font-serif text-white mb-4">
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

            {/* Party Statement - Only show if user is a party */}
            {mediation.parties.some(
              (p) => p.toLowerCase() === address?.toLowerCase()
            ) && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <UsersRound className="w-5 h-5 text-white" />
                  <h2 className="text-xl font-serif text-white">
                    Your Party Statement
                  </h2>
                </div>
                {party ? (
                  <div className="text-white/80">
                    <p className="mb-2">Status: {party.status}</p>
                    {party.statement && (
                      <div className="bg-white/10 rounded-lg p-4">
                        <p className="whitespace-pre-wrap">{party.statement}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-white/80">
                    <p>You haven't submitted your statement yet.</p>
                    <button
                      onClick={() => router.push(`/party/${mediation._id}`)}
                      className="mt-4 bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg backdrop-blur-sm transition-all"
                    >
                      Submit Statement
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

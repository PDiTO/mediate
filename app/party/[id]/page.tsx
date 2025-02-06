"use client";

import { useAccount } from "wagmi";
import { useEffect, use, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { Mediation } from "../../../types/mediation";
import { Party } from "../../../types/party";
import { FileText, FileQuestion } from "lucide-react";

export default function PartyStatement({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const resolvedParams = use(params);
  const [mediation, setMediation] = useState<Mediation | null>(null);
  const [party, setParty] = useState<Party | null>(null);
  const [statement, setStatement] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          const mediationRecord = mediationData.records[0];
          setMediation(mediationRecord);

          // Check if user is a party
          if (
            !mediationRecord.parties.some(
              (p: string) => p.toLowerCase() === address?.toLowerCase()
            )
          ) {
            console.error("User is not a party in this mediation");
            router.push("/dashboard");
            return;
          }
        } else {
          console.error("Mediation not found");
          router.push("/dashboard");
          return;
        }

        if (
          partyData.success &&
          partyData.records &&
          partyData.records.length > 0
        ) {
          setParty(partyData.records[0]);
          setStatement(partyData.records[0].statement || "");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediation || !address || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/nillion/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          schema: "partySchema",
          data: {
            mediationId: mediation._id,
            address: address,
            statement,
            status: "submitted",
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        router.push(`/issue/${mediation._id}`);
      } else {
        console.error("Failed to submit statement");
      }
    } catch (error) {
      console.error("Error submitting statement:", error);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-teal-500 to-emerald-500 animate-gradient-hero">
      <Navbar />
      <div className="max-w-7xl mx-auto px-8 pt-32 pb-16">
        <div className="max-w-3xl mx-auto bg-white/20 backdrop-blur-sm rounded-lg p-8">
          <h1 className="text-4xl font-serif text-white mb-8">
            Submit Your Statement
          </h1>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-white" />
              <h2 className="text-xl font-serif text-white">Issue Details</h2>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">
                {mediation.title}
              </h3>
              <p className="text-white/80 whitespace-pre-wrap">
                {mediation.description}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <FileQuestion className="w-5 h-5 text-white" />
                <label
                  htmlFor="statement"
                  className="text-xl font-serif text-white"
                >
                  Your Statement
                </label>
              </div>
              <textarea
                id="statement"
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                className="w-full h-48 bg-white/10 text-white placeholder:text-white/80 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Enter your statement..."
                required
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push(`/issue/${mediation._id}`)}
                className="flex items-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Statement"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

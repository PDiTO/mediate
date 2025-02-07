import { Mediation } from "../types/mediation";
import { Party } from "../types/party";
import { format } from "date-fns";
import {
  CircleDot,
  CheckCircle2,
  XCircle,
  CircleDollarSign,
  ShieldCheck,
  UsersRound,
  Hourglass,
  FileText,
  FileQuestion,
  AlertCircle,
  Bot,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

interface MediationCardProps {
  mediation: Mediation;
  party?: Party;
}

export default function MediationCard({
  mediation,
  party,
}: MediationCardProps) {
  const router = useRouter();
  const { address } = useAccount();

  const statusConfig = {
    open: {
      icon: CircleDot,
      color: "text-blue-500",
    },
    resolved: {
      icon: CheckCircle2,
      color: "text-green-500",
    },
    unresolved: {
      icon: XCircle,
      color: "text-red-500",
    },
    funded: {
      icon: CircleDollarSign,
      color: "text-yellow-500",
    },
    pending: {
      icon: Bot,
      color: "text-white",
    },
  };

  const StatusIcon = statusConfig[mediation.status].icon;

  // Determine user's role
  const isCreator = address?.toLowerCase() === mediation.creator.toLowerCase();
  const isParty = mediation.parties.some(
    (party) => party.toLowerCase() === address?.toLowerCase()
  );

  // Determine if action is needed
  const needsAction =
    (isCreator && mediation.status === "open") || // Creator needs to fund
    (isParty && !party); // Party needs to submit statement

  const actionMessage =
    isCreator && mediation.status === "open"
      ? "Needs Funding"
      : isParty && !party
      ? "Statement Required"
      : "";

  return (
    <div
      onClick={() => router.push(`/issue/${mediation._id}`)}
      className="bg-white/20 backdrop-blur-sm rounded-lg p-6 hover:bg-white/30 transition-all cursor-pointer relative"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-white">{mediation.title}</h3>
        <StatusIcon
          className={`w-7 h-7 ${statusConfig[mediation.status].color}`}
        />
      </div>
      <p className="text-white/80 mb-4">{mediation.description}</p>
      <div className="flex justify-between items-center text-sm text-white/60">
        <div>{format(new Date(mediation.createdAt), "MMM d, yyyy")}</div>
        <div className="flex items-center gap-2">
          {needsAction && (
            <div className="bg-amber-500/90 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {actionMessage}
            </div>
          )}
          {isCreator && (
            <ShieldCheck className="w-7 h-7" aria-label="Creator" />
          )}
          {isParty && (
            <>
              <UsersRound className="w-7 h-7" aria-label="Party" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

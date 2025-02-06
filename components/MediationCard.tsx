import { Mediation } from "../types/mediation";
import { format } from "date-fns";
import {
  CircleDot,
  CheckCircle2,
  XCircle,
  CircleDollarSign,
  ShieldCheck,
  UsersRound,
  Hourglass,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

interface MediationCardProps {
  mediation: Mediation;
}

export default function MediationCard({ mediation }: MediationCardProps) {
  const router = useRouter();
  const { address } = useAccount();

  const statusConfig = {
    open: {
      icon: CircleDot,
      color: "text-blue-400",
    },
    resolved: {
      icon: CheckCircle2,
      color: "text-green-500",
    },
    unresolved: {
      icon: XCircle,
      color: "text-red-400",
    },
    funded: {
      icon: CircleDollarSign,
      color: "text-yellow-400",
    },
    pending: {
      icon: Hourglass,
      color: "text-gray-400",
    },
  };

  const StatusIcon = statusConfig[mediation.status].icon;

  // Determine user's role
  const isCreator = address?.toLowerCase() === mediation.creator.toLowerCase();
  const isParty = mediation.parties.some(
    (party) => party.toLowerCase() === address?.toLowerCase()
  );

  return (
    <div
      onClick={() => router.push(`/issue/${mediation._id}`)}
      className="bg-white/20 backdrop-blur-sm rounded-lg p-6 hover:bg-white/30 transition-all cursor-pointer"
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
          {isCreator && <ShieldCheck className="w-7 h-7" />}
          {isParty && <UsersRound className="w-7 h-7" />}
        </div>
      </div>
    </div>
  );
}

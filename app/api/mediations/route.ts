import { NextRequest, NextResponse } from "next/server";
import { testMediations } from "../../../data/mediations";
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get("wallet");
    const signature = request.headers.get("x-signature");
    const timestamp = request.headers.get("x-timestamp");

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Simulate database delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Filter mediations where the wallet is either creator or in parties
    const filteredMediations = testMediations.filter(
      (mediation) =>
        mediation.creator.toLowerCase() === walletAddress.toLowerCase() ||
        mediation.parties.some(
          (party) => party.toLowerCase() === walletAddress.toLowerCase()
        )
    );

    return NextResponse.json({
      mediations: filteredMediations,
    });
  } catch (error) {
    console.error("Error fetching mediations:", error);
    return NextResponse.json(
      { error: "Failed to fetch mediations" },
      { status: 500 }
    );
  }
}

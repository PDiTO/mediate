import { NextResponse } from "next/server";
import { createNillionRecordWithSchema } from "../../../../lib/nillion/core/create";
import { CdpWalletProvider } from "@coinbase/agentkit";

export async function POST(request: Request) {
  try {
    const { schema, data } = await request.json();

    if (!schema || !data) {
      return NextResponse.json(
        { success: false, error: "Schema name and data are required" },
        { status: 400 }
      );
    }

    const config = {
      apiKeyName: process.env.CDP_API_KEY_NAME!,
      apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY!.replace(
        /\\n/g,
        "\n"
      ),
      networkId: process.env.NETWORK_ID || "base-sepolia",
    };

    const walletProvider = await CdpWalletProvider.configureWithWallet(config);

    const mediatorCDPData = JSON.stringify(await walletProvider.exportWallet());

    if (!data.mediator) {
      data.mediator = walletProvider.getAddress();
    }
    if (!data.mediatorCDPData) {
      data.mediatorCDPData = {
        $allot: mediatorCDPData,
      };
    }

    const recordIds = await createNillionRecordWithSchema(schema, data);
    return NextResponse.json({ success: true, recordIds });
  } catch (error: any) {
    console.error("Error writing to Nillion:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error occurred" },
      { status: 500 }
    );
  }
}

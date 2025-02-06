import { NextResponse } from "next/server";
import { writeNillionWithSchema } from "../../../../lib/nillion/core/create";

export async function POST(request: Request) {
  try {
    const { schema, data } = await request.json();

    if (!schema || !data) {
      return NextResponse.json(
        { success: false, error: "Schema name and data are required" },
        { status: 400 }
      );
    }

    if (Array.isArray(data)) {
      data.forEach((item) => {
        if (!item.mediator) {
          item.mediator = "0x0000000000000000000000000000000000000000"; // Placeholder mediator address
        }
        if (!item.mediatorCDPData) {
          item.mediatorCDPData = {
            $allot: "encrypted_mediator_data", // Placeholder encrypted data
          };
        }
      });
    }

    const recordIds = await writeNillionWithSchema(schema, data);
    return NextResponse.json({ success: true, recordIds });
  } catch (error: any) {
    console.error("Error writing to Nillion:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error occurred" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { readNillionRecordsWithSchema } from "../../../../lib/nillion/core/read";
import { Mediation } from "../../../../types/mediation";

export async function POST(request: Request) {
  try {
    const { schema, filter = {}, isServerSide = false } = await request.json();

    if (!schema) {
      return NextResponse.json(
        { success: false, error: "Schema name is required" },
        { status: 400 }
      );
    }

    const records = await readNillionRecordsWithSchema(schema, filter);

    // If server-side request, return full data
    if (isServerSide) {
      return NextResponse.json({ success: true, records });
    }

    return NextResponse.json({ success: true, records: records });
  } catch (error: any) {
    console.error("Error reading from Nillion:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error occurred" },
      { status: 500 }
    );
  }
}

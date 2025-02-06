import { NextResponse } from "next/server";
import { createNillionRecordWithSchema } from "../../../../../lib/nillion/core/create";

export async function POST(request: Request) {
  try {
    const { schema, data } = await request.json();

    if (!schema || !data) {
      return NextResponse.json(
        { success: false, error: "Schema name and data are required" },
        { status: 400 }
      );
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

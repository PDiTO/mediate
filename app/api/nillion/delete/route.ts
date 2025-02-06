import { NextResponse } from "next/server";
import { deleteNillionRecordWithSchema } from "../../../../lib/nillion/core/delete";

export async function POST(request: Request) {
  try {
    const { schema, id } = await request.json();

    // Validate required fields
    if (!schema || !id) {
      return NextResponse.json(
        { success: false, error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    await deleteNillionRecordWithSchema(schema, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting records:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete records" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { updateNillionRecordWithSchema } from "@/lib/nillion/core/update";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID is required for update" },
        { status: 400 }
      );
    }

    await updateNillionRecordWithSchema("partySchema", id, updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating mediation:", error);
    return NextResponse.json(
      { error: "Failed to update mediation" },
      { status: 500 }
    );
  }
}

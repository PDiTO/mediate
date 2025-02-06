import { NextResponse } from "next/server";
import { updateNillionRecordWithSchema } from "@/lib/nillion/core/update";

// Fields that cannot be modified by clients
const PROTECTED_FIELDS = [
  "mediator",
  "mediatorCDPData",
  "creator",
  "createdAt",
  "_id",
];

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

    // Check for protected fields in the update data
    const protectedFieldsAttempted = PROTECTED_FIELDS.filter(
      (field) => field in updateData
    );
    if (protectedFieldsAttempted.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot update protected fields: ${protectedFieldsAttempted.join(
            ", "
          )}`,
          protectedFields: protectedFieldsAttempted,
        },
        { status: 403 }
      );
    }

    await updateNillionRecordWithSchema("mediationSchema", id, updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating mediation:", error);
    return NextResponse.json(
      { error: "Failed to update mediation" },
      { status: 500 }
    );
  }
}

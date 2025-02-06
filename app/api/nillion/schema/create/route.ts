import { NextResponse } from "next/server";
import { postSchema } from "../../../../../lib/nillion/helpers/postSchema";

export async function POST() {
  try {
    await postSchema("partySchema");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error posting schema:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error occurred" },
      { status: 500 }
    );
  }
}

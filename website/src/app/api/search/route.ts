import { NextResponse } from "next/server";
import { getSearchEntries } from "@/lib/content/loader";

export async function GET() {
  const entries = await getSearchEntries();
  return NextResponse.json(entries);
}

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { toggleSavedPrompt } from "@/db/queries";
import { bumpContentVersion } from "@/lib/cache";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { id } = await params;
  const saved = await toggleSavedPrompt(id, session.id);
  await bumpContentVersion();
  return NextResponse.json({ saved });
}

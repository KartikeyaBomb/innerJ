import { NextResponse } from "next/server";
import { removeFromCollection } from "@/db/queries";
import { getSessionUser } from "@/lib/auth";
import { bumpContentVersion } from "@/lib/cache";

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string; promptId: string }> }
) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { id, promptId } = await params;
  await removeFromCollection(id, promptId, session.id);
  await bumpContentVersion();
  return NextResponse.json({ ok: true });
}

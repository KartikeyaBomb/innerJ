import { NextResponse } from "next/server";
import { addComment, getComments } from "@/db/queries";
import { getSessionUser } from "@/lib/auth";
import { bumpContentVersion } from "@/lib/cache";
import { commentSchema } from "@/lib/validation";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({ comments: await getComments(id) });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const parsed = commentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Comment must be between 2 and 2,000 characters." }, { status: 400 });
  }

  const { id } = await params;
  await addComment(id, session.id, parsed.data.body);
  await bumpContentVersion();
  return NextResponse.json({ ok: true }, { status: 201 });
}

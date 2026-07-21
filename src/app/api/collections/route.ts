import { NextResponse } from "next/server";
import { createCollection, getCollections } from "@/db/queries";
import { getSessionUser } from "@/lib/auth";
import { collectionSchema } from "@/lib/validation";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  return NextResponse.json({ collections: await getCollections(session.id) });
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const parsed = collectionSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid collection." }, { status: 400 });

  const id = await createCollection({ ownerId: session.id, ...parsed.data });
  return NextResponse.json({ id }, { status: 201 });
}

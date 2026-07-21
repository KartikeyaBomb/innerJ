import { NextResponse } from "next/server";
import { sql } from "@/db";

export async function GET() {
  const startedAt = Date.now();
  try {
    await sql`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      database: "connected",
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "degraded",
        database: "unavailable",
        error: error instanceof Error ? error.message : "Unknown database error"
      },
      { status: 503 }
    );
  }
}

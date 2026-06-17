// This route is excluded during static export via next.config.ts
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ ok: true });
}

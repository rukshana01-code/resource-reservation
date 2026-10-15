import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resourceInputSchema } from "@/lib/validation";

// GET /api/resources            -> active resources
// GET /api/resources?all=true   -> including deactivated ones
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all") === "true";

  const resources = await prisma.resource.findMany({
    where: all ? undefined : { isActive: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(resources);
}

// POST /api/resources -> create a resource
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = resourceInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
      },
      { status: 400 },
    );
  }

  try {
    const resource = await prisma.resource.create({ data: parsed.data });
    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    // P2002 = unique constraint (resource names must be unique)
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "A resource with this name already exists" }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
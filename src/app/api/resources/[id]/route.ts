import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resourceInputSchema } from "@/lib/validation";

// PATCH /api/resources/1 -> edit fields, or deactivate with {"isActive": false}
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const resourceId = Number(id);
  if (!Number.isInteger(resourceId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = resourceInputSchema.partial().safeParse(body);
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
    const resource = await prisma.resource.update({ where: { id: resourceId }, data: parsed.data });
    return NextResponse.json(resource);
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "P2025") return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    if (code === "P2002") return NextResponse.json({ error: "A resource with this name already exists" }, { status: 409 });
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
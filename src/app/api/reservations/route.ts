import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reservationInputSchema } from "@/lib/validation";
import { isOverlapError } from "@/lib/reservation-errors";

// GET /api/reservations?resourceId=1  -> list reservations
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const resourceId = searchParams.get("resourceId");

  const reservations = await prisma.reservation.findMany({
    where: resourceId ? { resourceId: Number(resourceId) } : undefined,
    include: { resource: true, user: true },
    orderBy: { startTime: "asc" },
  });
  return NextResponse.json(reservations);
}

// POST /api/reservations -> create a reservation
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // 1. Validate the input
  const parsed = reservationInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 },
    );
  }
  const data = parsed.data;

  // 2. The resource must exist and be active
  const resource = await prisma.resource.findUnique({ where: { id: data.resourceId } });
  if (!resource || !resource.isActive) {
    return NextResponse.json(
      { error: "This resource does not exist or is not available" },
      { status: 404 },
    );
  }

  // 3. Insert. The database itself rejects overlapping bookings.
  try {
    const reservation = await prisma.reservation.create({ data });
    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    if (isOverlapError(error)) {
      return NextResponse.json(
        { error: "This resource is already booked for part of that time. Please pick another slot." },
        { status: 409 },
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
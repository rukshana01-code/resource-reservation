import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/reservations/1 -> cancels the reservation (kept for history)
export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const reservationId = Number(id);
  if (!Number.isInteger(reservationId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const existing = await prisma.reservation.findUnique({ where: { id: reservationId } });
  if (!existing) {
    return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  }
  if (existing.status === "CANCELLED") {
    return NextResponse.json({ error: "This reservation is already cancelled" }, { status: 409 });
  }

  const cancelled = await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });
  return NextResponse.json(cancelled);
}
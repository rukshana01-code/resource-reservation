export const OVERLAP_CONSTRAINT = "reservation_no_overlap";
export const EXCLUSION_VIOLATION_SQLSTATE = "23P01";

// True when the database rejected an insert because the time slot is taken.
export function isOverlapError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const { message, meta } = error as { message?: unknown; meta?: unknown };

  const texts: string[] = [];
  if (typeof message === "string") texts.push(message);
  if (meta !== undefined) {
    try {
      texts.push(JSON.stringify(meta));
    } catch {}
  }
  return texts.some(
    (t) => t.includes(OVERLAP_CONSTRAINT) || t.includes(EXCLUSION_VIOLATION_SQLSTATE),
  );
}
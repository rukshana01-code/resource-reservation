import { z } from "zod";

export const MAX_RESERVATION_HOURS = 12;

export const resourceInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  category: z.string().trim().min(1, "Category is required").max(50),
  capacity: z.coerce.number().int("Capacity must be a whole number").min(1).max(10000),
  description: z.string().trim().max(500).optional(),
  isActive: z.boolean().optional(),
});

export const reservationInputSchema = z
  .object({
    resourceId: z.coerce.number().int().positive("Choose a resource"),
    userId: z.coerce.number().int().positive("Choose who is booking"),
    startTime: z.coerce.date({ error: "Enter a valid start time" }),
    endTime: z.coerce.date({ error: "Enter a valid end time" }),
    purpose: z.string().trim().max(200).optional(),
  })
  .superRefine((v, ctx) => {
    if (Number.isNaN(v.startTime.getTime()) || Number.isNaN(v.endTime.getTime())) return;

    if (v.endTime <= v.startTime) {
      ctx.addIssue({ code: "custom", path: ["endTime"], message: "End time must be after the start time" });
      return;
    }
    if (v.startTime < new Date()) {
      ctx.addIssue({ code: "custom", path: ["startTime"], message: "Start time cannot be in the past" });
    }
    const hours = (v.endTime.getTime() - v.startTime.getTime()) / 3_600_000;
    if (hours > MAX_RESERVATION_HOURS) {
      ctx.addIssue({ code: "custom", path: ["endTime"], message: `A reservation cannot be longer than ${MAX_RESERVATION_HOURS} hours` });
    }
  });
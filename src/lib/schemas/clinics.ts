// src/lib/schemas/clinic.ts
import { z } from "zod";

export const Coords = z.tuple([z.number(), z.number()]);

export const ClinicSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  address: z.string().min(5),
  url: z.string().url().optional().default(""),
  services: z.array(z.string()).default([]),
  coords: Coords,
  summary: z.string().optional(),
  slug: z.string().optional(),
  languages: z.array(z.string()).optional(),
  eligibility: z.array(z.string()).optional(),
  phone: z.string().optional(),
  hours: z.string().optional(),
  verified: z.boolean().optional().default(false),
  nameLower: z.string().optional(),
});

export type ClinicInput = z.infer<typeof ClinicSchema>;

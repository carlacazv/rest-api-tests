import { z } from "zod";

export const measureSchema = z
  .object({
    imperial: z.string().optional(),
    metric: z.string().optional(),
  })
  .passthrough();

export const breedSchema = z
  .object({
    id: z.union([z.number(), z.string()]),
    name: z.string().min(1),
    temperament: z.string().optional(),
    life_span: z.string().optional(),
    breed_group: z.string().optional(),
    origin: z.string().optional(),
    reference_image_id: z.string().optional(),
    weight: z.union([measureSchema, z.string()]).optional(),
    height: z.union([measureSchema, z.string()]).optional(),
  })
  .passthrough();

export const breedListSchema = z.array(breedSchema);

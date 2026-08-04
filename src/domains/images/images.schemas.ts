import { z } from "zod";
import { breedSchema } from "../breeds/breeds.schemas.js";

export const imageSchema = z
  .object({
    id: z.string().min(1),
    url: z.string().url(),
    width: z.number().int().nonnegative().optional(),
    height: z.number().int().nonnegative().optional(),
    breeds: z.array(breedSchema).optional(),
    categories: z.array(z.object({ id: z.number(), name: z.string() }).passthrough()).optional(),
  })
  .passthrough();

export const imageListSchema = z.array(imageSchema);

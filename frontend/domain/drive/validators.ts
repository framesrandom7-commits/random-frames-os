import { z } from "zod";

export const DriveFolderCreationSchema = z.object({
  name: z.string().min(1),
  parentId: z.string().optional(),
});

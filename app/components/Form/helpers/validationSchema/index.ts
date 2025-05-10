import { z } from "zod";

export const validationSchema = z.object({
  file: z
    .custom<FileList>()
    .refine((val) => val.length > 0, "ファイルは必須です")
    .refine((val) => {
      const file = val.item(0);
      return file?.type === "text/csv" || file?.name.endsWith(".csv");
    }, "CSVファイルのみ許可されています"),
});

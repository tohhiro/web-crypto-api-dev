// import { z } from "zod";

// export const validationSchema = z.object({
//   file: z
//     .custom<FileList>()
//     .refine((val) => val.length > 0, "ファイルは必須です")
//     .refine((val) => {
//       const file = val.item(0);
//       return file?.type === "text/csv" || file?.name.endsWith(".csv");
//     }, "CSVファイルのみ許可されています"),
// });
// helpers/validationSchema.ts
// import { z } from "zod";

// export const validationSchema = z.object({
//   file: z
//     .custom<FileList>((val) => val instanceof FileList && val.length > 0, {
//       message: "CSVファイルを1つ選択してください",
//     })
//     .refine(
//       (fileList) => fileList.item(0)?.type === "text/csv",
//       "CSVファイルのみアップロードできます"
//     ),
// });

// export type FormSchema = z.infer<typeof validationSchema>;

import { z } from "zod";

export const validationSchema = z.object({
  file: z
    .custom<FileList>()
    .refine(
      (val): val is FileList => {
        return (
          typeof val === "object" &&
          val !== null &&
          typeof (val as FileList).length === "number" &&
          typeof (val as FileList).item === "function" &&
          (val as FileList).length > 0
        );
      },
      {
        message: "ファイルは必須です",
      }
    )
    .refine(
      (val) => {
        if (
          !val ||
          typeof val.item !== "function" ||
          typeof val.length !== "number" ||
          val.length === 0
        ) {
          return false;
        }
        const file = val.item(0);
        return file?.type === "text/csv" || file?.name.endsWith(".csv");
      },
      {
        message: "CSVファイルのみ許可されています",
      }
    ),
});

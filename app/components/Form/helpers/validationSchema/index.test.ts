import { describe, expect } from "vitest";
import { validationSchema } from ".";

const createFileListMock = (files: File[]): FileList => {
  return {
    0: files[0],
    length: files.length,
    item(index: number) {
      return this[index] ?? null;
    },
    *[Symbol.iterator](this: FileList): Generator<File> {
      for (let i = 0; i < this.length; i++) {
        yield this[i];
      }
    },
  };
};

describe("validationSchema", () => {
  test("CSVであればtrue", () => {
    const csvFile = new File(["id,name\n1,Alice"], "test.csv", {
      type: "text/csv",
    });
    const fileList = createFileListMock([csvFile]);

    const result = validationSchema.safeParse({ file: fileList });
    expect(result.success).toBe(true);
  });

  test("ファイルが存在しない場合はfalse", () => {
    const fileList = createFileListMock([]);
    const result = validationSchema.safeParse({ file: fileList });
    expect(result.success).toBe(false);
  });

  test("CSVでない場合はfalse", () => {
    const txtFile = new File(["Hello"], "test.txt", {
      type: "text/plain",
    });
    const fileList = createFileListMock([txtFile]);

    const result = validationSchema.safeParse({ file: fileList });
    expect(result.success).toBe(false);
  });
});

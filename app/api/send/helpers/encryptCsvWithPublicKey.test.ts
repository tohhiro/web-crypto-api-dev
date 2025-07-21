/// <reference types="vitest" />
// @vitest-environment node

import { encryptCsvWithPublicKey } from "./encryptCsvWithPublicKey";

// RSA 2048bit 公開鍵 (spki base64形式) のダミー（正常系用）
const validPublicKeyBase64 = "MIIBIjANBgkq...略...IDAQAB";

function createMockFile(content: string, name = "test.csv", type = "text/csv") {
  const blob = new Blob([content], { type });
  return new File([blob], name, { type });
}

let publicKeyBase64: string;

beforeAll(async () => {
  // テスト用にRSAキーを生成（RSA-OAEP + SHA-256）
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );

  const exportedPublicKey = await crypto.subtle.exportKey(
    "spki",
    keyPair.publicKey
  );
  publicKeyBase64 = Buffer.from(exportedPublicKey).toString("base64");
});

describe("encryptCsvWithPublicKey", () => {
  test("CSVを暗号化し、base64 encodedすること", async () => {
    const file = createMockFile("name,age\nAlice,30\nBob,25");

    const result = await encryptCsvWithPublicKey(file, publicKeyBase64);

    expect(result).toHaveProperty("encryptedCsv");
    expect(result).toHaveProperty("encryptedKey");
    expect(result).toHaveProperty("iv");

    expect(typeof result.encryptedCsv).toBe("string");
    expect(typeof result.encryptedKey).toBe("string");
    expect(typeof result.iv).toBe("string");
  });

  test("異常系：公開鍵が不正な形式（base64 decodeできない）場合、エラーをスローすること", async () => {
    const file = createMockFile("name,age\nAlice,30\nBob,25");
    const invalidKey = "not_base64_encoded_key";

    await expect(() =>
      encryptCsvWithPublicKey(file, invalidKey)
    ).rejects.toThrow(/Invalid keyData/);
  });

  test("異常系：公開鍵はbase64だがRSA鍵ではない場合、エラーをスローすること", async () => {
    const file = createMockFile("name,age\nAlice,30\nBob,25");
    const fakeBase64 = Buffer.from("not an RSA key").toString("base64");

    await expect(() =>
      encryptCsvWithPublicKey(file, fakeBase64)
    ).rejects.toThrow(/Invalid keyData/);
  });

  test("異常系：file.arrayBuffer() が壊れているファイルの場合、エラーをスローすること", async () => {
    const brokenFile = {
      arrayBuffer: () => Promise.reject(new Error("Fake File Error")),
      name: "test.csv",
      type: "text/csv",
    } as unknown as File;

    await expect(() =>
      encryptCsvWithPublicKey(brokenFile, validPublicKeyBase64)
    ).rejects.toThrow("Fake File Error");
  });
});

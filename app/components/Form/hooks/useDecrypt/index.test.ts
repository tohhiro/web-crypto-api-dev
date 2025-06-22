import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useDecrypt } from ".";
import type { KeyAndCsv } from "@/app/components/Form";

type MockKeyPair = {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
};

const toBase64 = (buffer: Uint8Array) => btoa(String.fromCharCode(...buffer));

describe("useDecrypt", () => {
  let mockKeyPair: MockKeyPair;
  let decryptedText = "id,name\n1,Alice\n2,Bob";
  const decryptedCsvBuffer = new TextEncoder().encode(decryptedText);

  // 元の createElement を保持
  const originalCreateElement = document.createElement;

  beforeEach(() => {
    // モックキーの準備
    mockKeyPair = {
      publicKey: {} as CryptoKey,
      privateKey: {} as CryptoKey,
    };

    // crypto.subtle.decrypt のモック
    vi.spyOn(crypto.subtle, "decrypt").mockImplementation(
      async (algo, _key, _data) => {
        if ((algo as any).name === "RSA-OAEP") {
          return new Uint8Array([11, 22, 33]).slice().buffer as ArrayBuffer; // AES鍵
        } else if ((algo as any).name === "AES-GCM") {
          return decryptedCsvBuffer.slice().buffer as ArrayBuffer; // 復号されたCSVデータ
        }
        throw new Error("Unexpected algorithm");
      }
    );

    // AES鍵のインポートモック
    vi.spyOn(crypto.subtle, "importKey").mockResolvedValue({} as CryptoKey);

    // URL API のモック
    global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = vi.fn();

    // aタグのクリックモック（無限ループ防止）
    vi.spyOn(document, "createElement").mockImplementation(
      (tagName: string) => {
        if (tagName === "a") {
          const anchor = originalCreateElement.call(document, "a");
          anchor.click = vi.fn();
          return anchor;
        }
        return originalCreateElement.call(document, tagName);
      }
    );
  });

  test("decrypts the data and triggers download", async () => {
    const encryptedData: KeyAndCsv = {
      encryptedCsv: toBase64(new Uint8Array([1, 2, 3])),
      encryptedKey: toBase64(new Uint8Array([4, 5, 6])),
      iv: toBase64(new Uint8Array([7, 8, 9])),
    };

    const { result } = renderHook(() => useDecrypt());

    await act(async () => {
      await result.current.decrypt({ encryptedData, keyPair: mockKeyPair });
    });

    expect(crypto.subtle.decrypt).toHaveBeenCalledTimes(2);
    expect(crypto.subtle.importKey).toHaveBeenCalledTimes(1);
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });
});

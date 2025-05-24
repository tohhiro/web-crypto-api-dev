import { renderHook } from "@testing-library/react";
import { useSendPublicKeyAndCsv } from ".";
import { vi } from "vitest";

describe("useSendPublicKeyAndCsv", () => {
  const dummyFile = new File(["dummy content"], "test.csv", {
    type: "text/csv",
  });

  const dummyKey = {
    publicKey: {} as CryptoKey,
    privateKey: {} as CryptoKey,
  };

  beforeEach(() => {
    vi.spyOn(crypto.subtle, "exportKey").mockResolvedValue(
      new Uint8Array([1, 2, 3, 4]).buffer
    );

    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
        })
      )
    );

    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("ファイルが空の場合、「ファイルまたは鍵がありません」のconsole.warnが発生する", async () => {
    const { result } = renderHook(() => useSendPublicKeyAndCsv());

    await result.current.getExportedPublicKey({
      data: { file: [] as unknown as FileList },
      keyPair: dummyKey,
    });
    expect(console.warn).toHaveBeenCalledWith("ファイルまたは鍵がありません");
  });
  test("鍵が空の場合、「ファイルまたは鍵がありません」のconsole.warnが発生する", async () => {
    const { result } = renderHook(() => useSendPublicKeyAndCsv());

    await result.current.getExportedPublicKey({
      data: { file: [dummyFile] as unknown as FileList },
      keyPair: null,
    });
    expect(console.warn).toHaveBeenCalledWith("ファイルまたは鍵がありません");
  });

  test("ファイルと鍵がある場合、exportKeyがspkiで呼ばれ、且つPOSTしステータスコード200が返る", async () => {
    const { result } = renderHook(() => useSendPublicKeyAndCsv());

    const fileList = {
      0: dummyFile,
      length: 1,
      item: (index: number) => (index === 0 ? dummyFile : null),
    } as unknown as FileList;

    const response = await result.current.getExportedPublicKey({
      data: { file: fileList },
      keyPair: dummyKey,
    });

    expect(crypto.subtle.exportKey).toHaveBeenCalledWith(
      "spki",
      dummyKey.publicKey
    );

    expect(fetch).toHaveBeenCalledWith(
      "/api/send",
      expect.objectContaining({
        method: "POST",
        body: expect.any(FormData),
      })
    );

    expect(response).toEqual({ ok: true, status: 200 });
  });
});

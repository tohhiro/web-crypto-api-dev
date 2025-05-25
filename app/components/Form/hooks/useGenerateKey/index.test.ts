import { renderHook, waitFor } from "@testing-library/react";
import { useGenerateKey } from ".";
import { vi } from "vitest";

const mockKeyPair = {
  publicKey: {} as CryptoKey,
  privateKey: {} as CryptoKey,
};

describe("useGenerateKey", () => {
  beforeEach(() => {
    vi.spyOn(globalThis.crypto.subtle, "generateKey").mockResolvedValue(
      mockKeyPair as CryptoKeyPair
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("setKeyとcryptoのgenerateKeyが呼ばれる", async () => {
    const setKey = vi.fn();

    renderHook(() => useGenerateKey({ setKey }));

    await waitFor(() => expect(setKey).toHaveBeenCalledWith(mockKeyPair));
    await waitFor(() =>
      expect(crypto.subtle.generateKey).toHaveBeenCalledTimes(1)
    );
  });

  test("エラーの場合、setKeyは呼ばれず、エラーメッセージが発生する", async () => {
    const error = new Error("Failed to generate key");
    const setKey = vi.fn();
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    vi.spyOn(globalThis.crypto.subtle, "generateKey").mockRejectedValue(error);

    renderHook(() => useGenerateKey({ setKey }));

    // 先にエラーが発生するのを待つ
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    const [msg, err] = consoleErrorSpy.mock.calls[0];
    expect(msg).toBe("Error generating key pair:");
    expect(err).toBe(error);
    expect(setKey).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});

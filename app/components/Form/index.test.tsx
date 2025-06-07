import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Form } from ".";
import type { KeyAndCsv } from "@/app/components/Form";

// モック関数の定義
const mockGenerateKey = vi.fn();
const mockGetExportedPublicKey = vi.fn();
const mockEncrypt = vi.fn();
const mockDecrypt = vi.fn();

// カスタムフックのモック
vi.mock("./hooks", () => ({
  useGenerateKey: () => ({ setKey: mockGenerateKey }),
  useSendPublicKeyAndCsv: () => ({
    getExportedPublicKey: mockGetExportedPublicKey,
  }),
  useEncrypt: () => ({ encrypt: mockEncrypt }),
  useDecrypt: () => ({ decrypt: mockDecrypt }),
}));

describe("Form Component", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("「Attached File」と「Submit」ボタンが表示される", () => {
    render(<Form />);
    expect(screen.getByLabelText(/Attached File/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Submit/i })).toBeInTheDocument();
  });

  test("PDFファイルをアップロードするとAPI通信されず暗号・復号のボタンが表示されない", async () => {
    // モックされたAPIレスポンス
    const mockResponseData: KeyAndCsv = {
      encryptedCsv: "mockEncryptedCsv",
      encryptedKey: "mockEncryptedKey",
      iv: "mockIv",
    };

    // getExportedPublicKeyのモック実装
    mockGetExportedPublicKey.mockResolvedValueOnce({
      json: async () => mockResponseData,
    });

    render(<Form />);

    const file = new File(["id,name\n1,Alice\n2,Bob"], "test.pdf", {
      type: "text/pdf",
    });
    const fileInput = screen.getByLabelText(
      /Attached File/i
    ) as HTMLInputElement;
    await userEvent.upload(fileInput, file);

    const submitButton = screen.getByRole("button", { name: /Submit/i });
    await userEvent.click(submitButton);

    // API呼び出しの確認
    await waitFor(() => {
      expect(mockGetExportedPublicKey).not.toHaveBeenCalled();
    });

    expect(
      screen.queryByRole("button", {
        name: /Download Encrypted CSV/i,
      })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: /Download Decrypted CSV/i,
      })
    ).not.toBeInTheDocument();
  });

  test("CSVファイルをアップロードすると暗号・復号のボタンが表示、押下するとコールバックが呼び出される", async () => {
    // モックされたAPIレスポンス
    const mockResponseData: KeyAndCsv = {
      encryptedCsv: "mockEncryptedCsv",
      encryptedKey: "mockEncryptedKey",
      iv: "mockIv",
    };

    // getExportedPublicKeyのモック実装
    mockGetExportedPublicKey.mockResolvedValueOnce({
      json: async () => mockResponseData,
    });

    render(<Form />);

    // ファイルのアップロード
    const file = new File(["id,name\n1,Alice\n2,Bob"], "test.csv", {
      type: "text/csv",
    });
    const fileInput = screen.getByLabelText(
      /Attached File/i
    ) as HTMLInputElement;
    await user.upload(fileInput, file);

    const submitButton = screen.getByRole("button", { name: /Submit/i });
    await user.click(submitButton);

    const downloadEncryptedButton = await screen.findByRole("button", {
      name: /Download Encrypted CSV/i,
    });
    const downloadDecryptedButton = await screen.findByRole("button", {
      name: /Download Decrypted CSV/i,
    });

    await user.click(downloadEncryptedButton);
    expect(mockEncrypt).toHaveBeenCalledWith({
      encryptedData: mockResponseData,
    });

    await user.click(downloadDecryptedButton);
    expect(mockDecrypt).toHaveBeenCalledWith({
      encryptedData: mockResponseData,
      keyPair: null,
    });
  });
});

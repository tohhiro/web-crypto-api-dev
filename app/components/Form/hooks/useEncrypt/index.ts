import { KeyAndCsv } from "@/app/components/Form";

export const useEncrypt = () => {
  const encrypt = ({ encryptedData }: { encryptedData: KeyAndCsv | null }) => {
    if (!encryptedData) return;
    // Base64データをBlobに変換
    const encryptedCsvBlob = new Blob(
      [
        new Uint8Array(
          atob(encryptedData.encryptedCsv)
            .split("")
            .map((c) => c.charCodeAt(0))
        ),
      ],
      { type: "application/octet-stream" }
    );
    const encryptedCsvUrl = URL.createObjectURL(encryptedCsvBlob);
    // ダウンロードのリンクを生成してクリック
    const encryptedCsvLink = document.createElement("a");
    encryptedCsvLink.href = encryptedCsvUrl;
    encryptedCsvLink.download = "encrypted.csv";
    encryptedCsvLink.click();
    // URLを解放
    URL.revokeObjectURL(encryptedCsvUrl);
  };
  return { encrypt };
};

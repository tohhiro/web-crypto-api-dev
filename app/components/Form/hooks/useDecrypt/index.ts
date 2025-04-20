import { KeyAndCsv } from "@/app/components/Form";

export const useDecrypt = () => {
  const decrypt = async ({
    encryptedData,
    keyPair,
  }: {
    encryptedData: KeyAndCsv | null;
    keyPair: CryptoKeyPair | null;
  }) => {
    if (!encryptedData || !keyPair) return;

    // Base64からBufferに変換
    const encryptedCsvBuffer = Uint8Array.from(
      atob(encryptedData.encryptedCsv),
      (c) => c.charCodeAt(0)
    );
    const encryptedKeyBuffer = Uint8Array.from(
      atob(encryptedData.encryptedKey),
      (c) => c.charCodeAt(0)
    );
    const ivBuffer = Uint8Array.from(atob(encryptedData.iv), (c) =>
      c.charCodeAt(0)
    );

    // 秘密鍵を使って対称鍵（AES）を復号
    const decryptedSymmetricKeyBuffer = await crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      keyPair.privateKey,
      encryptedKeyBuffer
    );

    // 対称鍵をインポート
    const symmetricKey = await crypto.subtle.importKey(
      "raw",
      decryptedSymmetricKeyBuffer,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );

    // 対称鍵でCSVを復号
    const decryptedCsvBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivBuffer,
      },
      symmetricKey,
      encryptedCsvBuffer
    );

    // 復号後のデータをCSVに変換
    const decodedCsv = new TextDecoder().decode(decryptedCsvBuffer);

    // 復号したデータをダウンロード
    const decryptedBlob = new Blob([decodedCsv], { type: "text/csv" });
    const decryptedUrl = URL.createObjectURL(decryptedBlob);

    // ダウンロードのリンクを生成してクリック
    const decryptedLink = document.createElement("a");
    decryptedLink.href = decryptedUrl;
    decryptedLink.download = "decrypted.csv";
    decryptedLink.click();

    // URLを解放
    URL.revokeObjectURL(decryptedUrl);
  };

  return {
    decrypt,
  };
};

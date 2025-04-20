export const useSendPublicKeyAndCsv = () => {
  const getExportedPublicKey = async ({
    data,
    keyPair,
  }: {
    data: { file: FileList };
    keyPair: CryptoKeyPair | null;
  }) => {
    const file = data.file[0]; // FileList なので 0 番目を使う
    if (!file || !keyPair) {
      console.warn("ファイルまたは鍵がありません");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const exportedPublicKey = await crypto.subtle.exportKey(
      "spki",
      keyPair.publicKey
    );
    const base64PublicKey = btoa(
      String.fromCharCode(...new Uint8Array(exportedPublicKey))
    );
    formData.append("publicKey", base64PublicKey);

    const result = await fetch("/api/send", {
      method: "POST",
      body: formData,
    });

    return result;
  };
  return { getExportedPublicKey };
};

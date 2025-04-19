// "use client";

// import { useState, useEffect } from "react";
// import { Button } from "../Button";
// import { Input } from "../Input";
// import { Controller, useForm } from "react-hook-form";

// type Props = {
//   file: FileList;
// };

// export const Form = () => {
//   const [keyPair, setKeyPair] = useState<string | null>(null);
//   const { handleSubmit, control } = useForm<Props>();

//   useEffect(() => {
//     crypto.subtle
//       .generateKey(
//         {
//           name: "RSA-OAEP",
//           modulusLength: 2048,
//           publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
//           hash: "SHA-256",
//         },
//         true,
//         ["encrypt", "decrypt"]
//       )
//       .then((keyPair) => {
//         console.log("keyPair", keyPair);
//         // 公開鍵を取得
//         const publicKey = keyPair.publicKey;
//         // 公開鍵をBase64エンコード
//         crypto.subtle
//           .exportKey("spki", publicKey)
//           .then((exportedKey) => {
//             const base64PublicKey = btoa(
//               String.fromCharCode(...new Uint8Array(exportedKey))
//             );
//             console.log("Base64 Public Key:", base64PublicKey);
//             console.log("Public Key:", publicKey);
//             setKeyPair(base64PublicKey);
//           })
//           .catch((error) => {
//             console.error("Error exporting public key:", error);
//           });
//       })
//       .catch((error) => {
//         console.error("Error generating key pair:", error);
//       });
//   }, []);

//   const onSubmit = async (data: Props) => {
//     const file = data.file[0]; // FileList なので 0 番目を使う
//     if (!file) {
//       console.warn("ファイルが添付されていません");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("file", file);
//     if (keyPair) {
//       formData.append("publicKey", keyPair);
//     }

//     const response = await fetch("/api/send", {
//       method: "POST",
//       body: formData,
//     });

//     console.log("response", response);

//     if (!response.ok) {
//       console.error("暗号化リクエスト失敗:", response.statusText);
//       return;
//     }

//     const { encryptedCsv } = await response.json();

//     // base64文字列をBlobに変換
//     const byteCharacters = atob(encryptedCsv);
//     const byteNumbers = new Array(byteCharacters.length)
//       .fill(0)
//       .map((_, i) => byteCharacters.charCodeAt(i));
//     const byteArray = new Uint8Array(byteNumbers);
//     const blob = new Blob([byteArray], { type: "text/csv" });

//     // ダウンロード処理
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = "encrypted.csv";
//     document.body.appendChild(link);
//     link.click();
//     link.remove();
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
//       <Controller
//         name="file"
//         control={control}
//         rules={{
//           required: true,
//         }}
//         render={({ field }) => (
//           <Input
//             label="Attached File"
//             type="file"
//             accept=".csv"
//             onChange={(e) => field.onChange(e.target.files)}
//             onBlur={field.onBlur}
//             name={field.name}
//             ref={field.ref}
//           />
//         )}
//       />
//       <Button label="Submit" type="submit" />
//     </form>
//   );
// };

"use client";

import { useState, useEffect } from "react";
import { Button } from "../Button";
import { Input } from "../Input";
import { Controller, useForm } from "react-hook-form";

type Props = {
  file: FileList;
};

export const Form = () => {
  const [keyPair, setKeyPair] = useState<CryptoKeyPair | null>(null);
  const [encryptedData, setEncryptedData] = useState<{
    encryptedCsv: string;
    encryptedKey: string;
    iv: string;
  } | null>(null);

  const { handleSubmit, control } = useForm<Props>();

  useEffect(() => {
    // RSAキーペア生成（秘密鍵と公開鍵）
    crypto.subtle
      .generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 2048,
          publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
          hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
      )
      .then((keyPair) => {
        console.log("keyPair", keyPair);
        setKeyPair(keyPair);
      })
      .catch((error) => {
        console.error("Error generating key pair:", error);
      });
  }, []);

  const onSubmit = async (data: Props) => {
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

    const dataResponse = await result.json();
    if (
      dataResponse.encryptedCsv &&
      dataResponse.encryptedKey &&
      dataResponse.iv
    ) {
      setEncryptedData({
        encryptedCsv: dataResponse.encryptedCsv,
        encryptedKey: dataResponse.encryptedKey,
        iv: dataResponse.iv,
      });
    }
    console.log("Encrypted Data:", dataResponse);
  };

  // 復号処理
  const handleDecrypt = async () => {
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

  // 暗号化されたデータのダウンロード
  const handleDownloadEncrypted = () => {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Controller
        name="file"
        control={control}
        rules={{
          required: true,
        }}
        render={({ field }) => (
          <Input
            label="Attached File"
            type="file"
            accept=".csv"
            onChange={(e) => field.onChange(e.target.files)}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
          />
        )}
      />
      <Button label="Submit" type="submit" />
      {encryptedData && (
        <>
          <Button
            label="Download Encrypted CSV"
            onClick={handleDownloadEncrypted}
          />
          <Button label="Download Decrypted CSV" onClick={handleDecrypt} />
        </>
      )}
    </form>
  );
};

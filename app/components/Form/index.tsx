"use client";

import { Button } from "../Button";
import { useForm } from "react-hook-form";

export const Form = () => {
  const { handleSubmit } = useForm();

  crypto.subtle
    .generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-256",
      },
      true,
      ["sign", "verify"]
    )
    .then((keyPair) => {
      console.log("keyPair", keyPair);
      // 公開鍵を取得
      const publicKey = keyPair.publicKey;
      // 公開鍵をBase64エンコード
      crypto.subtle
        .exportKey("spki", publicKey)
        .then((exportedKey) => {
          const base64PublicKey = btoa(
            String.fromCharCode(...new Uint8Array(exportedKey))
          );
          console.log("Base64 Public Key:", base64PublicKey);
          // ここでBase64エンコードされた公開鍵をサーバーに送信することができます
          // 例: fetch("/api/sendData", { method: "POST", body: JSON.stringify({ publicKey: base64PublicKey }) });
        })
        .catch((error) => {
          console.error("Error exporting public key:", error);
        });
    })
    .catch((error) => {
      console.error("Error generating key pair:", error);
    });

  const onSubmit = (data: Record<string, string | CryptoKey>) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Button label="Submit" type="submit" />
    </form>
  );
};

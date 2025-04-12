"use client";

import { useState, useEffect } from "react";
import { Button } from "../Button";
import { useForm } from "react-hook-form";

export const Form = () => {
  const [keyPair, setKeyPair] = useState<string | null>(null);
  const { handleSubmit } = useForm();

  useEffect(() => {
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
            console.log("Public Key:", publicKey);
            setKeyPair(base64PublicKey);
          })
          .catch((error) => {
            console.error("Error exporting public key:", error);
          });
      })
      .catch((error) => {
        console.error("Error generating key pair:", error);
      });
  }, []);

  const onSubmit = async () => {
    const result = await fetch("/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publicKey: keyPair }),
    });
    console.log("result", result);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Button label="Submit" type="submit" />
    </form>
  );
};

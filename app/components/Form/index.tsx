"use client";

import { useState, useEffect } from "react";
import { Button } from "../Button";
import { Input } from "../Input";
import { Controller, useForm } from "react-hook-form";

type Props = {
  file: FileList;
};

export const Form = () => {
  const [keyPair, setKeyPair] = useState<string | null>(null);
  const { handleSubmit, control } = useForm<Props>();

  useEffect(() => {
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

  const onSubmit = async (data: Props) => {
    const file = data.file[0]; // FileList なので 0 番目を使う
    if (!file) {
      console.warn("ファイルが添付されていません");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    if (keyPair) {
      formData.append("publicKey", keyPair);
    }

    const result = await fetch("/api/send", {
      method: "POST",
      body: formData,
    });

    console.log("result", result);
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
    </form>
  );
};

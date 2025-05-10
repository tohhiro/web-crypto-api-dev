"use client";

import { useState } from "react";
import { Button } from "../Button";
import { Input } from "../Input";
import { Controller, useForm } from "react-hook-form";
import {
  useGenerateKey,
  useSendPublicKeyAndCsv,
  useDecrypt,
  useEncrypt,
} from "./hooks";
import { validationSchema } from "./helpers/validationSchema";
import { zodResolver } from "@hookform/resolvers/zod";

type Props = {
  file: FileList;
};

export type KeyAndCsv = {
  encryptedCsv: string;
  encryptedKey: string;
  iv: string;
};

export const Form = () => {
  const [keyPair, setKeyPair] = useState<CryptoKeyPair | null>(null);
  const [encryptedData, setEncryptedData] = useState<KeyAndCsv | null>(null);

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<Props>({
    resolver: zodResolver(validationSchema),
  });

  // RSAキーペア生成（秘密鍵と公開鍵）
  useGenerateKey({ setKey: setKeyPair });

  // 公開鍵とCSVを送信するhooks
  const { getExportedPublicKey } = useSendPublicKeyAndCsv();

  // 復号処理をした状態のCSVのダウンロード
  const { decrypt } = useDecrypt();

  // 暗号化されたCSVのダウンロード
  const { encrypt } = useEncrypt();

  const onSubmit = async (data: Props) => {
    // CSVファイルと公開鍵をAPIへ送信
    const result = await getExportedPublicKey({ data, keyPair });

    const dataResponse = await result?.json();
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
  };

  // 復号処理したCSVのダウンロード
  const handleDownloadDecrypted = async () => {
    await decrypt({
      encryptedData,
      keyPair,
    });
  };

  // 暗号化されたCSVのダウンロード
  const handleDownloadEncrypted = () => {
    encrypt({
      encryptedData,
    });
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
          <>
            <Input
              label="Attached File"
              type="file"
              accept=".csv"
              onChange={(e) => field.onChange(e.target.files)}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
            {errors.file && (
              <span className="text-red-500">{errors.file?.message}</span>
            )}
          </>
        )}
      />
      <Button label="Submit" type="submit" disabled={isSubmitting} />
      {encryptedData && (
        <>
          <Button
            label="Download Encrypted CSV"
            onClick={handleDownloadEncrypted}
          />
          <Button
            label="Download Decrypted CSV"
            onClick={handleDownloadDecrypted}
          />
        </>
      )}
    </form>
  );
};

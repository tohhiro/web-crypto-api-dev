import { useEffect } from "react";
import { Dispatch, SetStateAction } from "react";

export const useGenerateKey = ({
  setKey,
}: {
  setKey: Dispatch<SetStateAction<CryptoKeyPair | null>>;
}) => {
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
        setKey(keyPair);
      })
      .catch((error) => {
        console.error("Error generating key pair:", error);
      });
  }, [setKey]);
};

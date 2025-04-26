import { Buffer } from "buffer";

export async function encryptCsvWithPublicKey(
  file: File,
  publicKeyBase64: string
) {
  const csvBuffer = new Uint8Array(await file.arrayBuffer());
  const publicKeyBuffer = Buffer.from(publicKeyBase64, "base64");

  const publicKey = await crypto.subtle.importKey(
    "spki",
    publicKeyBuffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["encrypt"]
  );

  const symmetricKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encryptedCsvBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    symmetricKey,
    csvBuffer
  );

  const rawSymmetricKey = await crypto.subtle.exportKey("raw", symmetricKey);
  const encryptedSymmetricKeyBuffer = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    rawSymmetricKey
  );

  return {
    encryptedCsv: Buffer.from(encryptedCsvBuffer).toString("base64"),
    encryptedKey: Buffer.from(encryptedSymmetricKeyBuffer).toString("base64"),
    iv: Buffer.from(iv).toString("base64"),
  };
}

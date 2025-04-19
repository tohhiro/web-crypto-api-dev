import { NextRequest, NextResponse } from "next/server";
import { Buffer } from "buffer";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const publicKeyBase64 = formData.get("publicKey") as string;

    if (!file || !publicKeyBase64) {
      return NextResponse.json(
        { message: "Missing file or publicKey" },
        { status: 400 }
      );
    }

    // ファイル読み込み
    const csvBuffer = new Uint8Array(await file.arrayBuffer());

    // 公開鍵のBase64 → ArrayBuffer
    const publicKeyBuffer = Buffer.from(publicKeyBase64, "base64");

    // 公開鍵をインポート
    const publicKey = await crypto.subtle.importKey(
      "spki",
      publicKeyBuffer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["encrypt"]
    );

    // 対称鍵（AES）生成
    const symmetricKey = await crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );

    // 初期化ベクトル（IV）生成
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // 対称鍵でCSVを暗号化
    const encryptedCsvBuffer = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      symmetricKey,
      csvBuffer
    );

    // 対称鍵をエクスポート（raw）
    const rawSymmetricKey = await crypto.subtle.exportKey("raw", symmetricKey);

    // 対称鍵を公開鍵で暗号化
    const encryptedSymmetricKeyBuffer = await crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      publicKey,
      rawSymmetricKey
    );

    // すべてBase64で返す
    return NextResponse.json({
      encryptedCsv: Buffer.from(encryptedCsvBuffer).toString("base64"),
      encryptedKey: Buffer.from(encryptedSymmetricKeyBuffer).toString("base64"),
      iv: Buffer.from(iv).toString("base64"),
      message: "Encryption complete",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ message: "Encryption failed" }, { status: 500 });
  }
}

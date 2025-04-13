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

    // ファイルをバッファに変換
    const arrayBuffer = await file.arrayBuffer();
    const csvBuffer = new Uint8Array(arrayBuffer);

    // 公開鍵をBase64デコード → ArrayBuffer
    const publicKeyBuffer = Uint8Array.from(atob(publicKeyBase64), (c) =>
      c.charCodeAt(0)
    ).buffer;

    // 公開鍵をimport（RSA-OAEP）
    const publicKey = await crypto.subtle.importKey(
      "spki",
      publicKeyBuffer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      false,
      ["encrypt"]
    );

    // CSVの暗号化
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      publicKey,
      csvBuffer
    );

    const encryptedCsvBase64 = Buffer.from(encryptedBuffer).toString("base64");

    return NextResponse.json({
      encryptedCsv: encryptedCsvBase64,
      message: "Encrypted successfully",
    });
  } catch (error) {
    console.error("Error handling form data:", error);
    return NextResponse.json({ message: "Encryption failed" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { encryptCsvWithPublicKey } from "./helpers/encryptCsvWithPublicKey";

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

    const result = await encryptCsvWithPublicKey(file, publicKeyBase64);

    return NextResponse.json({
      ...result,
      message: "Encryption complete",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ message: "Encryption failed" }, { status: 500 });
  }
}

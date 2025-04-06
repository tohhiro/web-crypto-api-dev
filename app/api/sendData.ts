import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { publicKey, data } = req.body;

    // ここで受け取った公開鍵 (publicKey) と文字列 (data) を処理するロジックを記述します
    // 例：ログ出力、データベースへの保存、他のサービスへの送信など

    console.log("Received PublicKey:", publicKey);
    console.log("Received Data:", data);

    res.status(200).json({ message: "Data received successfully" });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

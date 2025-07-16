import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dosyaYolu = path.join(process.cwd(), "data", "barkodlar.json");

export async function POST(req: Request) {
  const { kod } = await req.json();

  try {
    let mevcut: string[] = [];

    if (fs.existsSync(dosyaYolu)) {
      const data = fs.readFileSync(dosyaYolu, "utf-8");
      mevcut = JSON.parse(data);
    }

    if (!mevcut.includes(kod)) {
      mevcut.push(kod);
      fs.writeFileSync(dosyaYolu, JSON.stringify(mevcut, null, 2));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

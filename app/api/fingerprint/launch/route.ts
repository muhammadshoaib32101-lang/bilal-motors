import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export const runtime = "nodejs";

const BAT_PATH = path.join(process.cwd(), "fingerprint-bridge", "start.bat");

export async function POST() {
  try {
    const child = spawn("cmd", ["/c", "start", "", BAT_PATH], {
      cwd: path.dirname(BAT_PATH),
      stdio: "ignore",
      detached: true,
    });
    child.unref();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[fingerprint/launch]", err);
    return NextResponse.json(
      { success: false, message: `Could not launch scanner service: ${err.message}` },
      { status: 500 }
    );
  }
}

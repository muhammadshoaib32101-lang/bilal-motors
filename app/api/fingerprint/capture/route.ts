import { NextResponse } from 'next/server';

export const runtime     = 'nodejs';
export const maxDuration = 15;

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { capture } = require('../../../../lib/zkfinger');
    const result      = capture();

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success:  true,
      image:    result.image,    // PNG data URL — shown in UI & printed on receipt
      template: result.template, // base64 binary — for future fingerprint matching
    });
  } catch (err: any) {
    console.error('[fingerprint/capture]', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

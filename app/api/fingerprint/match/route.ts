import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { template1, template2 } = await req.json();

    if (!template1 || !template2) {
      return NextResponse.json({ success: false, message: 'Both templates are required' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const zk = require('../../../../lib/zkfinger');
    const result = zk.match(template1, template2);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

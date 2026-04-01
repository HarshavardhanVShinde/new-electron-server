import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { NextResponse } from 'next/server';

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  try {
    const { licenseKey, machineId } = await request.json();

    if (!licenseKey || !machineId) {
      return NextResponse.json(
        { error: 'Missing licenseKey or machineId' },
        { status: 400 }
      );
    }

    // Call Convex mutation to verify and activate license
    const result = await convex.mutation(api.licenses.verifyLicense, {
      licenseKey,
      machineId,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('License Verification Error:', errorMessage);

    // Map specific error messages to HTTP status codes
    if (errorMessage === 'License not found') {
      return NextResponse.json({ error: errorMessage }, { status: 404 });
    } else if (
      errorMessage.includes('License is') ||
      errorMessage === 'License Expired'
    ) {
      return NextResponse.json({ error: errorMessage }, { status: 403 });
    } else if (errorMessage.includes('already in use on another computer')) {
      return NextResponse.json({ error: 'Device Mismatch' }, { status: 403 });
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

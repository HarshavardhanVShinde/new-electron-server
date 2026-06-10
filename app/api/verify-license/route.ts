import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { NextResponse } from 'next/server';

// Lazy-initialize Convex client to avoid build-time crash
let convex: ConvexHttpClient | null = null;
function getConvex() {
  if (!convex) {
    convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  }
  return convex;
}

export async function POST(request: Request) {
  try {
    const { licenseKey, machineId, softwareType } = await request.json();

    if (!licenseKey || !machineId) {
      return NextResponse.json(
        { error: 'Missing licenseKey or machineId' },
        { status: 400 }
      );
    }

    // Call Convex mutation to verify and activate license
    const result = await getConvex().mutation(api.licenses.verifyLicense, {
      licenseKey,
      machineId,
      softwareType,
    });

    const license = result.license;

    // Check software type match if provided
    if (softwareType && license?.softwareType && license.softwareType !== softwareType) {
      return NextResponse.json(
        { error: `License is for ${license.softwareType}, not ${softwareType}` },
        { status: 403 }
      );
    }

    // Return in the format Electron LicenseManager expects: { valid: true, expiry }
    return NextResponse.json({
      valid: true,
      expiry: license?.expiresAt ? new Date(license.expiresAt).toISOString() : null,
      message: result.message,
      license,
    }, { status: 200 });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('License Verification Error:', errorMessage);

    if (errorMessage === 'License not found') {
      return NextResponse.json({ valid: false, error: errorMessage }, { status: 404 });
    } else if (
      errorMessage.includes('License is') ||
      errorMessage === 'License Expired'
    ) {
      return NextResponse.json({ valid: false, error: errorMessage }, { status: 403 });
    } else if (errorMessage.includes('already in use on another computer')) {
      return NextResponse.json({ valid: false, error: 'Device Mismatch' }, { status: 403 });
    }

    return NextResponse.json({ valid: false, error: errorMessage }, { status: 500 });
  }
}

import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { NextResponse } from 'next/server';

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

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
        const result = await convex.mutation(api.licenses.verifyLicense, {
            licenseKey,
            machineId,
        });

        // Get full license details
        const licenseData = await convex.query(api.licenses.getLicenseByKey, {
            licenseKey,
        });

        if (!licenseData) {
            return NextResponse.json({ error: 'License not found' }, { status: 404 });
        }

        // Check Software Type Match
        if (softwareType && licenseData.softwareType && licenseData.softwareType !== softwareType) {
            return NextResponse.json(
                { error: `License is for ${licenseData.softwareType}, not ${softwareType}` },
                { status: 403 }
            );
        }

        return NextResponse.json({
            valid: true,
            expiry: new Date(licenseData.expiresAt).toISOString(),
            license: {
                licenseKey: licenseData.licenseKey,
                machineId: licenseData.machineId,
                clientName: licenseData.clientName,
                softwareType: licenseData.softwareType,
                planType: licenseData.planType,
                status: licenseData.status,
                expiresAt: new Date(licenseData.expiresAt).toISOString(),
                activatedAt: licenseData.activatedAt ? new Date(licenseData.activatedAt).toISOString() : null,
            },
        });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';
        console.error('Verify API Error:', errorMessage);

        if (errorMessage === 'License not found') {
            return NextResponse.json({ error: errorMessage }, { status: 404 });
        } else if (
            errorMessage.includes('License is') ||
            errorMessage === 'License Expired' ||
            errorMessage === 'License expired'
        ) {
            return NextResponse.json({ error: errorMessage }, { status: 403 });
        } else if (errorMessage.includes('already in use on another computer')) {
            return NextResponse.json({ error: 'Device Mismatch' }, { status: 403 });
        }

        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

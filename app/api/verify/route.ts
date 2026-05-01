import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
    try {
        const { licenseKey, machineId, softwareType } = await request.json();

        if (!licenseKey || !machineId) {
            return NextResponse.json(
                { error: 'Missing licenseKey or machineId' },
                { status: 400 }
            );
        }

        // 1. Fetch License
        const { data: license, error } = await supabase
            .from('licenses')
            .select('*')
            .eq('license_key', licenseKey)
            .single();

        if (error || !license) {
            return NextResponse.json({ error: 'License not found' }, { status: 404 });
        }

        // 2. Check Software Type Match
        if (softwareType && license.software_type && license.software_type !== softwareType) {
            return NextResponse.json(
                { error: `License is for ${license.software_type}, not ${softwareType}` },
                { status: 403 }
            );
        }

        // 3. Check Status
        if (license.status !== 'active') {
            return NextResponse.json(
                { error: `License is ${license.status}` },
                { status: 403 }
            );
        }

        // 4. Check Expiry
        const now = new Date();
        const expiresAt = new Date(license.expires_at);
        if (expiresAt < now) {
            // Auto-update status to expired if needed, or just return error
            return NextResponse.json({ error: 'License expired' }, { status: 403 });
        }

        // 5. Node Locking Logic
        if (!license.machine_id) {
            // Bind to this machine
            const { error: updateError } = await supabase
                .from('licenses')
                .update({ machine_id: machineId })
                .eq('id', license.id);

            if (updateError) {
                return NextResponse.json(
                    { error: 'Failed to bind license' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                valid: true,
                expiry: license.expires_at,
                license: {
                    ...license,
                    machine_id: machineId, // Return updated state
                },
            });
        } else {
            // Check match
            if (license.machine_id === machineId) {
                return NextResponse.json({
                    valid: true,
                    expiry: license.expires_at,
                    license,
                });
            } else {
                return NextResponse.json(
                    // Return 403 Device Mismatch as requested
                    { error: 'Device Mismatch' },
                    { status: 403 }
                );
            }
        }
    } catch (err) {
        console.error('Verify API Error:', err);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

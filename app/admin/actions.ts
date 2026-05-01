'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Admin Auth Password — MUST be set as environment variable in production
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin-secret-password';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// --- Auth Actions ---

export async function loginAction(formData: FormData) {
    const password = formData.get('password') as string;
    if (password === ADMIN_PASSWORD) {
        const nextCookies = await cookies();
        nextCookies.set('admin_session', 'true', {
            httpOnly: true,
            path: '/',
            secure: true,
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 24 hours
        });
        redirect('/admin/dashboard');
    } else {
        return { error: 'Invalid password' };
    }
}

export async function logoutAction() {
    const nextCookies = await cookies();
    nextCookies.delete('admin_session');
    redirect('/admin/dashboard');
}

export async function checkAuth() {
    const nextCookies = await cookies();
    return nextCookies.get('admin_session')?.value === 'true';
}

// --- License Actions ---

export async function generateLicense(clientName: string, planType: string, validityDays: number, softwareType: string = 'UrbanBill') {
    if (!await checkAuth()) return { error: 'Unauthorized' };

    // Generate unambiguous license key (avoid O, 0, I, 1, l)
    // Using: A-H, J-N, P-Z (uppercase), 2-9 (numbers)
    const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
    const generateSegment = (length: number) => {
        return Array(length).fill(0)
            .map(() => chars[Math.floor(Math.random() * chars.length)])
            .join('');
    };

    // Format: XXXX-XXXX-XXXX-XXXX (16 characters total)
    const customKey = [
        generateSegment(4),
        generateSegment(4),
        generateSegment(4),
        generateSegment(4)
    ].join('-');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + validityDays);

    const { error } = await supabase.from('licenses').insert({
        license_key: customKey,
        client_name: clientName,
        software_type: softwareType,
        plan_type: planType,
        status: 'active',
        expires_at: expiresAt.toISOString(),
    });

    if (error) return { error: error.message };
    revalidatePath('/admin/dashboard');
    return { success: true, licenseKey: customKey };
}

export async function revokeLicense(id: string) {
    if (!await checkAuth()) return { error: 'Unauthorized' };

    const { error } = await supabase
        .from('licenses')
        .update({ status: 'banned' })
        .eq('id', id);

    if (error) return { error: error.message };
    revalidatePath('/admin/dashboard');
    return { success: true };
}

export async function resetMachineId(id: string) {
    if (!await checkAuth()) return { error: 'Unauthorized' };

    const { error } = await supabase
        .from('licenses')
        .update({ machine_id: null })
        .eq('id', id);

    if (error) return { error: error.message };
    revalidatePath('/admin/dashboard');
    return { success: true };
}

export async function deleteLicense(id: string) {
    if (!await checkAuth()) return { error: 'Unauthorized' };

    const { error } = await supabase.from('licenses').delete().eq('id', id);

    if (error) return { error: error.message };
    revalidatePath('/admin/dashboard');
    return { success: true };
}

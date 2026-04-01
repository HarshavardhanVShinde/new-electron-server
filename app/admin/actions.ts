'use server';

import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Admin Auth Password — use env variable in production
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin-secret-password';

// Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// --- Auth Actions ---

export async function loginAction(formData: FormData) {
    const password = formData.get('password') as string;
    if (password === ADMIN_PASSWORD) {
        const nextCookies = await cookies();
        nextCookies.set('admin_session', 'true', { httpOnly: true, path: '/' });
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

// --- License Actions (Convex) ---

export async function generateLicense(
    clientName: string,
    planType: string,
    validityDays: number,
    softwareType: string = 'JewelleryPos'
) {
    if (!await checkAuth()) return { error: 'Unauthorized' };

    // Generate unambiguous license key (avoid O, 0, I, 1, l)
    const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
    const generateSegment = (length: number) => {
        return Array(length).fill(0)
            .map(() => chars[Math.floor(Math.random() * chars.length)])
            .join('');
    };

    // Format: SV-XXXX-XXXX-XXXX (prefixed for JewelleryPos)
    const prefix = softwareType === 'JewelleryPos' ? 'SV' : softwareType.substring(0, 2).toUpperCase();
    const customKey = [
        prefix,
        generateSegment(4),
        generateSegment(4),
        generateSegment(4)
    ].join('-');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + validityDays);

    try {
        const result = await convex.mutation(api.licenses.createLicense, {
            licenseKey: customKey,
            clientName,
            softwareType: softwareType as any,
            planType: planType as any,
            expiresAt: expiresAt.getTime(),
        });

        revalidatePath('/admin/dashboard');
        return { success: true, licenseKey: customKey };
    } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to create license';
        return { error: msg };
    }
}

export async function revokeLicense(id: string) {
    if (!await checkAuth()) return { error: 'Unauthorized' };

    try {
        await convex.mutation(api.licenses.revokeLicense, { id: id as Id<"licenses"> });
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to revoke';
        return { error: msg };
    }
}

export async function resetMachineId(id: string) {
    if (!await checkAuth()) return { error: 'Unauthorized' };

    try {
        await convex.mutation(api.licenses.resetMachineId, { id: id as Id<"licenses"> });
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to reset';
        return { error: msg };
    }
}

export async function deleteLicense(id: string) {
    if (!await checkAuth()) return { error: 'Unauthorized' };

    try {
        await convex.mutation(api.licenses.deleteLicense, { id: id as Id<"licenses"> });
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to delete';
        return { error: msg };
    }
}

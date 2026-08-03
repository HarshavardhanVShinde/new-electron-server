type ApiResult = Record<string, unknown> | unknown[];
export type ActionResult = { success?: boolean; error?: string; licenseKey?: string; [key: string]: unknown };

function asObject(result: ApiResult): Record<string, unknown> {
    return Array.isArray(result) ? {} : result;
}

function asActionResult(result: ApiResult): ActionResult {
    return asObject(result) as ActionResult;
}

async function requestApi(path: string, init?: RequestInit): Promise<ApiResult> {
    const response = await fetch(path, {
        credentials: 'same-origin',
        ...init,
        headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    });
    const payload = await response.json().catch(() => ({}));
    if (Array.isArray(payload)) return payload;
    const objectPayload = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {};
    return response.ok ? objectPayload : { error: typeof objectPayload.error === 'string' ? objectPayload.error : 'Request failed' };
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
    return asActionResult(await requestApi('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ id: formData.get('id'), password: formData.get('password') }),
    }));
}

export async function logoutAction(_formData?: FormData): Promise<void> {
    const result = asObject(await requestApi('/api/admin/logout', { method: 'POST' }));
    if (result.success === true) window.location.reload();
}

export async function checkAuth() {
    const result = asObject(await requestApi('/api/admin/me'));
    return result.authenticated === true;
}

export async function getLicenses() {
    const result = await requestApi('/api/admin/licenses');
    return Array.isArray(result) ? result : [];
}

export async function generateLicense(
    clientName: string,
    planType: string,
    validityDays: number,
    softwareType: string,
) : Promise<ActionResult> {
    return asActionResult(await requestApi('/api/admin/licenses', {
        method: 'POST',
        body: JSON.stringify({ clientName, planType, validityDays, softwareType }),
    }));
}

async function mutateLicense(id: string, operation: 'revoke' | 'reset' | 'delete'): Promise<ActionResult> {
    const result = await requestApi(`/api/admin/licenses/${encodeURIComponent(id)}/${operation}`, { method: 'POST' });
    if (asObject(result).success === true) window.location.reload();
    return asActionResult(result);
}

export function revokeLicense(id: string) {
    return mutateLicense(id, 'revoke');
}

export function resetMachineId(id: string) {
    return mutateLicense(id, 'reset');
}

export function deleteLicense(id: string) {
    return mutateLicense(id, 'delete');
}

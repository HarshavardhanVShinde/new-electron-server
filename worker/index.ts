type WorkerEnv = Env & {
  ADMIN_ID?: string;
  ADMIN_PASSWORD?: string;
  SESSION_SECRET?: string;
};

type LicenseRow = {
  id: string;
  license_key: string;
  machine_id: string | null;
  client_name: string;
  software_type: string;
  plan_type: string;
  status: string;
  created_at: number;
  expires_at: number;
  activated_at: number | null;
};

type License = {
  _id: string;
  _creationTime: number;
  licenseKey: string;
  machineId: string | null;
  clientName: string;
  softwareType: string;
  planType: string;
  status: string;
  createdAt: number;
  expiresAt: number;
  activatedAt: number | null;
};

const SESSION_COOKIE = 'admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const LICENSE_CHARS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const SOFTWARE_TYPES = [
  'UrbanBill', 'MediBill', 'KiranaBill', 'StationMaster', 'MandiBill',
  'OptiVision', 'JewelleryPos', 'Mangal Seva', 'TailorShop',
  'GarmentsSoftware', 'DryCleaning Pro', 'BSS-Smartbill',
] as const;
const PLAN_TYPES = ['Standard', 'Premium'] as const;

type SoftwareType = typeof SOFTWARE_TYPES[number];
type PlanType = typeof PLAN_TYPES[number];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data: unknown, status = 200, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}

function withCors(response: Response) {
  const headers = new Headers(response.headers);
  Object.entries(CORS_HEADERS).forEach(([key, value]) => headers.set(key, value));
  return new Response(response.body, { status: response.status, headers });
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get('Content-Type') || '';
  try {
    const raw = await request.text();
    if (contentType.includes('application/x-www-form-urlencoded')) {
      return Object.fromEntries(new URLSearchParams(raw));
    }
    const value = JSON.parse(raw);
    return value && typeof value === 'object' ? value as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

function firstString(...values: unknown[]) {
  const value = values.find((item) => typeof item === 'string' && item.trim());
  return typeof value === 'string' ? value.trim() : '';
}

function isSoftwareType(value: unknown): value is SoftwareType {
  return typeof value === 'string' && (SOFTWARE_TYPES as readonly string[]).includes(value);
}

function isPlanType(value: unknown): value is PlanType {
  return typeof value === 'string' && (PLAN_TYPES as readonly string[]).includes(value);
}

function randomSegment(length: number) {
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => LICENSE_CHARS[value % LICENSE_CHARS.length]).join('');
}

function generateLicenseKey() {
  return [randomSegment(4), randomSegment(4), randomSegment(4), randomSegment(4)].join('-');
}

function base64Url(bytes: ArrayBuffer | Uint8Array) {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = '';
  data.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function digest(value: string) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
}

function timingSafeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return base64Url(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)));
}

async function createSession(env: WorkerEnv) {
  if (!env.SESSION_SECRET) throw new Error('SESSION_SECRET is not configured');
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = String(expiresAt);
  return `${payload}.${await sign(payload, env.SESSION_SECRET)}`;
}

async function isAuthenticated(request: Request, env: WorkerEnv) {
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookie = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  if (!cookie || !env.SESSION_SECRET) return false;
  const value = cookie.slice(`${SESSION_COOKIE}=`.length);
  const [payload, signature] = value.split('.');
  if (!payload || !signature || Number(payload) < Math.floor(Date.now() / 1000)) return false;
  const expected = await sign(payload, env.SESSION_SECRET);
  return timingSafeEqual(await digest(signature), await digest(expected));
}

function sessionCookie(value: string, maxAge: number) {
  return `${SESSION_COOKIE}=${value}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

function toLicense(row: LicenseRow): License {
  return {
    _id: row.id,
    _creationTime: row.created_at,
    licenseKey: row.license_key,
    machineId: row.machine_id,
    clientName: row.client_name,
    softwareType: row.software_type,
    planType: row.plan_type,
    status: row.status,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    activatedAt: row.activated_at,
  };
}

async function findLicense(db: D1Database, licenseKey: string) {
  return db.prepare('SELECT * FROM licenses WHERE license_key = ?1').bind(licenseKey).first<LicenseRow>();
}

async function activateLicense(db: D1Database, licenseKey: string, machineId: string, softwareType?: string) {
  const license = await findLicense(db, licenseKey);
  if (!license) throw new Error('License not found');
  if (license.status !== 'active') throw new Error(`License is ${license.status}`);
  if (license.expires_at < Date.now()) throw new Error('License Expired');
  if (softwareType && license.software_type !== softwareType) throw new Error(`License is for ${license.software_type}, not ${softwareType}`);

  if (license.machine_id === null) {
    const activatedAt = Date.now();
    const update = await db.prepare('UPDATE licenses SET machine_id = ?1, activated_at = ?2 WHERE id = ?3 AND machine_id IS NULL')
      .bind(machineId, activatedAt, license.id)
      .run();
    if (update.meta.changes > 0) {
      return { message: 'License activated successfully', license: toLicense({ ...license, machine_id: machineId, activated_at: activatedAt }) };
    }
    return activateLicense(db, licenseKey, machineId, softwareType);
  }

  if (license.machine_id === machineId) return { message: 'License verified successfully', license: toLicense(license) };
  throw new Error('License is already in use on another computer');
}

async function login(request: Request, env: WorkerEnv) {
  const body = await readJson(request);
  const id = typeof body.id === 'string' ? body.id : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!env.ADMIN_ID || !env.ADMIN_PASSWORD) return json({ error: 'Admin credentials are not configured' }, 503);
  const validId = timingSafeEqual(await digest(id), await digest(env.ADMIN_ID));
  const validPassword = timingSafeEqual(await digest(password), await digest(env.ADMIN_PASSWORD));
  if (!validId || !validPassword) return json({ error: 'Invalid credentials' }, 401);
  return json({ success: true }, 200, { 'Set-Cookie': sessionCookie(await createSession(env), SESSION_TTL_SECONDS) });
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Internal Server Error';
}

async function adminApi(request: Request, env: WorkerEnv, url: URL) {
  if (url.pathname === '/api/admin/login' && request.method === 'POST') return login(request, env);
  if (url.pathname === '/api/admin/logout' && request.method === 'POST') return json({ success: true }, 200, { 'Set-Cookie': sessionCookie('', 0) });
  if (url.pathname === '/api/admin/me' && request.method === 'GET') return json({ authenticated: await isAuthenticated(request, env) });
  if (!(await isAuthenticated(request, env))) return json({ error: 'Unauthorized' }, 401);

  try {
    if (url.pathname === '/api/admin/licenses' && request.method === 'GET') {
      const result = await env.DB.prepare('SELECT * FROM licenses ORDER BY created_at DESC').all<LicenseRow>();
      return json(result.results.map(toLicense));
    }

    if (url.pathname === '/api/admin/licenses' && request.method === 'POST') {
      const body = await readJson(request);
      const clientName = typeof body.clientName === 'string' ? body.clientName.trim() : '';
      const validityDays = Number(body.validityDays);
      if (!clientName || !Number.isFinite(validityDays) || validityDays <= 0 || !isSoftwareType(body.softwareType) || !isPlanType(body.planType)) return json({ error: 'Invalid license details' }, 400);
      const licenseKey = generateLicenseKey();
      const now = Date.now();
      await env.DB.prepare('INSERT INTO licenses (id, license_key, client_name, software_type, plan_type, status, created_at, expires_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)')
        .bind(crypto.randomUUID(), licenseKey, clientName, body.softwareType, body.planType, 'active', now, now + validityDays * 24 * 60 * 60 * 1000)
        .run();
      return json({ success: true, licenseKey });
    }

    const match = url.pathname.match(/^\/api\/admin\/licenses\/([^/]+)\/(revoke|reset|delete)$/);
    if (match && request.method === 'POST') {
      const id = decodeURIComponent(match[1]);
      const operation = match[2];
      if (operation === 'revoke') await env.DB.prepare('UPDATE licenses SET status = ?1 WHERE id = ?2').bind('banned', id).run();
      if (operation === 'reset') await env.DB.prepare('UPDATE licenses SET machine_id = NULL, activated_at = NULL WHERE id = ?1').bind(id).run();
      if (operation === 'delete') await env.DB.prepare('DELETE FROM licenses WHERE id = ?1').bind(id).run();
      return json({ success: true });
    }
  } catch (error) {
    const message = errorMessage(error);
    return json({ error: message }, message.includes('UNIQUE constraint') ? 409 : 500);
  }
  return json({ error: 'Not Found' }, 404);
}

async function verify(request: Request, env: WorkerEnv, detailed: boolean) {
  const body = await readJson(request);
  const licenseKey = firstString(body.licenseKey, body.license_key, body.key);
  const machineId = firstString(body.machineId, body.machine_id, body.deviceId, body.device_id);
  const softwareType = firstString(body.softwareType, body.software_type, body.softwareName, body.software_name) || undefined;
  if (!licenseKey || !machineId) return withCors(json({ error: 'Missing licenseKey or machineId' }, 400));

  try {
    const result = await activateLicense(env.DB, licenseKey, machineId, softwareType);
    const expiry = new Date(result.license.expiresAt).toISOString();

    // Preserve the two response contracts used by the existing Electron clients:
    // /api/verify-license returns the original activation result, while /api/verify
    // returns the compact legacy response with ISO date strings.
    if (!detailed) {
      return withCors(json({
        valid: true,
        expiry,
        message: result.message,
        license: result.license,
      }));
    }

    return withCors(json({
      valid: true,
      expiry,
      license: {
        licenseKey: result.license.licenseKey,
        machineId: result.license.machineId,
        clientName: result.license.clientName,
        softwareType: result.license.softwareType,
        planType: result.license.planType,
        status: result.license.status,
        expiresAt: expiry,
        activatedAt: result.license.activatedAt ? new Date(result.license.activatedAt).toISOString() : null,
      },
    }));
  } catch (error) {
    const message = errorMessage(error);
    const status = message === 'License not found' ? 404 : message.includes('License is') || message === 'License Expired' ? 403 : 500;
    return withCors(json({ valid: false, error: message }, status));
  }
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, '') || '/';
    if (pathname.startsWith('/api/')) {
      if (request.method === 'OPTIONS') return withCors(new Response(null, { status: 204, headers: CORS_HEADERS }));
      if (pathname === '/api/verify' || pathname === '/api/verify-license') return verify(request, env, pathname === '/api/verify');
      return adminApi(request, env, url);
    }
    return env.ASSETS.fetch(request);
  },
};

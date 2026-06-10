import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

/**
 * Query: Find license by key
 */
export const getLicenseByKey = query({
  args: { licenseKey: v.string() },
  handler: async (ctx, { licenseKey }) => {
    return await ctx.db
      .query('licenses')
      .withIndex('by_license_key', (q) => q.eq('licenseKey', licenseKey))
      .first();
  },
});

/**
 * Mutation: Verify and activate/re-validate a license
 */
export const verifyLicense = mutation({
  args: {
    licenseKey: v.string(),
    machineId: v.string(),
    softwareType: v.optional(v.string()),
  },
  handler: async (ctx, { licenseKey, machineId, softwareType }) => {
    // 1. Find the license
    const license = await ctx.db
      .query('licenses')
      .withIndex('by_license_key', (q) => q.eq('licenseKey', licenseKey))
      .first();

    if (!license) {
      throw new Error('License not found');
    }

    // 2. Check Status (banned)
    if (license.status !== 'active') {
      throw new Error(`License is ${license.status}`);
    }

    // 3. Check Expiry
    const now = Date.now();
    if (license.expiresAt < now) {
      throw new Error('License Expired');
    }

    // 4. Check software type before locking the license to this machine
    if (softwareType && license.softwareType && license.softwareType !== softwareType) {
      throw new Error(`License is for ${license.softwareType}, not ${softwareType}`);
    }

    // 5. First Activation (Locking to machine)
    if (license.machineId === null || license.machineId === undefined) {
      await ctx.db.patch(license._id, {
        machineId,
        activatedAt: now,
      });

      return {
        success: true,
        message: 'License activated successfully',
        license: {
          ...license,
          machineId,
          activatedAt: now,
        },
      };
    }

    // 6. Re-Validation (check if device matches)
    if (license.machineId === machineId) {
      return {
        success: true,
        message: 'License verified successfully',
        license,
      };
    } else {
      throw new Error('License is already in use on another computer');
    }
  },
});

/**
 * Query: Check license status without binding (read-only)
 */
export const checkLicenseStatus = query({
  args: { licenseKey: v.string() },
  handler: async (ctx, { licenseKey }) => {
    const license = await ctx.db
      .query('licenses')
      .withIndex('by_license_key', (q) => q.eq('licenseKey', licenseKey))
      .first();

    if (!license) {
      return { exists: false, valid: false };
    }

    const now = Date.now();
    const isExpired = license.expiresAt < now;
    const isActive = license.status === 'active' && !isExpired;

    return {
      exists: true,
      valid: isActive,
      status: license.status,
      isExpired,
      isBound: license.machineId !== null && license.machineId !== undefined,
      boundTo: license.machineId || null,
      clientName: license.clientName,
      softwareType: license.softwareType,
      planType: license.planType,
    };
  },
});

/**
 * Mutation: Create a new license (admin use only)
 */
export const createLicense = mutation({
  args: {
    licenseKey: v.string(),
    clientName: v.string(),
    softwareType: v.union(
      v.literal('UrbanBill'),
      v.literal('MediBill'),
      v.literal('KiranaBill'),
      v.literal('StationMaster'),
      v.literal('MandiBill'),
      v.literal('OptiVision'),
      v.literal('JewelleryPos'),
      v.literal('Mangal Seva'),
      v.literal('TailorShop'),
      v.literal('GarmentsSoftware')
    ),
    planType: v.union(v.literal('Standard'), v.literal('Premium')),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if license key already exists
    const existing = await ctx.db
      .query('licenses')
      .withIndex('by_license_key', (q) => q.eq('licenseKey', args.licenseKey))
      .first();

    if (existing) {
      throw new Error('License key already exists');
    }

    const licenseId = await ctx.db.insert('licenses', {
      licenseKey: args.licenseKey,
      clientName: args.clientName,
      softwareType: args.softwareType,
      planType: args.planType,
      status: 'active',
      createdAt: Date.now(),
      expiresAt: args.expiresAt,
    });

    return { success: true, licenseId };
  },
});

/**
 * Mutation: Revoke/ban a license by its Convex document ID
 */
export const revokeLicense = mutation({
  args: { id: v.id('licenses') },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { status: 'banned' as const });
    return { success: true, message: 'License revoked' };
  },
});

/**
 * Mutation: Reset machine binding to allow re-activation on a new device
 */
export const resetMachineId = mutation({
  args: { id: v.id('licenses') },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { machineId: undefined, activatedAt: undefined });
    return { success: true, message: 'Machine ID reset' };
  },
});

/**
 * Mutation: Permanently delete a license
 */
export const deleteLicense = mutation({
  args: { id: v.id('licenses') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { success: true, message: 'License deleted' };
  },
});

/**
 * Query: Get all licenses (for admin dashboard)
 */
export const getAllLicenses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('licenses').order('desc').collect();
  },
});

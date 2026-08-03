import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  licenses: defineTable({
    licenseKey: v.string(),
    machineId: v.optional(v.string()),
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
      v.literal('GarmentsSoftware'),
      v.literal('DryCleaning Pro'),
      v.literal('BSS-Smartbill')
    ),
    planType: v.union(v.literal('Standard'), v.literal('Premium')),
    status: v.union(
      v.literal('active'),
      v.literal('banned'),
      v.literal('expired')
    ),
    createdAt: v.number(), // Store as timestamp
    expiresAt: v.number(), // Store as timestamp
    activatedAt: v.optional(v.number()), // Timestamp of first activation
  })
  .index('by_license_key', ['licenseKey']) // Index for fast lookups
  .index('by_status', ['status']),
});

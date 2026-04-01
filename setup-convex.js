#!/usr/bin/env node

/**
 * Convex Migration Helper Script
 * Run this to set up Convex for your licensing server
 */

const fs = require('fs');
const path = require('path');

console.log('\n🚀 Convex Migration Setup\n');

const steps = [
  {
    title: '1️⃣  Install Convex CLI',
    command: 'npm install -g convex',
    optional: false,
  },
  {
    title: '2️⃣  Install Project Dependencies',
    command: 'npm install',
    optional: false,
  },
  {
    title: '3️⃣  Initialize Convex Project',
    command: 'npx convex init',
    description: 'You will be prompted to:\n     - Sign in to Convex\n     - Create or select a project\n     - Accept the deployment',
    optional: false,
  },
  {
    title: '4️⃣  Deploy Schema to Convex',
    command: 'npx convex deploy',
    description: 'This will:\n     - Sync your schema to the cloud\n     - Create database tables\n     - Generate TypeScript types',
    optional: false,
  },
  {
    title: '5️⃣  Copy Environment Variables',
    description: 'After step 3, copy NEXT_PUBLIC_CONVEX_URL from .env to .env.local',
    optional: false,
  },
  {
    title: '6️⃣  Start Development Server',
    command: 'npm run dev',
    optional: false,
  },
];

steps.forEach((step) => {
  console.log(`\n${step.title}`);
  if (step.description) {
    console.log(`   ${step.description}`);
  }
  if (step.command) {
    console.log(`\n   Run: ${step.command}\n`);
  }
});

console.log('\n✅ Setup Complete!\n');
console.log('Test your API with:');
console.log('  curl -X POST http://localhost:3000/api/verify-license \\');
console.log('    -H "Content-Type: application/json" \\');
console.log('    -d \'{"licenseKey": "TEST-KEY", "machineId": "machine-123"}\'\n');

console.log('For more details, see: CONVEX_MIGRATION.md\n');

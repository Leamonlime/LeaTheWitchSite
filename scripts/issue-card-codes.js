#!/usr/bin/env node
/**
 * issue-card-codes.js
 *
 * Generates a batch of /card access codes and writes them straight
 * into your Cloudflare KV namespace via the API — no dashboard
 * clicking required.
 *
 * SETUP (one-time):
 *   1. Get an API token: Cloudflare dashboard -> your profile icon (top right)
 *      -> "My Profile" -> "API Tokens" -> "Create Token" -> use the
 *      "Edit Cloudflare Workers" template (it includes KV write access),
 *      or a custom token with "Workers KV Storage: Edit" permission.
 *   2. Get your Account ID: Cloudflare dashboard -> any domain's Overview
 *      page -> right sidebar, "Account ID".
 *   3. Get your Namespace ID: Storage & Databases -> KV -> click your
 *      namespace -> it's shown at the top of that page.
 *
 * Set these as environment variables before running (never hardcode
 * the token in this file):
 *   CF_API_TOKEN=xxxxx
 *   CF_ACCOUNT_ID=xxxxx
 *   CF_KV_NAMESPACE_ID=xxxxx
 *
 * USAGE:
 *   node issue-card-codes.js --batch "print-run-1" --count 10 --days 365
 *
 *   --batch   required. Label stored as the KV value, purely for your
 *             own reference later (which run of cards this was).
 *   --count   how many codes to generate. Default 10.
 *   --days    how many days until this batch's codes stop working.
 *             Default 365.
 *   --length  characters per code. Default 8.
 *
 * Windows PowerShell example (set env vars for the current session):
 *   $env:CF_API_TOKEN="xxxxx"
 *   $env:CF_ACCOUNT_ID="xxxxx"
 *   $env:CF_KV_NAMESPACE_ID="xxxxx"
 *   node scripts\issue-card-codes.js --batch "print-run-1" --count 10 --days 365
 *
 * Requires Node 18 or newer (uses the built-in fetch).
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Legible charset — no 0/O, 1/I/l, so codes are unambiguous when printed small.
const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function parseArgs(argv) {
  const args = { count: 10, days: 365, length: 8 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--batch') args.batch = argv[++i];
    else if (a === '--count') args.count = parseInt(argv[++i], 10);
    else if (a === '--days') args.days = parseInt(argv[++i], 10);
    else if (a === '--length') args.length = parseInt(argv[++i], 10);
  }
  return args;
}

function randomCode(length) {
  let out = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    out += CHARSET[bytes[i] % CHARSET.length];
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.batch) {
    console.error('Missing --batch "some-label". Example:\n  node issue-card-codes.js --batch "print-run-1" --count 10 --days 365');
    process.exit(1);
  }

  const token = process.env.CF_API_TOKEN;
  const accountId = process.env.CF_ACCOUNT_ID;
  const namespaceId = process.env.CF_KV_NAMESPACE_ID;

  if (!token || !accountId || !namespaceId) {
    console.error('Missing one of CF_API_TOKEN, CF_ACCOUNT_ID, CF_KV_NAMESPACE_ID environment variables. See the comment block at the top of this file for where to find them.');
    process.exit(1);
  }

  if (args.days * 86400 < 60) {
    console.error('--days is too small — Cloudflare requires at least 60 seconds of expiry.');
    process.exit(1);
  }

  const codes = [];
  const seen = new Set();
  while (codes.length < args.count) {
    const code = randomCode(args.length);
    if (seen.has(code)) continue; // vanishingly unlikely, but just in case
    seen.add(code);
    codes.push(code);
  }

  const expirationTtl = args.days * 86400;
  const bulkBody = codes.map((code) => ({
    key: code,
    value: args.batch,
    expiration_ttl: expirationTtl
  }));

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/bulk`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bulkBody)
  });

  const result = await res.json();

  if (!res.ok || !result.success) {
    console.error('Cloudflare API call failed:');
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  const expiresOn = new Date(Date.now() + expirationTtl * 1000).toISOString().slice(0, 10);

  console.log(`\nCreated ${codes.length} code(s) for batch "${args.batch}", expiring ${expiresOn}:\n`);
  codes.forEach((c) => console.log('  ' + c));

  // Also save to a local file so you have a record for printing / reference.
  const outDir = path.join(__dirname, 'issued-codes');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${args.batch.replace(/[^a-z0-9-_]/gi, '_')}-${Date.now()}.txt`);
  fs.writeFileSync(
    outFile,
    `Batch: ${args.batch}\nExpires: ${expiresOn}\nCreated: ${new Date().toISOString()}\n\n${codes.join('\n')}\n`
  );
  console.log(`\nSaved to ${outFile}`);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});

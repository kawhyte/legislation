/**
 * Deletes non-bill debris from the `bill_summaries` Firestore collection.
 *
 * Real cache documents are keyed on encodeURIComponent(bill.id), and every
 * OpenStates bill id starts with "ocd-bill/". Anything that does not is left
 * over from manual testing (t1..t10, test, test1..test10), and four of those
 * hold the FALLBACK gist.
 *
 * Dry run (default, deletes nothing):
 *   node scripts/delete-junk-summaries.mjs
 * Actually delete:
 *   node scripts/delete-junk-summaries.mjs --yes
 *
 * Reads credentials from .env. Requires FIREBASE_CLIENT_EMAIL,
 * FIREBASE_PRIVATE_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

for (const line of fs.readFileSync(path.join(root, '.env'), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!m) continue;
  let v = m[2].trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  process.env[m[1]] = v;
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

const commit = process.argv.includes('--yes');
const db = admin.firestore();
const snap = await db.collection('bill_summaries').get();

// Decode first: real ids are stored percent-encoded ("ocd-bill%2F...").
const junk = snap.docs.filter(d => !decodeURIComponent(d.id).startsWith('ocd-bill/'));

console.log(`${snap.size} documents total, ${junk.length} junk:`);
for (const d of junk) {
  const gist = String(d.data().gist ?? '').slice(0, 45);
  console.log(`  ${d.id.padEnd(8)} ${gist}`);
}

if (!junk.length) {
  console.log('\nNothing to do.');
  process.exit(0);
}

if (!commit) {
  console.log('\nDRY RUN — nothing deleted. Re-run with --yes to delete these.');
  process.exit(0);
}

const batch = db.batch();
junk.forEach(d => batch.delete(d.ref));
await batch.commit();
console.log(`\nDeleted ${junk.length} documents.`);
process.exit(0);

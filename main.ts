// Neon Shores — make.fun program entry (Node 22, standard library only).
// Hands the app in: clears the contents of the output directory (never the
// directory itself — the grader mounts it read-write and owns the folder),
// copies app/ and screenshots/ from beside this file into it, then writes
// /output/dossier.json with the vendored make.fun library and prints a short
// audit summary to stdout. Outside the grader, MAKEFUN_OUTPUT_DIR stands
// in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { buildDossier } from './vendor/makefun-app.ts';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)));
const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

function clearContents(dir) {
  // Remove every entry inside dir, one by one. The directory itself is
  // never removed: deleting /output would fail on the grader's mount and
  // abort the run, so only its contents go.
  mkdirSync(dir, { recursive: true });
  for (const name of readdirSync(dir)) {
    rmSync(join(dir, name), { recursive: true, force: true });
  }
}

function countTree(dir) {
  let files = 0;
  let bytes = 0;
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      const st = statSync(p);
      if (st.isDirectory()) walk(p);
      else {
        files += 1;
        bytes += st.size;
      }
    }
  };
  walk(dir);
  return { files, bytes };
}

function auditSummary(out) {
  const app = countTree(join(out, 'app'));
  const shots = existsSync(join(out, 'screenshots'))
    ? countTree(join(out, 'screenshots'))
    : { files: 0, bytes: 0 };
  const dossier = JSON.parse(readFileSync(join(out, 'dossier.json'), 'utf8'));
  return {
    appFiles: app.files,
    appBytes: app.bytes,
    screenshotFiles: shots.files,
    screenshotBytes: shots.bytes,
    dossierSchema: dossier.schema,
    dossierBytes: statSync(join(out, 'dossier.json')).size,
  };
}

clearContents(outDir);
if (!existsSync(join(repoRoot, 'app', 'index.html'))) {
  throw new Error(`app/index.html missing under ${repoRoot} — nothing to hand in`);
}
cpSync(join(repoRoot, 'app'), join(outDir, 'app'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

const dossierBytes = buildDossier(outDir, DOSSIER_CAPS);
writeFileSync(join(outDir, 'dossier.json'), dossierBytes);

const summary = auditSummary(outDir);
console.log('neon-shores: handed in');
console.log(`  app: ${summary.appFiles} files, ${summary.appBytes} bytes`);
console.log(`  screenshots: ${summary.screenshotFiles} files, ${summary.screenshotBytes} bytes`);
console.log(`  dossier: ${summary.dossierSchema}, ${summary.dossierBytes} bytes`);

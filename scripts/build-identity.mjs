import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { hostname } from 'node:os';
import { resolve, join } from 'node:path';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const digest = value => createHash('sha256').update(value).digest('hex');

// Exclusive reservations are never removed: failed invocations retain their number.
export function reserveLocal(directory) {
  mkdirSync(directory, { recursive: true });
  for (let ordinal = 1; ; ordinal++) {
    try {
      writeFileSync(join(directory, `${ordinal}.json`), JSON.stringify({ reservedAt: new Date().toISOString() }), { flag: 'wx' });
      return ordinal;
    } catch (error) { if (error.code !== 'EEXIST') throw error; }
  }
}

export function createIdentity(target = 'web') {
  const release = JSON.parse(readFileSync('package.json', 'utf8'));
  const sha = git('rev-parse', 'HEAD');
  const dirty = Boolean(git('status', '--porcelain', '--untracked-files=normal'));
  const paths = [...new Set(git('ls-files', '-co', '--exclude-standard', '-z').split('\0').filter(Boolean))].sort();
  const source = createHash('sha256');
  for (const path of paths) source.update(path + '\0').update(existsSync(path) ? readFileSync(path) : '(deleted)');
  const fingerprint = source.digest('hex');
  const localScope = `local-${digest(hostname() + resolve('.')).slice(0, 10)}`;
  const scope = process.env.EASYASPIE_BUILD_SCOPE || localScope;
  const ordinal = process.env.EASYASPIE_BUILD_ORDINAL
    ? Number(process.env.EASYASPIE_BUILD_ORDINAL)
    : reserveLocal(resolve(git('rev-parse', '--git-common-dir'), 'easyaspie-builds', localScope));
  if (!/^(pr-[1-9]\d*|main|local-[a-z0-9-]+)$/.test(scope) || !Number.isSafeInteger(ordinal) || ordinal < 1) throw new Error('Invalid build reservation.');
  if (!scope.startsWith('local-') && !process.env.EASYASPIE_BUILD_ORDINAL) throw new Error('Shared builds need a durable reservation.');
  const builtAt = new Date().toISOString(); // Capture once, immediately before bundling.
  const stamp = builtAt.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const codename = release.releaseCodename ?? null;
  const slug = codename ? codename.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '') : 'Unassigned';
  const id = `${release.version}_${slug}_${scope}_build-${String(ordinal).padStart(3, '0')}_${stamp}_g${sha.slice(0, 12)}${dirty ? `_dirty-${fingerprint.slice(0, 12)}` : ''}_${target}`;
  return Object.freeze({ id, version: release.version, codename, codenameSlug: slug, scope, pr: scope.startsWith('pr-') ? Number(scope.slice(3)) : null, ordinal, builtAt, sha, dirty, sourceFingerprint: fingerprint, prHead: process.env.EASYASPIE_PR_HEAD || null, target, reservation: process.env.EASYASPIE_BUILD_REF || 'local-exclusive-file' });
}

export function buildReport(m, status) {
  return `# EasyAsPie Build\n\n**${m.id}**\n\nStatus: ${status}\n\nVersion: ${m.version}\n\nCodename: ${m.codename || 'Unassigned (awaiting the owner’s choice)'}\n\nUTC Build Time: ${m.builtAt}\n\nSource: ${m.sha}${m.dirty ? ' (dirty)' : ' (clean)'}\n\nSource Fingerprint: ${m.sourceFingerprint}\n\nPR Head: ${m.prHead || 'Not applicable'}\n\nScope / Ordinal: ${m.scope} / ${m.ordinal}\n\nTarget: ${m.target}\n\nThe complete machine-readable record is in build.json. Reusing this output preserves this identity.\n`;
}

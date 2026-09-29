// Editorial cuts only: original frames and motion speed are preserved. Keep the
// full capture next to the review cut so software-renderer stalls remain visible.
// The default ranges belong to one recovered take. A new capture needs a new
// JSON edit decision list, passed as the first argument, after watching that take.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
const output = resolve(process.env.REVIEW_OUTPUT || 'docs/review/issue-18');
const m = JSON.parse(readFileSync(`${output}/media-results.json`, 'utf8'));
const edit = JSON.parse(readFileSync(process.argv[2] || `${output}/review-edit.json`, 'utf8'));
assert.equal(edit.build, m.build, 'The edit list must identify this captured build.');
const actualDuration = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', `${output}/bakery-full-capture.mp4`], { encoding: 'utf8' }).trim());
assert.ok(Math.abs(actualDuration - edit.sourceDuration) < 0.05, 'Review ranges must be checked against this exact take.');
const ranges = edit.ranges;
assert.ok(Array.isArray(ranges) && ranges.length > 0);
for (const [a, b] of ranges) assert.ok(Number.isFinite(a) && Number.isFinite(b) && a >= 0 && b > a && b <= actualDuration);
const filter = ranges.map(([a, b], i) => `[0:v]trim=start=${a}:end=${b},setpts=PTS-STARTPTS[v${i}]`).join(';') + ';' + ranges.map((_, i) => `[v${i}]`).join('') + `concat=n=${ranges.length}:v=1:a=0[out]`;
execFileSync('ffmpeg', ['-y', '-i', `${output}/bakery-full-capture.mp4`, '-filter_complex_threads', '1', '-filter_complex', filter, '-map', '[out]', '-c:v', 'libx264', '-threads', '2', '-preset', 'medium', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', `${output}/bakery-review.mp4`], { stdio: 'pipe' });
const duration = ranges.reduce((n, [a, b]) => n + b - a, 0);
writeFileSync(`${output}/review-edit.json`, JSON.stringify({ build: m.build, source: 'bakery-full-capture.mp4', output: 'bakery-review.mp4', sourceDuration: actualDuration, ranges, duration, note: 'Editorial cuts omit waits and portions of transitions. Included footage retains its original speed; frames are not synthesized or interpolated. Use the full recording to judge complete transitions and timing. Ranges apply to this recorded take only.' }, null, 2) + '\n');
console.log(`Created ${duration}-second review cut from the original ${actualDuration}-second capture.`);

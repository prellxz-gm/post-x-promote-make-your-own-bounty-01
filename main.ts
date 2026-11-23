// Entry program for the make.fun "Promote make.fun's make-your-own-bounty
// post on X" bounty.
//
// The house scores the X post itself; this program only carries the post's
// address forward. It reads POST.json from the bot directory, checks that it
// is a JSON object with a non-empty string "url" field, and copies the file
// byte-for-byte into the output directory as POST.json.
//
// No network, no wall clock, no files outside the two directories above.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const botDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const inputPath = join(botDir, "POST.json");
const outputPath = join(outputDir, "POST.json");

function fail(message: string): never {
  process.stderr.write(`error: ${message}\n`);
  process.exit(1);
}

let raw: Buffer;
try {
  raw = readFileSync(inputPath);
} catch {
  fail(`cannot read ${inputPath}`);
}

let parsed: unknown;
try {
  parsed = JSON.parse(raw.toString("utf8"));
} catch {
  fail("POST.json is not valid JSON");
}

if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
  fail('POST.json must be a JSON object with a "url" field');
}

const url = (parsed as Record<string, unknown>).url;
if (typeof url !== "string" || url.trim().length === 0) {
  fail('POST.json "url" must be a non-empty string');
}

try {
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(outputPath, raw);
} catch {
  fail(`cannot write ${outputPath}`);
}

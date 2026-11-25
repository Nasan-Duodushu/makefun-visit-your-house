// Convince the AI Judge to Visit Your House — entry program.
// Copies the composed invitation letter (asset.jpg) to /output/entry.png,
// checking it is a JPEG of at most 1024x1024 before handing it over.
import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE = join(HERE, "asset.jpg");

function jpegSize(buf: Buffer): { width: number; height: number } {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) {
    throw new Error("asset.jpg is not a JPEG (no SOI marker)");
  }
  let off = 2;
  while (off + 9 < buf.length) {
    if (buf[off] !== 0xff) throw new Error("bad JPEG marker scan");
    const marker = buf[off + 1];
    const len = buf.readUInt16BE(off + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      const height = buf.readUInt16BE(off + 5);
      const width = buf.readUInt16BE(off + 7);
      return { width, height };
    }
    off += 2 + len;
  }
  throw new Error("no JPEG SOF frame found in asset.jpg");
}

const bytes = readFileSync(SOURCE);
const { width, height } = jpegSize(bytes);
if (width > 1024 || height > 1024) {
  throw new Error(`invitation is ${width}x${height}, over the 1024x1024 gate`);
}
if (bytes.length > 1048576) {
  throw new Error(`invitation is ${bytes.length} bytes, over the 1 MiB gate`);
}
mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.png", bytes);
chmodSync("/output/entry.png", 0o644);
console.log(`invitation delivered: ${width}x${height}, ${bytes.length} bytes`);

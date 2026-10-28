import { describe, expect, it } from 'vitest';
import goblinPng from '../../docs/art/m17/walk-v2/goblin.png?inline';
import scoutPng from '../../docs/art/m17/walk-v2/scout-spaced.png?inline';
import ogrePng from '../../docs/art/m17/walk-v2/ogre-spaced.png?inline';
import ogreDeathPng from '../../docs/art/m17/armored-ogre.png?inline';
import goblinAtlas from '../data/art/walk-v2/goblin.atlas.json';
import scoutAtlas from '../data/art/walk-v2/scout.atlas.json';
import ogreAtlas from '../data/art/walk-v2/ogre.atlas.json';
import ogreDeathAtlas from '../data/art/walk-v2/ogre-death.atlas.json';
import { ENEMY_ART, ENEMY_ART_FRAMES, ENEMY_DEATH_FRAMES } from '../data/artAssets';

const movement: number[] = Object.values(ENEMY_ART_FRAMES)
  .flatMap(({ idle, walk }) => [idle, ...walk]);
const fullSheet = [...movement, ...ENEMY_DEATH_FRAMES];
const assets = [
  { kind: 'basic', atlas: goblinAtlas, png: goblinPng, indices: fullSheet,
    bytes: 2153305, hash: 'e3f9c5bd24771e660eb97abced3a06a6162fbf76796cde861aef9be88a65d8f3' },
  { kind: 'runner', atlas: scoutAtlas, png: scoutPng, indices: fullSheet,
    bytes: 2020293, hash: '91ee6d05f4f913b19eb01c456db654a4a0ad4849cce4ccae33b01f7552f0c4f2' },
  { kind: 'guard', atlas: ogreAtlas, png: ogrePng, indices: movement,
    bytes: 2272632, hash: 'ba398450351f5866881ed6066d6330dfc66d34c5dee819706e8491ea0e4c6fca' },
  { kind: 'ogre-death', atlas: ogreDeathAtlas, png: ogreDeathPng, indices: [5, 11, 17, 23],
    bytes: 2696177, hash: '42a778de0af81551b03df05f13354fad363f8a34ae614ec9d5afd2d5e7208426' },
] as const;

it('binds the measured atlases to the runtime manifest', () => {
  expect(ENEMY_ART.basic!.atlas).toBe(goblinAtlas);
  expect(ENEMY_ART.runner!.atlas).toBe(scoutAtlas);
  expect(ENEMY_ART.guard!.atlas).toBe(ogreAtlas);
  expect(ENEMY_ART.guard!.death!.atlas).toBe(ogreDeathAtlas);
  expect(ENEMY_ART.guard!.death!.frames).toEqual([5, 11, 17, 23]);
});

// Vite supplies the real PNG bytes; standard Web APIs avoid adding Node typings.
function sourceBytes(dataUrl: string): ArrayBuffer {
  const binary = atob(dataUrl.slice(dataUrl.indexOf(',') + 1));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

// Read just the alpha channel of our RGBA8 PNGs. This never rewrites an image.
async function readAlpha(buffer: ArrayBuffer): Promise<Uint8Array> {
  const png = new Uint8Array(buffer), view = new DataView(buffer);
  if (png[24] !== 8 || png[25] !== 6 || png[28] !== 0) {
    throw new Error('Enemy art must be non-interlaced RGBA8 PNG');
  }
  const width = view.getUint32(16);
  const height = view.getUint32(20);
  const chunks: Uint8Array[] = [];
  for (let offset = 8; offset < png.length;) {
    const length = view.getUint32(offset);
    if (String.fromCharCode(...png.subarray(offset + 4, offset + 8)) === 'IDAT') {
      chunks.push(png.subarray(offset + 8, offset + 8 + length));
    }
    offset += length + 12;
  }
  const compressed = new Uint8Array(chunks.reduce((total, chunk) => total + chunk.length, 0));
  let offset = 0;
  for (const chunk of chunks) { compressed.set(chunk, offset); offset += chunk.length; }
  const stream = new Blob([compressed.buffer]).stream().pipeThrough(new DecompressionStream('deflate'));
  const raw = new Uint8Array(await new Response(stream).arrayBuffer());
  expect(raw.length).toBe((width * 4 + 1) * height);
  const alpha = new Uint8Array(width * height);
  const paeth = (a: number, b: number, c: number) => {
    const p = a + b - c;
    const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
  };
  for (let y = 0; y < height; y++) {
    const row = y * (width * 4 + 1);
    const filter = raw[row];
    if (filter > 4) throw new Error('Invalid PNG row filter');
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const left = x > 0 ? alpha[i - 1] : 0;
      const above = y > 0 ? alpha[i - width] : 0;
      const diagonal = x > 0 && y > 0 ? alpha[i - width - 1] : 0;
      const predictor = filter === 0 ? 0 : filter === 1 ? left : filter === 2 ? above
        : filter === 3 ? Math.floor((left + above) / 2) : paeth(left, above, diagonal);
      alpha[i] = (raw[row + 4 + x * 4] + predictor) & 255;
    }
  }
  return alpha;
}

for (const asset of assets) describe(`${asset.kind} atlas geometry`, () => {
  const { atlas } = asset;
  const poses = Object.entries(atlas.frames);

  it('matches the source PNG exactly and contains every required pose', async () => {
    const buffer = sourceBytes(asset.png), png = new Uint8Array(buffer), view = new DataView(buffer);
    expect(Array.from(png.subarray(0, 8))).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    expect(view.getUint32(16)).toBe(atlas.meta.size.w);
    expect(view.getUint32(20)).toBe(atlas.meta.size.h);
    expect(buffer.byteLength).toBe(asset.bytes);
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', buffer));
    expect(Array.from(digest, (byte) => byte.toString(16).padStart(2, '0')).join('')).toBe(asset.hash);
    expect(Object.keys(atlas.frames).sort()).toEqual(asset.indices.map(String).sort());
  });

  for (const [name, pose] of poses) {
    it(`keeps pose ${name} inside the PNG with a consistent ground pivot`, () => {
      const { frame, sourceSize, spriteSourceSize: trim, pivot, groundContact } = pose;
      expect(frame.w).toBeGreaterThan(0);
      expect(frame.h).toBeGreaterThan(0);
      expect(frame.x).toBeGreaterThanOrEqual(0);
      expect(frame.y).toBeGreaterThanOrEqual(0);
      expect(frame.x + frame.w).toBeLessThanOrEqual(atlas.meta.size.w);
      expect(frame.y + frame.h).toBeLessThanOrEqual(atlas.meta.size.h);
      expect(sourceSize).toEqual({ w: 320, h: 320 });
      expect(trim.w).toBe(frame.w);
      expect(trim.h).toBe(frame.h);
      expect(trim.x).toBeGreaterThanOrEqual(0);
      expect(trim.y).toBeGreaterThanOrEqual(0);
      expect(trim.x + trim.w).toBeLessThanOrEqual(sourceSize.w);
      expect(trim.y + trim.h).toBeLessThanOrEqual(sourceSize.h);
      expect(trim.x + groundContact.x - frame.x).toBe(pivot.x * sourceSize.w);
      expect(trim.y + groundContact.y - frame.y).toBe(pivot.y * sourceSize.h);
      expect(pivot).toEqual({ x: 0.5, y: 0.8 });
    });
  }

  it('does not include neighboring characters in overlapping source rectangles', () => {
    for (let i = 0; i < poses.length; i++) {
      const a = poses[i][1].frame;
      for (let j = i + 1; j < poses.length; j++) {
        const b = poses[j][1].frame;
        const overlap = a.x < b.x + b.w && b.x < a.x + a.w &&
          a.y < b.y + b.h && b.y < a.y + a.h;
        expect(overlap, `poses ${poses[i][0]} and ${poses[j][0]}`).toBe(false);
      }
    }
  });

  it('keeps transparent padding rather than cutting through a character', async () => {
    const alpha = await readAlpha(sourceBytes(asset.png)), width = atlas.meta.size.w;
    for (const [name, { frame }] of poses) {
      let maxBorder = 0, visible = 0;
      for (let y = frame.y; y < frame.y + frame.h; y++) {
        for (let x = frame.x; x < frame.x + frame.w; x++) {
          const value = alpha[y * width + x];
          if (value >= 32) visible++;
          if (x === frame.x || x === frame.x + frame.w - 1 ||
              y === frame.y || y === frame.y + frame.h - 1) {
            maxBorder = Math.max(maxBorder, value);
          }
        }
      }
      expect(visible, `pose ${name} must contain artwork`).toBeGreaterThan(5000);
      expect(maxBorder, `pose ${name} must retain padding`).toBeLessThanOrEqual(8);
    }
  });
});

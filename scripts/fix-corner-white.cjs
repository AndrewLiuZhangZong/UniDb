/**
 * fix-corner-white.cjs
 * 修复 qlmanage 渲染 SVG 时在圆角区域填充的纯白像素。
 * 用 pngjs 读取，自定义写入 PNG（含正确的 filter 处理）。
 */
const fs = require('fs');
const zlib = require('zlib');
const PNGModule = require('/Users/edy/Lemo/UniDb/node_modules/pngjs/lib/png.js');
const PNG = PNGModule.PNG || PNGModule;

function readPNGWithPngjs(buf) {
  return PNG.sync.read(buf);
}

function writePNGCustom(png, outPath) {
  const { width: w, height: h, data } = png;
  const rowSize = 1 + w * 4;
  const filtered = Buffer.alloc(h * rowSize);

  for (let y = 0; y < h; y++) {
    filtered[y * rowSize] = 0; // filter type None
    data.copy(filtered, y * rowSize + 1, y * w * 4, (y + 1) * w * 4);
  }

  const compressed = zlib.deflateSync(filtered, { level: 9 });

  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crcTable[n] = c;
  }
  const crc32 = (buf) => {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };

  const mkChunk = (type, payload) => {
    const tb = Buffer.from(type);
    const lb = Buffer.alloc(4); lb.writeUInt32BE(payload.length, 0);
    const cb = Buffer.alloc(4); cb.writeUInt32BE(crc32(Buffer.concat([tb, payload])), 0);
    return Buffer.concat([lb, tb, payload, cb]);
  };

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const pngBuf = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    mkChunk('IHDR', ihdr),
    mkChunk('IDAT', compressed),
    mkChunk('IEND', Buffer.alloc(0))
  ]);

  fs.writeFileSync(outPath, pngBuf);
}

// ── Run ──────────────────────────────────────────────────────
const buf = fs.readFileSync('./resources/icon.png');
const png = readPNGWithPngjs(buf);
const { width: w, height: h, data } = png;

const px = (x, y) => { const i=(y*w+x)*4; return [data[i],data[i+1],data[i+2],data[i+3]]; };
const setPx = (x,y,r,g,b,a) => { const i=(y*w+x)*4; data[i]=r;data[i+1]=g;data[i+2]=b;data[i+3]=a; };

console.log('=== Before ===');
console.log('Cylinder (200,180):', px(200,180));
console.log('Cylinder (256,200):', px(256,200));
console.log('Dark BG (100,100):', px(100,100));
console.log('Corner (0,0):', px(0,0));
console.log('Corner (511,511):', px(511,511));

// Background color from SVG gradient top-left: rgb(14,19,25)
const BG = [14, 19, 25];
const margin = 96;
const whiteThresh = 248;

let whiteBefore = 0;
for (let y=0;y<h;y++) for (let x=0;x<w;x++) {
  const [r,g,b,a] = px(x,y);
  if (a===255 && r>whiteThresh && g>whiteThresh && b>whiteThresh) whiteBefore++;
}
console.log('White pixels before:', whiteBefore);

let fixed = 0;
for (let y=0;y<h;y++) {
  for (let x=0;x<w;x++) {
    const inCorner = ((x<margin||x>=w-margin) && (y<margin||y>=h-margin));
    if (!inCorner) continue;
    const [r,g,b,a] = px(x,y);
    if (a===255 && r>whiteThresh && g>whiteThresh && b>whiteThresh) {
      setPx(x, y, BG[0], BG[1], BG[2], 255);
      fixed++;
    }
  }
}

let whiteAfter = 0;
for (let y=0;y<h;y++) for (let x=0;x<w;x++) {
  const [r,g,b,a] = px(x,y);
  if (a===255 && r>whiteThresh && g>whiteThresh && b>whiteThresh) whiteAfter++;
}
console.log('Fixed:', fixed, '  White after:', whiteAfter);

console.log('\n=== After ===');
console.log('Cylinder (200,180):', px(200,180));
console.log('Cylinder (256,200):', px(256,200));
console.log('Dark BG (100,100):', px(100,100));
console.log('Corner (0,0):', px(0,0));

writePNGCustom(png, './resources/icon.png');
const sz = fs.statSync('./resources/icon.png').size;
console.log('\nWritten icon.png:', sz, 'bytes');

// Re-verify by reading back
const buf2 = fs.readFileSync('./resources/icon.png');
const png2 = readPNGWithPngjs(buf2);
const p2 = (x,y) => { const i=(y*png2.width+x)*4; return [png2.data[i],png2.data[i+1],png2.data[i+2],png2.data[i+3]]; };
console.log('\n=== Re-read back ===');
console.log('Cylinder (200,180):', p2(200,180));
console.log('Cylinder (256,200):', p2(256,200));
console.log('Dark BG (100,100):', p2(100,100));
console.log('Corner (0,0):', p2(0,0));
console.log('Corner (511,511):', p2(511,511));

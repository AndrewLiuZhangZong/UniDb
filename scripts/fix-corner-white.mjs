/**
 * fix-corner-white.mjs
 * 修复 qlmanage 渲染 SVG 时在圆角区域填充的纯白像素。
 * 用实际背景暗色替换四角白块，同时保持其余内容完整。
 */
import { readFileSync, writeFileSync } from 'fs'

function readPNG(buf) {
  const zlib = require('zlib')
  let off = 8 // skip PNG signature

  const ihdrOff = off + 8 // type+len
  const len = buf.readUInt32BE(off); off += 4
  const type = String.fromCharCode(...buf.slice(off, off+4)); off += 4
  const ihdr = buf.slice(off, off+len); off += len + 4

  const w = ihdr.readUInt32BE(0)
  const h = ihdr.readUInt32BE(4)

  // Collect all IDAT chunks
  off += 4 // skip remaining of first chunk
  const chunks = []
  while (off < buf.length) {
    const clen = buf.readUInt32BE(off); off += 4
    const ctype = String.fromCharCode(...buf.slice(off, off+4)); off += 4
    if (ctype === 'IEND') { off += 4; break }
    if (ctype === 'IDAT') chunks.push(buf.slice(off, off+clen))
    off += clen + 4
  }

  const raw = zlib.inflateSync(Buffer.concat(chunks))
  const bpp = 4 // RGBA
  const rowSize = 1 + w * bpp
  const data = Buffer.alloc(w * h * 4)

  // Unfilter: process row by row, keep previous row for Up/Avg filters
  const prevRow = Buffer.alloc(w * 4)
  for (let y = 0; y < h; y++) {
    const filter = raw[y * rowSize]
    const curRow = Buffer.alloc(w * 4)
    for (let x = 0; x < w; x++) {
      const s = y * rowSize + 1 + x * bpp
      const d = (y * w + x) * 4
      for (let c = 0; c < 4; c++) {
        let v = raw[s + c]
        if (filter === 1) { // Sub: + left pixel
          v = (v + (x >= 1 ? curRow[d + c - 4] : 0)) & 0xff
        } else if (filter === 2) { // Up: + above pixel
          v = (v + prevRow[d + c]) & 0xff
        } else if (filter === 3) { // Average: + (left + above) / 2
          const a = x >= 1 ? curRow[d + c - 4] : 0
          v = (v + Math.floor((a + prevRow[d + c]) / 2)) & 0xff
        } else if (filter === 4) { // Paeth
          const a = x >= 1 ? curRow[d + c - 4] : 0
          const b = prevRow[d + c]
          const cc = x >= 1 ? prevRow[d + c - 4] : 0
          const p = a + b - cc
          v = (v + (Math.abs(p-a) <= Math.abs(p-b) && Math.abs(p-a) <= Math.abs(p-cc) ? a : Math.abs(p-b) <= Math.abs(p-cc) ? b : cc)) & 0xff
        }
        curRow[d + c] = v
      }
    }
    curRow.copy(data, y * w * 4)
    prevRow.fill(0)
    curRow.copy(prevRow)
  }

  return { width: w, height: h, data }
}

function writePNG(png, outPath) {
  const zlib = require('zlib')
  const { width: w, height: h, data } = png
  const rowSize = 1 + w * 4
  const filtered = Buffer.alloc(h * rowSize)

  // No filtering (type 0) for simplicity
  for (let y = 0; y < h; y++) {
    filtered[y * rowSize] = 0
    data.copy(filtered, y * rowSize + 1, y * w * 4, (y + 1) * w * 4)
  }

  const compressed = zlib.deflateSync(filtered, { level: 9 })

  const crc32 = (buf) => {
    let c = 0xffffffff
    const t = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
      let cc = n
      for (let k = 0; k < 8; k++) cc = cc & 1 ? 0xedb88320 ^ (cc >>> 1) : cc >>> 1
      t[n] = cc
    }
    for (let i = 0; i < buf.length; i++) c = t[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
    return (c ^ 0xffffffff) >>> 0
  }

  const makeChunk = (type, payload) => {
    const typeB = Buffer.from(type)
    const lenB = Buffer.alloc(4)
    lenB.writeUInt32BE(payload.length, 0)
    const crcB = Buffer.alloc(4)
    crcB.writeUInt32BE(crc32(Buffer.concat([typeB, payload])), 0)
    return Buffer.concat([lenB, typeB, payload, crcB])
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const chunks = Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0))
  ])

  writeFileSync(outPath, chunks)
  console.log('Written:', outPath)
}

// ── Run ──────────────────────────────────────────────────────
const buf = readFileSync('./resources/icon.png')
const png = readPNG(buf)
const { width: w, height: h, data } = png

function px(x, y) {
  const i = (y * w + x) * 4
  return [data[i], data[i+1], data[i+2], data[i+3]]
}
function setPx(x, y, r, g, b, a) {
  const i = (y * w + x) * 4
  data[i]=r; data[i+1]=g; data[i+2]=b; data[i+3]=a
}

// Background color matches SVG gradient top-left: ~rgb(14,19,25)
const BG = [14, 19, 25]
const margin = 96
const whiteThresh = 248

// Count before
let whiteBefore = 0
for (let y = 0; y < h; y++)
  for (let x = 0; x < w; x++) {
    const [r,g,b,a] = px(x,y)
    if (a===255 && r>whiteThresh && g>whiteThresh && b>whiteThresh) whiteBefore++
  }
console.log('White pixels before:', whiteBefore)

// Fix corners: pure white + in corner margin → dark background
let fixed = 0
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const inCorner = (
      (x < margin || x >= w - margin) &&
      (y < margin || y >= h - margin)
    )
    if (!inCorner) continue
    const [r,g,b,a] = px(x, y)
    if (a === 255 && r > whiteThresh && g > whiteThresh && b > whiteThresh) {
      setPx(x, y, BG[0], BG[1], BG[2], 255)
      fixed++
    }
  }
}

// Count after
let whiteAfter = 0
for (let y = 0; y < h; y++)
  for (let x = 0; x < w; x++) {
    const [r,g,b,a] = px(x,y)
    if (a===255 && r>whiteThresh && g>whiteThresh && b>whiteThresh) whiteAfter++
  }
console.log('White pixels after:', whiteAfter)
console.log('Fixed:', fixed)

// Verify a cylinder pixel is unchanged
console.log('Cylinder check (200,180):', px(200,180))
console.log('Corner check (0,0):', px(0,0))

writePNG(png, './resources/icon.png')
/**
 * generate-icns.mjs
 * Reads PNG files from resources/iconset/ and writes a valid .icns file.
 * Run: node scripts/generate-icns.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const iconsetDir = join(__dirname, '../resources/iconset')
const outPath = join(__dirname, '../resources/icon.icns')

// Map filename suffix -> ICNS chunk type (big-endian uint32)
const TYPE_MAP = {
  'icon_16x16.png':       [0x69, 0x63, 0x70, 0x34], // icp4
  'icon_16x16@2x.png':    [0x69, 0x63, 0x31, 0x33], // ic13
  'icon_32x32.png':       [0x69, 0x63, 0x70, 0x35], // icp5
  'icon_32x32@2x.png':    [0x69, 0x63, 0x31, 0x32], // ic12
  'icon_128x128.png':     [0x69, 0x63, 0x30, 0x37], // ic07
  'icon_128x128@2x.png':  [0x69, 0x63, 0x30, 0x38], // ic08
  'icon_256x256.png':     [0x69, 0x63, 0x30, 0x39], // ic09
  'icon_256x256@2x.png':  [0x69, 0x63, 0x31, 0x30], // ic10
  'icon_512x512.png':     [0x69, 0x63, 0x30, 0x39], // ic09 (512 = ic09)
  'icon_512x512@2x.png':  [0x69, 0x63, 0x31, 0x30], // ic10 (1024)
}

function be32(n) {
  const b = Buffer.alloc(4)
  b.writeUInt32BE(n, 0)
  return b
}

function chunkTypeToHex(type) {
  return String.fromCharCode(...type)
}

const files = readdirSync(iconsetDir).filter(f => f.endsWith('.png'))
const chunks = []

for (const file of files) {
  const pngData = readFileSync(join(iconsetDir, file))
  const type = TYPE_MAP[file]
  if (!type) {
    console.warn(`  Skipping unknown: ${file}`)
    continue
  }
  const typeHex = chunkTypeToHex(type)
  const chunkSize = 8 + pngData.length // header(4+4) + data
  const chunk = Buffer.concat([Buffer.from(type), be32(chunkSize), pngData])
  chunks.push({ typeHex, size: pngData.length, chunk })
  console.log(`  + ${typeHex}: ${file} (${pngData.length} bytes)`)
}

if (chunks.length === 0) {
  console.error('No PNG files found in iconset!')
  process.exit(1)
}

// Build ICNS: magic 'icns' + total size + chunks
const headerSize = 8 // 'icns' + total-size
const allChunkData = Buffer.concat(chunks.map(c => c.chunk))
const totalSize = headerSize + allChunkData.length

const icns = Buffer.concat([
  Buffer.from('icns'),
  be32(totalSize),
  allChunkData
])

writeFileSync(outPath, icns)
console.log(`\nWritten: ${outPath} (${icns.length} bytes)`)

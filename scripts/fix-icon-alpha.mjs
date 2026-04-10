/**
 * fix-icon-alpha.mjs
 * Reads icon.png, makes corner areas (near edges) transparent where they are white/opaque,
 * since those are rendering artifacts from qlmanage's white-fill.
 */
import { readFileSync, writeFileSync } from 'fs'
import PNG from 'pngjs'

const src = readFileSync('./resources/icon.png')
const png = PNG.PNG.sync.read(src)
const { width, height, data } = png

// Replace pixels where:
// 1. Pixel is in corner regions (within margin from edge)
// 2. Pixel is mostly white (R,G,B > threshold)
// 3. Pixel is opaque (A = 255)
// The SVG has elements that go to edges - but qlmanage fills with white.
// We'll make edges transparent where alpha was added by qlmanage (pure opaque white = artifact).
const margin = 96 // roughly matches SVG rx="96" on 512px
const whiteThreshold = 230 // R,G,B all > this = considered white

let fixed = 0
let unchanged = 0

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4
    const r = data[idx]
    const g = data[idx + 1]
    const b = data[idx + 2]
    const a = data[idx + 3]

    // Check if in corner region
    const inCorner = (
      (x < margin || x >= width - margin) &&
      (y < margin || y >= height - margin)
    )

    if (inCorner && a === 255 && r > whiteThreshold && g > whiteThreshold && b > whiteThreshold) {
      // Check if this pixel is part of a decorative corner circle
      // Circle centers: (72,72),(440,72),(72,440),(440,440) r=5
      const corners = [
        {cx:72,cy:72},{cx:440,cy:72},{cx:72,cy:440},{cx:440,cy:440}
      ]
      const inCornerCircle = corners.some(c => {
        const dx = x - c.cx, dy = y - c.cy
        return Math.sqrt(dx*dx+dy*dy) <= 6 // small margin for anti-aliasing
      })
      if (!inCornerCircle) {
        data[idx + 3] = 0 // make transparent
        fixed++
      } else {
        unchanged++
      }
    } else {
      unchanged++
    }
  }
}

const out = PNG.PNG.sync.write(png, { colorType: 6 })
writeFileSync('./resources/icon.png', out)
console.log(`Fixed ${fixed} pixels, kept ${unchanged} pixels`)
console.log('Written: resources/icon.png (RGBA with transparent corners)')

/**
 * Generate favicon.ico for SmartTravel Qingyuan (智游清远)
 * Creates a 256x256 green mountain/travel themed icon using PNG-in-ICO format
 */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const SIZE = 256;

// Create RGBA pixel data
function createPixelData() {
  const data = Buffer.alloc(SIZE * SIZE * 4, 0);
  
  function setPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return;
    const idx = (y * SIZE + x) * 4;
    data[idx] = r;
    data[idx+1] = g;
    data[idx+2] = b;
    data[idx+3] = a;
  }

  function fillCircle(cx, cy, radius, r, g, b, a = 255) {
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const dx = x - cx, dy = y - cy;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist <= radius) {
          // Anti-alias edge
          const edgeDist = radius - dist;
          const alpha = edgeDist < 1 ? Math.floor(a * edgeDist) : a;
          setPixel(x, y, r, g, b, alpha);
        }
      }
    }
  }

  // Background: rounded square with gradient (emerald green)
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const margin = 8;
      const radius = 40;
      const inX = x >= margin && x < SIZE - margin;
      const inY = y >= margin && y < SIZE - margin;
      if (!inX || !inY) continue;
      
      // Check rounded corners
      const corners = [
        [margin + radius, margin + radius],
        [SIZE - margin - radius - 1, margin + radius],
        [margin + radius, SIZE - margin - radius - 1],
        [SIZE - margin - radius - 1, SIZE - margin - radius - 1]
      ];
      let inside = true;
      if (x < margin + radius && y < margin + radius) {
        inside = Math.hypot(x - corners[0][0], y - corners[0][1]) <= radius;
      } else if (x > SIZE - margin - radius - 1 && y < margin + radius) {
        inside = Math.hypot(x - corners[1][0], y - corners[1][1]) <= radius;
      } else if (x < margin + radius && y > SIZE - margin - radius - 1) {
        inside = Math.hypot(x - corners[2][0], y - corners[2][1]) <= radius;
      } else if (x > SIZE - margin - radius - 1 && y > SIZE - margin - radius - 1) {
        inside = Math.hypot(x - corners[3][0], y - corners[3][1]) <= radius;
      }
      
      if (inside) {
        // Gradient from top-left to bottom-right
        const t = (x + y) / (SIZE * 2);
        const r = Math.floor(16 + t * 20);
        const g = Math.floor(185 - t * 40);
        const b = Math.floor(129 - t * 30);
        setPixel(x, y, r, g, b, 255);
      }
    }
  }

  // Mountain 1 (left, shorter) - white with slight transparency
  const m1Peak = { x: 95, y: 85 };
  const m1Base = 195;
  const m1Width = 0.85;
  for (let y = m1Peak.y; y <= m1Base; y++) {
    const progress = (y - m1Peak.y) / (m1Base - m1Peak.y);
    const halfW = progress * (m1Base - m1Peak.y) * m1Width;
    for (let x = Math.floor(m1Peak.x - halfW); x <= Math.ceil(m1Peak.x + halfW); x++) {
      if (x >= 8 && x < SIZE - 8) setPixel(x, y, 255, 255, 255, 230);
    }
  }

  // Mountain 2 (right, taller) - white
  const m2Peak = { x: 168, y: 55 };
  const m2Base = 200;
  const m2Width = 0.72;
  for (let y = m2Peak.y; y <= m2Base; y++) {
    const progress = (y - m2Peak.y) / (m2Base - m2Peak.y);
    const halfW = progress * (m2Base - m2Peak.y) * m2Width;
    for (let x = Math.floor(m2Peak.x - halfW); x <= Math.ceil(m2Peak.x + halfW); x++) {
      if (x >= 8 && x < SIZE - 8) setPixel(x, y, 255, 255, 255, 245);
    }
  }

  // Snow cap on mountain 2
  for (let y = m2Peak.y; y <= m2Peak.y + 18; y++) {
    const progress = (y - m2Peak.y) / 18;
    const halfW = progress * 18 * m2Width;
    for (let x = Math.floor(m2Peak.x - halfW); x <= Math.ceil(m2Peak.x + halfW); x++) {
      if (x >= 8 && x < SIZE - 8) setPixel(x, y, 255, 255, 255, 255);
    }
  }

  // Sun (golden yellow circle, top right area)
  fillCircle(205, 50, 22, 255, 210, 50, 240);
  // Sun glow
  fillCircle(205, 50, 30, 255, 220, 80, 60);

  // Path/river line (subtle white curve at bottom)
  for (let x = 40; x < 220; x++) {
    const y = Math.floor(210 + Math.sin((x - 40) / 30) * 8);
    for (let dy = -2; dy <= 2; dy++) {
      const alpha = Math.max(0, 150 - Math.abs(dy) * 50);
      if (y + dy >= 8 && y + dy < SIZE - 8) setPixel(x, y + dy, 255, 255, 255, alpha);
    }
  }

  return data;
}

// Create PNG buffer from RGBA data
function createPNG(pixelData, width, height) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  function crc32(buf) {
    let c = 0xFFFFFFFF;
    const table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let val = n;
      for (let k = 0; k < 8; k++) val = (val & 1) ? (0xEDB88320 ^ (val >>> 1)) : (val >>> 1);
      table[n] = val;
    }
    for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function createChunk(type, data) {
    const typeData = Buffer.concat([Buffer.from(type), data]);
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(typeData), 0);
    return Buffer.concat([len, typeData, crcBuf]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);   // bit depth
  ihdr.writeUInt8(6, 9);   // color type: RGBA
  ihdr.writeUInt8(0, 10);  // compression
  ihdr.writeUInt8(0, 11);  // filter
  ihdr.writeUInt8(0, 12);  // interlace

  // IDAT - raw pixel data with filter byte per row
  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 4)] = 0; // filter: None
    pixelData.copy(rawData, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const compressed = zlib.deflateSync(rawData, { level: 9 });

  // IEND
  const iend = Buffer.alloc(0);

  return Buffer.concat([
    signature,
    createChunk("IHDR", ihdr),
    createChunk("IDAT", compressed),
    createChunk("IEND", iend),
  ]);
}

// ICO with PNG entry (modern format, supported by Windows Vista+)
function createICO(pngData) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);  // reserved
  header.writeUInt16LE(1, 2);  // type: ICO
  header.writeUInt16LE(1, 4);  // count: 1

  const dir = Buffer.alloc(16);
  dir.writeUInt8(0, 0);              // width: 0 = 256
  dir.writeUInt8(0, 1);              // height: 0 = 256
  dir.writeUInt8(0, 2);              // color palette
  dir.writeUInt8(0, 3);              // reserved
  dir.writeUInt16LE(1, 4);           // color planes
  dir.writeUInt16LE(32, 6);          // bits per pixel
  dir.writeUInt32LE(pngData.length, 8);  // image data size
  dir.writeUInt32LE(22, 12);         // offset (6+16=22)

  return Buffer.concat([header, dir, pngData]);
}

console.log("Generating 256x256 icon...");
const pixels = createPixelData();
const png = createPNG(pixels, SIZE, SIZE);
const ico = createICO(png);
const outPath = path.join(__dirname, "..", "public", "favicon.ico");
fs.writeFileSync(outPath, ico);
console.log(`Created favicon.ico (${ico.length} bytes) at ${outPath}`);

// Also save as PNG for web use
const pngPath = path.join(__dirname, "..", "public", "icons", "icon-192.png");
const png192 = createPNG(createPixelData(), SIZE, SIZE);
fs.writeFileSync(pngPath, png192);
console.log(`Created icon-192.png (${png192.length} bytes)`);

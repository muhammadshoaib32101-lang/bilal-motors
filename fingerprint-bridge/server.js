"use strict";

const express = require("express");
const koffi   = require("koffi");
const fs      = require("fs");
const path    = require("path");

// ─── Config ───────────────────────────────────────────────────────────────────

const PORT        = 9999;
const ZKFP_ERR_OK = 0;
const POLL_MS     = 100;
const MAX_BUF     = 1024 * 1024;   // 1MB — prevents buffer overflow for any scanner size
const TMP_FILE    = path.join(__dirname, "last_fingerprint.bmp");

const DLL_CANDIDATES = [
  "libzkfp",
  "C:\\Windows\\System32\\libzkfp.dll",
  "C:\\Windows\\SysWOW64\\libzkfp.dll",
];

// ─── State ────────────────────────────────────────────────────────────────────

let lib          = null;
let deviceHandle = null;
let fpWidth      = 0;
let fpHeight     = 0;

const TEMPLATE_SIZE = 2048;

let fnInit, fnTerminate, fnGetDeviceCount, fnOpenDevice,
    fnCloseDevice, fnGetCaptureParamsEx, fnAcquireFingerprint;

// ─── Global crash guard ───────────────────────────────────────────────────────

process.on("uncaughtException",  (err) => console.error("[CRASH CAUGHT]", err.message));
process.on("unhandledRejection", (err) => console.error("[REJECTION]",    err));

// ─── Load DLL ─────────────────────────────────────────────────────────────────

function loadDLL() {
  if (lib) return true;
  for (const p of DLL_CANDIDATES) {
    try {
      lib = koffi.load(p);
      fnInit               = lib.func("int ZKFPM_Init()");
      fnTerminate          = lib.func("int ZKFPM_Terminate()");
      fnGetDeviceCount     = lib.func("int ZKFPM_GetDeviceCount()");
      fnOpenDevice         = lib.func("void* ZKFPM_OpenDevice(int index)");
      fnCloseDevice        = lib.func("int ZKFPM_CloseDevice(void* hDevice)");
      fnGetCaptureParamsEx  = lib.func("int ZKFPM_GetCaptureParamsEx(void* hDevice, int* width, int* height, int* dpi)");
      // AcquireFingerprint: same function Delphi/C# demo uses — returns processed image
      fnAcquireFingerprint  = lib.func("int ZKFPM_AcquireFingerprint(void* hDevice, uint8* fpImage, uint32 cbFPImage, uint8* fpTemplate, uint32* cbTemplate)");
      console.log(`[OK] DLL loaded: ${p}`);
      return true;
    } catch (_) { lib = null; }
  }
  console.error("[ERR] libzkfp.dll not found. Run setup.exe first.");
  return false;
}

// ─── CLAHE (Contrast Limited Adaptive Histogram Equalization) ────────────────
// Standard algorithm for fingerprint image enhancement

function clahe(src, w, h, gridX = 8, gridY = 8, clipFactor = 3) {
  const tW = Math.ceil(w / gridX);
  const tH = Math.ceil(h / gridY);

  // Build equalized LUT for every tile
  const luts = [];
  for (let ty = 0; ty < gridY; ty++) {
    const row = [];
    for (let tx = 0; tx < gridX; tx++) {
      const x0 = tx * tW, y0 = ty * tH;
      const x1 = Math.min(x0 + tW, w), y1 = Math.min(y0 + tH, h);
      const n  = (x1 - x0) * (y1 - y0);

      const hist = new Array(256).fill(0);
      for (let y = y0; y < y1; y++)
        for (let x = x0; x < x1; x++)
          hist[src[y * w + x]]++;

      // Clip and redistribute excess
      const limit = Math.max(1, Math.round(clipFactor * n / 256));
      let excess = 0;
      for (let i = 0; i < 256; i++) {
        if (hist[i] > limit) { excess += hist[i] - limit; hist[i] = limit; }
      }
      const add = Math.floor(excess / 256);
      let   rem = excess - add * 256;
      for (let i = 0; i < 256; i++) { hist[i] += add; if (rem-- > 0) hist[i]++; }

      // Build LUT from CDF
      const lut = new Uint8Array(256);
      let cdf = 0;
      for (let i = 0; i < 256; i++) {
        cdf += hist[i];
        lut[i] = Math.min(255, Math.round(cdf * 255 / n));
      }
      row.push(lut);
    }
    luts.push(row);
  }

  // Apply bilinear interpolation across tile boundaries
  const dst = Buffer.alloc(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v   = src[y * w + x];
      const tfx = x / tW - 0.5;
      const tfy = y / tH - 0.5;
      const tx0 = Math.max(0, Math.floor(tfx));
      const tx1 = Math.min(gridX - 1, tx0 + 1);
      const ty0 = Math.max(0, Math.floor(tfy));
      const ty1 = Math.min(gridY - 1, ty0 + 1);
      const fx  = tfx - tx0, fy = tfy - ty0;

      dst[y * w + x] = Math.round(
        luts[ty0][tx0][v] * (1-fx)*(1-fy) +
        luts[ty0][tx1][v] * fx    *(1-fy) +
        luts[ty1][tx0][v] * (1-fx)*fy     +
        luts[ty1][tx1][v] * fx    *fy
      );
    }
  }
  return dst;
}

// ─── Raw grayscale → 24-bit BMP base64 ────────────────────────────────────────
// Pipeline: CLAHE (local adaptive equalization) → 24-bit BMP

function toBMPBase64(rawBuf, width, height) {
  const img = clahe(rawBuf, width, height);
  console.log(`[IMAGE] CLAHE done ${width}×${height}`);

  // 24-bit RGB BMP (no palette) — better browser support than 8-bit indexed
  const rowSize    = Math.floor((width * 3 + 3) / 4) * 4;  // 3 bytes/pixel, 4-byte aligned
  const pixelBytes = rowSize * height;
  const fileSize   = 54 + pixelBytes;  // 14+40 header, no palette
  const bmp        = Buffer.alloc(fileSize, 0);
  let   off        = 0;

  // BITMAPFILEHEADER
  bmp.write("BM", off);                  off += 2;
  bmp.writeUInt32LE(fileSize, off);      off += 4;
  bmp.writeUInt16LE(0, off);             off += 2;
  bmp.writeUInt16LE(0, off);             off += 2;
  bmp.writeUInt32LE(54, off);            off += 4;  // pixel data starts at byte 54

  // BITMAPINFOHEADER
  bmp.writeUInt32LE(40,      off); off += 4;
  bmp.writeInt32LE(width,    off); off += 4;
  bmp.writeInt32LE(-height,  off); off += 4;  // negative = top-down
  bmp.writeUInt16LE(1,       off); off += 2;
  bmp.writeUInt16LE(24,      off); off += 2;  // 24-bit RGB
  bmp.writeUInt32LE(0,       off); off += 4;
  bmp.writeUInt32LE(pixelBytes, off); off += 4;
  bmp.writeInt32LE(0, off);        off += 4;
  bmp.writeInt32LE(0, off);        off += 4;
  bmp.writeUInt32LE(0, off);       off += 4;
  bmp.writeUInt32LE(0, off);       off += 4;

  // Pixel rows (B G R per pixel)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const g = img[y * width + x];
      bmp[off++] = g;  // B
      bmp[off++] = g;  // G
      bmp[off++] = g;  // R
    }
    off += rowSize - width * 3;
  }

  return bmp.toString("base64");
}

// ─── Express ──────────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin",  "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// ── GET /ZKService ─── init scanner ───────────────────────────────────────────

app.get("/ZKService", (req, res) => {
  try {
    if (!loadDLL())
      return res.json({ ret: -1, msg: "libzkfp.dll not found. Run setup.exe first." });

    if (deviceHandle) {
      try { fnCloseDevice(deviceHandle); } catch (_) {}
      deviceHandle = null;
      try { fnTerminate(); } catch (_) {}
    }

    if (fnInit() !== ZKFP_ERR_OK)
      return res.json({ ret: -1, msg: "SDK init failed." });

    if (fnGetDeviceCount() <= 0) {
      fnTerminate();
      return res.json({ ret: -1, msg: "No scanner found. Check USB connection." });
    }

    deviceHandle = fnOpenDevice(0);
    if (!deviceHandle) {
      fnTerminate();
      return res.json({ ret: -1, msg: "Failed to open device." });
    }

    const wArr = [0], hArr = [0], dpiArr = [0];
    try { fnGetCaptureParamsEx(deviceHandle, wArr, hArr, dpiArr); } catch (_) {}
    // Only trust GetCaptureParamsEx if DPI > 0 (DPI=0 = unreliable)
    // Actual ZK9500 image size confirmed from SDK sample BMP: 275×375
    fpWidth  = (dpiArr[0] > 0 && wArr[0] > 0) ? wArr[0]  : 275;
    fpHeight = (dpiArr[0] > 0 && hArr[0] > 0) ? hArr[0]  : 375;

    console.log(`[OPEN] Scanner ready: ${fpWidth}×${fpHeight} @ ${dpiArr[0]} DPI`);
    res.json({ ret: 0, SN: "ZK001", width: fpWidth, height: fpHeight });

  } catch (err) {
    console.error("[/ZKService]", err.message);
    res.json({ ret: -99, msg: "Server error: " + err.message });
  }
});

// ── POST /ZKService/GetFingers ─── capture → PNG ──────────────────────────────

app.post("/ZKService/GetFingers", (req, res) => {
  if (!deviceHandle)
    return res.json({ ret: -1, msg: "Scanner not initialized. Click Connect Scanner first." });

  const timeoutMs = (req.body && req.body.timeout) ? Number(req.body.timeout) : 15000;
  const deadline  = Date.now() + timeoutMs;

  // 1MB write buffer (prevents overflow) + exact-size safe copy for JS access
  const imgSize = fpWidth * fpHeight;
  const fpImage = Buffer.alloc(MAX_BUF);   // DLL writes here (large = safe)
  const fpTpl   = Buffer.alloc(TEMPLATE_SIZE);
  let   responded = false;

  console.log(`[SCAN] ${fpWidth}×${fpHeight} = ${imgSize} bytes. Waiting for finger...`);

  function safeRespond(data) {
    if (responded) return;
    responded = true;
    try { res.json(data); } catch (e) { console.error("[respond err]", e.message); }
  }

  function poll() {
    if (responded) return;
    if (Date.now() > deadline) {
      console.log("[SCAN] Timeout.");
      return safeRespond({ ret: -2, msg: "Timeout. No fingerprint detected." });
    }

    let ret = -999;
    try {
      const cbArr = [TEMPLATE_SIZE];
      ret = fnAcquireFingerprint(deviceHandle, fpImage, imgSize, fpTpl, cbArr);
    } catch (e) {
      console.error("[AcquireFingerprint error]", e.message);
      return safeRespond({ ret: -3, msg: "Scanner error: " + e.message });
    }

    if (ret === ZKFP_ERR_OK) {
      console.log("[SCAN] Captured! Copying buffer...");
      try {
        // Direct copy — confirmed 8-bit, 275×375 = 103125 bytes
        const safeBuf = Buffer.alloc(imgSize);
        fpImage.copy(safeBuf, 0, 0, imgSize);

        console.log("[SCAN] Converting to BMP...");
        const b64 = toBMPBase64(safeBuf, fpWidth, fpHeight);
        console.log(`[SCAN] Done — ${b64.length} chars. Saving...`);
        fs.writeFileSync(TMP_FILE, Buffer.from(b64, "base64"));
        safeRespond({ ret: 0, img: b64 });
      } catch (e) {
        console.error("[PNG error]", e.message);
        safeRespond({ ret: -4, msg: "Image error: " + e.message });
      }
      return;
    }

    setTimeout(poll, POLL_MS);
  }

  poll();
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, "127.0.0.1", () => {
  console.log("=========================================");
  console.log("  ZKFinger Bridge Server - Bilal Motors");
  console.log("=========================================");
  console.log(`\n ZKFinger Bridge  →  http://localhost:${PORT}\n`);
  console.log("  GET  /ZKService             init scanner");
  console.log("  POST /ZKService/GetFingers  capture image");
  console.log("\nKeep this window open while using the app.");
});

process.on("SIGINT",  cleanup);
process.on("SIGTERM", cleanup);
function cleanup() {
  if (deviceHandle) { try { fnCloseDevice(deviceHandle); } catch (_) {} }
  try { fnTerminate(); } catch (_) {}
  process.exit(0);
}

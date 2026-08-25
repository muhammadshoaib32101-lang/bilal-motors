"use strict";

// Standalone child process — called by server.js
// Loads koffi, captures ONE fingerprint, saves BMP, exits.
// If it crashes, only this process dies — the main server keeps running.

const koffi = require("koffi");
const fs    = require("fs");
const path  = require("path");

const ZKFP_ERR_OK   = 0;
const TEMPLATE_SIZE = 2048;
const TMP_FILE      = path.join(__dirname, "last_fingerprint.bmp");

const mode           = process.argv[2] || "--check";
const captureTimeout = parseInt(process.argv[3]) || 15000;

const DLL_CANDIDATES = [
  "libzkfp",
  "C:\\Windows\\System32\\libzkfp.dll",
  "C:\\Windows\\SysWOW64\\libzkfp.dll",
];

// ─── Output helpers ───────────────────────────────────────────────────────────

function done(obj) {
  process.stdout.write(JSON.stringify(obj) + "\n");
  process.exit(0);
}

// ─── Load DLL ─────────────────────────────────────────────────────────────────

function loadDLL() {
  for (const p of DLL_CANDIDATES) {
    try {
      const lib = koffi.load(p);
      return {
        Init:               lib.func("int ZKFPM_Init()"),
        Terminate:          lib.func("int ZKFPM_Terminate()"),
        GetDeviceCount:     lib.func("int ZKFPM_GetDeviceCount()"),
        OpenDevice:         lib.func("void* ZKFPM_OpenDevice(int index)"),
        CloseDevice:        lib.func("int ZKFPM_CloseDevice(void* hDevice)"),
        GetCaptureParamsEx: lib.func("int ZKFPM_GetCaptureParamsEx(void* hDevice, int* width, int* height, int* dpi)"),
        AcquireFingerprint: lib.func("int ZKFPM_AcquireFingerprint(void* hDevice, uint8* fpImage, uint32 cbFPImage, uint8* fpTemplate, uint32* cbTemplate)"),
      };
    } catch (_) {}
  }
  return null;
}

// ─── Save raw grayscale buffer as BMP file (pure Node.js) ─────────────────────

function saveBMP(rawBuf, width, height, filePath) {
  const rowSize    = Math.floor((width + 3) / 4) * 4;
  const pixelBytes = rowSize * height;
  const fileSize   = 14 + 40 + 1024 + pixelBytes;
  const buf        = Buffer.alloc(fileSize, 0);
  let   off        = 0;

  // BITMAPFILEHEADER
  buf.write("BM", off);                           off += 2;
  buf.writeUInt32LE(fileSize,          off);       off += 4;
  buf.writeUInt16LE(0,                 off);       off += 2;
  buf.writeUInt16LE(0,                 off);       off += 2;
  buf.writeUInt32LE(14 + 40 + 1024,   off);       off += 4;

  // BITMAPINFOHEADER
  buf.writeUInt32LE(40,       off); off += 4;
  buf.writeInt32LE(width,     off); off += 4;
  buf.writeInt32LE(height,    off); off += 4;
  buf.writeUInt16LE(1,        off); off += 2;
  buf.writeUInt16LE(8,        off); off += 2;
  buf.writeUInt32LE(0,        off); off += 4;
  buf.writeUInt32LE(pixelBytes, off); off += 4;
  buf.writeInt32LE(0,         off); off += 4;
  buf.writeInt32LE(0,         off); off += 4;
  buf.writeUInt32LE(256,      off); off += 4;
  buf.writeUInt32LE(256,      off); off += 4;

  // Grayscale palette
  for (let i = 0; i < 256; i++) {
    buf[off++] = i; buf[off++] = i; buf[off++] = i; buf[off++] = 0;
  }

  // Pixel data (scanner gives bottom-up rows — matches BMP format, no flip needed)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      buf[off++] = rawBuf[y * width + x] || 0;
    }
    off += rowSize - width; // row padding
  }

  fs.writeFileSync(filePath, buf);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const fns = loadDLL();
if (!fns) done({ ret: -1, msg: "libzkfp.dll not found. Run setup.exe first." });

// ── --check: verify scanner is connected ──────────────────────────────────────

if (mode === "--check") {
  if (fns.Init() !== ZKFP_ERR_OK) done({ ret: -1, msg: "SDK init failed." });
  const count = fns.GetDeviceCount();
  fns.Terminate();
  if (count <= 0) done({ ret: -1, msg: "No scanner found. Check USB." });
  done({ ret: 0, SN: "ZK001" });
}

// ── --capture: open device, wait for finger, save BMP, exit ───────────────────

if (mode === "--capture") {
  const dbg = (msg) => process.stderr.write("[DBG] " + msg + "\n");

  dbg("Init start");
  const initRet = fns.Init();
  dbg("Init ret=" + initRet);
  if (initRet !== ZKFP_ERR_OK) done({ ret: -1, msg: "Init failed: " + initRet });

  dbg("GetDeviceCount");
  const count = fns.GetDeviceCount();
  dbg("count=" + count);
  if (count <= 0) { fns.Terminate(); done({ ret: -1, msg: "No scanner found." }); }

  dbg("OpenDevice");
  const handle = fns.OpenDevice(0);
  dbg("handle=" + (handle ? "ok" : "null"));
  if (!handle) { fns.Terminate(); done({ ret: -1, msg: "Cannot open device." }); }

  dbg("GetCaptureParamsEx");
  const wArr = [0], hArr = [0], dpiArr = [0];
  try { fns.GetCaptureParamsEx(handle, wArr, hArr, dpiArr); } catch (e) { dbg("GetCaptureParamsEx err: " + e.message); }
  const width  = wArr[0]  > 0 ? wArr[0]  : 320;
  const height = hArr[0] > 0 ? hArr[0] : 240;
  dbg("dims=" + width + "x" + height);

  dbg("Alloc buffers imgSize=" + (width * height));
  const imgSize = width * height;
  const fpImage = Buffer.alloc(imgSize);
  const fpTpl   = Buffer.alloc(TEMPLATE_SIZE);
  dbg("Buffers allocated OK");

  const deadline = Date.now() + captureTimeout;
  let captured    = false;
  let loopCount   = 0;
  let imgSnapshot = null;

  dbg("Starting capture loop timeout=" + captureTimeout);
  while (Date.now() < deadline) {
    loopCount++;
    if (loopCount % 10 === 1) dbg("loop #" + loopCount);
    try {
      const cbArr = [TEMPLATE_SIZE];
      const ret   = fns.AcquireFingerprint(handle, fpImage, imgSize, fpTpl, cbArr);
      if (ret === ZKFP_ERR_OK) {
        dbg("CAPTURED after " + loopCount + " attempts");
        // Copy buffer IMMEDIATELY before DLL background thread can overwrite it
        imgSnapshot = Buffer.from(fpImage);
        dbg("Buffer copied");
        captured = true;
        break;
      }
    } catch (e) {
      dbg("AcquireFingerprint threw: " + e.message);
      fns.CloseDevice(handle);
      fns.Terminate();
      done({ ret: -3, msg: "AcquireFingerprint error: " + e.message });
    }
    const t = Date.now() + 150;
    while (Date.now() < t) {}
  }

  // Close device BEFORE processing image — stops DLL background thread
  dbg("Closing device");
  fns.CloseDevice(handle);
  fns.Terminate();
  dbg("Device closed");

  if (!captured) done({ ret: -2, msg: "Timeout. No fingerprint detected." });

  dbg("Saving BMP from snapshot");
  try {
    saveBMP(imgSnapshot, width, height, TMP_FILE);
    dbg("BMP saved OK");
    done({ ret: 0 });
  } catch (e) {
    dbg("BMP save failed: " + e.message);
    done({ ret: -4, msg: "BMP save error: " + e.message });
  }
}

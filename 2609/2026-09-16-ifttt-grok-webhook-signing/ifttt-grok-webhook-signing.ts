/*
 * Paste this entire file into IFTTT Filter Code.
 * Add the Webhooks "Make a web request" action and set its URL in the UI.
 * Replace the secret below. The file deliberately contains no real credential.
 * Pure synchronous TypeScript using ES5 runtime APIs: no imports, Buffer,
 * Web Crypto, TextEncoder, atob, or btoa.
 *
 * The signing helpers are locally checked against Node crypto. The IFTTT
 * editor and live webhook delivery have not been tested in this environment.
 * Headers below use the Standard Webhooks convention; retain any different
 * header names required by your receiver.
 */

// Every day: 07:00 inclusive through 23:00 exclusive in fixed UTC+08:00.
// Clone before changing the offset to preserve IFTTT's metadata object.
var currentHour = Meta.currentUserTime.clone().utcOffset(480).hour();
if (currentHour < 7 || currentHour >= 23) {
  MakerWebhooks.makeWebRequest.skip("Outside working hours: 07:00–23:00 UTC+08:00");
} else {
  var secret = "whsec_REPLACE_WITH_YOUR_BASE64_SECRET";
  var body = "{}";
  // Use the current execution time for signature freshness.
  var timestamp = Math.floor(Meta.currentUserTime.valueOf() / 1000).toString();
  // If the trigger provides a unique event ID, prefer that for deduplication.
  // The random suffix below reduces collisions; it is not a security token.
  var webhookId = "ifttt_" + Meta.triggerTime.valueOf().toString() + "_" +
    Math.random().toString(36).slice(2);
  var signedContent = webhookId + "." + timestamp + "." + body;
  var signature = hmacSha256Base64(secret.replace(/^whsec_/, ""), signedContent);

  MakerWebhooks.makeWebRequest.setMethod("POST");
  MakerWebhooks.makeWebRequest.setContentType("application/json");
  MakerWebhooks.makeWebRequest.setBody(body);
  MakerWebhooks.makeWebRequest.setAdditionalHeaders([
    "webhook-id: " + webhookId,
    "webhook-timestamp: " + timestamp,
    "webhook-signature: v1," + signature
  ].join("\n"));
}

// ---- Standalone signing helpers ----

// keyBase64 is the Base64-encoded key BYTES, not the literal secret text.
// The output encodes the raw 32-byte HMAC, not a hexadecimal string.
function hmacSha256Base64(keyBase64: string, message: string): string {
  var key = decodeBase64(keyBase64);
  if (key.length > 64) key = sha256Bytes(key);
  var inner: number[] = [];
  var outer: number[] = [];
  for (var i = 0; i < 64; i++) {
    var b = i < key.length ? key[i] : 0;
    inner.push(b ^ 0x36);
    outer.push(b ^ 0x5c);
  }
  return encodeBase64(sha256Bytes(
    outer.concat(sha256Bytes(inner.concat(utf8Bytes(message))))
  ));
}

function utf8Bytes(value: string): number[] {
  var out: number[] = [];
  for (var i = 0; i < value.length; i++) {
    var c = value.charCodeAt(i);
    if (c >= 0xd800 && c <= 0xdbff) {
      var next = value.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        c = 0x10000 + ((c - 0xd800) << 10) + next - 0xdc00;
        i++;
      } else c = 0xfffd;
    } else if (c >= 0xdc00 && c <= 0xdfff) c = 0xfffd;
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xc0 | (c >>> 6), 0x80 | (c & 63));
    else if (c < 0x10000) out.push(
      0xe0 | (c >>> 12), 0x80 | ((c >>> 6) & 63), 0x80 | (c & 63)
    );
    else out.push(
      0xf0 | (c >>> 18), 0x80 | ((c >>> 12) & 63),
      0x80 | ((c >>> 6) & 63), 0x80 | (c & 63)
    );
  }
  return out;
}

function decodeBase64(value: string): number[] {
  var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var text = value.replace(/\s/g, "");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(text)) throw new Error("Invalid Base64 key");
  var data = text.replace(/=+$/, "");
  var remainder = data.length % 4;
  var padding = text.length - data.length;
  if (remainder === 1 || (padding > 0 &&
      (text.length % 4 !== 0 || padding !== (4 - remainder) % 4))) {
    throw new Error("Invalid Base64 key length");
  }
  var out: number[] = [];
  var bits = 0;
  var buffer = 0;
  for (var i = 0; i < data.length; i++) {
    buffer = (buffer << 6) | alphabet.indexOf(data.charAt(i));
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out.push((buffer >>> bits) & 255);
      buffer &= (1 << bits) - 1;
    }
  }
  if (buffer !== 0) throw new Error("Noncanonical Base64 key");
  return out;
}

function encodeBase64(bytes: number[]): string {
  var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var out = "";
  for (var i = 0; i < bytes.length; i += 3) {
    var n = (bytes[i] << 16) |
      ((i + 1 < bytes.length ? bytes[i + 1] : 0) << 8) |
      (i + 2 < bytes.length ? bytes[i + 2] : 0);
    out += alphabet.charAt((n >>> 18) & 63) + alphabet.charAt((n >>> 12) & 63) +
      (i + 1 < bytes.length ? alphabet.charAt((n >>> 6) & 63) : "=") +
      (i + 2 < bytes.length ? alphabet.charAt(n & 63) : "=");
  }
  return out;
}

function rotateRight(x: number, bits: number): number {
  return (x >>> bits) | (x << (32 - bits));
}

function sha256Bytes(input: number[]): number[] {
  var k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
    0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
    0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
    0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  var hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];
  var bytes = input.slice();
  var bitLength = input.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  var high = Math.floor(bitLength / 0x100000000);
  var low = bitLength >>> 0;
  var i: number;
  for (i = 3; i >= 0; i--) bytes.push((high >>> (i * 8)) & 255);
  for (i = 3; i >= 0; i--) bytes.push((low >>> (i * 8)) & 255);
  var w: number[] = [];
  for (var offset = 0; offset < bytes.length; offset += 64) {
    for (i = 0; i < 16; i++) {
      var p = offset + i * 4;
      w[i] = (bytes[p] << 24) | (bytes[p + 1] << 16) |
        (bytes[p + 2] << 8) | bytes[p + 3];
    }
    for (i = 16; i < 64; i++) {
      var x = w[i - 15];
      var y = w[i - 2];
      var s0 = rotateRight(x, 7) ^ rotateRight(x, 18) ^ (x >>> 3);
      var s1 = rotateRight(y, 17) ^ rotateRight(y, 19) ^ (y >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    var a = hash[0], b = hash[1], c = hash[2], d = hash[3];
    var e = hash[4], f = hash[5], g = hash[6], h = hash[7];
    for (i = 0; i < 64; i++) {
      var sigma1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
      var choice = (e & f) ^ (~e & g);
      var t1 = (h + sigma1 + choice + k[i] + w[i]) | 0;
      var sigma0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
      var majority = (a & b) ^ (a & c) ^ (b & c);
      var t2 = (sigma0 + majority) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0;
      d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    hash[0] = (hash[0] + a) | 0; hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0; hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0; hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0; hash[7] = (hash[7] + h) | 0;
  }
  var out: number[] = [];
  for (i = 0; i < hash.length; i++) {
    out.push((hash[i] >>> 24) & 255, (hash[i] >>> 16) & 255,
      (hash[i] >>> 8) & 255, hash[i] & 255);
  }
  return out;
}

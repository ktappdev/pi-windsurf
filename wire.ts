/**
 * Manual protobuf + Connect-RPC streaming envelope helpers.
 * Zero dependencies — pure Buffer math.
 *
 * Connect-RPC streaming wire format (HTTPS POST body):
 *   ┌─────────────┬────────────────┬──────────────┐
 *   │ flags 1byte │ length 4B BE   │   payload    │
 *   └─────────────┴────────────────┴──────────────┘
 *   flags bit 0x01 = payload is gzip-compressed
 *   flags bit 0x02 = end-of-stream (trailer frame)
 */

import * as zlib from "zlib";

// ----------------------------------------------------------------------------
// Proto wire encode
// ----------------------------------------------------------------------------

export function encodeVarint(value: number | bigint): Buffer {
  const v0 = BigInt(value);
  if (v0 < 0n) throw new RangeError(`encodeVarint: negative input not supported (got ${value})`);
  const bytes: number[] = [];
  let v = v0;
  while (v > 127n) {
    bytes.push(Number(v & 0x7fn) | 0x80);
    v >>= 7n;
  }
  bytes.push(Number(v));
  return Buffer.from(bytes);
}

export function encodeTag(fieldNum: number, wire: number): Buffer {
  return encodeVarint((fieldNum << 3) | wire);
}

export function encodeString(fieldNum: number, s: string): Buffer {
  const buf = Buffer.from(s, "utf8");
  return Buffer.concat([encodeTag(fieldNum, 2), encodeVarint(buf.length), buf]);
}

export function encodeMessage(fieldNum: number, body: Buffer): Buffer {
  return Buffer.concat([encodeTag(fieldNum, 2), encodeVarint(body.length), body]);
}

export function encodeVarintField(fieldNum: number, v: number | bigint): Buffer {
  return Buffer.concat([encodeTag(fieldNum, 0), encodeVarint(v)]);
}

export function encodeTimestampBody(): Buffer {
  const now = Date.now();
  const seconds = Math.floor(now / 1000);
  const nanos = (now % 1000) * 1_000_000;
  return Buffer.concat([
    encodeVarintField(1, seconds),
    nanos > 0 ? encodeVarintField(2, nanos) : Buffer.alloc(0),
  ]);
}

// ----------------------------------------------------------------------------
// Proto wire decode
// ----------------------------------------------------------------------------

export function decodeVarint(buf: Buffer, offset: number): [bigint, number] {
  let res = 0n;
  let shift = 0n;
  let i = offset;
  while (i < buf.length) {
    const b = buf[i++];
    res |= BigInt(b & 0x7f) << shift;
    if (!(b & 0x80)) return [res, i];
    shift += 7n;
  }
  throw new Error("truncated varint");
}

export interface ProtoField {
  num: number;
  wire: number;
  value: bigint | Buffer;
}

export function* iterFields(buf: Buffer): Generator<ProtoField> {
  let i = 0;
  while (i < buf.length) {
    const [tagBig, ai] = decodeVarint(buf, i);
    i = ai;
    const tag = Number(tagBig);
    const num = tag >> 3;
    const wire = tag & 0x7;
    if (wire === 0) {
      const [v, bi] = decodeVarint(buf, i);
      i = bi;
      yield { num, wire, value: v };
    } else if (wire === 1) {
      if (i + 8 > buf.length) return;
      yield { num, wire, value: buf.slice(i, i + 8) };
      i += 8;
    } else if (wire === 2) {
      const [n, ci] = decodeVarint(buf, i);
      i = ci;
      const len = Number(n);
      if (len < 0 || i + len > buf.length) return;
      yield { num, wire, value: buf.slice(i, i + len) };
      i += len;
    } else if (wire === 5) {
      if (i + 4 > buf.length) return;
      yield { num, wire, value: buf.slice(i, i + 4) };
      i += 4;
    } else if (wire === 3 || wire === 4) {
      return;
    } else {
      return;
    }
  }
}

// ----------------------------------------------------------------------------
// Connect-streaming envelope
// ----------------------------------------------------------------------------

export function frameConnectStream(body: Buffer, compress = true): Buffer {
  let payload = body;
  let flags = 0;
  if (compress) {
    payload = zlib.gzipSync(body);
    flags |= 0x01;
  }
  const header = Buffer.alloc(5);
  header[0] = flags;
  header.writeUInt32BE(payload.length, 1);
  return Buffer.concat([header, payload]);
}

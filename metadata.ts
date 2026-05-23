/**
 * `exa.codeium_common_pb.Metadata` proto builder.
 */
import { encodeMessage, encodeString, encodeTimestampBody, encodeVarintField } from "./wire";

const WINDSURF_VERSION_STRING = "2.0.0";

export interface MetadataInput {
  apiKey: string;
  userJwt?: string;
  sessionId: string;
  requestId: bigint;
  triggerId: string;
  windsurfVersion?: string;
  osName?: string;
}

function osString(): string {
  switch (process.platform) {
    case "darwin": return "darwin";
    case "linux": return "linux";
    case "win32": return "windows";
    default: return String(process.platform);
  }
}

export function buildMetadata(input: MetadataInput): Buffer {
  const version = input.windsurfVersion ?? WINDSURF_VERSION_STRING;
  const os = input.osName ?? osString();
  const parts: Buffer[] = [
    encodeString(1, "windsurf"),
    encodeString(2, version),
    encodeString(3, input.apiKey),
    encodeString(4, "en"),
    encodeString(5, os),
    encodeString(7, version),
    encodeVarintField(9, input.requestId),
    encodeString(10, input.sessionId),
    encodeString(12, "windsurf"),
    encodeMessage(16, encodeTimestampBody()),
    encodeString(25, input.triggerId),
    encodeString(26, "Unset"),
    encodeString(28, "windsurf"),
  ];
  if (input.userJwt) parts.push(encodeString(21, input.userJwt));
  return Buffer.concat(parts);
}

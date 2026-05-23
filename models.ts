/**
 * Windsurf model catalog — variant resolution + model_uid mapping.
 */

export const ModelEnum = {
  MODEL_UNSPECIFIED: 0,
  CLAUDE_3_OPUS_20240229: 63,
  CLAUDE_3_SONNET_20240229: 64,
  CLAUDE_3_HAIKU_20240307: 172,
  CLAUDE_3_5_SONNET_20241022: 166,
  CLAUDE_3_5_HAIKU_20241022: 171,
  CLAUDE_3_7_SONNET_20250219: 226,
  CLAUDE_3_7_SONNET_20250219_THINKING: 227,
  CLAUDE_4_OPUS: 290,
  CLAUDE_4_OPUS_THINKING: 291,
  CLAUDE_4_SONNET: 281,
  CLAUDE_4_SONNET_THINKING: 282,
  CLAUDE_4_1_OPUS: 328,
  CLAUDE_4_1_OPUS_THINKING: 329,
  CLAUDE_4_5_SONNET: 353,
  CLAUDE_4_5_SONNET_THINKING: 354,
  CLAUDE_4_5_OPUS: 391,
  CLAUDE_4_5_OPUS_THINKING: 392,
  CLAUDE_CODE: 344,
  GPT_4: 30,
  GPT_4O_2024_08_06: 109,
  GPT_4O_MINI_2024_07_18: 113,
  GPT_4_1_2025_04_14: 259,
  GPT_4_1_MINI_2025_04_14: 260,
  GPT_4_1_NANO_2025_04_14: 261,
  GPT_5: 340,
  GPT_5_NANO: 337,
  GPT_5_LOW: 339,
  GPT_5_HIGH: 341,
  GPT_5_CODEX: 346,
  GPT_5_1_CODEX_MINI_LOW: 385,
  GPT_5_1_CODEX_MINI_MEDIUM: 386,
  GPT_5_1_CODEX_MINI_HIGH: 387,
  GPT_5_1_CODEX_LOW: 388,
  GPT_5_1_CODEX_MEDIUM: 389,
  GPT_5_1_CODEX_HIGH: 390,
  GPT_5_1_CODEX_MAX_LOW: 395,
  GPT_5_1_CODEX_MAX_MEDIUM: 396,
  GPT_5_1_CODEX_MAX_HIGH: 397,
  GPT_5_2_NONE: 399, GPT_5_2_LOW: 400, GPT_5_2_MEDIUM: 401, GPT_5_2_HIGH: 402, GPT_5_2_XHIGH: 403,
  GPT_5_2_NONE_PRIORITY: 404, GPT_5_2_LOW_PRIORITY: 405, GPT_5_2_MEDIUM_PRIORITY: 406, GPT_5_2_HIGH_PRIORITY: 407, GPT_5_2_XHIGH_PRIORITY: 408,
  O3: 218, O3_MINI: 207, O3_LOW: 262, O3_HIGH: 263, O3_PRO: 294, O3_PRO_LOW: 295, O3_PRO_HIGH: 296,
  O4_MINI: 264, O4_MINI_LOW: 265, O4_MINI_HIGH: 266,
  GEMINI_2_0_FLASH: 184, GEMINI_2_5_PRO: 246, GEMINI_2_5_FLASH: 312,
  GEMINI_2_5_FLASH_THINKING: 313, GEMINI_2_5_FLASH_LITE: 343,
  GEMINI_3_0_PRO_MINIMAL: 411, GEMINI_3_0_PRO_LOW: 378, GEMINI_3_0_PRO_MEDIUM: 412, GEMINI_3_0_PRO_HIGH: 379,
  GEMINI_3_0_FLASH_MINIMAL: 413, GEMINI_3_0_FLASH_LOW: 414, GEMINI_3_0_FLASH_MEDIUM: 415, GEMINI_3_0_FLASH_HIGH: 416,
  DEEPSEEK_V3: 205, DEEPSEEK_V3_2: 409, DEEPSEEK_R1: 206, DEEPSEEK_R1_FAST: 216, DEEPSEEK_R1_SLOW: 215,
  LLAMA_3_1_8B_INSTRUCT: 106, LLAMA_3_1_70B_INSTRUCT: 107, LLAMA_3_1_405B_INSTRUCT: 105,
  LLAMA_3_3_70B_INSTRUCT: 208, LLAMA_3_3_70B_INSTRUCT_R1: 209,
  QWEN_2_5_7B_INSTRUCT: 178, QWEN_2_5_32B_INSTRUCT: 179, QWEN_2_5_72B_INSTRUCT: 180,
  QWEN_2_5_32B_INSTRUCT_R1: 224, QWEN_3_235B_INSTRUCT: 324,
  QWEN_3_CODER_480B_INSTRUCT: 325, QWEN_3_CODER_480B_INSTRUCT_FAST: 327,
  GROK_2: 212, GROK_3: 217, GROK_3_MINI_REASONING: 234, GROK_CODE_FAST: 345,
  MISTRAL_7B: 77, KIMI_K2: 323, KIMI_K2_THINKING: 394,
  GLM_4_5: 342, GLM_4_5_FAST: 352, GLM_4_6: 356, GLM_4_6_FAST: 357, GLM_4_7: 417, GLM_4_7_FAST: 418,
  MINIMAX_M2: 368, MINIMAX_M2_1: 419,
  SWE_1_5: 359, SWE_1_5_THINKING: 369, SWE_1_5_SLOW: 377,
  SWE_1_6: 420, SWE_1_6_FAST: 421,
  GPT_OSS_120B: 326,
  GPT_5_2_CODEX_LOW: 422, GPT_5_2_CODEX_MEDIUM: 423, GPT_5_2_CODEX_HIGH: 424, GPT_5_2_CODEX_XHIGH: 425,
  GPT_5_2_CODEX_LOW_PRIORITY: 426, GPT_5_2_CODEX_MEDIUM_PRIORITY: 427, GPT_5_2_CODEX_HIGH_PRIORITY: 428, GPT_5_2_CODEX_XHIGH_PRIORITY: 429,
  PRIVATE_1: 219, PRIVATE_2: 220, PRIVATE_3: 221, PRIVATE_4: 222, PRIVATE_5: 223,
  PRIVATE_6: 314, PRIVATE_7: 315, PRIVATE_8: 316, PRIVATE_9: 317, PRIVATE_10: 318,
  PRIVATE_11: 347, PRIVATE_12: 348, PRIVATE_13: 349, PRIVATE_14: 350, PRIVATE_15: 351,
  PRIVATE_16: 363, PRIVATE_17: 364, PRIVATE_18: 365, PRIVATE_19: 366, PRIVATE_20: 367,
  PRIVATE_21: 372, PRIVATE_22: 373, PRIVATE_23: 374, PRIVATE_24: 375, PRIVATE_25: 376,
  PRIVATE_26: 380, PRIVATE_27: 381, PRIVATE_28: 382, PRIVATE_29: 383, PRIVATE_30: 384,
} as const;

export type ModelEnumValue = (typeof ModelEnum)[keyof typeof ModelEnum];

// ----------------------------------------------------------------------------
// Enum → cloud uid mapping
// ----------------------------------------------------------------------------

const ENUM_PREFIX_OVERRIDES: Array<{ enumPrefix: string; uidPrefix: string }> = [
  { enumPrefix: "GPT_4_1_2025_04_14", uidPrefix: "MODEL_CHAT_GPT_4_1_2025_04_14" },
  { enumPrefix: "GPT_4O_2024_08_06", uidPrefix: "MODEL_CHAT_GPT_4O_2024_08_06" },
  { enumPrefix: "GPT_5_CODEX", uidPrefix: "MODEL_CHAT_GPT_5_CODEX" },
  { enumPrefix: "O3_HIGH", uidPrefix: "MODEL_CHAT_O3_HIGH" },
  { enumPrefix: "O3", uidPrefix: "MODEL_CHAT_O3" },
  { enumPrefix: "GEMINI_3_0_FLASH", uidPrefix: "MODEL_GOOGLE_GEMINI_3_0_FLASH" },
  { enumPrefix: "GEMINI_2_5_PRO", uidPrefix: "MODEL_GOOGLE_GEMINI_2_5_PRO" },
  { enumPrefix: "GROK_3_MINI_REASONING", uidPrefix: "MODEL_XAI_GROK_3_MINI_REASONING" },
  { enumPrefix: "GROK_3", uidPrefix: "MODEL_XAI_GROK_3" },
];

function enumKeyToCloudUid(key: string): string {
  const sorted = [...ENUM_PREFIX_OVERRIDES].sort((a, b) => b.enumPrefix.length - a.enumPrefix.length);
  for (const { enumPrefix, uidPrefix } of sorted) {
    if (key === enumPrefix) return uidPrefix;
    if (key.startsWith(enumPrefix + "_")) return uidPrefix + key.slice(enumPrefix.length);
  }
  return `MODEL_${key}`;
}

const ENUM_VALUE_TO_NAME: Map<number, string> = (() => {
  const map = new Map<number, string>();
  for (const [key, value] of Object.entries(ModelEnum)) {
    if (typeof value === "number") map.set(value, enumKeyToCloudUid(key));
  }
  return map;
})();

// ----------------------------------------------------------------------------
// Variant catalog
// ----------------------------------------------------------------------------

type VariantMeta = { description?: string; modelUid?: string; enumValue?: ModelEnumValue; };
type VariantName = string;

interface ModelCatalogEntry {
  id: string;
  defaultEnum?: ModelEnumValue;
  defaultUid?: string;
  variants?: Record<VariantName, VariantMeta>;
  aliases?: string[];
}

const VARIANT_CATALOG: Record<string, ModelCatalogEntry> = {
  "claude-opus-4.7": { id: "claude-opus-4.7", defaultUid: "claude-opus-4-7-medium",
    variants: {
      "low": { modelUid: "claude-opus-4-7-low" }, "medium": { modelUid: "claude-opus-4-7-medium" },
      "high": { modelUid: "claude-opus-4-7-high" }, "xhigh": { modelUid: "claude-opus-4-7-xhigh" },
      "max": { modelUid: "claude-opus-4-7-max" },
      "low-fast": { modelUid: "claude-opus-4-7-low-fast" }, "medium-fast": { modelUid: "claude-opus-4-7-medium-fast" },
      "high-fast": { modelUid: "claude-opus-4-7-high-fast" }, "xhigh-fast": { modelUid: "claude-opus-4-7-xhigh-fast" },
      "max-fast": { modelUid: "claude-opus-4-7-max-fast" },
    }, aliases: ["claude-opus-4-7"],
  },
  "claude-opus-4.6": { id: "claude-opus-4.6", defaultUid: "claude-opus-4-6-thinking",
    variants: {
      "thinking": { modelUid: "claude-opus-4-6-thinking" }, "base": { modelUid: "claude-opus-4-6" },
      "1m": { modelUid: "claude-opus-4-6-1m" }, "thinking-1m": { modelUid: "claude-opus-4-6-thinking-1m" },
      "fast": { modelUid: "claude-opus-4-6-fast" }, "thinking-fast": { modelUid: "claude-opus-4-6-thinking-fast" },
    }, aliases: ["claude-opus-4-6"],
  },
  "gemini-3.5-flash": { id: "gemini-3.5-flash", defaultUid: "gemini-3-5-flash-medium",
    variants: {
      "minimal": { modelUid: "gemini-3-5-flash-minimal" }, "low": { modelUid: "gemini-3-5-flash-low" },
      "medium": { modelUid: "gemini-3-5-flash-medium" }, "high": { modelUid: "gemini-3-5-flash-high" },
    }, aliases: ["gemini-3-5-flash"],
  },
  "gpt-5.5": { id: "gpt-5.5", defaultUid: "gpt-5-5-low",
    variants: {
      "none": { modelUid: "gpt-5-5-none" }, "low": { modelUid: "gpt-5-5-low" },
      "medium": { modelUid: "gpt-5-5-medium" }, "high": { modelUid: "gpt-5-5-high" }, "xhigh": { modelUid: "gpt-5-5-xhigh" },
      "none-priority": { modelUid: "gpt-5-5-none-priority" }, "low-priority": { modelUid: "gpt-5-5-low-priority" },
      "medium-priority": { modelUid: "gpt-5-5-medium-priority" }, "high-priority": { modelUid: "gpt-5-5-high-priority" },
      "xhigh-priority": { modelUid: "gpt-5-5-xhigh-priority" },
    }, aliases: ["gpt-5-5"],
  },
  "gpt-5.4": { id: "gpt-5.4", defaultUid: "gpt-5-4-none",
    variants: {
      "none": { modelUid: "gpt-5-4-none" }, "low": { modelUid: "gpt-5-4-low" },
      "medium": { modelUid: "gpt-5-4-medium" }, "high": { modelUid: "gpt-5-4-high" }, "xhigh": { modelUid: "gpt-5-4-xhigh" },
      "none-priority": { modelUid: "gpt-5-4-none-priority" }, "low-priority": { modelUid: "gpt-5-4-low-priority" },
      "medium-priority": { modelUid: "gpt-5-4-medium-priority" }, "high-priority": { modelUid: "gpt-5-4-high-priority" },
      "xhigh-priority": { modelUid: "gpt-5-4-xhigh-priority" },
    }, aliases: ["gpt-5-4"],
  },
  "gpt-5.3-codex": { id: "gpt-5.3-codex", defaultUid: "gpt-5-3-codex-medium",
    variants: {
      "low": { modelUid: "gpt-5-3-codex-low" }, "medium": { modelUid: "gpt-5-3-codex-medium" },
      "high": { modelUid: "gpt-5-3-codex-high" }, "xhigh": { modelUid: "gpt-5-3-codex-xhigh" },
      "low-priority": { modelUid: "gpt-5-3-codex-low-priority" }, "medium-priority": { modelUid: "gpt-5-3-codex-medium-priority" },
      "high-priority": { modelUid: "gpt-5-3-codex-high-priority" }, "xhigh-priority": { modelUid: "gpt-5-3-codex-xhigh-priority" },
    }, aliases: ["gpt-5-3-codex"],
  },
  "gpt-5.2": { id: "gpt-5.2", defaultUid: "MODEL_GPT_5_2_LOW",
    variants: {
      "low": { modelUid: "MODEL_GPT_5_2_LOW" }, "medium": { modelUid: "MODEL_GPT_5_2_MEDIUM" },
      "high": { modelUid: "MODEL_GPT_5_2_HIGH" }, "xhigh": { modelUid: "MODEL_GPT_5_2_XHIGH" },
      "none": { modelUid: "MODEL_GPT_5_2_NONE" },
      "low-priority": { modelUid: "MODEL_GPT_5_2_LOW_PRIORITY" }, "medium-priority": { modelUid: "MODEL_GPT_5_2_MEDIUM_PRIORITY" },
      "high-priority": { modelUid: "MODEL_GPT_5_2_HIGH_PRIORITY" }, "xhigh-priority": { modelUid: "MODEL_GPT_5_2_XHIGH_PRIORITY" },
      "none-priority": { modelUid: "MODEL_GPT_5_2_NONE_PRIORITY" },
    }, aliases: ["gpt-5-2"],
  },
  "gpt-5.2-codex": { id: "gpt-5.2-codex", defaultUid: "MODEL_GPT_5_2_CODEX_LOW",
    variants: {
      "low": { modelUid: "MODEL_GPT_5_2_CODEX_LOW" }, "medium": { modelUid: "MODEL_GPT_5_2_CODEX_MEDIUM" },
      "high": { modelUid: "MODEL_GPT_5_2_CODEX_HIGH" }, "xhigh": { modelUid: "MODEL_GPT_5_2_CODEX_XHIGH" },
      "low-priority": { modelUid: "MODEL_GPT_5_2_CODEX_LOW_PRIORITY" }, "medium-priority": { modelUid: "MODEL_GPT_5_2_CODEX_MEDIUM_PRIORITY" },
      "high-priority": { modelUid: "MODEL_GPT_5_2_CODEX_HIGH_PRIORITY" }, "xhigh-priority": { modelUid: "MODEL_GPT_5_2_CODEX_XHIGH_PRIORITY" },
    }, aliases: ["gpt-5-2-codex"],
  },
  "kimi-k2.6": { id: "kimi-k2.6", defaultUid: "kimi-k2-6", aliases: ["kimi-k2-6"] },
  "swe-1.6": { id: "swe-1.6", defaultUid: "swe-1-6",
    variants: {
      "base": { modelUid: "swe-1-6" }, "fast": { modelUid: "swe-1-6-fast" },
    }, aliases: ["swe-1-6"],
  },
  "deepseek-v4": { id: "deepseek-v4", defaultUid: "deepseek-v4" },
  "gemini-3.1-pro": { id: "gemini-3.1-pro", defaultUid: "gemini-3-1-pro-low",
    variants: { "low": { modelUid: "gemini-3-1-pro-low" }, "high": { modelUid: "gemini-3-1-pro-high" } }, aliases: ["gemini-3-1-pro"],
  },
  "gpt-5.4-mini": { id: "gpt-5.4-mini", defaultUid: "gpt-5-4-mini-low",
    variants: {
      "low": { modelUid: "gpt-5-4-mini-low" }, "medium": { modelUid: "gpt-5-4-mini-medium" },
      "high": { modelUid: "gpt-5-4-mini-high" }, "xhigh": { modelUid: "gpt-5-4-mini-xhigh" },
    }, aliases: ["gpt-5-4-mini"],
  },
};

const ALIAS_TO_ID: Record<string, string> = Object.values(VARIANT_CATALOG).reduce((acc, entry) => {
  acc[entry.id] = entry.id;
  for (const alias of entry.aliases || []) acc[alias] = entry.id;
  return acc;
}, {} as Record<string, string>);

// ----------------------------------------------------------------------------
// Model resolution
// ----------------------------------------------------------------------------

export interface ResolvedModel {
  modelId: string;
  modelUid: string;
  variant?: string;
  enumValue?: ModelEnumValue;
}

function splitModelAndVariant(raw: string): { base: string; variant?: string } {
  const normalized = raw.toLowerCase().trim();
  const colonIdx = normalized.indexOf(":");
  if (colonIdx !== -1) {
    return { base: normalized.slice(0, colonIdx), variant: normalized.slice(colonIdx + 1).trim() || undefined };
  }
  const parts = normalized.split("-");
  for (let cut = 1; cut < parts.length; cut++) {
    const base = parts.slice(0, parts.length - cut).join("-");
    const maybeVariant = parts.slice(parts.length - cut).join("-");
    const entry = VARIANT_CATALOG[ALIAS_TO_ID[base] || base];
    if (entry?.variants?.[maybeVariant]) return { base, variant: maybeVariant };
  }
  return { base: normalized };
}

export function resolveModel(modelName: string): ResolvedModel {
  const { base, variant } = splitModelAndVariant(modelName);
  const baseId = ALIAS_TO_ID[base] || base;
  const entry = VARIANT_CATALOG[baseId];

  if (entry) {
    const effectiveVariant = (variant || "").trim().toLowerCase();
    if (effectiveVariant && entry.variants?.[effectiveVariant]) {
      const v = entry.variants[effectiveVariant]!;
      return {
        modelId: entry.id,
        modelUid: v.modelUid ?? (v.enumValue !== undefined ? ENUM_VALUE_TO_NAME.get(v.enumValue as number) ?? "" : uidForEntry(entry)),
        enumValue: v.enumValue,
        variant: effectiveVariant,
      };
    }
    return { modelId: entry.id, modelUid: uidForEntry(entry), enumValue: entry.defaultEnum };
  }

  // Legacy enum fallback
  const enumKey = base.toUpperCase().replace(/\./g, "_").replace(/-/g, "_");
  const enumValue = (ModelEnum as Record<string, number>)[enumKey];
  if (enumValue !== undefined) {
    const uid = ENUM_VALUE_TO_NAME.get(enumValue);
    if (uid) return { modelId: base, modelUid: uid, enumValue: enumValue as ModelEnumValue };
  }

  throw new Error(`Unknown Windsurf model: "${modelName}".`);
}

// Resolve model but accept raw model_uid passthrough for catalog-discovered models
export function resolveModelOrPassthrough(modelName: string): ResolvedModel {
  try {
    return resolveModel(modelName);
  } catch {
    // Unknown model — pass through the raw name as the UID
    return { modelId: modelName, modelUid: modelName };
  }
}

function uidForEntry(entry: ModelCatalogEntry): string {
  if (entry.defaultUid) return entry.defaultUid;
  if (entry.defaultEnum !== undefined) {
    const uid = ENUM_VALUE_TO_NAME.get(entry.defaultEnum as number);
    if (uid) return uid;
  }
  throw new Error(`Catalog entry "${entry.id}" has no defaultUid or defaultEnum`);
}

export function getDefaultModel(): string { return "claude-opus-4.7:medium"; }

export function getCanonicalModels(): string[] {
  return Object.keys(VARIANT_CATALOG);
}

// Build reverse lookup: model_uid → user-facing model ID
const UID_TO_MODEL_ID: Map<string, string> = (() => {
  const map = new Map<string, string>();
  for (const [id, entry] of Object.entries(VARIANT_CATALOG)) {
    // Default UID
    try {
      const defaultUid = entry.defaultUid ?? (entry.defaultEnum !== undefined ? ENUM_VALUE_TO_NAME.get(entry.defaultEnum as number) : undefined);
      if (defaultUid) map.set(defaultUid, id);
    } catch {}
    // Variant UIDs
    if (entry.variants) {
      for (const [variantKey, variantMeta] of Object.entries(entry.variants)) {
        const vUid = variantMeta.modelUid ?? (variantMeta.enumValue !== undefined ? ENUM_VALUE_TO_NAME.get(variantMeta.enumValue as number) : undefined);
        if (vUid) map.set(vUid, `${id}:${variantKey}`);
      }
    }
  }
  // Also map legacy enum names
  for (const [key, value] of Object.entries(ModelEnum)) {
    if (typeof value === "number") {
      const uid = ENUM_VALUE_TO_NAME.get(value);
      if (uid && !map.has(uid)) {
        const id = key.toLowerCase().replace(/_/g, "-");
        map.set(uid, id);
      }
    }
  }
  return map;
})();

export function lookupModelId(uid: string): string | null {
  // Direct lookup
  const direct = UID_TO_MODEL_ID.get(uid);
  if (direct) return direct;
  // Strip _BYOK suffix (Bring Your Own Key variants)
  const withoutByok = uid.replace(/_BYOK$/, "");
  if (withoutByok !== uid) {
    const byokMatch = UID_TO_MODEL_ID.get(withoutByok);
    if (byokMatch) return byokMatch;
  }
  return null;
}

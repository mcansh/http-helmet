import { LiteralUnion, KebabCasedProperties } from "type-fest";
import { QuotedSource, dashify, isQuoted } from "../utils.js";

type ContentSecurityPolicyCamel = {
  childSrc?: Array<LiteralUnion<QuotedSource, string>>;
  connectSrc?: Array<LiteralUnion<QuotedSource, string>>;
  defaultSrc?: Array<LiteralUnion<QuotedSource, string>>;
  fontSrc?: Array<LiteralUnion<QuotedSource, string>>;
  frameSrc?: Array<LiteralUnion<QuotedSource, string>>;
  imgSrc?: Array<LiteralUnion<QuotedSource, string>>;
  manifestSrc?: Array<LiteralUnion<QuotedSource, string>>;
  mediaSrc?: Array<LiteralUnion<QuotedSource, string>>;
  objectSrc?: Array<LiteralUnion<QuotedSource, string>>;
  prefetchSrc?: Array<LiteralUnion<QuotedSource, string>>;
  scriptSrc?: Array<LiteralUnion<QuotedSource, string>>;
  scriptSrcElem?: Array<LiteralUnion<QuotedSource, string>>;
  scriptSrcAttr?: Array<LiteralUnion<QuotedSource, string>>;
  styleSrc?: Array<LiteralUnion<QuotedSource, string>>;
  styleSrcElem?: Array<LiteralUnion<QuotedSource, string>>;
  styleSrcAttr?: Array<LiteralUnion<QuotedSource, string>>;
  workerSrc?: Array<LiteralUnion<QuotedSource, string>>;
  baseUri?: Array<LiteralUnion<QuotedSource, string>>;
  sandbox?: Array<LiteralUnion<QuotedSource, string>>;
  formAction?: Array<LiteralUnion<QuotedSource, string>>;
  frameAncestors?: Array<LiteralUnion<QuotedSource, string>>;
  navigateTo?: Array<LiteralUnion<QuotedSource, string>>;
  reportUri?: Array<LiteralUnion<QuotedSource, string>>;
  reportTo?: Array<LiteralUnion<QuotedSource, string>>;
  requireSriFor?: Array<LiteralUnion<QuotedSource, string>>;
  requireTrustedTypesFor?: Array<LiteralUnion<QuotedSource, string>>;
  trustedTypes?: Array<LiteralUnion<QuotedSource, string>>;
  upgradeInsecureRequests?: boolean;
};

type ContentSecurityPolicyKebab =
  KebabCasedProperties<ContentSecurityPolicyCamel>;

export interface ContentSecurityPolicy
  extends ContentSecurityPolicyCamel,
    ContentSecurityPolicyKebab {}

let reservedCSPKeywords = new Set([
  "self",
  "none",
  "unsafe-inline",
  "unsafe-eval",
]);

export function createContentSecurityPolicy(
  settings: ContentSecurityPolicy,
): string {
  let { upgradeInsecureRequests, ...rest } = settings;
  let policy: Array<string> = [];
  let seenKeys: Set<string> = new Set();

  if (settings.upgradeInsecureRequests) {
    policy.push("upgrade-insecure-requests");
  }

  for (let [originalKey, values] of Object.entries(rest)) {
    let key = dashify(originalKey);
    if (seenKeys.has(key)) {
      throw new Error(
        `[createContentSecurityPolicy]: The key "${originalKey}" was specified more than once.`,
      );
    }

    let allowedValuesSeen: Set<string> = new Set();

    if (!Array.isArray(values)) {
      throw new Error(
        `[createContentSecurityPolicy]: The value of the "${originalKey}" must be array of strings.`,
      );
    }

    values.forEach((allowedValue) => {
      if (typeof allowedValue !== "string") {
        throw new Error(
          `[createContentSecurityPolicy]: The value of the "${originalKey}" contains a non-string, which is not supported.`,
        );
      }

      if (allowedValuesSeen.has(allowedValue)) {
        throw new Error(
          `[createContentSecurityPolicy]: The value of the "${originalKey}" contains duplicates, which it shouldn't.`,
        );
      }

      if (reservedCSPKeywords.has(allowedValue) && !isQuoted(allowedValue)) {
        throw new Error(
          `[createContentSecurityPolicy]: reserved keyword ${allowedValue} must be quoted.`,
        );
      }

      allowedValuesSeen.add(allowedValue);
    });

    policy.push(`${key} ${values.filter(Boolean).join(" ")}`);
    seenKeys.add(key);
  }

  return policy.join("; ");
}

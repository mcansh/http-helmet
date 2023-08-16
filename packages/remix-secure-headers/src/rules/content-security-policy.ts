import { LiteralUnion } from "type-fest";
import { QuotedSource, dashify, isQuoted } from "../utils.js";

export type ContentSecurityPolicy = {
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

const reservedCSPKeywords = new Set([
  "self",
  "none",
  "unsafe-inline",
  "unsafe-eval",
]);

export function createContentSecurityPolicy(
  settings: ContentSecurityPolicy
): string {
  let { upgradeInsecureRequests, ...rest } = settings;
  let policy: Array<string> = [];

  if (settings.upgradeInsecureRequests) {
    policy.push("upgrade-insecure-requests");
  }

  for (let [key, values] of Object.entries(rest)) {
    if (!Array.isArray(values)) {
      throw new Error(
        `[createContentSecurityPolicy]: The value of the "${key}" must be array of strings.`
      );
    }

    const allowedValuesSeen: Set<string> = new Set();

    values.forEach((allowedValue) => {
      if (typeof allowedValue !== "string") {
        throw new Error(
          `[createContentSecurityPolicy]: The value of the "${key}" contains a non-string, which is not supported.`
        );
      }

      if (allowedValuesSeen.has(allowedValue)) {
        throw new Error(
          `[createContentSecurityPolicy]: The value of the "${key}" contains duplicates, which it shouldn't.`
        );
      }

      if (reservedCSPKeywords.has(allowedValue) && !isQuoted(allowedValue)) {
        throw new Error(
          `[createContentSecurityPolicy]: reserved keyword ${allowedValue} must be quoted.`
        );
      }

      allowedValuesSeen.add(allowedValue);
    });

    policy.push(`${dashify(key)} ${values.filter(Boolean).join(" ")}`);
  }

  return policy.join("; ");
}

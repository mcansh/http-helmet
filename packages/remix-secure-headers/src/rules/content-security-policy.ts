import { dashify, isQuoted } from "../utils.js";

export type ContentSecurityPolicy = {
  childSrc?: Array<string>;
  connectSrc?: Array<string>;
  defaultSrc?: Array<string>;
  fontSrc?: Array<string>;
  frameSrc?: Array<string>;
  imgSrc?: Array<string>;
  manifestSrc?: Array<string>;
  mediaSrc?: Array<string>;
  objectSrc?: Array<string>;
  prefetchSrc?: Array<string>;
  scriptSrc?: Array<string>;
  scriptSrcElem?: Array<string>;
  scriptSrcAttr?: Array<string>;
  styleSrc?: Array<string>;
  styleSrcElem?: Array<string>;
  styleSrcAttr?: Array<string>;
  workerSrc?: Array<string>;
  baseUri?: Array<string>;
  sandbox?: Array<string>;
  formAction?: Array<string>;
  frameAncestors?: Array<string>;
  navigateTo?: Array<string>;
  reportUri?: Array<string>;
  reportTo?: Array<string>;
  requireSriFor?: Array<string>;
  requireTrustedTypesFor?: Array<string>;
  trustedTypes?: Array<string>;
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

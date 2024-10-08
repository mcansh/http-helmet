import { LiteralUnion, KebabCasedProperties } from "type-fest";
import { QuotedSource, convertCamelToDash, isQuoted } from "../utils.js";

type CspSetting = Array<LiteralUnion<QuotedSource, string> | undefined>;

type ContentSecurityPolicyCamel = {
  childSrc?: CspSetting;
  connectSrc?: CspSetting;
  defaultSrc?: CspSetting;
  fontSrc?: CspSetting;
  frameSrc?: CspSetting;
  imgSrc?: CspSetting;
  manifestSrc?: CspSetting;
  mediaSrc?: CspSetting;
  objectSrc?: CspSetting;
  prefetchSrc?: CspSetting;
  scriptSrc?: CspSetting;
  scriptSrcElem?: CspSetting;
  scriptSrcAttr?: CspSetting;
  styleSrc?: CspSetting;
  styleSrcElem?: CspSetting;
  styleSrcAttr?: CspSetting;
  workerSrc?: CspSetting;
  baseUri?: CspSetting;
  sandbox?: CspSetting;
  formAction?: CspSetting;
  frameAncestors?: CspSetting;
  navigateTo?: CspSetting;
  reportUri?: CspSetting;
  reportTo?: CspSetting;
  requireSriFor?: CspSetting;
  requireTrustedTypesFor?: CspSetting;
  trustedTypes?: CspSetting;
  upgradeInsecureRequests?: boolean;
};

type ContentSecurityPolicyKebab =
  KebabCasedProperties<ContentSecurityPolicyCamel>;

export type ContentSecurityPolicy =
  | ContentSecurityPolicyCamel
  | ContentSecurityPolicyKebab;

let reservedCSPKeywords = new Set([
  "self",
  "none",
  "unsafe-inline",
  "unsafe-eval",
]);

export function createContentSecurityPolicy(
  settings: ContentSecurityPolicyCamel,
): string;
export function createContentSecurityPolicy(
  settings: ContentSecurityPolicyKebab,
): string;
export function createContentSecurityPolicy(
  settings: ContentSecurityPolicy,
): string {
  let policy: Array<string> = [];
  let seenKeys: Set<string> = new Set();

  if (
    "upgradeInsecureRequests" in settings &&
    settings.upgradeInsecureRequests
  ) {
    policy.push("upgrade-insecure-requests");
    delete settings.upgradeInsecureRequests;
  }

  if (
    "upgrade-insecure-requests" in settings &&
    settings["upgrade-insecure-requests"]
  ) {
    policy.push("upgrade-insecure-requests");
    delete settings["upgrade-insecure-requests"];
  }

  for (let [originalKey, values] of Object.entries(settings)) {
    let key = convertCamelToDash(originalKey);
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

    let definedValues = values.filter(
      (v): v is string => typeof v !== "undefined",
    );

    definedValues.forEach((allowedValue) => {
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

    if (definedValues.length === 0) {
      throw new Error(
        `[createContentSecurityPolicy]: key "${key}" has no defined options`,
      );
    }

    policy.push(`${key} ${definedValues.join(" ")}`);
    seenKeys.add(key);
  }

  return policy.join("; ");
}

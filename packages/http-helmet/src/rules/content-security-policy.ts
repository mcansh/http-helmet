import { LiteralUnion, KebabCasedProperties } from "type-fest";
import { QuotedSource, isQuoted } from "../utils.js";
import { kebabCase } from "change-case";

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

type ContentSecurityPolicy =
  | ContentSecurityPolicyCamel
  | ContentSecurityPolicyKebab;

export type PublicContentSecurityPolicy = Parameters<
  typeof createContentSecurityPolicy
>[0];

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
  let { "upgrade-insecure-requests": upgradeInsecureRequests, ...rest } =
    Object.entries(settings).reduce<ContentSecurityPolicyKebab>(
      (acc, [key, value]) => {
        let kebab = kebabCase(key) as keyof ContentSecurityPolicyKebab;
        if (acc[kebab]) {
          throw new Error(
            `[createContentSecurityPolicy]: The key "${key}" was specified in camelCase and kebab-case.`,
          );
        }
        // @ts-expect-error - hush
        acc[kebab] = value;
        return acc;
      },
      {},
    );

  let policy: Array<string> = [];

  if (upgradeInsecureRequests) {
    policy.push("upgrade-insecure-requests");
  }

  for (let [key, values] of Object.entries(rest)) {
    let allowedValuesSeen: Set<string> = new Set();

    if (!Array.isArray(values)) {
      throw new Error(
        `[createContentSecurityPolicy]: The value of the "${key}" must be array of strings.`,
      );
    }

    let definedValues = values.filter(
      (v): v is string => typeof v !== "undefined",
    );

    definedValues.forEach((allowedValue) => {
      if (typeof allowedValue !== "string") {
        throw new Error(
          `[createContentSecurityPolicy]: The value of the "${key}" contains a non-string, which is not supported.`,
        );
      }

      if (allowedValuesSeen.has(allowedValue)) {
        throw new Error(
          `[createContentSecurityPolicy]: The value of the "${key}" contains duplicates, which it shouldn't.`,
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
  }

  return policy.join("; ");
}

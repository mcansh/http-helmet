import type { LiteralUnion } from "type-fest";
import { dashify, isQuoted } from "../utils.js";

type KnownSecurityPolicies = LiteralUnion<
  | "childSrc"
  | "connectSrc"
  | "defaultSrc"
  | "fontSrc"
  | "frameSrc"
  | "imgSrc"
  | "manifestSrc"
  | "mediaSrc"
  | "objectSrc"
  | "prefetchSrc"
  | "scriptSrc"
  | "scriptSrcElem"
  | "scriptSrcAttr"
  | "styleSrc"
  | "styleSrcElem"
  | "styleSrcAttr"
  | "workerSrc"
  | "baseUri"
  | "sandbox"
  | "formAction"
  | "frameAncestors"
  | "navigateTo"
  | "reportUri"
  | "reportTo"
  | "requireSriFor"
  | "requireTrustedTypesFor"
  | "trustedTypes"
  | "upgradeInsecureRequests",
  string
>;

export type ContentSecurityPolicy = {
  [key in KnownSecurityPolicies]?: Array<string>;
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
  return Object.entries(settings)
    .map(([key, values]) => {
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

      return `${dashify(key)} ${values.filter(Boolean).join(" ")}`;
    })
    .join("; ");
}

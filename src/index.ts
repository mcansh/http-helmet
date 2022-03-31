import {
  ContentSecurityPolicy,
  createContentSecurityPolicy,
} from "./rules/content-security-policy";
import {
  createPermissionsPolicy,
  PermissionsPolicy,
} from "./rules/permissions";
import {
  strictTransportSecurity,
  StrictTransportSecurity,
} from "./rules/strict-transport-security";

export * from "./rules/content-security-policy";
export * from "./rules/permissions";
export * from "./rules/strict-transport-security";

export type XFrameOptions = "DENY" | "SAMEORIGIN";
export type ReferrerPolicy =
  | "no-referrer"
  | "no-referrer-when-downgrade"
  | "origin"
  | "origin-when-cross-origin"
  | "same-origin"
  | "strict-origin"
  | "strict-origin-when-cross-origin"
  | "unsafe-url";

export type CreateSecureHeaders = {
  /**
   * Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks, including Cross-Site Scripting (XSS) and data injection attacks. These attacks are used for everything from data theft, to site defacement, to malware distribution.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
   */
  "Content-Security-Policy"?: ContentSecurityPolicy;
  /**
   * The X-Frame-Options HTTP response header can be used to indicate whether or not a browser should be allowed to render a page in a <frame>, <iframe>, <embed> or <object>. Sites can use this to avoid click-jacking attacks, by ensuring that their content is not embedded into other sites.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
   */
  "X-Frame-Options"?: XFrameOptions;
  /**
   * The HTTP Feature-Policy header provides a mechanism to allow and deny the use of browser features in its own frame, and in content within any <iframe> elements in the document.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy
   */
  "Permissions-Policy"?: PermissionsPolicy;
  /**
   * The Referrer-Policy HTTP header controls how much referrer information (sent with the Referer header) should be included with requests. Aside from the HTTP header, you can set this policy in HTML.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
   */
  "Referrer-Policy"?: ReferrerPolicy;
  /**
   * The HTTP Strict-Transport-Security response header (often abbreviated as HSTS) informs browsers that the site should only be accessed using HTTPS, and that any future attempts to access it using HTTP should automatically be converted to HTTPS.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
   */
  "Strict-Transport-Security"?: StrictTransportSecurity;
  /**
   * The X-DNS-Prefetch-Control HTTP response header controls DNS prefetching, a feature by which browsers proactively perform domain name resolution on both links that the user may choose to follow as well as URLs for items referenced by the document, including images, CSS, JavaScript, and so forth.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control
   */
  "X-DNS-Prefetch-Control"?: "on" | "off";
  /**
   * The X-Content-Type-Options response HTTP header is a marker used by the server to indicate that the MIME types advertised in the Content-Type headers should be followed and not be changed. The header allows you to avoid MIME type sniffing by saying that the MIME types are deliberately configured.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
   */
  "X-Content-Type-Options"?: "nosniff";
};

export function createSecureHeaders(options: CreateSecureHeaders) {
  let headers = new Map<string, string>();

  if (options["Content-Security-Policy"]) {
    headers.set(
      "Content-Security-Policy",
      createContentSecurityPolicy(options["Content-Security-Policy"])
    );
  }

  if (options["X-Frame-Options"]) {
    headers.set("X-Frame-Options", options["X-Frame-Options"]);
  }

  if (options["Permissions-Policy"]) {
    headers.set(
      "Permissions-Policy",
      createPermissionsPolicy(options["Permissions-Policy"])
    );
  }

  if (options["Strict-Transport-Security"]) {
    headers.set(
      "Strict-Transport-Security",
      strictTransportSecurity(options["Strict-Transport-Security"])
    );
  }

  if (options["Referrer-Policy"]) {
    headers.set("Referrer-Policy", options["Referrer-Policy"]);
  }

  return Object.fromEntries(headers.entries());
}

import { RequireOneOrNone } from "type-fest";
import { createContentSecurityPolicy } from "./rules/content-security-policy.js";
import type { PublicContentSecurityPolicy } from "./rules/content-security-policy.js";
import {
  createPermissionsPolicy,
  PermissionsPolicy,
} from "./rules/permissions.js";
import {
  createStrictTransportSecurity,
  StrictTransportSecurity,
} from "./rules/strict-transport-security.js";

export { PublicContentSecurityPolicy as ContentSecurityPolicy };
export { createContentSecurityPolicy } from "./rules/content-security-policy.js";
export { createPermissionsPolicy } from "./rules/permissions.js";
export type { PermissionsPolicy } from "./rules/permissions.js";
export { createStrictTransportSecurity } from "./rules/strict-transport-security.js";
export type { StrictTransportSecurity } from "./rules/strict-transport-security.js";

export type FrameOptions = "DENY" | "SAMEORIGIN";
export type ReferrerPolicy =
  | "no-referrer"
  | "no-referrer-when-downgrade"
  | "origin"
  | "origin-when-cross-origin"
  | "same-origin"
  | "strict-origin"
  | "strict-origin-when-cross-origin"
  | "unsafe-url";
export type DNSPrefetchControl = "on" | "off";
export type ContentTypeOptions = "nosniff";
export type CrossOriginOpenerPolicy =
  | "unsafe-none"
  | "same-origin-allow-popups"
  | "same-origin";
export type XSSProtection = "0" | "1" | "1; mode=block" | `1; report=${string}`;

type BaseSecureHeaders = {
  /**
   * @description The X-Frame-Options HTTP response header can be used to indicate whether or not a browser should be allowed to render a page in a `<frame>`, `<iframe>`, `<embed>` or `<object>`. Sites can use this to avoid click-jacking attacks, by ensuring that their content is not embedded into other sites.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
   */
  "X-Frame-Options"?: FrameOptions;

  /**
   * @description The HTTP Feature-Policy header provides a mechanism to allow and deny the use of browser features in its own frame, and in content within any <iframe> elements in the document.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy
   */
  "Permissions-Policy"?: PermissionsPolicy;

  /**
   * @description The Referrer-Policy HTTP header controls how much referrer information (sent with the Referer header) should be included with requests. Aside from the HTTP header, you can set this policy in HTML.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
   */
  "Referrer-Policy"?: ReferrerPolicy;

  /**
   * @description HTTP Strict-Transport-Security response header (often abbreviated as HSTS) informs browsers that the site should only be accessed using HTTPS, and that any future attempts to access it using HTTP should automatically be converted to HTTPS.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
   */
  "Strict-Transport-Security"?: StrictTransportSecurity;

  /**
   * @description The X-DNS-Prefetch-Control HTTP response header controls DNS prefetching, a feature by which browsers proactively perform domain name resolution on both links that the user may choose to follow as well as URLs for items referenced by the document, including images, CSS, JavaScript, and so forth.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control
   */
  "X-DNS-Prefetch-Control"?: DNSPrefetchControl;

  /**
   * @description The X-Content-Type-Options response HTTP header is a marker used by the server to indicate that the MIME types advertised in the Content-Type headers should be followed and not be changed. The header allows you to avoid MIME type sniffing by saying that the MIME types are deliberately configured.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
   */
  "X-Content-Type-Options"?: ContentTypeOptions;

  /**
   * @description The HTTP Cross-Origin-Opener-Policy (COOP) response header allows you to ensure a top-level document does not share a browsing context group with cross-origin documents.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy
   */
  "Cross-Origin-Opener-Policy"?: CrossOriginOpenerPolicy;

  /**
  @description The HTTP X-XSS-Protection response header is a feature of Internet Explorer, Chrome and Safari that stops pages from loading when they detect reflected cross-site scripting (XSS) attacks. These protections are largely unnecessary in modern browsers when sites implement a strong Content-Security-Policy that disables the use of inline JavaScript ('unsafe-inline').
		@see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection
  */
  "X-XSS-Protection"?: XSSProtection;

  /**
   * @description The HTTP Cross-Origin-Embedder-Policy (COEP) response header configures embedding cross-origin resources into the document.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy
   */
  "Cross-Origin-Embedder-Policy"?:
    | "unsafe-none"
    | "require-corp"
    | "credentialless";

  /**
   * @description Cross-Origin Resource Policy is a policy set by the Cross-Origin-Resource-Policy HTTP header that lets websites and applications opt in to protection against certain requests from other origins (such as those issued with elements like <script> and <img>), to mitigate speculative side-channel attacks, like Spectre, as well as Cross-Site Script Inclusion attacks.
    @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Cross-Origin_Resource_Policy_(CORP)
  */
  "Cross-Origin-Resource-Policy"?: "same-site" | "same-origin" | "cross-origin";
};

export type CreateSecureHeaders = RequireOneOrNone<
  {
    /**
     * @description Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks, including Cross-Site Scripting (XSS) and data injection attacks. These attacks are used for everything from data theft, to site defacement, to malware distribution.
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
     */

    "Content-Security-Policy"?: PublicContentSecurityPolicy;

    /**
     * @description The HTTP Content-Security-Policy-Report-Only response header allows web developers to experiment with policies by monitoring (but not enforcing) their effects. These violation reports consist of JSON documents sent via an HTTP POST request to the specified URI defined in a Reporting-Endpoints HTTP response header.
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy-Report-Only
     */
    "Content-Security-Policy-Report-Only"?: PublicContentSecurityPolicy;
  },
  "Content-Security-Policy" | "Content-Security-Policy-Report-Only"
> &
  BaseSecureHeaders;

export function createSecureHeaders(options: CreateSecureHeaders) {
  let headers = new Headers();

  if (
    options["Content-Security-Policy"] &&
    options["Content-Security-Policy-Report-Only"]
  ) {
    throw new Error(
      "createSecureHeaders: Content-Security-Policy and Content-Security-Policy-Report-Only cannot be set at the same time",
    );
  }

  if (options["Content-Security-Policy"]) {
    headers.set(
      "Content-Security-Policy",
      createContentSecurityPolicy(options["Content-Security-Policy"]),
    );
  }

  if (options["Content-Security-Policy-Report-Only"]) {
    headers.set(
      "Content-Security-Policy-Report-Only",
      createContentSecurityPolicy(
        options["Content-Security-Policy-Report-Only"],
      ),
    );
  }

  if (options["X-Frame-Options"]) {
    headers.set("X-Frame-Options", options["X-Frame-Options"]);
  }

  if (options["Permissions-Policy"]) {
    headers.set(
      "Permissions-Policy",
      createPermissionsPolicy(options["Permissions-Policy"]),
    );
  }

  if (options["Strict-Transport-Security"]) {
    headers.set(
      "Strict-Transport-Security",
      createStrictTransportSecurity(options["Strict-Transport-Security"]),
    );
  }

  if (options["Referrer-Policy"]) {
    headers.set("Referrer-Policy", options["Referrer-Policy"]);
  }

  if (options["X-XSS-Protection"]) {
    headers.set("X-XSS-Protection", options["X-XSS-Protection"]);
  }

  if (options["Cross-Origin-Embedder-Policy"]) {
    headers.set(
      "Cross-Origin-Embedder-Policy",
      options["Cross-Origin-Embedder-Policy"],
    );
  }

  if (options["Cross-Origin-Opener-Policy"]) {
    headers.set(
      "Cross-Origin-Opener-Policy",
      options["Cross-Origin-Opener-Policy"],
    );
  }

  if (options["Cross-Origin-Resource-Policy"]) {
    headers.set(
      "Cross-Origin-Resource-Policy",
      options["Cross-Origin-Resource-Policy"],
    );
  }

  if (options["X-Content-Type-Options"]) {
    headers.set("X-Content-Type-Options", options["X-Content-Type-Options"]);
  }

  if (options["X-DNS-Prefetch-Control"]) {
    headers.set("X-DNS-Prefetch-Control", options["X-DNS-Prefetch-Control"]);
  }

  // if we forgot to set a header internally, throw an error
  for (const key of Object.keys(options)) {
    if (!headers.has(key)) {
      throw new Error(`createSecureHeaders: ${key} was not set`);
    }
  }

  return headers;
}

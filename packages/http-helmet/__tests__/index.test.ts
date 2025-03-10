import { describe, expect, it } from "vitest";
import parseContentSecurityPolicy from "content-security-policy-parser";
import {
  createContentSecurityPolicy,
  createSecureHeaders,
  HASH,
  mergeHeaders,
  NONCE,
  NONE,
  REPORT_SAMPLE,
  SELF,
  STRICT_DYNAMIC,
  UNSAFE_EVAL,
  UNSAFE_HASHES,
  UNSAFE_INLINE,
  WASM_UNSAFE_EVAL,
} from "../src/index.js";

describe("createSecureHeaders", () => {
  it("generates a config", () => {
    let headers = createSecureHeaders({
      "Strict-Transport-Security": {
        maxAge: 63072000,
        includeSubDomains: true,
        preload: true,
      },
      "Content-Security-Policy": {
        defaultSrc: ["'self'"],
        upgradeInsecureRequests: true,
        scriptSrc: ["'sha512-sdhgsgh'"],
        imgSrc: ["'none'"],
      },
      "Permissions-Policy": {
        battery: [],
        accelerometer: ["self"],
        autoplay: ["https://example.com"],
        camera: ["*"],
        fullscreen: ["self", "https://example.com", "https://example.org"],
        interestCohort: [],
      },
      "X-XSS-Protection": "1; report=https://google.com",
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "same-origin",
      "X-Content-Type-Options": "nosniff",
      "X-DNS-Prefetch-Control": "on",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Frame-Options": "DENY",
    });

    expect(headers.get("Strict-Transport-Security")).toBe(
      "max-age=63072000; includeSubDomains; preload",
    );
    expect(headers.get("Content-Security-Policy")).toBe(
      "upgrade-insecure-requests; default-src 'self'; script-src 'sha512-sdhgsgh'; img-src 'none'",
    );
    expect(headers.get("Permissions-Policy")).toBe(
      `battery=(), accelerometer=(self), autoplay=("https://example.com"), camera=*, fullscreen=(self "https://example.com" "https://example.org"), interest-cohort=()`,
    );
    expect(headers.get("X-XSS-Protection")).toBe(
      "1; report=https://google.com",
    );
    expect(headers.get("Cross-Origin-Embedder-Policy")).toBe("require-corp");
    expect(headers.get("Cross-Origin-Opener-Policy")).toBe("same-origin");
    expect(headers.get("Cross-Origin-Resource-Policy")).toBe("same-origin");
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("X-DNS-Prefetch-Control")).toBe("on");
    expect(headers.get("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(headers.get("X-Frame-Options")).toBe("DENY");
  });

  it("allows using exported quoted values", () => {
    let headers = createSecureHeaders({
      "Content-Security-Policy": {
        defaultSrc: [NONE],
        scriptSrc: [
          SELF,
          NONCE("foo"),
          HASH("sha256", "bar"),
          UNSAFE_EVAL,
          UNSAFE_HASHES,
          WASM_UNSAFE_EVAL,
          STRICT_DYNAMIC,
        ],
        imgSrc: [SELF, "https://example.com"],
        styleSrc: [UNSAFE_EVAL, UNSAFE_INLINE],
        fontSrc: [REPORT_SAMPLE],
      },
    });

    let csp = headers.get("Content-Security-Policy");
    if (!csp) throw new Error("Expected CSP header");
    let parsed = parseContentSecurityPolicy(csp);

    let defaultSrc = parsed.get("default-src");
    if (!defaultSrc) throw new Error("Expected default-src");
    let scriptSrc = parsed.get("script-src");
    if (!scriptSrc) throw new Error("Expected script-src");
    let imgSrc = parsed.get("img-src");
    if (!imgSrc) throw new Error("Expected img-src");
    let styleSrc = parsed.get("style-src");
    if (!styleSrc) throw new Error("Expected style-src");
    let fontSrc = parsed.get("font-src");
    if (!fontSrc) throw new Error("Expected font-src");

    expect(defaultSrc).toEqual([NONE]);
    expect(scriptSrc).toEqual([
      SELF,
      `'nonce-foo'`,
      `'sha256-bar'`,
      UNSAFE_EVAL,
      UNSAFE_HASHES,
      WASM_UNSAFE_EVAL,
      STRICT_DYNAMIC,
    ]);
    expect(imgSrc).toEqual([SELF, "https://example.com"]);
    expect(styleSrc).toEqual([UNSAFE_EVAL, UNSAFE_INLINE]);
    expect(fontSrc).toEqual([REPORT_SAMPLE]);
  });

  it('allows shorthand for "Strict-Transport-Security"', () => {
    let headers = createSecureHeaders({ "Strict-Transport-Security": true });

    expect(headers.get("Strict-Transport-Security")).toBe(
      "max-age=15552000; includeSubDomains; preload",
    );
  });
});

it("throws an error if the value is reserved", () => {
  expect(() =>
    createSecureHeaders({
      "Content-Security-Policy": {
        defaultSrc: ["'self'", "https://example.com"],
      },
      "Permissions-Policy": {
        battery: ["'self'"],
      },
    }),
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: [createPermissionsPolicy]: self must not be quoted for "battery".]`,
  );
});

describe("mergeHeaders", () => {
  it("merges headers", () => {
    let secureHeaders = createSecureHeaders({
      "Content-Security-Policy": { "default-src": ["'self'"] },
    });

    let responseHeaders = new Headers({
      "Content-Type": "text/html",
      "x-foo": "bar",
    });

    let merged = mergeHeaders(responseHeaders, secureHeaders);

    expect(merged.get("Content-Type")).toBe("text/html");
    expect(merged.get("x-foo")).toBe("bar");
    expect(merged.get("Content-Security-Policy")).toBe("default-src 'self'");
  });

  it("throws if the argument is not an object", () => {
    // @ts-expect-error
    expect(() => mergeHeaders("foo")).toThrowErrorMatchingInlineSnapshot(
      `[TypeError: All arguments must be of type object]`,
    );
  });

  it("overrides existing headers", () => {
    let secureHeaders = createSecureHeaders({
      "Content-Security-Policy": { "default-src": ["'self'"] },
    });

    let responseHeaders = new Headers({
      "Content-Security-Policy": "default-src 'none'",
    });

    let merged1 = mergeHeaders(responseHeaders, secureHeaders);
    let merged2 = mergeHeaders(secureHeaders, responseHeaders);

    expect(merged1.get("Content-Security-Policy")).toBe("default-src 'self'");
    expect(merged2.get("Content-Security-Policy")).toBe("default-src 'none'");
  });

  it('keeps all "Set-Cookie" headers', () => {
    let headers1 = new Headers({ "Set-Cookie": "foo=bar" });
    let headers2 = new Headers({ "Set-Cookie": "baz=qux" });

    let merged = mergeHeaders(headers1, headers2);

    expect(merged.get("Set-Cookie")).toBe("foo=bar, baz=qux");
    expect(merged.getSetCookie()).toStrictEqual(["foo=bar", "baz=qux"]);
  });
});

it("allows mixing camel and kebab case for CSP keys", () => {
  let secureHeaders = createSecureHeaders({
    "Content-Security-Policy": {
      "default-src": ["'self'"],
      imgSrc: ["'none'"],
      "frame-src": ["https://example.com"],
    },
  });

  expect(secureHeaders.get("Content-Security-Policy")).toBe(
    "default-src 'self'; img-src 'none'; frame-src https://example.com",
  );
});

it("throws an error on duplicate CSP keys", () => {
  expect(() =>
    createSecureHeaders({
      "Content-Security-Policy": {
        defaultSrc: ["'self'"],
        "default-src": ["'self'"],
      },
    }),
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: [createContentSecurityPolicy]: The key "default-src" was specified in camelCase and kebab-case.]`,
  );
});

it('throws an error when "Content-Security-Policy" and "Content-Security-Policy-Report-Only" are set at the same time', () => {
  expect(() =>
    // @ts-expect-error - this is intentional, we want to test the error
    createSecureHeaders({
      "Content-Security-Policy": {
        defaultSrc: ["'self'"],
      },
      "Content-Security-Policy-Report-Only": {
        defaultSrc: ["'self'"],
      },
    }),
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: createSecureHeaders: Content-Security-Policy and Content-Security-Policy-Report-Only cannot be set at the same time]`,
  );
});

it("allows and filters out `undefined` values", () => {
  let csp = createContentSecurityPolicy({
    "connect-src": [undefined, "'self'", undefined],
  });

  expect(csp).toMatchInlineSnapshot(`"connect-src 'self'"`);
});

it("throws an error when there's no define values for a csp key", () => {
  expect(() =>
    createContentSecurityPolicy({
      "base-uri": [undefined],
      "default-src": ["'none'"],
    }),
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: [createContentSecurityPolicy]: key "base-uri" has no defined options]`,
  );
});

describe("checks for both upgradeInsecureRequests and upgrade-insecure-requests", () => {
  it("upgradeInsecureRequests", () => {
    expect(
      createContentSecurityPolicy({
        upgradeInsecureRequests: true,
      }),
    ).toMatchInlineSnapshot(`"upgrade-insecure-requests"`);
  });

  it("upgrade-insecure-requests", () => {
    expect(
      createContentSecurityPolicy({
        "upgrade-insecure-requests": true,
      }),
    ).toMatchInlineSnapshot(`"upgrade-insecure-requests"`);
  });
});

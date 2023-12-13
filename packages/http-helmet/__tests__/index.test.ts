import { describe, expect, it } from "vitest";
import { createSecureHeaders, mergeHeaders } from "../src/index.js";

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
    `battery=(), accelerometer=(self), autoplay=("https://example.com"), camera=*, fullscreen=(self "https://example.com" "https://example.org")`,
  );
  expect(headers.get("X-XSS-Protection")).toBe("1; report=https://google.com");
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
    '"[createPermissionsPolicy]: self must not be quoted for \\"battery\\"."',
  );
});

describe("mergeHeaders", () => {
  it("merges headers", () => {
    let secureHeaders = createSecureHeaders({
      "Content-Security-Policy": { defaultSrc: ["'self'"] },
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
      '"All arguments must be of type object"',
    );
  });

  it("overrides existing headers", () => {
    let secureHeaders = createSecureHeaders({
      "Content-Security-Policy": { defaultSrc: ["'self'"] },
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

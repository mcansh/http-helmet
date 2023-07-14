import { expect, it } from "vitest";
import { createSecureHeaders } from "../src";

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
    },
    "Permissions-Policy": {
      battery: [],
      accelerometer: ["self"],
      autoplay: ["https://example.com"],
      camera: ["*"],
      fullscreen: ["self", "https://example.com", "https://example.org"],
    },
    "X-XSS-Protection": "1; report=https://google.com",
  });

  expect(headers.get("Strict-Transport-Security")).toBe(
    "max-age=63072000; includeSubDomains; preload"
  );
  expect(headers.get("Content-Security-Policy")).toBe(
    "upgrade-insecure-requests; default-src 'self'"
  );
  expect(headers.get("Permissions-Policy")).toBe(
    `battery=(), accelerometer=(self), autoplay=("https://example.com"), camera=*, fullscreen=(self "https://example.com" "https://example.org")`
  );
  expect(headers.get("X-XSS-Protection")).toBe("1; report=https://google.com");
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
    })
  ).toThrowErrorMatchingInlineSnapshot(
    '"[createPermissionsPolicy]: self must not be quoted for \\"battery\\"."'
  );
});

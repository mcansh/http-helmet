import { expect, it } from "vitest";
import { createSecureHeaders } from "../src";

it("generates a config", () => {
  expect(
    createSecureHeaders({
      "Strict-Transport-Security": {
        maxAge: 3600,
        includeSubDomains: true,
        preload: true,
      },
      "Content-Security-Policy": {
        defaultSrc: ["'self'"],
      },
      "Permissions-Policy": {
        battery: [],
        accelerometer: ["self"],
        autoplay: ["https://example.com"],
        camera: ["*"],
        fullscreen: ["self", "https://example.com", "https://example.org"],
      },
    })
  ).toMatchInlineSnapshot(`
    [
      [
        "Content-Security-Policy",
        "default-src 'self'",
      ],
      [
        "Permissions-Policy",
        "battery=(), accelerometer=(self), autoplay=(\\"https://example.com\\"), camera=*, fullscreen=(self \\"https://example.com\\" \\"https://example.org\\")",
      ],
      [
        "Strict-Transport-Security",
        "max-age=3600; includeSubDomains; preload",
      ],
    ]
  `);
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

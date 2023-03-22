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
    Headers {
      Symbol(query): [
        "content-security-policy",
        "default-src 'self'",
        "permissions-policy",
        "battery=(), accelerometer=(self), autoplay=(\\"https://example.com\\"), camera=*, fullscreen=(self \\"https://example.com\\" \\"https://example.org\\")",
        "strict-transport-security",
        "max-age=3600; includeSubDomains; preload",
      ],
      Symbol(context): null,
    }
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

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
        battery: ["none"],
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
        "battery=(none)",
      ],
      [
        "Strict-Transport-Security",
        "max-age=3600; includeSubDomains; preload",
      ],
    ]
  `);
});

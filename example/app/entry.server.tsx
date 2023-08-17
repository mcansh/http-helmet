import crypto from "node:crypto";
import { PassThrough } from "node:stream";
import type { EntryContext } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import isbot from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { createSecureHeaders } from "@mcansh/http-helmet";
import { NonceContext } from "./nonce";

let ABORT_DELAY = 5000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  let callback = isbot(request.headers.get("user-agent"))
    ? "onAllReady"
    : "onShellReady";

  let nonce = crypto.randomBytes(16).toString("base64");
  let secureHeaders = createSecureHeaders({
    "Content-Security-Policy": {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", `'nonce-${nonce}'`],
      // prettier-ignore
      connectSrc: process.env.NODE_ENV === "development" ? ["ws:", "'self'"] : ["'self'"],
    },
    "Strict-Transport-Security": {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  });

  return new Promise((resolve, reject) => {
    let { pipe, abort } = renderToPipeableStream(
      <NonceContext.Provider value={nonce}>
        <RemixServer context={remixContext} url={request.url} />
      </NonceContext.Provider>,
      {
        nonce,
        [callback]() {
          let body = new PassThrough();

          responseHeaders.set("Content-Type", "text/html");
          for (let header of secureHeaders) {
            responseHeaders.set(...header);
          }

          resolve(
            new Response(body, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          console.error(error);
          responseStatusCode = 500;
        },
      },
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

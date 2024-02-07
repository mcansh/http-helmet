import crypto from "node:crypto";
import { PassThrough } from "node:stream";

import type { AppLoadContext, EntryContext } from "@remix-run/node";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { createSecureHeaders, mergeHeaders } from "@mcansh/http-helmet";
import { NonceContext } from "./nonce";

const ABORT_DELAY = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: AppLoadContext,
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
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      <NonceContext.Provider value={nonce}>
        <RemixServer
          context={remixContext}
          url={request.url}
          abortDelay={ABORT_DELAY}
        />
      </NonceContext.Provider>,
      {
        nonce,
        [callback]() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(stream, {
              headers: mergeHeaders(responseHeaders, secureHeaders),
              status: responseStatusCode,
            }),
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error);
          }
        },
      },
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

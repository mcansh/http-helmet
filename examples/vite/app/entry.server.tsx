/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import { PassThrough } from "node:stream";

import type { AppLoadContext, EntryContext } from "@remix-run/node";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { createSecureHeaders, mergeHeaders } from "@mcansh/http-helmet";
import { NonceProvider, createNonce } from "@mcansh/http-helmet/react";

const ABORT_DELAY = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  // This is ignored so we can keep it in the template for visibility.  Feel
  // free to delete this parameter in your app if you're not using it!
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _loadContext: AppLoadContext,
) {
  let callback = isbot(request.headers.get("user-agent"))
    ? "onAllReady"
    : "onShellReady";

  let nonce = createNonce();
  let secureHeaders = createSecureHeaders({
    "Content-Security-Policy": {
      "default-src": ["'self'"],
      "script-src": [
        "'self'",
        `'nonce-${nonce}'`,
        "'strict-dynamic'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "'unsafe-hashes'",
      ],
      "connect-src": [
        "'self'",
        ...(process.env.NODE_ENV === "development" ? ["ws:", ""] : []),
      ],
      "prefetch-src": ["'self'"],
    },
    "Strict-Transport-Security": {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    "Referrer-Policy": "origin-when-cross-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "X-Content-Type-Options": "nosniff",
    "X-DNS-Prefetch-Control": "on",
    "X-XSS-Protection": "1; mode=block",
    "X-Frame-Options": "DENY",
  });

  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      <NonceProvider nonce={nonce}>
        <RemixServer
          context={remixContext}
          url={request.url}
          abortDelay={ABORT_DELAY}
        />
      </NonceProvider>,
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

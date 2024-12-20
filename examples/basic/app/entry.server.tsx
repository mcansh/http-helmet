import { PassThrough } from "node:stream";

import type { AppLoadContext, EntryContext } from "@remix-run/node";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import {
  createNonce,
  createSecureHeaders,
  mergeHeaders,
} from "@mcansh/http-helmet";
import { NonceProvider } from "@mcansh/http-helmet/react";

const ABORT_DELAY = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: AppLoadContext
) {
  let callback = isbot(request.headers.get("user-agent"))
    ? "onAllReady"
    : "onShellReady";

  let nonce = createNonce();
  let secureHeaders = createSecureHeaders({
    "Content-Security-Policy": {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", `'nonce-${nonce}'`],
      connectSrc: [
        "'self'",
        ...(process.env.NODE_ENV === "development" ? ["ws:", ""] : []),
      ],
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
            })
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
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}
